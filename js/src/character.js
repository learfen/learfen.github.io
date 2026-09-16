let timeDialog = 0;
let intervalDialog = null;
let vision = [];
let dialogoActual = null;
let dialogoElemento = null;

function posicionarDialogo() {
	const dialogo = dialogoActual;
	if (!dialogo || !dialogoElemento?.nodo) return;
	const candidatos = [
		dialogoElemento.nodo.querySelector("canvas"),
		dialogoElemento.nodo.querySelector("img"),
		dialogoElemento.nodo.querySelector(".block-label"),
		dialogoElemento.nodo,
	];
	const objetivo = candidatos
		.map((el) => el && { el, r: el.getBoundingClientRect() })
		.filter((c) => c && c.r && c.r.width && c.r.height)
		.sort((a, b) => b.r.width * b.r.height - a.r.width * a.r.height)[0];
	if (!objetivo) return;
	const r = objetivo.r;
	dialogo.style.left =
		Math.round(r.left + r.width / 2 - dialogo.offsetWidth / 2) + "px";
	dialogo.style.top = Math.round(r.top - dialogo.offsetHeight - 6) + "px";
}

function seguirDialogo() {
	if (!dialogoActual) return;
	posicionarDialogo();
	requestAnimationFrame(seguirDialogo);
}

let dialogoPreguntando = false;
escuchar(
	["arriba", "abajo"],
	(info) => {
		let next = "previousElementSibling";
		if (info.evento == "abajo") next = "nextElementSibling";
		if (dialogoPreguntando) {
			let selected = document
				.querySelector(".dialogo-globo")
				.querySelector(".dialogo-opcion.selected");
			if (!selected[next]) {
				// quitamos el select
				selected.classList.remove("selected");
				// si no hay un siguiente ni un anterior
				(info.evento === "abajo"
					? selected.parentNode.children[0] // seleccionamos el primero
					: selected.parentNode.children[
							selected.parentNode.children.length - 1
						]
				).classList // seleccionamos el ultimo
					.add("selected");
			} else {
				selected.classList.remove("selected");
				selected[next].classList.add("selected");
			}
		}
	},
	"dialogo:preguntando",
);

escuchar("a", () => {
	if (dialogoPreguntando) {
		let selected = document
			.querySelector(".dialogo-globo")
			.querySelector(".dialogo-opcion.selected");
		console.log({
			indice: selected.getAttribute("index"),
			texto: selected.innerText,
		});
		dialogoPreguntando({
			indice: parseInt(selected.getAttribute("index")),
			texto: selected.innerText,
		});
	}
});

function decir(elemento) {
	// decir("texto") hace hablar al player; decir(elemento) cablea los diálogos
	// del elemento. Un solo nombre para no sombrear la otra versión con el
	// hoisting de function (y para no romper el parseo estricto ESM).
	if (typeof elemento === "string") {
		try {
			if (player()) player().decir(elemento);
		} catch (error) {
			esperarY(.5, () => decir(elemento));
		}
		return;
	}
	/**
	 *
	 * @param {string} pregunta
	 * @param {array} respuestas
	 */

	if (window.sceneManager) {
		escuchar("mover", () => posicionarDialogo());
		escuchar("mover:" + elemento.id, () => posicionarDialogo());
	}
	elemento.preguntar = async function (pregunta, respuestas) {
		estado("dialogo:preguntando");
		elemento.decir(pregunta);
		let first = true;
		let index = 0;
		if (!respuestas) respuestas = [];
		respuestas.push("Salir");
		esperarY(0.5, () => {
			let dialogo = document.querySelector(".dialogo-globo");
			let options = document.createElement("div");
			options.style.marginLeft = "100%";
			options.classList.add(
				"absolute",
				"flex",
				"flex-col",
				"p-1",
				"gap-1",
				"bg-white",
			);
			respuestas.forEach((r) => {
				let nodo = document.createElement("div");
				nodo.innerHTML = r;
				nodo.style.minWidth = "180px";
				nodo.setAttribute("index", index);
				nodo.classList.add("dialogo-opcion", "rounded-md", "p-1");
				if (first) {
					nodo.classList.add("selected");
					first = false;
				}
				nodo.setAttribute("name", "dialogo-opciones");
				options.appendChild(nodo);
				index++;
			});
			dialogo.appendChild(options);
		});
		return new Promise((resolve) => {
			dialogoPreguntando = (a) => {
				elemento.cerrarDecir();
				clearInterval(intervalDialog);
				elemento.decir(a.texto);
				esperarY(0.3, () => {
					estado("play");
				});
				resolve(a);
			};
		});
	};
	elemento.decir = function (texto, config) {
		// config is number or object
		let respuesta = null;
		// si config es un tipo numero se interpreta como el tiempo en segundos
		let time = null;
		if (typeof config === "number") time = config;

		document.querySelectorAll(".dialogo-globo").forEach((d) => d.remove());
		dialogoActual = document.createElement("div");
		dialogoActual.className = "dialogo-globo";
		dialogoActual.innerHTML =
			texto +
			"<div class='globo-puntos'><span></span><span></span></div>";
		document.body.appendChild(dialogoActual);
		dialogoElemento = elemento;

		timeDialog = Date.now() + time * 1000;
		if (intervalDialog) clearInterval(intervalDialog);
		if (time !== null) {
			intervalDialog = setInterval(() => {
				if (Date.now() > timeDialog) {
					if (dialogoActual) dialogoActual.remove();
					dialogoActual = null;
					clearInterval(intervalDialog);
					intervalDialog = null;
				} else {
					posicionarDialogo();
				}
			}, 200);
		}

		elemento.cerrarDecir = function () {
			if (dialogoPreguntando) dialogoPreguntando = null;
			document
				.querySelectorAll(".dialogo-globo")
				.forEach((d) => d.remove());
			if (intervalDialog) clearInterval(intervalDialog);
			dialogoActual = null;
		};
		seguirDialogo();
		return elemento;
	};
	return elemento;
}

