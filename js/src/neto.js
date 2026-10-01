// neto.js — sincroniza la escena entre 2 navegadores (2 PCs) por WebSocket.
// Activar: abrir el juego con ?neto=1 en ambos. El jugador 2 puede forzarse con ?jugador=2.
// El canal es único y genérico: 3 operaciones — ws:created, ws:updated, ws:removed.
//   red("ws:created", serializar(el)) / red("ws:updated", serializar(el)) / red("ws:removed", {id,x,y,z})
// El servidor solo mergea/reenvía; cada browser aplica el snapshot entero (sin
// deltas: los cambios de posición y propiedades van en el mismo mensaje).
// Para reaccionar a cambios ajenos desde la escena/global:
//   escuchar(["ws:created","ws:updated","ws:removed"], (elemento) => { ... })
// idem imagen física/intentarMover: la posición se replica "en caliente" pero la
// física sigue siendo local en cada navegador (espadas y muros idénticos).
(() => {
	const ENVIAR_CADA_MS = 100;
	const neto = {
		activo: false,
		rol: 1,
		mio: null,
		suyo: null,
		listo: false,
		ultimo: "",
		ws: null,
		silencioso: false,
		timers: {},
		posesiones: {},
		empujando: false,
		eliminados: new Set()
	};
	window.neto = neto;

	// Envío seguro: valida que exista la conexión y que el socket esté ABIERTO (readyState === 1)
	window.red = (nombre, datos) => {
		if (!neto.ws || typeof neto.ws.send !== "function" || neto.ws.readyState !== 1) return;
		neto.ws.send(JSON.stringify({ op: nombre, datos: datos || {} }));
	};

	// Serializa el estado visible de un elemento: geometría + propiedades.
	const PROPS_NO_SERIALIZAR = new Set([
		"solido", "peso", "fuerza", "orientacion", "tipo", "imagenAlias", "escena",
		"esPlayer", "animadoImagen", "piso", "vidas", "animado", "escala", "margenX",
		"margenY", "abierta", "items", "interactuarFunction", "guardado", "guardado-en",
		"estado-visual", "colisionable", "interactuando"
	]);
	neto.serializar = (el) => {
		const props = el.propiedades();
		const estado = {};
		for (const clave in props) {
			if (PROPS_NO_SERIALIZAR.has(clave) || props[clave] === undefined) continue;
			estado[clave] = props[clave];
		}
		return {
			id: el.id,
			alias: el.imagenAlias,
			tipo: el.tipo,
			x: el.x,
			y: el.y,
			z: el.z || 0,
			w: el.w,
			h: el.h,
			d: el.d,
			solido: !!el.propiedades("solido"),
			esPlayer: !!el.esPlayer,
			cubo: !!el.cubo,
			escala: el.propiedades("escala") || undefined,
			margenX: el.propiedades("margenX") || undefined,
			margenY: el.propiedades("margenY") || undefined,
			orientacion: el.orientacion || "derecha",
			vidas: typeof el.vidas === "function" ? el.vidas() : undefined,
			abierta: el.propiedades("abierta") === undefined ? undefined : !!el.propiedades("abierta"),
			animationOpen: el.animationOpen === undefined ? undefined : !!el.animationOpen,
			estado,
		};
	};

	// Aplica los cambios y empuja el snapshot entero al canal genérico.
	neto.cambiar = (elemento, cambios) => {
		if (!elemento || typeof elemento.propiedades !== "function") return elemento;
		if (cambios) Object.entries(cambios).forEach(([clave, valor]) => elemento.propiedades(clave, valor));
		if (neto.activo && neto.listo && !neto.silencioso) red("ws:updated", neto.serializar(elemento));
		return elemento;
	};
	neto.estado = (elemento, cambios) => neto.cambiar(elemento, cambios);

	function actualizarPosesiones() {
		neto.mio = null;
		neto.suyo = null;
		Object.entries(neto.posesiones).forEach(([rolSala, elemento]) => {
			if (Number(rolSala) === neto.rol) neto.mio = elemento;
			else if (Number(rolSala) > 0) neto.suyo = elemento;
		});
	}

	neto.poseer = (elemento, rolSala) => {
		neto.posesiones[rolSala] = elemento;
		actualizarPosesiones();
		return elemento;
	};

	neto.moverJugador = (direccion) => {
		const pasos = {
			arriba: [0, -1], abajo: [0, 1], izquierda: [-1, 0], derecha: [1, 0],
		};
		const paso = pasos[direccion];
		const jugador = neto.mio || window.player?.();
		if (!paso || !jugador || jugador.ocupado || window.estado?.() !== "play") return false;
		if (jugador.orientacion !== direccion) jugador.orientar(direccion);
		if (neto.empujando) {
			const resultado = window.physicsEngine?.tirar(jugador, paso[0], paso[1], 0);
			if (resultado === null) {
				return window.physicsEngine?.intentarMover(jugador, paso[0], paso[1], 0, false, true) || false;
			}
			return resultado === 1;
		}
		if (jugador.animacion?.play) jugador.animacion.play(.22);
		return window.physicsEngine?.intentarMover(jugador, paso[0], paso[1], 0, false, false) || false;
	};

	function porId(id) {
		return (window.sceneManager?.elementos || []).find((o) => o.id === id) || null;
	}

	function porXY(x, y) {
		return (window.sceneManager?.elementos || []).find((o) => o.x === x && o.y === y && !o.esPlayer) || null;
	}

	function teletransportar(el, x, y, z) {
		if (el.x === x && el.y === y && el.z === (z ?? el.z)) return;
		el.x = x;
		el.y = y;
		el.z = z;
		window.sceneManager?.actualizarTransformNodo(el);
	}

	function pulso() {
		const el = neto.mio;
		if (!el || !neto.listo) return;
		const snap = { op: "ws:updated", datos: neto.serializar(el) };
		const json = JSON.stringify(snap);
		if (json === neto.ultimo) return;
		neto.ultimo = json;
		if (neto.ws?.readyState === 1) neto.ws.send(json);
	}

	function conectar() {
		const params = new URLSearchParams(location.search);
		if (params.get("neto") === null) return;

		// Si el navegador no soporta WebSockets, salir limpiamente
		if (typeof WebSocket === "undefined") {
			console.warn("WebSocket no soportado en este entorno.");
			return;
		}

		neto.activo = true;
		document.body.classList.add("neto-mode");
		instalarJoystickNeto();

		const playerSolicitado = params.get("player") === "2" ? 2 : 1;
		neto.rol = playerSolicitado;
		const user = localStorage.getItem("username") || "invitado";
		const escena = params.get("escena") || localStorage.getItem("escenaSeleccionada") || "principal";
		const sala = params.get("sala") || user + ":" + escena;
		neto.sala = sala;

		let pid = localStorage.getItem("neto_pid");
		if (!pid) {
			pid = Math.random().toString(36).slice(2, 10);
			localStorage.setItem("neto_pid", pid);
		}

		// Construcción de la URL del WebSocket
		const protocol = location.protocol === "https:" ? "wss:" : "ws:";
		const wsUrl = protocol + "//" + location.host + "/ws?sala=" + encodeURIComponent(sala) + "&pid=" + pid + "&player=" + playerSolicitado;

		try {
			const ws = new WebSocket(wsUrl);
			neto.ws = ws;

			ws.onmessage = (ev) => {
				let msg;
				try {
					msg = JSON.parse(ev.data);
				} catch {
					return;
				}
				if (msg.op === "hola") {
					neto.rol = msg.jugador;
					actualizarPosesiones();
					window.eventBus?.emitir("neto:rol", { rol: neto.rol });
				} else if (msg.op === "estado-inicial") {
					(msg.eliminados || []).forEach((id) => neto.eliminados.add(id));
					(msg.estado || []).forEach(crearRemoto);
					(msg.eliminados || []).forEach(eliminarEliminado);
				} else if (msg.op === "ws:eliminado" && msg.datos?.id) {
					neto.eliminados.add(msg.datos.id);
					eliminarEliminado(msg.datos.id);
				} else if (msg.op === "ws:restaurar" && msg.datos?.id) {
					neto.eliminados.delete(msg.datos.id);
					if (window.sceneManager?.datos?.elementos) window.sceneManager.datos.elementos[msg.datos.id] = undefined;
				} else if (msg.op === "ws:created" || msg.op === "ws:updated" || msg.op === "ws:removed" || msg.op === "ataque") {
					window.eventBus?.emitir(msg.op === "ataque" ? "red:ataque" : msg.op, msg.datos);
				}
			};

			// Capturar errores de conexión para no interrumpir la ejecución del script
			ws.onerror = (err) => {
				console.warn("No se pudo conectar al servidor WebSocket. El juego continuará en modo local.", err);
			};

			ws.onclose = () => {
				neto.listo = false;
			};

		} catch (e) {
			console.warn("Excepción al intentar instanciar WebSocket:", e);
			neto.ws = null;
			return;
		}

		neto.timers.arranque = setInterval(() => {
			if (neto.mio || window.sceneManager?.elementos?.length > 2) {
				clearInterval(neto.timers.arranque);
				esperarY(1.5, () => {
					neto.listo = true;
					if (neto.ws?.readyState === 1) neto.ws.send(JSON.stringify({ op: "estado-inicial" }));
				});
				setInterval(pulso, ENVIAR_CADA_MS);
			} else if (++neto.timers.arranque.esperas > 500) {
				clearInterval(neto.timers.arranque);
			}
		}, 50);
	}

	function instalarJoystickNeto() {
		if (document.getElementById("neto-controls")) return;
		const controles = document.createElement("div");
		controles.id = "neto-controls";
		controles.innerHTML = `
			<div class="neto-joystick" aria-label="Mover personaje"><div class="neto-joystick-thumb"></div></div>
			<div class="neto-actions flex flex-wrap" style="max-width:200px">
				<button type="button" style="height:50px;width:50px;top:-100px" class="text-2xl flex justify-center items-start rounded-full bg-indigo-400 absolute mt-5 ms-5" data-tecla="w">🎒</button>
				<button type="button" data-tecla="a">Usar</button>
				<button type="button" class="neto-hold" data-agarre>Empujar</button>
				<button type="button" data-tecla="e">Atacar</button>
				<button type="button" data-tecla="d">Saltar</button>
			</div>`;
		document.body.appendChild(controles);

		["selectstart", "dragstart", "contextmenu"].forEach((tipo) =>
			controles.addEventListener(tipo, (event) => event.preventDefault()),
		);

		const joystick = controles.querySelector(".neto-joystick");
		const thumb = controles.querySelector(".neto-joystick-thumb");
		let direccion = null;
		let pulsando = false;
		const emitirDireccion = () => {
			if (direccion) neto.moverJugador?.(direccion) ?? window.evento?.(direccion);
		};
		const actualizarDireccion = (event) => {
			const rect = joystick.getBoundingClientRect();
			const dx = event.clientX - (rect.left + rect.width / 2);
			const dy = event.clientY - (rect.top + rect.height / 2);
			const limite = rect.width * 0.28;
			const escala = Math.min(1, limite / Math.max(Math.hypot(dx, dy), 1));
			thumb.style.transform = `translate(${dx * escala}px, ${dy * escala}px)`;
			
			const dist = Math.hypot(dx, dy);
			if (dist < (direccion ? 6 : 12)) return (direccion = null);
			
			const ax = Math.abs(dx);
			const ay = Math.abs(dy);
			const siguiente = ax >= ay * 1.6
				? (dx < 0 ? "izquierda" : "derecha")
				: ay >= ax * 1.6
					? (dy < 0 ? "arriba" : "abajo")
					: direccion;
			if (siguiente !== direccion) {
				direccion = siguiente;
				emitirDireccion();
			}
		};
		const soltar = () => {
			pulsando = false;
			direccion = null;
			window.direccionSostenida = null;
			thumb.style.transform = "translate(0, 0)";
		};
		joystick.addEventListener("pointerdown", (event) => {
			event.preventDefault();
			pulsando = true;
			joystick.setPointerCapture?.(event.pointerId);
			actualizarDireccion(event);
		});
		joystick.addEventListener("pointermove", (event) => { if (pulsando) actualizarDireccion(event); });
		joystick.addEventListener("pointerup", soltar);
		joystick.addEventListener("pointercancel", soltar);
		setInterval(() => {
			if (pulsando) {
				window.direccionSostenida = direccion;
				emitirDireccion();
			}
		}, 400);
		controles.querySelectorAll("button[data-tecla]").forEach((boton) => {
			let ultimo = 0;
			boton.addEventListener("pointerdown", (event) => {
				event.preventDefault();
				const ahora = Date.now();
				if (ahora - ultimo < 400) return;
				ultimo = ahora;
				window.evento?.(boton.dataset.tecla);
			});
		});
		controles.querySelectorAll("button[data-agarre]").forEach((boton) => {
			const terminar = () => {
				neto.empujando = false;
				window.evento?.("s:soltar");
			};
			boton.addEventListener("pointerdown", (event) => {
				event.preventDefault();
				boton.setPointerCapture?.(event.pointerId);
				neto.empujando = true;
				window.evento?.("s");
			});
			boton.addEventListener("pointerup", terminar);
			boton.addEventListener("pointercancel", terminar);
			boton.addEventListener("lostpointercapture", terminar);
		});
	}

	function puertaFX(d) {
		if (d.animationOpen === undefined && d.abierta === undefined) return;
		const puerta = porId(d.id) || (d.x !== undefined ? porXY(d.x, d.y) : null);
		const obj = puerta?.media?.objeto;
		if (!obj?.parentNode) return;
		setTransform(obj.parentNode, "rotateY", d.animationOpen ? "60deg" : (puerta.vertical ? "90deg" : "0deg"));
		puerta.animationOpen = !!d.animationOpen;
		if (d.abierta !== undefined) puerta.propiedades("abierta", d.abierta);
		if (d.animationOpen) puerta.noSolido();
		else if (d.abierta !== undefined) puerta.solido();
	}

	function aplicarEstado(d, el) {
		if (!el || typeof el.propiedades !== "function" || !d?.estado) return;
		for (const clave in d.estado) {
			if (PROPS_NO_SERIALIZAR.has(clave)) continue;
			el.propiedades(clave, d.estado[clave]);
		}
	}

	function aplicarRemoto(d) {
		const el = porId(d?.id) || (d?.x !== undefined ? porXY(d.x, d.y) : null);
		if (!el) return;
		neto.silencioso = true;
		try {
			teletransportar(el, d.x, d.y, d.z ?? 0);
			if (d.orientacion && el.orientacion !== d.orientacion) el.orientar(d.orientacion);
			if (d.solido !== undefined) el.propiedades("solido", !!d.solido);
			if (d.escala !== undefined && el.propiedades("escala") !== d.escala) el.escala(d.escala);
			if (d.margenX !== undefined) el.margenX(d.margenX);
			if (d.margenY !== undefined) el.margenY(d.margenY);
			aplicarEstado(d, el);
			if (d.vidas !== undefined && el.destruible && typeof el.vidas === "function") {
				el.vidas(d.vidas);
				if (el.info && el.vidasTexto) el.info({ vidas: el.vidasTexto() });
			}
			puertaFX(d);
		} finally {
			neto.silencioso = false;
		}
	}

	function crearRemoto(d) {
		if (porId(d?.id)) return aplicarRemoto(d);
		const enCelda = d?.x !== undefined ? porXY(d.x, d.y) : null;
		if (enCelda && enCelda.imagenAlias === d.alias) return aplicarRemoto(d);
		const scene = window.sceneManager;
		if (!scene?.agregar) return;
		neto.silencioso = true;
		try {
			const el = scene.agregar(d.x, d.y, d.alias, d.id, {
				tipo: d.tipo,
				solido: d.solido,
				esPlayer: d.esPlayer,
				z: d.z,
				w: d.w,
				h: d.h,
				d: d.d,
				cubo: !!d.cubo,
				pausado: d.esPlayer,
				repetir: true
			});
			if (d.escala) el.escala(d.escala);
			if (d.margenY !== undefined) el.margenY(d.margenY);
			if (d.margenX !== undefined) el.margenX(d.margenX);
			if (d.orientacion) el.orientar(d.orientacion);
			if (d.vidas !== undefined && el.destruible && typeof el.vidas === "function") el.vidas(d.vidas);
			aplicarEstado(d, el);
		} finally {
			neto.silencioso = false;
		}
	}

	function eliminarRemoto(d) {
		const el = porId(d?.id) || (d?.x !== undefined ? porXY(d.x, d.y) : null);
		if (!el || el === neto.mio || el === neto.suyo) return;
		neto.silencioso = true;
		try {
			window.sceneManager?.eliminarObjeto(el.id);
		} finally {
			neto.silencioso = false;
		}
	}

	function eliminarEliminado(id) {
		const el = porId(id);
		if (!el || el === neto.mio || el === neto.suyo) return;
		neto.silencioso = true;
		try {
			window.sceneManager?.eliminarObjeto(id);
		} finally {
			neto.silencioso = false;
		}
	}

	function ataqueRemoto(d) {
		const el = porId(d.actor) || (d.x !== undefined ? porXY(d.x, d.y) : null);
		if (el) {
			const base = el.imagenAlias || "";
			const giro = d.orientacion || el.orientacion || "derecha";
			if (d.orientacion && el.orientacion !== d.orientacion) el.orientar(d.orientacion);
			const conAtaque = imagenesImportadas.hasOwnProperty(base + "-ataca-" + giro);
			el.pintar(conAtaque ? base + "-ataca" : base);
			if (el.animacion?.play) el.animacion.play(1.5);
			esperarY(1.5, () => {
				if (porId(el.id) || porXY(el.x, el.y)) {
					el.pintar(base);
					if (el.animacion?.reset) el.animacion.reset();
				}
			});
		}
		if (d.imagen && d.dir && d.dist) animarProyectil(d);
		if (d.melee && d.objetivo) {
			const objetivo = porId(d.objetivo) || porXY(d.objX, d.objY);
			if (objetivo && objetivo !== neto.mio && objetivo !== neto.suyo && typeof objetivo.perderVida === "function") {
				objetivo.perderVida();
				if (objetivo.vidas() === 0) window.sceneManager?.eliminarObjeto(objetivo.id);
			}
		}
	}

	function animarProyectil(d) {
		const sx = d.x + d.dir.dx;
		const sy = d.y + d.dir.dy;
		const ex = d.x + d.dir.dx * d.dist;
		const ey = d.y + d.dir.dy * d.dist;
		const duracion = (Math.max(Math.abs(ex - sx), Math.abs(ey - sy)) / 2) * 250;
		const inicio = Date.now();
		const avanzen = (ahora) => {
			const proy = porXY(sx, sy);
			if (!proy) {
				if (Date.now() - inicio < 250) requestAnimationFrame(avanzen);
				return;
			}
			const f = Math.min((ahora - inicio) / duracion, 1);
			proy.x = sx + (ex - sx) * f;
			proy.y = sy + (ey - sy) * f;
			window.sceneManager?.actualizarTransformNodo(proy);
			if (f < 1) requestAnimationFrame(avanzen);
		};
		requestAnimationFrame(avanzen);
	}

	function conectarPuentes() {
		escuchar("ws:created", (d) => crearRemoto(d));
		escuchar("ws:updated", (d) => aplicarRemoto(d));
		escuchar("ws:removed", (d) => eliminarRemoto(d));

		escuchar("actor:orientar", (d) => {
			if (!d?.actor || !d?.orientacion) return;
			const el = porId(d.actor) || (d.x !== undefined ? porXY(d.x, d.y) : null);
			if (!el) return;
			if (el.orientacion !== d.orientacion) el.orientar(d.orientacion);
			red("ws:updated", neto.serializar(el));
		});

		escuchar("ataque", (d) => { if (d?.actor) red("ataque", d); });
		escuchar("red:ataque", (d) => ataqueRemoto(d));
	}

	try {
		conectar();
		conectarPuentes();
	} catch (e) {
		console.error(e);
	}
})();