function lanzar(obj) {
	if (!obj.hasOwnProperty("animado")) obj.animar();
	obj.lanzar = function (opciones) {
		let vision = '*'
		if(opciones.hasOwnProperty('vision')) vision = opciones.vision
		escuchar(opciones.tecla, () => this.ejecutarLanzamiento(opciones));
		obj.disparar = (x, y, z) => {
			const rango = opciones.distancia ?? 3;
			if (x !== undefined && y !== undefined) {
				const dist = Math.max(Math.abs(x - obj.x), Math.abs(y - obj.y));
				if (dist > rango) return obj;
				return this.ejecutarLanzamiento({ ...opciones, modo: "dinamico", objetivo: { x, y, z: z ?? obj.z } });
			}
			// sin destino: ruta recta segun orientacion y distancia, recortada a la grid (20x20)
			const dirMap = {
				arriba: { dx: 0, dy: -1 },
				abajo: { dx: 0, dy: 1 },
				izquierda: { dx: -1, dy: 0 },
				derecha: { dx: 1, dy: 0 },
			};
			const dir = dirMap[obj.orientacion] || { dx: 0, dy: -1 };
			const nx1 = obj.x + dir.dx, ny1 = obj.y + dir.dy;
			if (nx1 < 0 || nx1 > 19 || ny1 < 0 || ny1 > 19) return obj;
			let tx = obj.x, ty = obj.y;
			for (let i = 1; i <= rango; i++) {
				const nx = obj.x + dir.dx * i, ny = obj.y + dir.dy * i;
				if (nx < 0 || nx > 19 || ny < 0 || ny > 19) break;
				tx = nx; ty = ny;
			}
			return this.ejecutarLanzamiento({ ...opciones, modo: "dinamico", objetivo: { x: tx, y: ty, z: obj.z } });
		};

		// disparo autónomo (arquero genérico): escanea un área = distancia en busca
		// del primer objetivo que matchee el selector y le dispara al entrar en rango.
		//   .hacia("luffy")            -> cualquiera en el área, cualquier orientación
		//   .hacia("@player", {vision:true}) -> solo si queda en la línea de visión
		obj.hacia = (selector, conf) => {
			conf = conf || {};
			const sel = selector[0] === "@" ? selector.slice(1) : selector;
			// los actores compartidos (neto) solo los decide el jugador 1: el
			// peer replica orientación/disparo, no decide su propio objetivo
			const puedo =
				conf.puede ??
				(() => !window.neto?.activo || (window.neto.listo && window.neto.rol === 1));
			const rango = opciones.distancia ?? 3;
			// ¿vive y sigue en la escena? (el bucle se apaga al morir)
			const vivo = () =>
				!obj.eliminado &&
				(typeof obj.vidas !== "function" || obj.vidas() > 0);
			// vision:'x' solo alcanza a quien comparte la misma columna (x),
			// vision:'y' la misma fila (y); vision:true usa la orientación actual
			const eje = conf.vision === "x" ? "x" : conf.vision === "y" ? "y" : null;
			const enArea = (t) => {
				if (Math.max(Math.abs(t.x - obj.x), Math.abs(t.y - obj.y)) > rango)
					return false;
				if (eje === "x") return t.x === obj.x;
				if (eje === "y") return t.y === obj.y;
				return true;
			};
			const enVision = (t) => {
				if (eje) {
					const dx = eje === "y" ? Math.sign(t.x - obj.x) : 0;
					const dy = eje === "x" ? Math.sign(t.y - obj.y) : 0;
					const dist = Math.max(Math.abs(t.x - obj.x), Math.abs(t.y - obj.y));
					if (dist < 1 || dist > rango) return false;
					for (let i = 1; i < dist; i++) {
						const px = obj.x + dx * i, py = obj.y + dy * i;
						if (escenaActiva().elementos.some(
							(e) => e.id !== obj.id && e.x === px && e.y === py &&
									e.z === (obj.z || 0) && e.propiedades("solido"),
						)) return false;
					}
					return true;
				}
				const d = {
					arriba: [0, -1], abajo: [0, 1],
					izquierda: [-1, 0], derecha: [1, 0],
				}[obj.orientacion];
				if (!d) return false;
				const dist = Math.max(Math.abs(t.x - obj.x), Math.abs(t.y - obj.y));
				const enLinea =
					t.x === obj.x + d[0] * dist && t.y === obj.y + d[1] * dist;
				if (dist < 1 || dist > rango || !enLinea) return false;
				for (let i = 1; i < dist; i++) {
					const px = obj.x + d[0] * i, py = obj.y + d[1] * i;
					if (escenaActiva().elementos.some(
						(e) => e.id !== obj.id && e.x === px && e.y === py &&
								e.z === (obj.z || 0) && e.propiedades("solido"),
					)) return false;
				}
				return true;
			};
			const objetivoEnArea = () =>
				escenaActiva().elementos
					.filter(
						(e) =>
							e.id !== obj.id &&
							(e.id === selector || e.tipo === sel) &&
							enArea(e) &&
							(!conf.vision || enVision(e)),
					)
					.sort(
						(a, b) =>
							Math.max(Math.abs(a.x - obj.x), Math.abs(a.y - obj.y)) -
							Math.max(Math.abs(b.x - obj.x), Math.abs(b.y - obj.y)),
					)[0];
			let ultimaOrient = obj.orientacion;
			repetir((ciclo) => {
				if (!vivo()) return ciclo.detener();
				if (!puedo()) return;
				const objetivo = objetivoEnArea();
				if (!objetivo) {
					// sin nadie al alcance: congelar el gif hasta que reaparezca alguien
					if (obj.animacion?.pause) obj.animacion.pause();
					return;
				}
				const orient = eje === "x"
					? (objetivo.y < obj.y ? "arriba" : "abajo")
					: (objetivo.x < obj.x ? "izquierda" : "derecha");
				if (orient !== obj.orientacion) {
					obj.orientar(orient);
					// actor compartido (neto): el peer replicó su orientación
					if (window.neto?.activo && ultimaOrient !== orient) {
						ultimaOrient = orient;
						evento("actor:orientar", {
							actor: obj.id, orientacion: orient,
							x: obj.x, y: obj.y,
						});
					}
				}
				//if(vision == 'x' && objetivo.y == obj.y) 
				if( vision === 'x' ){
					if(obj.y == objetivo.y)
						obj.disparar(objetivo.x, objetivo.y, objetivo.z);
					else
						obj.animacion.pause();
				} else if( vision === 'y'){
					if(obj.x == objetivo.x )
						obj.disparar(objetivo.x, objetivo.y, objetivo.z);
					else
						obj.animacion.pause();
				} else {
					obj.disparar(objetivo.x, objetivo.y, objetivo.z);
				}
				//else obj.animacion.pause()
			}).cada(conf.cada ?? .2);
			return obj;
		};

		// tiro por visión/config: lanzar({ ..., visionRecta: "luffy" }) dispara
		// solo cuando el objetivo entra en la línea de visión (sin rotar)
		if (opciones.visionRecta) obj.hacia(opciones.visionRecta, { vision: true });

		// todo lanzador que no sea el jugador quedará congelado en reposo:
		// la animación solo corre durante el disparo (ejecutarLanzamiento la
		// reproduce y vuelve a pausar). Sin esto, un lanzador sin `.hacia` y
		// sin pausado:true en config tiene el gif corriendo para siempre.
		if (!obj.esPlayer && obj.animacion?.pause) obj.animacion.pause();

		return obj;
	};

	let time = 0;
	let launch = false;
	obj.ejecutarLanzamiento = async function (opciones) {
		// si el objeto ya no esta en la escena (fue eliminado), no disparar mas
		if (!escenaActiva().elementos.some(o => o.id === obj.id)) return;
		// cooldown entre lanzamientos: opciones.cada segundos (default 1.5)
		const intervalo = (opciones.cada ?? 1.5) * 1000;
		if (time < Date.now()) {
			time = Date.now() + intervalo;
		} else {
			return;
		}

		const dirMap = {
			arriba: { dx: 0, dy: -1 },
			abajo: { dx: 0, dy: 1 },
			izquierda: { dx: -1, dy: 0 },
			derecha: { dx: 1, dy: 0 },
		};
		const objetivo = opciones.objetivo;
		const dir = objetivo
			? { dx: Math.sign(objetivo.x - obj.x), dy: Math.sign(objetivo.y - obj.y) }
			: dirMap[obj.orientacion] || { dx: 0, dy: -1 };

		let currentX = obj.x + dir.dx;
		let currentY = obj.y + dir.dy;

		if (typeof opciones.animacion === "function") {
			opciones.animacion();
		} else if (
			obj.hasOwnProperty("animacion") &&
			typeof obj?.animacion?.play == "function"
		) {
			// duracion de la animacion en segundos (default 1.5)
			const duracion = opciones.animacion ?? 1.5;
			obj.animacion.reset();
			obj.animacion.play(duracion);
			// pasado ese tiempo se resetea y pausa hasta el proximo disparo
			setTimeout(() => {
				if (obj.animacion?.reset) obj.animacion.reset();
				if (obj.animacion?.pause) obj.animacion.pause();
			}, duracion * 1000);
		}
		// demora antes de soltar el proyectil (en segundos): alinea la animacion con el disparo
		await esperar(opciones.demora ?? 1);

		const proyectil = escenaActiva().agregar(
			currentX,
			currentY,
			opciones.imagen,
			{
				x: currentX,
				y: currentY,
				z: objetivo ? objetivo.z : obj.z,
				w: 1,
				h: 1,
				d: 1,
				solido: false,
				cubo: false,
			},
		);
		if (obj.orientacion === "izquierda" || obj.orientacion === "derecha")
			proyectil.margenY(-35);
		if (obj.orientacion === "abajo") {
			proyectil.margenY(-50);
		}
		// disparo/lanzamiento visible para ambos jugadores (neto)
		evento("ataque", {
			actor: obj.id,
			orientacion: obj.orientacion,
			imagen: opciones.imagen,
			modo: opciones.modo || "recto",
			x: obj.x,
			y: obj.y,
			z: obj.z || 0,
			dir,
			dist: objetivo
				? Math.max(Math.abs(objetivo.x - obj.x), Math.abs(objetivo.y - obj.y))
				: (opciones.distancia ?? 3),
		});
		let eventoProyectil = true;
		if (
			opciones.hasOwnProperty("proyectil") &&
			typeof opciones?.proyectil === "function"
		) {
			opciones?.proyectil(proyectil, {
				cancelar() {
					eventoProyectil = false;
				},
			});
		}
		let pasosRecorridos = 0;
		const maxDistancia = objetivo
			? Math.max(Math.abs(objetivo.x - obj.x), Math.abs(objetivo.y - obj.y))
			: opciones.hasOwnProperty("distancia")
				? opciones.distancia
				: 3;
		const modo = opciones.modo || "recto";
		if (!eventoProyectil) {
			return;
		}
		launch = true;
		let bucleProyectil;
		const finBucleProyectil = () => {
			launch = false;
			clearInterval(bucleProyectil);
			window.sceneManager.eliminarObjeto(proyectil.id);
		};
		const colision = () => {
			// Detección de colisión previa al movimiento
			const colisiones = escenaActiva().elementos.filter(
				(o) =>
					o.id !== proyectil.id &&
					o.id !== this.id &&
					!o.propiedades("plano") &&
					window.physicsEngine.haySolapamiento(proyectil, o),
			);

			if (colisiones.length === 0) return false;

			const impactoCon = colisiones[0];

			if (
				opciones.hasOwnProperty("impacto") &&
				typeof opciones?.impacto === "function"
			) {
				let eventoImpacto = true;
				opciones.impacto({
					origen:obj,
					objeto: proyectil,
					con: impactoCon,
					cancelar() {
						eventoImpacto = false;
					},
				});
				if (eventoImpacto) {
					evento("colision", {
						objeto: proyectil,
						quien: proyectil,
						con: impactoCon,
					});
				}
			} else {
				evento("colision", {
					objeto: proyectil,
					quien: proyectil,
					con: impactoCon,
				});
			}

			finBucleProyectil();
			return true;
		};

		if (modo === "dinamico") {
			// la flecha nace en la celda pegada al tirador: si esa celda ya esta
			// ocupada (ej: player pegado al arquero), impacta antes de despegar
			if (colision()) return;
			const xi = proyectil.x;
			const yi = proyectil.y;
			const xf = objetivo ? objetivo.x : obj.x + dir.dx * maxDistancia;
			const yf = objetivo ? objetivo.y : obj.y + dir.dy * maxDistancia;
			// se detiene antes si una celda del tramo recto ya está ocupada
			const celdaOcupada = (x, y) =>
				escenaActiva().elementos.some(
					(o) =>
						o.id !== proyectil.id &&
						o.id !== this.id &&
						!o.propiedades("plano") &&
						window.physicsEngine.haySolapamiento(
							{ x, y, z: proyectil.z, w: proyectil.w, h: proyectil.h, d: proyectil.d },
							o,
						),
				);
			const largo = Math.max(Math.abs(xf - xi), Math.abs(yf - yi));
			const sx = Math.sign(xf - xi) || 0;
			const sy = Math.sign(yf - yi) || 0;
			const ax = Math.abs(xf - xi);
			const ay = Math.abs(yf - yi);
			let x = xi;
			let y = yi;
			let errX = 0;
			let corteX = xf;
			let corteY = yf;
			for (let i = 0; i < largo; i++) {
				x += sx;
				errX += ay;
				if (errX * 2 >= ax) {
					y += sy;
					errX -= ax;
				}
				if (celdaOcupada(x, y)) {
					corteX = x;
					corteY = y;
					break;
				}
			}
			// vuelo en línea recta: 0.25s por cada 2 celdas, sin pisar celdas intermedias
			const duracion = (Math.max(Math.abs(corteX - xi), Math.abs(corteY - yi)) / 2) * 250;
			const inicio = performance.now();
			const avanzar = (ahora) => {
				const f = Math.min((ahora - inicio) / duracion, 1);
				proyectil.x = xi + (corteX - xi) * f;
				proyectil.y = yi + (corteY - yi) * f;
				window.sceneManager.actualizarTransformNodo(proyectil);
				if (f < 1) {
					requestAnimationFrame(avanzar);
					return;
				}
				// colision() ya termina el proyectil si impacta: no llamarlo dos veces
				if (colision()) return;
				finBucleProyectil();
			};
			requestAnimationFrame(avanzar);
		} else {
			bucleProyectil = setInterval(() => {
				if (colision()) return;
				if (pasosRecorridos + 1 >= maxDistancia) {
					finBucleProyectil();
					return;
				}
				proyectil.x += dir.dx;
				proyectil.y += dir.dy;
				window.sceneManager.actualizarTransformNodo(proyectil);
				pasosRecorridos++;
			}, 300);
		}
	};
	return obj;
}

function estadoAnimado(elemento) {
	elemento.info = function (estado, mode = "label", acciones) {
		if (
			mode === "label" &&
			(typeof estado !== "object" || estado === null)
		) {
			return elemento.mostrarEnEstado(String(estado), "label");
		}
		if (!elemento.propiedades("estado-visual")) {
			elemento.propiedades("estado-visual", {});
		}
		let texto = "";
		let values = Object.values(estado);
		optionsOpenMenu = {};
		if (mode === "label") {
			elemento.propiedades("estado-visual", {
				...elemento.propiedades("estado-visual"),
				...estado,
			});
			values = Object.values(elemento.propiedades("estado-visual"));
		}
		if (mode === "options") {
			optionsOpenMenu.actions = acciones;
			estado.cerrar = "Cerrar";
			optionsOpenMenu.actions.cerrar = () => {
				evento("menu-info:cerrar");
			};
			optionsOpenMenu.actions.reset = () => {
				elemento.info({}, "label");
			};
		}
		if (values.length > 0) {
			if (mode === "label") {
				for (let val of values) {
					if (!val) continue;
					// si val contiene solo alfabeto, numeros, letras y espacios sin contar con emojis
					if (val.match(/^[a-zA-Z0-9\s]+$/))
						texto += "<div>" + val + "</div>";
					else if (String(val).length === 1)
						texto += "<div class='text-2xl'>" + val + "</div>";
					else texto += "<div>" + val + "</div>";
				}
			}

			if (mode === "options") {
				for (let key in estado) {
					texto += `<div name="${key}" class="bg-white pb-1 px-2 min-w-[90px]">${estado[key]}</div>`;
				}
			}
			elemento.mostrarEnEstado(texto, mode);
			// esperarY(0.5, () => elemento.moverEstado(positionReal.x, positionReal.y, 10), );

			if (mode === "options") {
				window.estado("menu-info:abierto");
				esperar(0.5, () =>
					elemento
						.referenciaEstado()
						.children[0].classList.add("bg-blue-200"),
				);
			}
		}
		if (
			texto === "" &&
			elemento.referenciaEstado &&
			elemento.referenciaEstado()
		) {
			elemento.referenciaEstado().innerHTML = "";
			elemento.referenciaEstado().classList.remove("show");
		}
		return elemento;
	};
	elemento.mostrarEnEstado = function (texto, mode) {
		if (
			elemento?.referenciaEstado === undefined ||
			!elemento.referenciaEstado()
		) {
			estado.reset = () => elemento.estado();
			elemento.referenciaEstado = () =>
				elemento.nodo.querySelector(".block-label");
			const nodoEstado = elemento.referenciaEstado();
			if (nodoEstado) nodoEstado.classList.add("show");
			else {
				const nuevo = document.createElement("div");
				nuevo.classList.add("block-label", "show");
				if (elemento.nodo) elemento.nodo.appendChild(nuevo);
				elemento.referenciaEstado = () =>
					elemento.nodo.querySelector(".block-label");
			}
		}
		if (mode === "options")
			optionsOpenMenu.nodo = elemento.referenciaEstado();
		elemento.referenciaEstado().classList.add("show");
		elemento.referenciaEstado().innerHTML = texto;
		return elemento;
	};
	elemento.fuerza = function (fuerza) {
		elemento.propiedades("fuerza", fuerza);
		return elemento;
	};
	elemento.usarVidas = function (n, imagen) {
		elemento.destruible = true
		elemento.propiedades("vidas", n);
		if (!elemento.propiedades("vidas-imagen"))
			elemento.propiedades("vidas-imagen", imagen || "🟩");
		elemento.info({ vidas: elemento.vidasTexto() });
		window.neto?.cambiar?.(elemento);
		return elemento;
	};
	elemento.restarVida = function (n) {
		n = n || 1;
		let vidas = parseInt(elemento.propiedades("vidas")) - parseInt(n);
		elemento.propiedades("vidas", vidas);

		evento(elemento.id + ":vidas", vidas);
		// haremos que se haga roja la imagen un momento cambiando la tonalidad
		let nodo = elemento.nodo.querySelector("img");
		if (!nodo) nodo = elemento.nodo.querySelector("canvas");
		else {
			nodo.style.filter = `hue-rotate(120deg)`;
			esperarY(0.25, () => {
				nodo.style.filter = ``;
			});
		}
		elemento.info({ vidas: elemento.vidasTexto() });
		window.neto?.cambiar?.(elemento);
		return elemento;
	};
	elemento.perderVida = (n) => {
		if(elemento.vidas() > 0) {
			elemento.restarVida(n);
			if(elemento.vidas() === 0) {
				evento("destruido", { elemento });
				evento("destruido:" + elemento.id, { elemento });
				evento("destruido:@" + elemento.tipo, { elemento });
			}
		}
	}
	elemento.sumarVida = function (n) {
		elemento.propiedades("vidas", elemento.propiedades("vidas") + parseInt(	n || 1 ));
		elemento.info({ vidas: elemento.vidasTexto() });
		window.neto?.cambiar?.(elemento);
		return elemento;
	};
	elemento.vidasTexto = function () {
		const imagen = elemento.propiedades("vidas-imagen") || "🟩";
		const n = Number(elemento.propiedades("vidas")) || 0;
		if(n < 1) return "";
		return "<div class='vidas'>" + imagen.repeat(n) + "</div>";
	};
	elemento.vidas = (n) =>
		n
			? elemento.propiedades("vidas", parseInt(n))
			: parseInt(elemento.propiedades("vidas"));
	elemento.moverEstado = function (newX, newY, z) {
		if (elemento?.referenciaEstado !== undefined) {
			elemento.referenciaEstado().style.transform = "rotateX(-80deg)";
			elemento.referenciaEstado().style.translate = `${parseInt(newX)}px ${parseInt(newY) + 50}px 70px`;

			if (elemento.referenciaEstado().classList.contains("hidden")) {
				esperarY(0.5, () =>
					elemento.referenciaEstado().classList.remove("hidden"),
				);
			}
		}
		return elemento;
	};

	// pasos base de una casilla usados por mover()/moverIzquierda/cantidad (patrullas)
	const pasoMovimiento = (dx, dy, orientacion) => {
		const moved = window.physicsEngine.intentarMover(elemento, dx, dy, 0);
		if (moved && elemento.imagenAlias) {
			elemento.orientacion = orientacion;
			elemento.pintar(elemento.imagenAlias);
			if (!imagenesImportadas.hasOwnProperty(elemento.imagenAlias + "-" + orientacion)) {
				elemento.rotarY(orientacion == "derecha" ? 180 : 0);
			}
		}
		window.neto?.cambiar?.(elemento);
	};
	const moverIzquierda = () => pasoMovimiento(-1, 0, "izquierda");
	const moverDerecha = () => pasoMovimiento(1, 0, "derecha");
	const moverArriba = () => pasoMovimiento(0, -1, "arriba");
	const moverAbajo = () => pasoMovimiento(0, 1, "abajo");
	const mover = (fn, cant) => {
		// la promesa y el encadenado .luego existen desde el primer momento:
		// los niveles se ejecutan en estado "start" y recien se llega a "play"
		// unos ms despues, por eso se espera (como aleatorio) y no se corta.
		let luego = [];
		let resolver;
		const prom = new Promise((resolve) => { resolver = resolve; });
		prom.then(() => { for (const cb of luego) cb(); });
		prom.luego = (cb) => { luego.push(cb); };
		const empezar = () => {
			if (estado() != "play") return setTimeout(empezar, 200);
			if (!cant) {
				fn();
				esperar(0.5).then(resolver);
				return;
			}
			let count = 0;
			const move = async () => {
				if (!elemento?.nodo) return resolver();
				if (elemento?.quieto) return setTimeout(() => move(), 1000);
				if (elemento?.animacionEffect) elemento.animacionEffect();
				if (!elemento?.nodo) return resolver();
				fn();
				if (!elemento?.nodo) return resolver();
				await esperar(0.5, () => {
					count++;
					if (count == cant) return resolver();
					return move();
				});
			};
			move();
		};
		empezar();
		return prom;
	};

	elemento.moverIzquierda = (cant) => mover(moverIzquierda, cant);
	elemento.moverDerecha = (cant) => mover(moverDerecha, cant);
	elemento.moverAbajo = (cant) => mover(moverAbajo, cant);
	elemento.moverArriba = (cant) => mover(moverArriba, cant);
	elemento.avanzar = () => {
		if (elemento.mirando() == "arriba") return mover(moverArriba, 1);
		if (elemento.mirando() == "abajo") return mover(moverAbajo, 1);
		if (elemento.mirando() == "derecha") return mover(moverDerecha, 1);
		if (elemento.mirando() == "izquierda") return mover(moverIzquierda, 1);
	};
	elemento.volver = () => {
		elemento.x = elemento.positionPrev.x;
		elemento.y = elemento.positionPrev.y;
		elemento.z = elemento.positionPrev.z;
		elemento.nodo.style.setProperty("--cx", elemento.positionPrev.x);
		elemento.nodo.style.setProperty("--cy", elemento.positionPrev.y);
		elemento.nodo.style.setProperty("--cz", elemento.positionPrev.z);
	};
	elemento.aleatorio = (limite, tipo) => {
		if (typeof limite === "string") {
			tipo = limite;
			limite = null;
		}
		tipo = tipo || elemento.propiedades("movimiento-aleatorio-tipo");
		if (tipo) elemento.propiedades("movimiento-aleatorio-tipo", tipo);
		if (!limite) {
			limite = {
				x: [1, 18],
				y: [1, 18],
			};
		}
		if (estado() != "play") {
			setTimeout(() => elemento.aleatorio(limite), 250);
			return elemento;
		}
		if (elemento.propiedades("movimiento-aleatorio") == "cancelado") {
			//elemento.nodo.style.transition = "all 3s ease-in-out";
			setTimeout(() => elemento.aleatorio(limite), 250);
			return elemento;
		}
		if (elemento.propiedades("movimiento-aleatorio") == "pausado") {
			setTimeout(() => elemento.aleatorio(limite), 250);
			return elemento;
		}
		if (!elemento.propiedades("movimiento-aleatorio"))
			elemento.propiedades("movimiento-aleatorio", "moviendo");
		const calcTime = () => aleatorio(1, 3) * 1000;
		elemento.nodo.style.transition =
			"transform 0.6s ease-out, translate 0.6s ease-out, opacity 0.15s ease-out";
		try {
			let sentidos = [
				{ dx: 0, dy: 1 }, // abajo
				{ dx: 0, dy: -1 }, // arriba
				{ dx: 1, dy: 0 }, // derecha
				{ dx: -1, dy: 0 }, // izquierda
			];
			// ahora la cantidad, con un maximo de 4
			let sentidoIndex = 0;
			let sentido = null;
			let test = [];
			let count = 0;
			while (!sentido) {
				count++;
				if (count == 4) {
					setTimeout(
						() => elemento.aleatorio(limite),
						calcTime(),
					);
					return elemento;
				}
				sentidoIndex = aleatorio(0, sentidos.length - 1);
				if (test.includes(sentidoIndex))
					sentidoIndex = aleatorio(0, sentidos.length - 1);
				if (test.includes(sentidoIndex))
					sentidoIndex = aleatorio(0, sentidos.length - 1);
				test.push(sentidoIndex);
				let cant = 1;
				let x = elemento.x;
				let y = elemento.y;
				let positionValid = true;
				if (
					y < limite.y[0] ||
					y > limite.y[1] ||
					x < limite.x[0] ||
					x > limite.x[1]
				) {
					elemento.mover(limite.x[0], limite.y[0]);
					setTimeout(
						() => elemento.aleatorio(limite),
						calcTime(),
					);
					return elemento;
				}
				let valid = true;
				// calculamos las nuevas coordenadas
				if (sentidoIndex < 2) {
					if (sentidoIndex == 0) y += cant;
					if (sentidoIndex == 1) y -= cant;
					if (y < limite.y[0] || y > limite.y[1]) valid = false;
				}
				if (sentidoIndex > 1 && valid) {
					if (sentidoIndex == 2) x += cant;
					if (sentidoIndex == 3) x -= cant;
					if (x < limite.x[0] || x > limite.x[1]) valid = false;
				}
				// si pasamos un tipo, la casilla destino debe tener un elemento de ese tipo
				// (ej. .aleatorio("agua") para que el pez no salga del agua)
				if (valid && tipo) {
					valid = window.sceneManager.elementos.some(
						(o) =>
							o.id !== elemento.id &&
							o.tipo === tipo &&
							window.physicsEngine.haySolapamiento(
								elemento,
								o,
								x,
								y,
								elemento.z,
							),
					);
				}
				if (valid) {
					sentido = sentidos[sentidoIndex];
				}
			}
			const moved = window.physicsEngine.intentarMover(
				elemento,
				sentido.dx,
				sentido.dy,
				0,
			);
			if (moved && elemento.imagenAlias) {
				elemento.orientacion = sentido.dx > 0
					? "derecha"
					: sentido.dx < 0
						? "izquierda"
						: sentido.dy > 0 ? "abajo" : "arriba";
				elemento.pintar(elemento.imagenAlias);
				if (
					!imagenesImportadas.hasOwnProperty(
						elemento.imagenAlias + "-" + elemento.orientacion,
					)
				) {
					elemento.rotarY(elemento.orientacion == "derecha" ? 180 : 0);
				}
			}
			setTimeout(
				() => elemento.aleatorio(limite),
				calcTime(),
			);
		} catch (e) {
			setTimeout(() => elemento.aleatorio(limite), calcTime());
		}
		return elemento;
	};

	elemento.usarAnimacion = (efecto) => {
		if (efecto == "scale") {
			elemento.nodo.style.transition = "all 0.15s ease-in-out";
			let animar = () => {
				if (elemento && elemento?.nodo) elemento.nodo.style.scale = 1;
				setTimeout(() => {
					if (elemento && elemento?.nodo)
						elemento.nodo.style.scale = 1.1;
				}, 200);
				setTimeout(() => {
					if (elemento && elemento?.nodo)
						elemento.nodo.style.scale = 1;
				}, 400);
			};
			elemento.animacionEffect = animar;
		}
		return elemento;
	};
}

let optionsOpenMenu = null;
escuchar(
	"arriba",
	() => {
		if (!optionsOpenMenu?.nodo) return;
		const item = optionsOpenMenu.nodo.querySelector(".bg-blue-200");
		if (item && item?.previousElementSibling) {
			item.previousElementSibling.classList.add("bg-blue-200");
			item.classList.remove("bg-blue-200");
		}
	},
	"menu-info:abierto",
);

escuchar(
	"abajo",
	() => {
		if (!optionsOpenMenu?.nodo) return;
		const item = optionsOpenMenu.nodo.querySelector(".bg-blue-200");
		if (item && item?.nextElementSibling) {
			item.nextElementSibling.classList.add("bg-blue-200");
			item.classList.remove("bg-blue-200");
		}
	},
	"menu-info:abierto",
);

escuchar(
	"a",
	() => {
		if (!optionsOpenMenu?.nodo) return;
		if (interaccionStandBy) return;
		const item = optionsOpenMenu.nodo.querySelector(".bg-blue-200");
		if (item) {
			optionsOpenMenu.actions[item.getAttribute("name")]();
		}
	},
	"menu-info:abierto",
);

escuchar(
	"s",
	() => {
		evento("menu-info:cerrar");
	},
	"menu-info:abierto",
);

escuchar(
	"menu-info:cerrar",
	() => {
		if (!optionsOpenMenu?.actions) return;
		optionsOpenMenu.actions.reset();
		estado("play", 1);
	},
	"menu-info:abierto",
);

function animar(obj) {
	if (obj.animado) return obj;
	obj.animado = true;
	//if (!obj.orientacion) obj.orientacion = "abajo";
	obj.propiedades("animado", true);

	obj.mirando = function () {
		return this.orientacion;
	};
	// Cono de vision: filas de ancho creciente, una lista (rayo) por columna lateral.
	// dx/dy = direccion del cono, px/py = eje lateral (en que columna se abre el cono).
	function conoEnRango(x, y, z, dx, dy, px, py, n) {
		const rayos = [];
		for (let lado = -n; lado <= n; lado++) {
			const rayo = [];
			for (let i = 1; i <= n; i++) {
				const ancho = Math.abs(lado);
				if (i >= ancho) {
					rayo.push({
						x: x + dx * i + px * lado,
						y: y + dy * i + py * lado,
						z,
					});
				}
			}
			if (rayo.length) rayos.push(rayo);
		}
		return rayos;
	}
	obj.vision = function (selector, action, distancia) {
		escuchar("mover:" + selector, (info) => {
			let x = obj.x;
			let y = obj.y;
			let z = obj.z;
			if (!distancia) distancia = 2;

			const crearRango = {
				arriba(n) {
					return conoEnRango(x, y, z, 0, -1, 1, 0, n);
				},
				abajo(n) {
					return conoEnRango(x, y, z, 0, 1, 1, 0, n);
				},
				izquierda(n) {
					return conoEnRango(x, y, z, -1, 0, 0, 1, n);
				},
				derecha(n) {
					return conoEnRango(x, y, z, 1, 0, 0, 1, n);
				},
			};

			obj.orientacion = obj.orientacion || "abajo";
			let dir = obj.orientacion;
			if (!crearRango[dir]) dir = "abajo";
			obj.orientacion = dir;
			for (let rayo of crearRango[dir](distancia)) {
				for (let rango of rayo) {
					let objeto = window.sceneManager.elementos.find(
						(e) =>
							e.x == rango.x && e.y == rango.y && e.z == rango.z,
					);
					if (
						info.x == rango.x &&
						info.y == rango.y &&
						info.z == rango.z
					) {
						return action({
							origen: obj,
							objeto,
							x: rango.x,
							y: rango.y,
							z: rango.z,
						});
					}
					// los solidos planos (agua, trampas) no tapan la vista
					if (
						objeto &&
						objeto.propiedades("solido") &&
						!objeto.propiedades("plano")
					) {
						break;
					}
				}
			}
		});
	};
	obj.visionRecta = function (selector, action, distancia) {
		if (!distancia) distancia = 2;

		const rangosDe = () => {
			const x = obj.x, y = obj.y, z = obj.z;
			const direcciones = {
				arriba: (n) => [...Array(n)].map((_, i) => ({ x, y: y - i - 1, z })),
				abajo: (n) => [...Array(n)].map((_, i) => ({ x, y: y + i + 1, z })),
				izquierda: (n) => [...Array(n)].map((_, i) => ({ x: x - i - 1, y, z })),
				derecha: (n) => [...Array(n)].map((_, i) => ({ x: x + i + 1, y, z })),
			};
			return (direcciones[obj.orientacion] || direcciones.abajo)(distancia);
		};

		// ¿la celda (x,y,z) esta en la linea de vision y sin un solido que la tape antes?
		const enVision = (x, y, z) => {
			for (let rango of rangosDe()) {
				if (rango.x == x && rango.y == y && rango.z == z) return true;
				if (escenaActiva().elementos.some(
					(e) =>
						e.id !== obj.id &&
						e.x == rango.x &&
						e.y == rango.y &&
						e.z == rango.z &&
						e.propiedades("solido"),
				)) return false;
			}
			return false;
		};

		// el selector puede ser un id o un tipo (con o sin "@"); ataca a cualquiera en vision
		const sel = selector[0] === "@" ? selector.slice(1) : selector;
		const coinciden = () =>
			escenaActiva().elementos.filter(
				(e) => e.id === selector || e.tipo === sel,
			);

		const dispararSiVisible = (x, y, z) => {
			const objetivo = coinciden().find((e) => enVision(e.x, e.y, e.z));
			if (!objetivo) return;
			return action({
				origen: obj,
				objeto: objetivo,
				x,
				y,
				z,
			});
		};

		// mientras el selector siga dentro de la vision, vuelve a disparar 2s despues
		let rearme;
		const reprogramarDisparo = () => {
			clearTimeout(rearme);
			rearme = setTimeout(() => {
				const objetivo = coinciden().find((e) => enVision(e.x, e.y, e.z));
				if (objetivo) {
					dispararSiVisible(objetivo.x, objetivo.y, objetivo.z);
					reprogramarDisparo();
				}
			}, 2000);
		};

		coinciden().forEach((o) =>
			escuchar("mover:" + o.id, (info) => {
				if (enVision(info.x, info.y, info.z)) {
					dispararSiVisible(info.x, info.y, info.z);
					reprogramarDisparo();
				}
			})
		);
		return obj;
	};
	obj.mirandoObjeto = function () {
		const dirMap = {
			arriba: { dx: 0, dy: -1 },
			abajo: { dx: 0, dy: 1 },
			izquierda: { dx: -1, dy: 0 },
			derecha: { dx: 1, dy: 0 },
		};
		const dir = dirMap[this.orientacion] || { dx: 0, dy: 0 };
		const targetX = this.x + dir.dx;
		const targetY = this.y + dir.dy;

		return window.sceneManager.elementos.filter(
			(o) =>
				o.id !== this.id &&
				window.physicsEngine.haySolapamiento(
					this,
					o,
					targetX,
					targetY,
					this.z,
				),
		);
	};

	obj.dejarDeSeguir = () => {
		if (obj?.persecusion) {
			obj.siguiendo = true;
			obj.persecusion.detener();
		}
		return obj;
	};
	obj.seguir = (config) => {
		// $seguir
		// calcularemos la ruta utilizando los puntos de referencia y los obstaculos que deberemos rodear
		// utilizaremos un metodo eficiente para encontrar la ruta mas corta
		if (obj["persiguiendo"]) return obj;
		obj.solido().animar();
		obj.persiguiendo = true;
		let repeticion = repetir(() => {
			// obstaculos
			let obstaculos = [];
			for (let i = 0; i < escenaActiva().elementos.length; i++) {
				let item = escenaActiva().elementos[i];
				// si es solido/colisionable
				if (item.id == obj.id || item.id === "player") continue;
				if (item.propiedades("solido")) {
					// si es un obstaculo
					obstaculos.push({ x: item.x, y: item.y });

					if (item.w > 1) {
						for (let j = 0; j < item.w; j++) {
							obstaculos.push({
								z: item.z,
								x: item.x + j,
								y: item.y,
							});
						}
					}
					if (item.h > 1) {
						for (let j = 0; j < item.h; j++) {
							obstaculos.push({
								z: item.z,
								x: item.x,
								y: item.y + j,
							});
						}
					}
				}
			}
			let route = encontrarRutaAStar(
				{ x: obj.x, y: obj.y },
				{ x: player().x, y: player().y },
				obstaculos,
			);
			if (route === null) return;
			if (route.length < 2) return;
			let to = route[1];

			// calcularemos hacia donde debe mirar
			const mirando = () => {
				if (to.x < obj.x) return "izquierda";
				if (to.x > obj.x) return "derecha";
				if (to.y > obj.y) return "abajo";
				if (to.y < obj.y) return "arriba";
			};
			let sentido = mirando();

			if (to.x == player().x && to.y == player().y) {
				// colision
				if (config.hasOwnProperty("colision")) config.colision({
					objeto: obj,
					quien: obj,
					con: player(),
				});
				evento("colision:" + obj.id, {
					objeto: obj,
					quien: obj,
					con: player(),
				});
				obj.orientacion = sentido;
				obj.pintar(obj.imagenAlias, {
					pausado: false,
					repetir: true,
				});
				return;
			}
			let found = escenaActiva()
				.en(to.x, to.y, obj.z, true)
				.filter((o) => o.id !== obj.id && o.id !== "player" && o.propiedades("solido"));
			if (found.length > 0) return;

			obj.mover(to.x, to.y);
			obj.orientacion = sentido;
			obj.pintar(obj.imagenAlias, {
				pausado: false,
				repetir: true,
			});
		}).cada(1.5);
		if (config) {
			if (config.hasOwnProperty("repeticion")) {
				repeticion.repeticion(config.luego);
			}
		}
		obj.persecusion = repeticion;

		return obj;
	};
	decir(obj);
	lanzar(obj);
	estadoAnimado(obj);
	//obj.pintar(obj.imagenAlias);
	return obj;
}

let interaccionStandBy = false;
escuchar(
	"a",
	(evento) => {
		if (interaccionStandBy) return;
		let objeto = player().mirandoObjeto();
		if (objeto && Array.isArray(objeto) && objeto.length > 0) {
			for (let item of objeto) {
				// interaccion
				if (typeof item?.interaccion === "function") {
					interaccionStandBy = true;
					item.interaccion({
						elemento: item,
						objeto: () => item,
					})
						.then(() => {
							interaccionStandBy = false;
						})
						.catch(() => {
							interaccionStandBy = false;
						});
					return;
				} else {
					window.evento("interactuar:" + item.id, {
						elemento: item,
						objeto: () => item,
					})
					window.evento("interactuar:@" + item.tipo, {
						elemento: item,
						objeto: () => item,
					})
				}
			}
		}
	},
	"play",
);

function repetir(accion) {
	let n = 1;
	let limit = 100000;
	const fn = () => {
		n++;
		if (n < limit) {
			accion();
		} else {
			if (interval) clearInterval(interval);
		}
	};
	let interval = setInterval(() => {
		fn();
	}, n * 1000);
	let manager = {
		cada(segundos) {
			clearInterval(interval);
			fn();
			interval = setInterval(() => {
				fn();
			}, segundos * 1000);
			return manager;
		},
		detener() {
			clearInterval(interval);
			return manager;
		},
		veces(veces) {
			limit = veces;
			if (!interval) {
				for (let i = 0; i < veces; i++) {
					fn(i);
				}
			}
			return manager;
		},
	};
	return manager;
}

function encontrarRutaAStar(inicio, destino, obstaculos) {
	const GRID_SIZE = 19;
	const obstaculosSet = new Set(obstaculos.map((o) => `${o.x},${o.y}`));

	function esValido(x, y) {
		return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
	}

	function esObstaculo(x, y) {
		return obstaculosSet.has(`${x},${y}`);
	}

	// Distancia Manhattan (SOLO 4 DIRECCIONES)
	function distanciaManhattan(a, b) {
		return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
	}

	// Si inicio o destino son obstáculos
	if (esObstaculo(inicio.x, inicio.y) || esObstaculo(destino.x, destino.y)) {
		return null;
	}

	// ✅ SOLO 4 DIRECCIONES (sin diagonales)
	const direcciones = [
		{ dx: 0, dy: -1 }, // arriba
		{ dx: 0, dy: 1 }, // abajo
		{ dx: -1, dy: 0 }, // izquierda
		{ dx: 1, dy: 0 }, // derecha
	];

	// Estructuras de datos para A*
	const openSet = new Map();
	const closedSet = new Set();

	// ✅ Almacenar padre como objeto con coordenadas
	const padres = new Map();

	// Inicializar nodo de inicio
	const startKey = `${inicio.x},${inicio.y}`;
	openSet.set(startKey, {
		x: inicio.x,
		y: inicio.y,
		g: 0,
		h: distanciaManhattan(inicio, destino),
		f: distanciaManhattan(inicio, destino),
	});
	padres.set(startKey, null);

	while (openSet.size > 0) {
		// Encontrar nodo con menor f en openSet
		let mejorNodo = null;
		let mejorKey = null;
		let mejorF = Infinity;

		for (const [key, nodo] of openSet) {
			if (nodo.f < mejorF) {
				mejorF = nodo.f;
				mejorNodo = nodo;
				mejorKey = key;
			}
		}

		// Si no hay nodos en openSet, no hay ruta
		if (!mejorNodo) break;

		// Si llegamos al destino
		if (mejorNodo.x === destino.x && mejorNodo.y === destino.y) {
			// ✅ Reconstruir el camino paso a paso
			return reconstruirCaminoAStar(padres, inicio, destino);
		}

		// Mover de openSet a closedSet
		openSet.delete(mejorKey);
		closedSet.add(mejorKey);

		// Explorar vecinos (SOLO 4 DIRECCIONES)
		for (const dir of direcciones) {
			const nuevaX = mejorNodo.x + dir.dx;
			const nuevaY = mejorNodo.y + dir.dy;
			const key = `${nuevaX},${nuevaY}`;

			// Validar posición
			if (!esValido(nuevaX, nuevaY)) continue;
			if (esObstaculo(nuevaX, nuevaY)) continue;
			if (closedSet.has(key)) continue;

			// ✅ Costo de movimiento = 1 (siempre 1 para 4 direcciones)
			const nuevoG = mejorNodo.g + 1;

			// Si el nodo ya está en openSet, actualizar si encontramos mejor camino
			if (openSet.has(key)) {
				const nodoExistente = openSet.get(key);
				if (nuevoG < nodoExistente.g) {
					nodoExistente.g = nuevoG;
					nodoExistente.f = nuevoG + nodoExistente.h;
					padres.set(key, { x: mejorNodo.x, y: mejorNodo.y });
				}
				continue;
			}

			// Crear nuevo nodo
			const nuevoNodo = {
				x: nuevaX,
				y: nuevaY,
				g: nuevoG,
				h: distanciaManhattan({ x: nuevaX, y: nuevaY }, destino),
				f:
					nuevoG +
					distanciaManhattan({ x: nuevaX, y: nuevaY }, destino),
			};

			openSet.set(key, nuevoNodo);
			padres.set(key, { x: mejorNodo.x, y: mejorNodo.y });
		}
	}

	// No se encontró ruta
	return null;
}

// ✅ Función CORREGIDA para reconstruir el camino paso a paso
function reconstruirCaminoAStar(padres, inicio, destino) {
	const camino = [];
	let actual = { x: destino.x, y: destino.y };

	// ✅ Reconstruir desde el destino hacia el inicio
	while (actual) {
		camino.unshift({ x: actual.x, y: actual.y });

		const key = `${actual.x},${actual.y}`;
		const padre = padres.get(key);

		// Si no hay padre, hemos llegado al inicio
		if (!padre) break;

		// ✅ Avanzar al padre (1 paso a la vez)
		actual = { x: padre.x, y: padre.y };
	}

	// ✅ Verificar que el camino comience en el inicio
	if (
		camino.length > 0 &&
		(camino[0].x !== inicio.x || camino[0].y !== inicio.y)
	) {
		console.warn("⚠️ El camino no comienza en el inicio");
		return null;
	}

	return camino;
}

async function pescar(tipos) {
	if (String(player().mirandoObjeto()[0]?.tipo) !== "agua") {
		return ayuda("No hay agua donde pescar");
	}
	player().inventario.cerrar();
	estado("pescando", 60);
	if (!Array.isArray(tipos)) {
		return errorRender(
			"Pescar requiere de la lista de alias de peces ['pez1','pez2',....]",
		);
	}
	if (!escenaActiva().hasOwnProperty("eventoPescar")) {
		console.log("====Registrando evento pescar===");
		escenaActiva()["eventoPescar"] = true;
		escuchar(
			"a",
			() => {
				player().pintar("player");
				estado("play");
				return;
			},
			"pescando",
		);
	}
	let vista = player().mirando();
	if (vista == "izquierda") {
		player().nodo.style.translate = "-20px -10px";
	}
	if (vista == "derecha") {
		player().nodo.style.translate = "20px -10px";
	}
	if (vista == "arriba") {
		player().nodo.style.translate = "0px -20px";
	}
	if (vista == "abajo") {
		player().nodo.style.translate = "0px 20px";
	}
	player().pintar("pesca-" + vista, {
		pausado: true,
		repetir: true,
	});
	let suerte = aleatorio(0, 10);
	let pescados = [1, 0, 1, 1, 2, 2, 3, 0, 2, 0];
	let tiempo = aleatorio(3, 15);
	player().decir("Presiona A cuando piqué", 2);
	esperarY(tiempo, () => {
		if (estado() == "pescando") {
			player().animacion.play();
			let peces = [null, ...tipos];
			let pez = pescados[suerte];
			esperarY(2, () => {
				if (pez > 0) {
					if (estado() == "play") {
						let y = player().y;
						let x = player().x;
						if (vista == "arriba") {
							y = player().y - 1;
						}
						if (vista == "abajo") {
							y = player().y + 1;
						}
						if (vista == "derecha") {
							x = player().x + 1;
						}
						if (vista == "izquierda") {
							x = player().x - 1;
						}
						let pezItem = escenaActiva().agregar(x, y, peces[pez]);

						esperarY(0.5, () => pezItem.margenY(-90));

						esperarY(1.5, () => {
							pezItem.margenY(0);
							if (vista == "arriba") pezItem.margenY(40);
							if (vista == "izquierda" || vista == "derecha") {
								if (vista == "izquierda") pezItem.margenX(50);
								if (vista == "derecha") pezItem.margenX(-50);
							}
						});
						esperarY(2.5, () => pezItem.eliminar());
						player().inventario.guardar(peces[pez]);
						player().decir("Es uno grande!.", 2);
					} else player().decir("Escapo...", 2);
				} else {
					estado("play");
					player().decir("Supongo que se comieron la carnada", 2);
				}
				player().pintar("player");
				player().nodo.style.translate = "0px 0px";
			});
		}
	});
}


function preguntar(actor, pregunta, respuestas) {
	return actor.preguntar(pregunta, respuestas);
}
