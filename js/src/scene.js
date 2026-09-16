
let magneticListener;

function crearId(id , imageAlias){
	if (!id) {
		id =
			imageAlias +
			`-c-${semilla() ? idFromSeed() : Math.random().toString(36).substr(2, 9)}`;
	}
	// id solo puede contener letras, numeros y guiones
	if(id.match(/[^a-zA-Z0-9-]/g)){
		id = id.replace(/[^a-zA-Z0-9-]/g, '');
	}
	return id
}

class SceneManager {
	constructor() {
		this.grid = document.getElementById("grid");
		this.gridWrap = document.getElementById("gridWrap");
		this.cameraViewport = document.getElementById("cameraViewport");
		this.jugador = null;
		this.siguienteId = 1;
		this.zoom = 1.6;
		this.idSeleccionado = null;
		this.modoCamara = true;
		this.elementos = [];
		evento("scene:created", true)

		// respaldo de seleccion por click: el hit-test del 3D proyectado es
		// impreciso (el click a veces cae en el overlay y no llega al bloque),
		// asi que si el click no aterrizo en ningun bloque, se elige el mas
		// cercano al cursor dentro de un radio de 50px
		document.addEventListener("click", (e) => {
			// si existe en la queryurl neto=1 ignoraremos la seleccion
			if (new URLSearchParams(location.search).has("neto")) return;
			// si se hizo click en algun bloque, no hacer nada
			if (e.target.closest?.(".block")) return;
			if (e.target.closest?.("button, a, input, select, textarea, .actor-chip, .barInfo")) return;
			// buscar cell en el stack 3D del punto clickado
			const cells = document.elementsFromPoint(e.clientX, e.clientY);
			const cell = cells.find(el => el.classList?.contains('cell') && el.parentElement?.id === 'grid');
			if (cell) {
				const idx = [...cell.parentNode.children].indexOf(cell);
				window.selectedPosition = { x: idx % 20, y: Math.floor(idx / 20) };
				document.querySelector('.cell.selected')?.classList.remove('selected')
				cell.classList.add('selected')
			}
			const x = e.clientX, y = e.clientY;
			let mejor = null, mejorD = 50;
			for (const o of this.elementos) {
				if (!o.nodo) continue;
				if (o.propiedades("visible") === false) continue;
				const r = o.nodo.getBoundingClientRect();
				const d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
				if (d < mejorD) { mejorD = d; mejor = o; }
			}
			if (mejor) this.seleccionarObjeto(mejor.id);
		});
	}

	seleccionar(id) {
		this.seleccionarObjeto(id);
	}
	actualizarCamara2() {
		if (!this.modoCamara) {
			this.cameraViewport.classList.add("dev-mode");
			this.gridWrap.style.transform = `scale(0.8) translate3d(-100px, 40px, 0px)`;
			this.actualizarOclusion();
			return;
		}

		this.cameraViewport.classList.remove("dev-mode");

		if (!this.jugador) return;

		const cellW = 60;
		const cellD = 60;
		const cellH = 40;

		const px = (this.jugador.x + this.jugador.w / 2) * cellW;
		const py = (this.jugador.y + this.jugador.d / 2) * cellD;
		const pz = (this.jugador.z + this.jugador.h / 2) * cellH;

		const gridCenterY = 600;
		const cos45 = Math.cos((45 * Math.PI) / 180);
		const sin45 = Math.sin((45 * Math.PI) / 180);

		const distYFromCenter = py - gridCenterY;
		const proyectadoY = gridCenterY + distYFromCenter * cos45 - pz * sin45;

		const vpWidth = 500 / this.zoom;
		const vpHeight = 300 / this.zoom;

		const translateX = vpWidth / 2 - px;
		const translateY = vpHeight / 2 - proyectadoY;

		this.gridWrap.style.transform = `scale(${this.zoom}) translate3d(${translateX}px, ${translateY}px, 0px)`;
		this.actualizarOclusion();
	}

	actualizarCamara() {
		if (!this.modoCamara) {
			this.cameraViewport.classList.add("dev-mode");
			// sin transicion: con el render loop activo, medir el grid proyectado
			// es estable (si no, el transform anima cada frame y la medida se corrompe)
			this.gridWrap.style.transition = "none";
			// .camera-viewport.dev-mode cambia tamano a 1000x520 con zoom:0.6 y
			// transicion all .25s; se fija inline para que el layout estalle
			// (snap) a su forma final y la medicion sea determinista
			if (!this._devPersp) {
				// capturar la proyeccion EFECTIVA de juego (main.js puede no haber
				// seteado el inline aun, y el default CSS de 640px la deforma)
				const cs = getComputedStyle(this.gridWrap);
				this._devPersp = cs.perspective;
				this._devOrig = cs.perspectiveOrigin;
				this._devVpTrans = this.cameraViewport.style.transition;
			}
			this.cameraViewport.style.transition = "none";
			this.gridWrap.style.perspective = "4400px";
			this.gridWrap.style.perspectiveOrigin = "50% 50%";
			const vp = this.cameraViewport.getBoundingClientRect();
			if (vp.width > 0 && vp.height > 0 && this.grid) {
				// cámara libre: encajar la escena completa (1200px) y centrarla.
				// la proyeccion con perspectiva no es lineal, asi que se itera
				// el translate hasta que el centro proyectado quede en el del viewport
				const gw = this.gridWrap;
				gw.style.transform = `scale(1) translate3d(0px, 0px, 0px)`;
				const g = this.grid.getBoundingClientRect();
				const s = Math.min(vp.width / g.width, vp.height / g.height) * 0.92;
				const vpx = vp.left + vp.width / 2;
				const vpy = vp.top + vp.height / 2;
				let tx = 0, ty = 0;
				for (let i = 0; i < 6; i++) {
					gw.style.transform = `translate3d(${tx}px, ${ty}px, 0px) scale(${s})`;
					const g2 = this.grid.getBoundingClientRect();
					const dx = vpx - (g2.left + g2.width / 2);
					const dy = vpy - (g2.top + g2.height / 2);
					// el translate se aplica despues de la escala (1.5x en pantalla),
					// amortiguar para converger en vez de oscilar
					tx += dx * 0.6;
					ty += dy * 0.6;
					if (Math.abs(dx) + Math.abs(dy) < 1) break;
				}
				gw.style.transform = `translate3d(${tx}px, ${ty}px, 0px) scale(${s})`;
			}
			this.actualizarOclusion();
			return;
		}

		this.cameraViewport.classList.remove("dev-mode");
		// restaurar la transicion del grid al volver al modo juego
		// en desliz, la camara viaja a la misma velocidad que el bloque (mismos ms, linear)
		this.gridWrap.style.transition = this.jugador?.deslizando
			? `transform ${typeof INTERVALO_DESLIZAR_MS === "number" ? INTERVALO_DESLIZAR_MS : 300}ms linear`
			: "";
		if (this.jugador) {
			// replicar la camara 3D de main.js (camera.updateFromPlayer): sin esto,
			// tras salir de libre la perspectiva quedaria en el default CSS (640px)
			// y la vista de juego se deforma hasta que el jugador se mueve
			const j = this.jugador;
			this.gridWrap.style.perspective = `${Math.round((1 + j.y * 0.1) * 2000)}px`;
			this.gridWrap.style.perspectiveOrigin = `${5 * j.x}% ${5 * j.y}%`;
		} else {
			this.gridWrap.style.perspective = this._devPersp || "";
			this.gridWrap.style.perspectiveOrigin = this._devOrig || "";
		}
		this.cameraViewport.style.transition = this._devVpTrans || "";
		this._devPersp = null;
		this._devOrig = null;
		this._devVpTrans = null;

		let elemento = escenaActiva().elementos.find(
			(o) => o.id == this.idSeleccionado,
		);
		if (!elemento) return;
		const cellW = 60;
		const cellD = 60;
		const cellH = 40;

		const px = (elemento.x + elemento.w / 2) * cellW;
		const py = (elemento.y + elemento.d / 2) * cellD;
		const pz = (elemento.z + elemento.h / 2) * cellH;

		const gridCenterY = 600;
		const cos45 = Math.cos((45 * Math.PI) / 180);
		const sin45 = Math.sin((45 * Math.PI) / 180);

		const distYFromCenter = py - gridCenterY;
		const proyectadoY = gridCenterY + distYFromCenter * cos45 - pz * sin45;

		const vpWidth = 500 / this.zoom;
		const vpHeight = 300 / this.zoom;

		const translateX = vpWidth / 2 - px;
		const translateY = vpHeight / 2 - proyectadoY;
		let x = translateX - 50
		if(x > 0) x = -10
		if(x < -790) x = -790
		let y = translateY
		if(y < -754) y = -750
		this.gridWrap.style.transform = `scale(${this.zoom}) translate3d(${x}px, ${y}px, 0px)`;
		this.actualizarOclusion();
	}

	actualizarOclusion() {
		if (!this.jugador) return;

		// Centro de cámara (el seleccionado o el jugador)
		const centro =
			this.elementos.find((o) => o.id === this.idSeleccionado) ||
			this.jugador;
		const cW = 500 / this.zoom;
		const cH = 300 / this.zoom;
		const modoCamara = this.modoCamara;

		this.elementos.forEach((obj) => {
			// ocultos a prop�sito: no se tocan
			if (obj.propiedades("visible") === false) return;

			if (modoCamara && obj.id !== this.jugador.id) {
				const margen = 60;
				// Culling por caja (AABB): un objeto solo se oculta si TODO su
				// rectangulo cae fuera de la vista. Usar el centro (como antes)
				// hacia desaparecer objetos largos (ej: muros/rios) aunque una
				// parte visible tocara al player.
				const cos45 = Math.cos(Math.PI / 4);
				const sin45 = Math.sin(Math.PI / 4);
				const proyectado = (y, z) =>
					(y - 600) * cos45 - z * sin45;
				// centro de camara en espacio proyectado
				const cpx = (centro.x + centro.w / 2) * 60;
				const Pc = proyectado(
					(centro.y + centro.d / 2) * 60,
					(centro.z + centro.h / 2) * 40
				);
				// rango X del objeto
				const xMin = obj.x * 60;
				const xMax = (obj.x + obj.w) * 60;
				// rango proyectado del objeto (a partir de sus esquinas)
				const Pmax = proyectado(
					(obj.y + obj.d) * 60,
					obj.z * 40
				);
				const Pmin = proyectado(
					obj.y * 60,
					(obj.z + obj.h) * 40
				);
				const fuera =
					xMax < cpx - cW / 2 - margen ||
					xMin > cpx + cW / 2 + margen ||
					Pmax < Pc - cH / 2 - margen ||
					Pmin > Pc + cH / 2 + margen;

				if (fuera) {
					obj.nodo.classList.add("off-screen");
					if (obj.animacion && !obj._gifFueraYa) {
						obj._gifFueraYa = true;
						obj.animacion.pause();
					}
				} else {
					obj.nodo.classList.remove("off-screen");
					if (obj.animacion && obj._gifFueraYa) {
						obj._gifFueraYa = false;
						if (!obj._gifPausadoPorConfig)
							obj.animacion.play();
					}
				}
			} else {
				obj.nodo.classList.remove("off-screen");
			}

			if (obj.id === this.jugador.id) return;
			if (obj.h <= 0 || obj.propiedades("plano")) {
				obj.nodo.classList.remove("occluding");
				return;
			}

			const dy = obj.y - this.jugador.y;
			if (dy <= 0) { obj.nodo.classList.remove("occluding"); return; }

			const solapaX = obj.x < this.jugador.x + this.jugador.w &&
				obj.x + obj.w > this.jugador.x;
			if (!solapaX) { obj.nodo.classList.remove("occluding"); return; }

			const cubreAlturaZ = obj.z + obj.h >= this.jugador.z;
			const cerca = obj.h >= dy * 2.0;
			if (cubreAlturaZ && cerca) {
				obj.nodo.classList.add("occluding");
			} else {
				obj.nodo.classList.remove("occluding");
			}
		});
	}
	
	actualizarTransformNodo(obj) {
		if (!obj.nodo) return;
		obj.nodo.style.setProperty("--cx", obj.x);
		obj.nodo.style.setProperty("--cy", obj.y);
		obj.nodo.style.setProperty("--cz", obj.z);
		
		return;
		const lbl = obj.nodo.querySelector(".block-label");
		if (lbl) {
			const dirText = obj.esPlayer ? ` [${obj.orientacion}]` : "";
			lbl.textContent = obj.esPlayer
				? `Player${dirText}`
				: `${obj.tipo} #${obj.id} (P:${obj.peso})`;
		}
	}
	buscar(selector, items){
		if(!items) items = this.elementos;
		if(selector.startsWith("@")){
			selector = selector.replace("@", "");
			return items.filter((o) => o.tipo === selector);
		}
		return items.filter((o) => o.id === selector);
	}
	agregar(x, y, image, id, config) {
		return this.crearObjeto(x, y, image, id, {
			z: 0,
			w: 1,
			h: 1,
			d: 1,
			ocupado:false,
			solido: true,
			fuerza: 1,
			peso: 10,
			...config,
		});
	}
	agregarEnInfo(contenedor, aliasImage, col) {
		// si no existe la imagen
		if (!urlsImages[aliasImage]) {
			errorRender("No existe la imagen " + aliasImage+ " debes importarla en el boton [imagenes] ");
			return;
		}
		let div = document.querySelector("#" + contenedor);
		if (!div) {
			div = document.createElement("div");
			div.id = contenedor;
			div.className = "flex gap-1 px-2 py-1";
			div.style = "grid-row:1;grid-column:" + col;
			document.querySelector("#barInfo").appendChild(div);
		}
		let image = document.createElement("img");
		image.style.width = "auto";
		image.style.height = "30px";
		image.src = urlsImages[aliasImage].url;
		image.eliminar = () => image.remove();
		div.appendChild(image);
		return image;
	}
	cambiarPiso(url, cover, position) {
		// si url no tiene / buscaremos como si url fuera un imageAlias
		if (url.search("/") === -1) {
			const alias = url;
			const aplicarCuandoEste = () => {
				const data = imagenesImportadasData[alias];
				if (data) {
					this.aplicarPiso(data, cover, position);
				} else {
					// la imagen (fetch bas64) aun no cargo: reintento hasta que exista
					setTimeout(aplicarCuandoEste, 100);
				}
			};
			aplicarCuandoEste();
			return this;
		}
		this.aplicarPiso(url, cover, position);
		return this;
	}
	aplicarPiso(url, cover, position) {
		let fondo = this.gridWrap.querySelector(":scope > .piso");
		if(!fondo){
			fondo = document.createElement("div");
			fondo.className = "piso";
			this.gridWrap.appendChild(fondo);
		}
		// el piso vive en un plano fantasma hundido para que los bloques
		// con z negativo (agua z:-1, etc.) queden delante y no tapados
		fondo.style.backgroundImage = `url('${url}')`;
		fondo.style.backgroundSize = cover || "cover";
		fondo.style.backgroundPosition = position || "center";
		this.grid.style.backgroundImage = "none";
		let configPiso = {
			repetir(n) {
				let x = setInterval(() => {
					if(fondo){
						if(n === true) fondo.style.backgroundRepeat = "repeat";
						if(n === false) fondo.style.backgroundRepeat = "no-repeat";
						if(n === 'x') fondo.style.backgroundRepeat = "repeat-x";
						if(n === 'y') fondo.style.backgroundRepeat = "repeat-y";
						clearInterval(x);
					}
				}, 10)
				return configPiso;
			},
			cubrir(){
				let x = setInterval(() => {
					if(fondo){
						fondo.style.backgroundSize = "cover";
						clearInterval(x);
					}
				}, 10)
				return configPiso
			}
		}
		return configPiso
	}

	/*
	Paredes de fondo de la escena (visuales, sin física):
	fondo("atras"|"izquierda"|"derecha", urlOAlon) — planos parados en los
	bordes del grid, usando el mismo transform 3D de las caras del cubo.
	*/
	fondo(lado, url, config = {}) {
		if (url.search("/") === -1) url = imagenesImportadasData[url];
		const H = config.alto || 8; // altura en niveles (40px cada uno)
		const pos = {
			// bloque gigante atras: w=20, d=1 en y=0
			atras: {
				nodo: `translate3d(600px, 5px, ${H * 20}px)`,
				cara: `translate(-50%,-50%) rotateX(260deg) translateZ(30px)`,
				w: 1200,
				h: H * 40,
			},
			// bloque gigante izquierda: w=1, d=20 en x=0
			izquierda: {
				nodo: `translate3d(30px, 600px, ${H * 20}px)`,
				cara: `translate(-50%,-50%) rotateY(-90deg) translateZ(30px)`,
				w: H * 40,
				h: 1200,
			},
			// bloque gigante derecha: w=1, d=20 en x=19
			derecha: {
				nodo: `translate3d(1170px, 600px, ${H * 20}px)`,
				cara: `translate(-50%,-50%) rotateY(90deg) translateZ(30px)`,
				w: H * 40,
				h: 1200,
			},
		};
		const p = pos[lado];
		if (!p) {
			errorRender("fondo(): lado desconocido [", lado, "]");
			return;
		}
		// reutilizar el div si se llama otra vez con el mismo lado
		let div = this.grid.querySelector(`.fondo-pared[data-lado="${lado}"]`);
		if (!div) {
			div = document.createElement("div");
			div.className = "fondo-pared";
			div.setAttribute("data-lado", lado);
			this.grid.appendChild(div);
		}
		div.style.width = p.w + "px";
		div.style.height = p.h + "px";
		div.style.backgroundImage = `url('${url}')`;
		div.style.transform = `${p.nodo} ${p.cara}`;
		
		if(config.hasOwnProperty("y")){
			// si config es numero agregamos px sino agregamos como texto nomas
			div.style.backgroundPositionY = `${config.y}%`;	
		}
		return div;
	}

	

	cargarJSON(jsonStr) {
//this.limpiarEscena();
//const datos = JSON.parse(jsonStr);
//datos.forEach((d) =>
//	this.crearObjeto(d.x, d.y, d.imagenAlias, d.id, d),
//);
	}

	crearNodoHTML(obj) {
		const el = document.createElement("div");
		el.className =
			"block" +
			(obj.esPlayer ? " player" : "") +
			(!obj.propiedades("solido") ? " non-solid" : "") +
			(obj.tipo ? " " + obj.tipo : "");
		el.id = "nodo-" + obj.id;
		el.style.setProperty("--w", obj.w);
		el.style.setProperty("--h", obj.h);
		el.style.setProperty("--d", obj.d);

		const cols = {
			north: "#2563eb",
			south: "#1d4ed8",
			east: "#3b82f6",
			west: "#1e40af",
			up: "#60a5fa",
			down: "#1e3a8a",
		};
		for (const f in cols) el.style.setProperty("--color-" + f, cols[f]);

		const cube = document.createElement("div");
		cube.className = "cube";
		["north", "south", "east", "west", "up", "down"].forEach((face) => {
			const f = document.createElement("div");
			f.className = "face face-" + face;

			// Asignar imagen si está definida
			if (obj.imagenAlias) {
				f.style.backgroundImage = `url('${imagenesImportadasData[obj.imagenAlias]}')`;
				f.style.backgroundSize = "cover";
				f.style.backgroundPosition = "center";
			}

			cube.appendChild(f);
		});
		el.appendChild(cube);

		const lbl = document.createElement("div");
		lbl.className = "block-label";
		el.appendChild(lbl);

		el.addEventListener("click", (e) => {
			// si existe neto en query url ignoramos
			if (new URLSearchParams(location.search).has("neto")) return;
			e.stopPropagation();
			this.seleccionarObjeto(obj.id);
		});

		this.grid.appendChild(el);
		return el;
	}
	crearObjeto(x, y, imageAlias, id, config) {
		if (id && typeof id === "object") {
			config = { ...id };
			id = null;
			if (config.hasOwnProperty("id")) id = config.id;
		}
		if (id) {
			try {
				// ids destruidos de forma compartida (neto/backend): no se recrean
				if (window.neto?.eliminados?.has?.(id) && !config?.resucitar) {
					console.log('Error crear: id destruido en el backend:', id)
					return elementoFantasma(id, x, y);
				}
				let guardado = datos.elementos[id];
				// no recreamos objetos que estan guardados en un inventario, ni enemigos destruidos
				if (guardado && !config?.resucitar) {
					if (guardado.propiedades?.["guardado-en"]) {
						console.log('Error crear: ya existe el id:', id, " guardado en el inventario de: ", guardado.propiedades["guardado-en"])
						return elementoFantasma(id, x, y);
					}
					if (guardado.destruido && (!guardado.escena || guardado.escena == escenaActiva().name)) {
						console.log('Error crear: el id fue eliminado:', id)
						return elementoFantasma(id, x, y);
					}
				}
			} catch (error) {
				console.log('Datos corruptos o no existen')
			}

			try{
				let el = escenaActiva().elementos.find((i) => id == i.id);
				if (el) {
					console.log('Error crear: ya existe el id:', id)
					return el;
				}
			} catch (error) {
				console.log('Error al buscar id en elementos')
			}
		}
		id = crearId(id, imageAlias)
		
		let propiedades = {
			cubo: config?.cubo || false,
			solido: config?.solido !== undefined ? config.solido : true,
			plano: config?.plano !== undefined ? config.plano : false,
			peso: config?.peso !== undefined ? config.peso : 10,
			fuerza:
				config?.fuerza !== undefined
					? config.fuerza
					: config?.esPlayer
						? 1
						: 0,
			orientacion: config?.orientacion || "abajo",
			tipo: config?.tipo || imageAlias,
			imagenAlias: imageAlias || null,
			escena: config?.escena || "principal",
			esPlayer: config?.esPlayer || false,
			animadoImagen: config?.animadoImagen || {},
			interactuando:false,
			items: [],
			piso:false,
			vidas: config?.vidas || 1,
			"2d": false,
		};
		// restaurar propiedades custom serializadas (imanes: magnetico, material, peso, etc.)
		if (config) {
			for (let key in config) {
				if (propiedades.hasOwnProperty(key)) continue;
				if (["id","x","y","z","w","h","d","nodo","media","img","configOriginal","tipo","imagenAlias"].includes(key)) continue;
				propiedades[key] = config[key];
			}
		}
		const elemento = {
			id,
			x: x || 0,
			y: y || 0,
			z: config?.z || 0,
			w: config?.w || 1,
			h: config?.h || 1,
			d: config?.d || 1,
			positionPrev: { x: x || 0, y: y || 0, z: config?.z || 0 },
			cubo: config?.cubo || false,
			configOriginal: config,
			destruible:false,
			orientacion: config?.orientacion || "", // N, S, E, W
			tipo: config?.tipo || imageAlias,
			imagenAlias: imageAlias || null,
			escena: config?.escena || "principal",
			esPlayer: !!config?.esPlayer,
			installed:false,
			nodo: null,
			items: [],
			alto(h) {
				elemento.nodo.style.setProperty("--h", h);
				propiedades.alto = h
				elemento.h = h;
				return elemento.baseAlPiso();
			},
			ancho(w) {
				elemento.nodo.style.setProperty("--w", w);
				propiedades.ancho = w
				elemento.w = w;
				return elemento.baseAlPiso();
			},
			animar() {
				propiedades.animar = true
				propiedades.animado = true
				return animar(elemento);
			},
			baseAlPiso() {
				// alinea la base de la imagen (img/canvas) al piso del cubo
				// (la cara mas cercana a y=20), sin margenes manuales
				const media = elemento?.media?.objeto;
				if (!media || !elemento.nodo) return elemento;
				const face = elemento.nodo.querySelector(".face-south");
				if (!face) return elemento;
				const faceH = (parseFloat(elemento.nodo.style.getPropertyValue("--h")) || 1) * 40;
				if (media.tagName === "IMG" && !media.naturalWidth) {
					media.addEventListener("load", () => elemento.baseAlPiso(), { once: true });
					return elemento;
				}
				let imgH;
				if (media.tagName === "IMG") {
					const w = (parseFloat(elemento.nodo.style.getPropertyValue("--w")) || 1) * 60;
					imgH = w * media.naturalHeight / media.naturalWidth;
				} else {
					// canvas: dimensiones no predecibles, usar escala real del plano de la cara
					const S = face.getBoundingClientRect().height / faceH;
					imgH = media.getBoundingClientRect().height / S;
					if (!imgH) return elemento;
				}
				// margenY manual del usuario tiene prioridad sobre la alineacion automatica
				if (typeof propiedades.margenY === "number") {
					media.style.marginTop = propiedades.margenY + "px";
				} else {
					media.style.marginTop = (faceH - imgH) + "px";
				}
				return elemento;
			},
			capa(z) {
				// $capa
				if (typeof z !== "number") {
					errorRender("Capa debe ser un numero:"+ z);
					throw new Error("La capa debe ser un numero");
				}
				elemento.z = z;
				elemento.mover(elemento.x , elemento.y)
				return elemento;
			},
			guardarItem(tipo, id){
				elemento.item = { tipo }
				if(id) elemento.item.id = id
				else elemento.item.id = elemento.id +"-"+ tipo
				
				// el arquero suelta su llave al morir: el id estable (llave-calabozo) la
				// replica en ambos navegadores via ws:created y queda en el estado del backend
				escuchar("destruido:"+elemento.id, ({ elemento }) => {
					elemento.item.creado = escenaActiva()
						.agregar(
							elemento.x,
							elemento.y,
							elemento.item.tipo,
							elemento.item.id
						)
						.solido()
						.escala(.5)
						.interactuar(() => player().inventario.guardar(elemento.item.creado))
						.propiedades("recoger", true);
				});
				return elemento
			},
			escala(n) {
				let dx = setInterval(() => {
					if(!(elemento?.media?.objeto || elemento.nodo)) return ;
					if(elemento?.media && elemento?.media?.objeto){
						elemento.media.objeto.style.transform = elemento.media.objeto.style.transform + ` scale(${n}) `;
					} else {
						let nodo = elemento.nodo.querySelector('img')
						if(nodo)
							nodo.style.transform = elemento.nodo.querySelector('img')?.style.transform + ` scale(${n}) `
					}
					clearInterval(dx)
				}, 50)
				propiedades.escala = n
				window.neto?.cambiar?.(elemento)

				return elemento
			},
			eliminar() {
				escenaActiva().eliminarObjeto(elemento.id);
			},
			esPiso() {
				return !!elemento.propiedades("piso");
			},
			expandir(w, d, h) {
				if(typeof w === "object") {
					h = w.h
					d = w.d
					w = w.w
				}
				// d y h son opcionales: si no se envian conservan su valor actual
				// (el default h:1 de agregar), asi llamadas viejas expandir(w,d)
				// no dejan h en undefined y rompen la colision (physics NaN)
				elemento.nodo.style.setProperty("--h", h ?? elemento.h);
				elemento.nodo.style.setProperty("--w", w);
				if (d !== undefined) elemento.nodo.style.setProperty("--d", d);
				elemento.propiedades("expandir",{ w, h: h ?? elemento.h, d: d ?? elemento.d })
				elemento.w = w;
				if (d !== undefined) elemento.d = d;
				if (h !== undefined) elemento.h = h;
				escenaActiva().actualizarTransformNodo(elemento);
				return elemento;
			},
			exportar(){	
				let el = JSON.stringify(elemento)
				let config = JSON.parse(el)
				let ignoreKeys = ["nodo","media","img","configOriginal"];
				
				for(let key of ignoreKeys) {
					if(config?.hasOwnProperty(key)) delete config[key];
				}
				
				for(let key in elemento.propiedades()) {
					if(!ignoreKeys.includes(key)) config[key] = elemento.propiedades(key)
				}

				return config
			},
			deslizar(v) {
				// modo deslizamiento: avanza suave mientras se sostiene una flecha, sin paso a paso
				elemento.deslizando = v !== false;
				// transicion a juego con INTERVALO_DESLIZAR_MS (main.js): velocidad constante, sin saltos
				if (elemento.deslizando) {
					const ms = typeof INTERVALO_DESLIZAR_MS !== "undefined" ? INTERVALO_DESLIZAR_MS : 230;
					elemento.nodo.style.transition =
						`transform ${ms}ms linear, translate ${ms}ms linear, opacity 0.15s ease-out`;
				} else {
					elemento.nodo.style.transition = "";
				}
				return elemento;
			},
			filtro(key, value){
				let filtros = {
					foco(value){
						// add efecto pulse
						elemento.nodo.style.filter = `blur(${value}px)`
					}
				}
				if(filtros.hasOwnProperty(key)) {
					filtros[key](value)
					if(!propiedades.hasOwnProperty('filtro')) propiedades['filtro'] = {}
					propiedades['filtro'][key] = value
				}
				return filtros
			},
			quitarFiltro(key){
				let filtros = {
					foco(){
						elemento.nodo.style.filter = ""
					}
				}
				if(filtros.hasOwnProperty(key)) filtros[key]()
				return filtros
			},
			guardado( id ){
				if(id === undefined) return propiedades["guardado"]
				if(id === false) return elemento.noGuardado()
				if(typeof id != "string") {
					errorRender("id debe ser un texto")
					throw "id debe ser un texto"
				}
				if(!escenaActiva().elementos.find( i => i.id == id )){
					errorRender("No existe el componente:#"+id)
					throw "No existe el componente:#"+id
				}
				propiedades["guardado"] = true
				propiedades["guardado-en"] = id
				return elemento
			},	
			imagen(prop, value) {
				if(!propiedades?.imagen) propiedades.imagen = {}
				propiedades.imagen[prop] = value
let aliasProps = {
				ancho: "width",
				alto: "height",
				tamano: "background-size",
				z: "translate",
				y: "translate",
				x: "translate",
				repetir: "background-repeat",
			};
				let propCss = prop
				if(prop == "repetir") {
					value = "repeat";
				}
				if (aliasProps[prop]) propCss = aliasProps[prop];
				if(prop == "2d"){
					elemento.propiedades("2d", true)
					for(let nodo of elemento.nodo.querySelectorAll('canva,img')) {
						nodo.remove()
					}
					let frente = elemento.nodo.querySelector('.face-south')
					insertarImagenEnNodo(frente, elemento.imagenAlias, "background")
					//frente.style.background = 'url('+imagenesImportadasData[elemento.imagenAlias]+')';
					frente.style.backgroundRepeat = "no-repeat"
					frente.style.backgroundSize = "100%"
					frente.style.backgroundPosition = "bottom"
					frente.style.backfaceVisibility = "visible"
				}
				else if(elemento?.media){
					if(prop == "ancho" || prop == "alto") {
						elemento?.media?.objeto.style.setProperty(
							propCss,
							value +
								(value.endsWith("px") || value.endsWith("%")
									? ""
									: "px"),
						);
					}
					if(prop == "x" || prop == "y" || prop == "z") {
						let translate = ['0px', '0px', '0px']
						let prev = elemento?.media?.objeto?.style?.translate
						if(prev){
							let p = prev.split(' ')
							if(p.length == 2) p.push('0px')
							if(p.length == 3) translate = p
						}
						let keyId = ['x', 'y', 'z'].indexOf(prop)
						translate[keyId] = value + "px"
						if (elemento?.media?.objeto) elemento.media.objeto.style.translate = translate.join(' ')
					}
				}
				else {
					for(let nodo of elemento.nodo.querySelectorAll('.face')) {
						nodo.style.setProperty(propCss, value);
						if(prop=="repetir") {
							nodo.style.setProperty("background-size", "auto");
							nodo.style.setProperty("backface-visibility", "visible");
						}
					}
				}
				return elemento;
			},
			info(texto) {
				elemento.nodo.querySelector(".block-label").innerHTML = texto;
				elemento.nodo.querySelector(".block-label").style.display =
					"flex";
				return elemento;
			},	
			interactuar(fn) {
				if(!fn) {
					errorRender("interactuar recibe una funcion como parametro")
					throw "interactuar recibe una funcion como parametro"
				}
				if(typeof fn != "function") {
					errorRender("interactuar debe ser una funcion")
					throw "interactuar debe ser una funcion"
				}
				// se guarda como string para poder restaurarla al sacar el objeto del inventario
				propiedades["interactuarFunction"] = fn.toString();
				elemento.interaccion = async(n, e) => {
					if(elemento.interactuando) return ;
					elemento.interactuando = true
					n.con = n.objeto()
					await fn(n, e);
					elemento.interactuando = false
					return true
				}
				propiedades["colisionable"] = true;
				return elemento;
			},
			largo(d){
				elemento.nodo.style.setProperty("--d", d);
				propiedades.largo = d
				elemento.d = d;
				return elemento.baseAlPiso();
			},
			lanzar(conf, tecla){
				let config = {
					imagen:conf,
					distancia:4,
				}
				if(typeof conf === "object") config = conf
				else {
					if(tecla){
						config.tecla = tecla
					}
				}
				// si no ejecutamos .animar() lo ejecutamos
				if (!elemento.hasOwnProperty("animado")){
					elemento.animar()
					return elemento.lanzar( config )
				} 
				
				return elemento.lanzar( config )
			},
			noMagnetico(){
				elemento.propiedades("magnetico-material", false)
				elemento.propiedades("magnetico", false)
				return elemento
			},
			magnetico(material){
				if (material === false ) {
					elemento.noMagnetico()
					return elemento
				}

				if(typeof material != "string") {
					errorRender("El material que atraera debe ser un texto")
					throw "El material que atraera debe ser un texto"
				}

				if (!material) {
					elemento.propiedades("magnetico")
					return elemento
				}

				elemento.propiedades("magnetico", !!material)
				
				if (elemento.propiedades("magnetico")) {
					elemento.propiedades("magnetico-material", material)
					listenMagnetic();
				}


				return elemento
			},
			margenY(n) {
				if(elemento?.media && elemento?.media?.objeto){
					elemento.media.objeto.style.marginTop = n + "px";
				} else{
					elemento.nodo.style.marginTop = n + "px";
				}
				propiedades.margenY = n
				window.neto?.cambiar?.(elemento)
				return elemento;
			},
			margenX(n) {
				if(elemento?.media && elemento?.media?.objeto){
					elemento.media.objeto.style.marginLeft = n + "px";
				} else {
					elemento.nodo.style.marginLeft = n + "px";
				}
					propiedades.margenX = n
				window.neto?.cambiar?.(elemento)
				return elemento;
			},
			material(material){
				if (!material) return propiedades["material"];
				if(typeof material != "string") {
					errorRender("Material debe ser un texto")
					throw "Material debe ser un texto"
				}
				propiedades["material"] = material
				return elemento
			},
			mostrar() {
				elemento.nodo.style.visibility = "visible";
				elemento.visible = true;
				elemento.propiedades("visible", true);
				return elemento;
			},
			mover(x,y,z) {
				elemento.x = x;
				elemento.y = y;
				if(z !== undefined) elemento.z = z;
				else z = elemento.z
				
				window.physicsEngine.intentarMover(elemento, x, y, z, true);
				
				return elemento;
			},
			moverX(x) {
				elemento.mover(x, elemento.y);
				return elemento;
			},
			moverY(y) {
				elemento.mover(elemento.x, y);
				return elemento;
			},
			saltar(distancia = 2, altura = 2) {
				// salto horizontal: avanza en la orientacion, salva 1 celda y aterriza
				// (por defecto x -> x + 2). Bloqueado si la celda de aterrizaje esta ocupada.
				if (
					elemento.enElAire ||
					elemento.z > 0 ||
					elemento.ocupado === true
				) return elemento;
				const dirMap = {
					derecha: { dx: 1, dy: 0 },
					izquierda: { dx: -1, dy: 0 },
					abajo: { dx: 0, dy: 1 },
					arriba: { dx: 0, dy: -1 },
				};
				const dir = dirMap[elemento.orientacion] || { dx: 1, dy: 0 };
				const x0 = elemento.x, y0 = elemento.y, z0 = elemento.z;
				const xf = x0 + dir.dx * distancia;
				const yf = y0 + dir.dy * distancia;
				const ocupado = (cx, cy, soloAltos = false) =>
					escenaActiva().elementos.some(
						(o) =>
							o !== elemento &&
							o.propiedades("solido") &&
							!o.propiedades("plano") &&
							(!soloAltos || o.h >= 2) &&
							window.physicsEngine.haySolapamiento(
								{ x: cx, y: cy, z: z0, w: elemento.w, h: elemento.h, d: elemento.d },
								o,
							),
					);
				// los obstaculos altos (h>=2) a mitad del camino no se pueden saltar
				const hayAltoEnCamino = Array.from({ length: distancia - 1 }, (_, i) => i + 1).some(
					(paso) => ocupado(x0 + dir.dx * paso, y0 + dir.dy * paso, true),
				);
				if (
					xf < 0 || xf > 19 || yf < 0 || yf > 19 ||
					ocupado(xf, yf) ||
					hayAltoEnCamino
				) {
					elemento.decir("no puedo saltar aqui", 1.5);
					return elemento;
				}
				elemento.enElAire = true;
				elemento.ocupado = true; // bloquea flechas/desliz/acciones durante el salto
				if (elemento.animacion?.pause) elemento.animacion.pause();
				const zf = Math.min(z0 + altura, 9); // limite del grid (z max 10)
				const dur = 700; // ms en el aire
				const inicio = performance.now();
				const step = (ahora) => {
					const t = Math.min((ahora - inicio) / dur, 1);
					const phi = t < 0.5 ? 2 * t : 2 * (1 - t); // sube y baja
					elemento.x = x0 + (xf - x0) * t;
					elemento.y = y0 + (yf - y0) * t;
					elemento.z = z0 + (zf - z0) * phi;
					escenaActiva().actualizarTransformNodo(elemento);
					escenaActiva().actualizarCamara();
					if (t < 1) {
						requestAnimationFrame(step);
						return;
					}
					elemento.x = xf; elemento.y = yf; elemento.z = z0; // aterriza exacto
					escenaActiva().actualizarTransformNodo(elemento);
					escenaActiva().actualizarCamara();
					elemento.enElAire = false;
					elemento.ocupado = false;
					revisarColisionesAlAgregar(elemento);
					if (elemento.animacion?.play) elemento.animacion.play();
				};
				requestAnimationFrame(step);
				return elemento;
			},
			seguir(config){
				// si aun no se ejecuto animar, lo ejecuta
				if (!elemento.hasOwnProperty("animado")){
					elemento.animar();
					return elemento.seguir(config)
				}
				return elemento;
			},
			colisionableCon(selector, fn) {
				// dispara cuando ESTE elemento colisiona (sea solido o no: physics.js
				// emite "colision" para ambos) con algo que coincide con el selector
				// (@tipo o id). elemento = este objeto, con = el otro.
				escuchar("colision", ({ objeto, con }) => {
					if (!objeto || !con || !escenaActiva().elementos.includes(elemento)) return;
					const esYo = (o) => o.id === elemento.id;
					const otro = esYo(objeto) ? con : esYo(con) ? objeto : null;
					if (!otro) return;
					const matchea = selector.startsWith("@")
						? otro?.tipo === selector.slice(1)
						: otro?.id === selector;
					if (matchea) fn({ elemento, con: otro });
				}, "play");
				return elemento;
			},
			noSolido() {
				propiedades.solido = false;
				return elemento;
			},
			orientar(orientacion) {
				elemento.orientacion = orientacion;
				const base = elemento.imagenAlias;
				// los cubos (paredes) pintan sus caras con background; `pintar` ahí
				// inserta un <img> solitario y borra el fondo del muro
				if (elemento.cubo) return elemento;
				// pone la mirada del canvas/img actual (se vuelve a aplicar tras pintar,
				// porque pintar puede recrear el nodo de media)
				elemento.pintar(base);
				return elemento;
			},
			noGuardado(){
				propiedades["guardado"] = false
				delete propiedades["guardado-en"]
				return elemento
			},
			ocultar(){
				elemento.nodo.style.visibility = "hidden";
				elemento.visible = false;
				elemento.propiedades("visible", false);
				return elemento;
			},
			peso(num) {
				propiedades.peso = num;
				return elemento;
			},
			pintar(imageAlias, config) {
				if(!imageAlias) return elemento;
				let url = "";
				let newAlias = imageAlias
				const hayVariante = imagenesImportadas.hasOwnProperty(
					imageAlias + "-" + elemento.orientacion,
				)
				if (hayVariante) {
					newAlias = imageAlias + "-" + elemento.orientacion;
					url =
						imagenesImportadas[
							imageAlias + "-" + elemento.orientacion
						];
				}
				// sin sprite por direccion: espeja el base para mirar en horizontal,
				// sin pisar las demas propiedades del transform del media
				// (ponytail: se asume que el sprite base mira a la izquierda; para otro
				// lado natural registrar <alias>-derecha / <alias>-izquierda)
				const espejar = !hayVariante && elemento.orientacion === "derecha";
				const voltearMirada = () => {
					const im = elemento.media?.objeto;
					if (!im) return;
					const t = (im.style.transform || "")
						.replace(/\s*scaleX\(-1\)\s*/g, " ")
						.trim();
					im.style.transform = espejar
						? "scaleX(-1)" + (t ? " " + t : "")
						: t;
				};
				voltearMirada();
				if(elemento.installed && newAlias == elemento.imagenAlias) return elemento;

				if(newAlias != elemento.imagenAlias) {
					imageAlias = newAlias
				}

				if(!config && elemento.hasOwnProperty("media")) config = elemento.media.config
								
				if (!url) {
					if (imagenesImportadas.hasOwnProperty(imageAlias)) {
						url = imagenesImportadas[imageAlias];
					}
				}
				if (!url) {
					console.log(
						"No se encontro la imagen: [" +
							imageAlias +
							"] tampoco [" +
							imageAlias +
							"-" +
							elemento.orientacion +
							"]",
					);
				}
				
				if (url) {
					let urlData = null;

					const updateGUI = () => {
						if (
							url.search(".gif") > -1 &&
							config &&
							config.hasOwnProperty("pausado")
						) {
							let canvas = elemento["canvas"];
							if (imageAlias !== elemento.imageInstalled) {
								elemento.imageInstalled = imageAlias;
								if (canvas !== undefined) {
									canvas.remove();
								}
								// elemento instalado originalmente como <img> (sin config):
								// la pasada gif crea un <canvas>; borrar el <img> viejo o
								// quedan dos sprites visibles encimados
								if (elemento?.img) {
									elemento.img.remove();
									elemento.img = null;
								}
								canvas = document.createElement("canvas");
								elemento.media = {
									objeto: canvas,
									config,
									type: "canvas",
								};
								elemento.nodo.appendChild(canvas);
							}
							
							const installCanvasGifPlayer = () => {
								if (canvas.playerGif && elemento.imageInstalled === imageAlias) return; // ya esta instalado este gif; no apilar bucles
								canvas.playerGif = createGifPlayer({
									canvas,
									loop: config.hasOwnProperty("repetir")
										? config.repetir
										: false,
									url: imagenesImportadasData[imageAlias]
								});
								
								// cuando el gif termine de cargar, aplicar el estado actual de la animacion
								// (si el usuario ya llamo animacion.play, reproducir; si no, usar config.pausado)
								(canvas.playerGif.cuandoListo || Promise.resolve()).then(() => {
									if (elemento.animacion.pausado === true)
										canvas.playerGif.pause();
									else
										canvas.playerGif.play();
								});
							}

							if(!imagenesImportadasData[imageAlias]){
								let x = setInterval(() => {
									if(imagenesImportadasData[imageAlias]){
										installCanvasGifPlayer()
										clearInterval(x)
									} else console.log('imagen no lista ', imageAlias)
								}, 50)
							} else {
								installCanvasGifPlayer()
							}
							elemento._gifPausadoPorConfig = config["pausado"] === true;
							elemento.animacion = {
								pausado: config["pausado"],
								play: (t) => {
									elemento.animacion.pausado = false;
									if (t)
										esperarY(t, () => {
											canvas.playerGif.pause();
										});
									return canvas.playerGif.play();
								},
								reiniciar: () => canvas.playerGif.reiniciar(),
								pause: () => {
									elemento.animacion.pausado = true;
									if(canvas.playerGif?.pause) canvas.playerGif.pause();
								},
								pausa: () => {
									elemento.animacion.pausado = true;
									if(canvas.playerGif?.pause) canvas.playerGif.pause();
								},
								reset: () => {
									elemento.animacion.pausado = false;
									return canvas.playerGif.reset();
								},
								siguiente: () => canvas.playerGif.next(),
								atras: () => canvas.playerGif.prev(),
								frame: (n) => canvas.playerGif.getFrame(n),
								repetir: (n) => canvas.playerGif.useLoop(true),
								playReverso: (t) => {
									elemento.animacion.pausado = false;
									if (t)
										esperarY(t, () => {
											canvas.playerGif.pause();
										});
									return canvas.playerGif.playReverso();
								}
							};
							canvas.style.marginLeft = (propiedades?.margenX || "-20") +"px";
							canvas.style.marginTop = (propiedades?.margenY || "-10") +"px";
							if(propiedades.hasOwnProperty("animadoImagen")){
								if(propiedades.animadoImagen.hasOwnProperty(elemento.orientacion)){
									canvas.style.translate = `${ propiedades.animadoImagen[elemento.orientacion]?.x || 0 }px ${ propiedades.animadoImagen[elemento.orientacion].y || 0 }px ${ propiedades.animadoImagen[elemento.orientacion].z || 0 }px`
								}
								if(propiedades.hasOwnProperty("escala")){
									canvas.style.scale = propiedades.escala
								}
							} 
							elemento.canvas = canvas;
							elemento.nodo
								.querySelectorAll(".face")
								.forEach((f) => {
									f.style.background = "none";
								});
						} else {
							if (!elemento.hasOwnProperty("media")) {
								let img = document.createElement("img");
								img.style.display = "block";
								img.style.width = "100%";
								img.style.height = "auto";
								//img.style.marginTop = "-25px";
								elemento.media = { objeto: img, type: "image" };
								elemento.nodo
									.querySelectorAll(".face")
									.forEach(
										(f) => (f.style.background = "none"),
									);
								elemento.nodo
									.querySelector(".face-south")
									.appendChild(img);
								elemento.img = img;
							}
							insertarImagenEnNodo(elemento.media.objeto, imageAlias)
						}
					};
					
					updateGUI();
					voltearMirada();
					elemento.installed = true;
				}
				return elemento;
			},
			piso(w,d) {
				elemento.noSolido()
				elemento.plano()
				elemento.propiedades("piso", true)
				// el piso es suelo: el z-index del .block pesa (cy+d)*100, asi un
				// piso ancho (3x3, 4x4...) taparia a quien camina encima. Se hunde
				// debajo de todo lo que no sea piso para que se pise "por encima".
				elemento.nodo.style.zIndex =
					"calc((var(--cy) + var(--d)) * 100 + var(--cz) * 10 + var(--cx) - 1000000)"
				if(w && d){
					elemento.nodo.style.setProperty("--w", w);
					elemento.nodo.style.setProperty("--d", d);
				}
				return elemento
			},
			plano() {
				elemento.propiedades("plano", true)
				let tx = setInterval(() => {
					if(!elemento.nodo) return ;
					elemento.nodo.querySelector(".face img")?.remove();
					// pintaremos la cara inferior del cubo
					let img = document.createElement("img");
					img.style.width = "100%";
					img.style.height = "100%";
					elemento.media = { objeto: img, type: "image-plain" };
					elemento.plano = true;
					let faceDown = elemento.nodo.querySelector(
						".face-down"
					)
					insertarImagenEnNodo(img, elemento.imagenAlias)
					faceDown.style.backfaceVisibility = "visible";
					faceDown.appendChild(img);
					Array.from(faceDown.parentNode.children).forEach((face) => {
						face.style.boxShadow = "none";
					})
					clearInterval(tx)
				}, 50)
				return elemento;
			},
			propiedades(key, val) {
				if (key === undefined) return propiedades;
				if (val === undefined) return propiedades[key];
				propiedades[key] = val;
				if (key === "recoger" && val && typeof elemento.interaccion !== "function") {
					// ítem de recogida (guardarItem): al recargar el elemento recreado
					// desde datos/neto se re-cablea la interacción para que se guarde
					// en el inventario, sin depender de la string de función.
					elemento.interaccion = async () => {
						if (elemento.interactuando) return;
						elemento.interactuando = true;
						try { await player().inventario.guardar(elemento); }
						finally { elemento.interactuando = false; }
						return true;
					};
					propiedades["colisionable"] = true;
				}
				if (key === "x" || key === "y" || key === "z")
				escenaActiva().actualizarTransformNodo(elemento);
				elemento.baseAlPiso();
				return elemento;
			},
			rotarX(val, updated) {
				$styleTransform(elemento.nodo, "rotateX", { val });
				elemento.propiedades("rotarX", val)
				if(updated) updated(elemento);
				return elemento;
			},
			rotarY(val, updated, nodo) {
				$styleTransform(nodo || elemento.nodo, "rotateY", { val });
				if(updated) updated(elemento);
				elemento.propiedades("rotarY", val)
				return elemento;
			},
			rotarZ(val, updated) {
				$styleTransform(elemento.nodo, "rotateZ", { val });
				if(updated) updated(elemento);
				elemento.propiedades("rotarZ", val)
				/*
				let width = elemento.nodo.offsetWidth;
				let height = elemento.nodo.offsetHeight;
				setTimeout(() => {
					elemento.nodo.style.width = height+"px";
					elemento.nodo.style.height = width+"px";
				},500)
				*/
				return elemento;
			},
			solido(v) {
				elemento.propiedades("solido", v || true);
				return elemento;
			},
			transparencia(v) {
				elemento.propiedades("transparencia", v);
				// opacity<1 en el .block fuerza flattening de preserve-3d y
				// derrumba las caras; se aplica a las caras hijas
				elemento.nodo.querySelectorAll(".face, img, canvas").forEach((f) => {
					f.style.opacity = v;
				});
				return elemento;
			},
			usarInventario(items){
				if(items && Array.isArray(items)) elemento.propiedades("items", items)
				if(!elemento.propiedades("items")){
					elemento.propiedades("items", [])
				}
				convertirEnAlmacen(() => elemento);
				return elemento
			},
			vision(){
				return elemento
			},
		};
		if(config?.escala){
			elemento.escala(config.escala)
		}
		elemento.nodo = this.crearNodoHTML(elemento);
		elemento.nodo.setAttribute('tipo', elemento.tipo)
		if (config?.cubo) {
			elemento.nodo.classList.add("cubo-style");
			elemento.nodo.querySelectorAll(".face").forEach((f) => {
				f.style.backgroundImage =
					"url('" + imagenesImportadas[imageAlias] + "')";
				f.style.backgroundSize = "cover";
				f.style.backgroundPosition = "center";
				f.style.backgroundRepeat = "repeat";
			});
		} else {
			elemento.pintar(imageAlias, config);
		}
		this.actualizarTransformNodo(elemento);

		// restaurar la interaccion guardada como string al sacar el objeto del inventario
		// y para elementos recreados desde el backend/datos (la propiedad puede llegar
		// con el resto del estado restaurado, despues de crearObjeto)
		const restaurarInteraccion = () => {
			if (!elemento.propiedades("interactuarFunction") || typeof elemento.interaccion === "function") return;
			const interOriginal = elemento.propiedades("interactuarFunction");
			try {
				let fnNueva = new Function(
					"elemento",
					"player",
					"escenaActiva",
					"return (" + interOriginal + ")",
				)(elemento, player, escenaActiva);
				elemento.interaccion = async (n, e) => {
					// si la funcion original quedó con referencias rotas (variables de la escena),
					// volvemos a guardar el objeto en el inventario para que siga siendo usable
					try {
						await fnNueva.call(elemento, n, e);
					} catch (error) {
						console.log("interaccion restaurada con fallback de #" + elemento.id, error);
						player().inventario.guardar(elemento);
					}
				};
				elemento.propiedades("interactuarFunction", interOriginal);
				elemento.propiedades("colisionable", true);
			} catch (error) {
				console.log("Error al restaurar interaccion de #" + elemento.id, error);
			}
		};
		restaurarInteraccion();

		if (elemento.esPlayer) {
			elemento.animar()
			this.jugador = elemento;
		}
		// restaurar estado guardado: posicion de empujados, vidas y propiedades
		try {
			let saved = datos?.elementos?.[elemento.id];
			if (saved && !saved.destruido && (elemento.esPlayer || saved.escena == escenaActiva().name)) {
				for (let p in (saved.propiedades || {})) {
					if (p == "items" || p == "guardado" || p == "guardado-en") continue;
					if (elemento.esPlayer && !["vidas", "vidas-imagen"].includes(p)) continue;
					elemento.propiedades(p, saved.propiedades[p]);
				}
				if (!elemento.esPlayer && typeof elemento.x !== "function") {
					if (saved.x !== undefined) elemento.x = saved.x;
					if (saved.y !== undefined) elemento.y = saved.y;
					if (saved.z !== undefined) elemento.z = saved.z;
					this.actualizarTransformNodo(elemento);
				}
			}
		} catch (error) {
			console.log("Error restaurando estado de #" + elemento.id, error);
		}
		// ahora si, la restauracion de estado ya cargo propiedades e interaccion
		restaurarInteraccion();
		//this.seleccionarObjeto(elemento.id);
		estadoAnimado(elemento);
		this.actualizarCamara();
		escenaActiva().elementos.push(elemento);
		evento('creado', elemento);
		evento('creado:@'+elemento.tipo, {elemento});
		evento('creado:'+elemento.id, {elemento});
		// sincronizar objetos creados en tiempo real (neto)
		if (window.neto?.activo && window.neto?.listo && !window.neto?.silencioso && typeof window.red === "function") {
			window.red("ws:created", window.neto.serializar(elemento));
		}
		revisarColisionesAlAgregar(elemento);
		return elemento;
	}

	eliminarObjeto(id) {
		if(typeof id === 'object') id = id.id
		const index = this.elementos.findIndex((o) => o.id === id);
		if (index === -1) return;

		const obj = this.elementos[index];
		if (obj.nodo) obj.nodo.remove();

		// si es un enemigo o un objeto guardado (en un inventario), marcamos que fue eliminado para que no reaparezca
		// (ponytail: destruible = usa vida, es un enemigo matable aunque no use seguir(): el arquero/otros
		//  lanzadores tambien deben quedar destruidos en el backend si el jugador los mata)
		if (!obj.esPlayer && (obj.persiguiendo || obj.destruible || obj.propiedades("guardado"))) {
			try {
				if (!datos.hasOwnProperty("elementos")) datos.elementos = {};
				datos.elementos[obj.id] = { destruido: true, escena: escenaActiva().name };
				escribirMemoria();
			} catch (error) {}
			// lista compartida en el backend: el id no debe volver a crearse en la escena.
			// incluye enemigos (caja/arquero/espectro) y objetos del inventario (comida):
			// ambos deben desaparecer en todos los navegadores; al tirar un item su id vuelve
			// a liberarse (ws:restaurar)
			if (
				obj.id &&
				window.neto?.activo && window.neto?.listo && !window.neto?.silencioso &&
				typeof window.red === "function"
			) {
				window.neto.eliminados = window.neto.eliminados || new Set();
				window.neto.eliminados.add(obj.id);
				window.red("ws:eliminado", { id: obj.id });
			}
		}

		if (obj.esPlayer) this.jugador = null;
		this.elementos.splice(index, 1);
		// sincronizar eliminaciones en tiempo real (neto)
		if (window.neto?.activo && window.neto?.listo && !window.neto?.silencioso && typeof window.red === "function") {
			window.red("ws:removed", { id, x: obj.x, y: obj.y, z: obj.z });
		}

		// buscaremos en los items tambien
		this.elementos.forEach((o) => {
			if (o.hasOwnProperty("items")) {
				o.items = o.items.filter((i) => i.id !== id);
			}
		});

		if (this.idSeleccionado === id) {
			this.idSeleccionado =
				this.elementos.length > 0 ? this.elementos[0].id : null;
		}

		if (window.actualizarUI) window.actualizarUI();
		this.actualizarCamara();
	}

	en(x,y,z, todos){
		const prepare = res => {
			res.buscar = (selector) => escenaActiva().buscar(selector, res)
			return res
		}
		// buscaremos el elemento que esta en esta posicion
		if(z === undefined) z = 0
		if(z === true || todos === true){
			// buscaremos todos los que coincidan
			return prepare(Array.from(this.elementos.filter(o => o.x == x && o.y == y && o.z == z)));
		}
		else{
			// buscaremos el primero que coincida
			return prepare(Array.from(this.elementos.find(o => o.x == x && o.y == y && o.z == z)));
		}
	}

	esPiso(x,y,z) {
		return this.elementos.find(o => o.x == x && o.y == y && o.z == (z || 0) && o.propiedades("piso"));
	}

	exportarJSON() {
		const datos = this.elementos.map((o) => ({
			id: o.id,
			x: o.x,
			y: o.y,
			z: o.z,
			w: o.w,
			h: o.h,
			d: o.d,
			solido: o.propiedades("solido"),
			peso: o.propiedades("peso"),
			fuerza: o.propiedades("fuerza"),
			orientacion: o.orientacion,
			tipo: o.tipo,
			imagen: o.imagenAlias,
			escena: o.escena,
			esPlayer: o.esPlayer,
		}));
		return JSON.stringify(datos, null, 2);
	}

	limpiarEscena() {
		this.elementos.forEach((o) => o.nodo.remove());
		this.elementos = [];
		this.jugador = null;
		this.idSeleccionado = null;
		this.siguienteId = 1;
		if (window.actualizarUI) window.actualizarUI();
	}
	ocupada(x, y, z) {
		if(!z) z = 1
		// retornara true o false si esta ocupada la casilla en las coordenadas que recibe
		for(let elemento of escenaActiva().elementos) {
			if (elemento.propiedades("guardado")===true) continue;
			if (elemento?.expandido !== undefined) {
				for (let cell of elemento.expandido) {
					if (cell.x == x && cell.y == y && cell.z == z) {
						return elemento;
					}
				}
			}
			if(elemento.x == x && elemento.y == y)
				return elemento;
		}
	}

	seleccionado(){
		return this.elementos.find(o => o.id == this.idSeleccionado);
	}

	colisionarPorTipo(tipo, cb) {
		// el player colisiona con cualquier elemento de este tipo (solido o no:
		// events.js expande "colision" a colision:@tipo en ambos casos).
		// elemento = el de tipo, con = el player.
		if (tipo.startsWith("@")) tipo = tipo.slice(1);
		escuchar(`colision:@${tipo}`, ({ objeto, con }) => {
			if (!objeto || !con) return;
			const deTipo = objeto.tipo === tipo ? objeto : con;
			const otro = deTipo === objeto ? con : objeto;
			if (!otro?.esPlayer) return;
			cb({ elemento: deTipo, con: otro });
		}, "play");
		return this;
	}

	seleccionarObjeto(id) {
		if(this.idSeleccionado){
			document.querySelector(`.actor-chip[name="${this.idSeleccionado}"]`)?.classList.remove('selected')
		}
		this.idSeleccionado = id;
		document.querySelector(`.actor-chip[name="${id}"]`)?.classList.add('selected')
		this.elementos.forEach((o) => {
			o.nodo.classList.toggle("selected", o.id === id && !o.esPlayer);
		});
		if (window.actualizarUI) window.actualizarUI(id);
	}

	toggleModoCamara() {
		this.modoCamara = !this.modoCamara;
		this.actualizarCamara();
		return this.modoCamara;
	}
}

window.sceneManager = new SceneManager();

/**
 * 
	
@elemento.ancho(cantidad:number),
	
	@elemento.animar(),
	
	@elemento.altura(cantidad:number),
	
	@elemento.capa(ejeZ:number),
	
	@elemento.escala(0.0-0.9:number),
	
	@elemento.eliminar(),
	
	@elemento.esPiso() true|false,
	
	@elemento.expandir(x,y),
	
	@elemento.exportar(),
	
	@elemento.filtro(color|blur|grayscale|invert|opacity|saturate, value),
	
	@elemento.quitarFiltro(color|blur|grayscale|invert|opacity|saturate),
	
	@elemento.guardado(true|false) : true|false,
	
	@elemento.imagen(n),
	
	@elemento.info(key, value),
	
	@elemento.interactuar(({ }) => accion),
	
	@elemento.magnetico(true|false),
	
	@elemento.margenY(cantidad:number),
	
	@elemento.margenX(cantidad:number),
	
	@elemento.material(n),
	
	@elemento.mostrar(true|false),
	
	@elemento.mover(x,y,z || { x, y, z }),
	
	@elemento.noGuardado(),
	
	@elemento.noMagnetico(),
	
	@elemento.noSolido(),
	
	@elemento.ocultar(),
	
	@elemento.peso(cantidad:number),
	
	@elemento.pintar(imagenAlias:string),
	
	@elemento.piso(ancho:number,alto:number, rango?:{x:number,y:number,z:number}),
	
	@elemento.plano(),
	
	@elemento.propiedades(key, value),
	
	@elemento.rotarX(grados:number),
	
	@elemento.rotarY(grados:number),
	
	@elemento.rotarZ(grados:number),
	
	@elemento.solido(true|false),
	
	@elemento.vision( tipo | id , {origen:obj, objeto, x:rango.x, y:rango.y, z:rango.z} => accion, distancia),
	
	@elemento.visionRecta( tipo | id , {origen:obj, objeto, x:rango.x, y:rango.y, z:rango.z} => accion, distancia),
		
 */
function escenaActiva() {
	return window.sceneManager;
}
// Helper global para acceder o cambiar el objeto jugador
window.player = function (nuevo) {
	if (!nuevo) return window.sceneManager.jugador;
	if (!nuevo.animado && nuevo.animar) nuevo.animar();
	const anterior = window.sceneManager.jugador;
	if (anterior && anterior !== nuevo) anterior.esPlayer = false;
	nuevo.esPlayer = true;
	window.sceneManager.jugador = nuevo;
	window.sceneManager.idSeleccionado = nuevo.id;
	window.sceneManager.actualizarCamara();
	return nuevo;
};

function esperar(time, func) {
	return new Promise((resolve) => setTimeout(resolve, time * 1000)).then(func);
}

function esperarY(time, func) {
	return setTimeout(func, time * 1000);
}

// nombre de la escena actual, usado para separar el estado guardado entre escenas.
// el parametro ?escena= tiene prioridad: escena.js se carga antes que el script
// de index.html que lo guarda en localStorage, y si el primer ingreso llega por
// URL debe dejar el mismo nombre que recargar despues (si no, el estado guardado
// se guarda como "principal" y los objetos destruidos reaparecen al recargar).
window.sceneManager.name = new URLSearchParams(location.search).get("escena") || localStorage.getItem("escenaSeleccionada") || "principal";

// un elemento fantasma: devuelve un objeto inerte para no romper el encadenado
// cuando el id ya fue eliminado o esta guardado en un inventario
function elementoFantasma(id, x, y, z) {
	const props = {};
	const base = {
		id,
		x: x || 0,
		y: y || 0,
		z: z || 0,
		tipo: "fantasma",
		imagenAlias: null,
		eliminado: true,
	};
	const fantasma = new Proxy(base, {
		get(t, k) {
			if (k === "propiedades")
				return (key, val) =>
					val === undefined
						? key === undefined
							? props
							: props[key]
						: fantasma;
			if (k === "nodo")
				return {
					style: {},
					classList: { add() {}, remove() {}, contains: () => false },
					remove() {},
					appendChild() {},
					querySelectorAll: () => [],
					querySelector: () => null,
				};
			if (k in t) return t[k];
			return () => fantasma;
		},
	});
	return fantasma;
}


escuchar("o", resetJuego);

// cuando un objeto entra a la escena (o el player aterriza un salto, que se
// mueve sin pasar por intentarMover) y queda sobre otros, revisa solapamientos
// y dispara los mismos eventos colision que si se hubiera movido hasta alli
// (solo en juego vivo, no al construir la escena)
function revisarColisionesAlAgregar(elemento) {
	if (estado() !== "play") return;
	const pe = window.physicsEngine;
	escenaActiva().elementos
		.filter((o) => o.id !== elemento.id && pe.haySolapamiento(elemento, o))
		.forEach((con) => {
			// si el objeto aparece sobre el player, la colision se cuenta igual
			// que si el player se hubiera movido contra el objeto (con = el objeto)
			if (con.tipo === 'player') {
				evento("colision", { objeto: con, quien: con, con: elemento });
			}
			else evento("colision", { objeto: elemento, quien: elemento, con });
		});
}

// resetea solo la partida (estado guardado de los elementos, vida, dinero).
// Preserva la sesión del usuario: renueva la cookie antes de recargar para
// que el server no sirva login.html por token vencido (index.ts "/").
function resetJuego() {
	saltarGuardadoAlSalir = true;
	// congela las escrituras: el juego en marcha no re-crea "datos" antes del reload
	saltarEscribirMemoria = true;
	localStorage.removeItem("datos");
	// la escena vive en el backend por sala: sin esto el reload revive el estado viejo
	if (window.red) red("ws:reset");
	fetch("/api/refresh")
		.then((r) => {
			if (r.ok) {
				localStorage.removeItem("datos");
				location.reload();
			} else {
				saltarGuardadoAlSalir = false;
				saltarEscribirMemoria = false;
				console.warn("resetJuego: sesión vencida, no se resetea la partida");
			}
		})
		.catch(() => {
			localStorage.removeItem("datos");
			location.reload();
		});
}
let datos = memoria({
	vida:3,
	dinero:10
})
function memoria(datosDefault) {
	if(!datosDefault) {
		datosDefault = {
			vida:3,
			dinero:10
		}
	}
	try {
		let datos = datosDefault
		if (localStorage.getItem("datos") !== undefined){
			try {		
				if(localStorage.getItem("datos"))
					datos = JSON.parse(localStorage.getItem("datos"));
			} catch (error) {
				errorRender("No se pudo cargar la memoria, datos corruptos");
				console.log("Error memoria")
				console.log(error)
				console.log(localStorage.getItem("datos"))
			}
			try {
				if(datos.hasOwnProperty("elementos")){
					// reparar datos viejos: el primer ingreso por ?escena= guardaba el
					// estado con escena "principal" (el nombre no estaba listo todavia).
					// esos marcados quedan huérfanos y hacen que los objetos destruidos
					// reaparezcan al recargar; se realinean a la escena actual.
					const nombreActual = escenaActiva()?.name;
					for(let elemento of Object.values(datos.elementos)){
						if (elemento.escena === "principal" && nombreActual && nombreActual !== "principal")
							elemento.escena = nombreActual;
						if(elemento.escena == nombreActual || elemento.id == "player"){
							if(elemento.id != "player")
								idsExistsStatePrevious .push(elemento.id)
							if(elemento?.items !== undefined){
								for(let item of elemento.items){
									idsExistsStatePrevious .push(item.id)
								}
							}
						}
					}
				}
			} catch (error) {
				errorRender("Error al extraer ids de los elementos en memoria")
				console.log(error)
			}
		}
		
		console.log('Memoria recuperada: ', datos)

		return new Proxy(datos, {
			set: function (target, key, value) {
				target[key] = value;
				escribirMemoria();
				return true;
			},
			guardar(key, value){
				target[key] = value;
				escribirMemoria();
			}
		});
	} catch (error) {
		errorRender("No se pudo crear la memoria");
		console.log(error)
	}
}
// mientas espera el reload, el juego en marcha volveria a escribir "datos"
// (proxy/guardarEstadoElemento); esta bandera lo congela hasta que recargue
let saltarEscribirMemoria = false;
function escribirMemoria(){
	if (saltarEscribirMemoria) return;
	try {
		localStorage.setItem("datos", JSON.stringify(datos));
	} catch (error) {
		errorRender("No se pudo guardar la memoria");
		console.log("Error memoria")
		console.log(error)
	}
}
function cargarEstadoElemento( id , elemento, propiedades){
	try {
		if(datos.hasOwnProperty('elementos')){
			// si no es id generico
			// sobrecarga de datos
			let item = datos.elementos[id]
			if(item){
				elemento().x(item.x)
				elemento().y(item.y)
				elemento().z(item.z)
				elemento().escena(item.escena)
				for(let p in item.propiedades){
					elemento().propiedades(p, item.propiedades[p], true)
				}
				
			}
		}
	} catch (error) {
		errorRender('cargarEstadoElemento #'+id)
		console.log(error)
	}
}
function guardarEstadoElemento(elemento) {
	
		if(datos){
			if(!datos.hasOwnProperty('elementos')) datos.elementos = {}
			// si no es id generico

				let propiedades = {...elemento.propiedades() , esPersonaje: false}
				const pos = (v) => typeof v === "function" ? v.call(elemento) : v;
				let datoElemento = {
					x:pos(elemento.x),
					y:pos(elemento.y),
					z:pos(elemento.z),
					id:elemento.id,
					tipo:elemento.tipo,
					imagenAlias:elemento.imagenAlias,
					escena:escenaActiva().name,
					propiedades,
					esPersonaje:false
				}
				if(elemento.propiedades("items")?.length > 0){
					datoElemento.items = elemento.propiedades("items").map(i => ({
						tipo:i.tipo,
						id:i.id,
						"guardado-en":elemento.id,
						imagenAlias:i.imagenAlias,
						imagen:i?.url || imagenesImportadasData[i.tipo],
						props: i
					}))
				}
				/*
				// si falta algun dato
				const validacion = () =>{
					for(let key in datos.elementos[elemento.id]){
						if(!datoElemento[key]) return false;
					}
					return true;
				}
				if( datos.elementos[elemento.id] && !validacion()) throw "Falta algun dato"; 
				*/
				// guardamos el componente con sus datos
				datos.elementos[elemento.id] = datoElemento
				// guardamos en la memoria del navegador
				escribirMemoria()
			
		}
}

// al salir de la escena guardamos la posicion de los objetos (los enemigos no)
// saltarGuardadoAlSalir: resetJuego lo activa para que el beforeunload no
// re-escriba las posiciones justo despues de borrar el estado (reload).
let saltarGuardadoAlSalir = false;
window.addEventListener("beforeunload", () => {
	try {
		if (saltarGuardadoAlSalir) return;
		if (!escenaActiva()?.elementos) return;
		for (let el of escenaActiva().elementos) {
			if (el.persiguiendo) continue;
			guardarEstadoElemento(el);
		}
		// datos.vida espejo de las vidas del jugador
		if (datos?.elementos?.["player"]?.propiedades?.vidas !== undefined)
			datos.vida = datos.elementos["player"].propiedades.vidas;
	} catch (error) {
		console.log("Error al guardar estado al salir", error);
	}
});


const cambiarPisoTextura = (alias) => {
	document.querySelectorAll('.cell').forEach(e => {
		e.style.backgroundImage = `url(${imagenesImportadasData[alias]})`;
		e.style.backgroundSize = "cover";
	})
};

function cambiarPiso(urlPiso, cover, position){
	return escenaActiva().cambiarPiso(urlPiso,cover, position );
}



const $styleTransform = (elemento, transformProp, value) => {

	const units = {
		translate: "px",
		rotate: "deg",
		scale: "",
	};
	let unit = "px";
	let keys = Object.keys(units);
	for (let index = 0; index < keys.length; index++) {
		let key = keys[index];
		if (transformProp.search(key) > -1) {
			unit = units[key];
			break;
		}
	}
	let nodo = elemento.querySelector('img')
	if(!nodo) nodo = elemento.querySelector('canva')

	if (!nodo) return;

	if (!String(nodo.style?.transform)){
		nodo.style.transform = `${transformProp}(${value.val}${unit})`;
		return ;
	}

	let transform = String(nodo.style?.transform);
	// obtenemos el key en el transform y lo cambiamos si recibimos value, sino lo retornamos
	let items = transform.split(" ");
	let props = {};
	for (let i = 0; i < items.length; i++) {
		let item = items[i].split("(");
		props[item[0]] = item[1].split(")")[0];
	}
	if (!value) return props[transformProp];

	// si no existe el key lo creamos
	if (!props[transformProp]) props[transformProp] = 0;

	// si value es {val:n} lo cambiamos
	if (typeof value === "object" && value.hasOwnProperty("val"))
		props[transformProp] = value.val + unit;

	if (typeof value === "object" && value.hasOwnProperty("acum"))
		props[transformProp] =
			$number(props[transformProp]) + value.acum + unit;
	let transformNew = Object.keys(props)
		.map((key) => `${key}(${props[key]})`)
		.join(" ");

	// aqui usaremos props para obtener el transform
	//if (elemento.id.search("3d:personaje-frente") > -1)
		//$printError(transformNew)
	nodo.style.transform = transformNew;
};



function estilarElementosAgua (elementos, opciones = {}) {
	if(!elementos) return;
	const update = async (index) => {
		let item = elementos[index]
		let { x , y, z } = item
		let left = 0
		let top = 1
		let right = 2
		let bottom = 3
		let borders = [false, false, false, false]

		if( !elementos.find( i => i.x == x + 1 && i.y == y && i.z == z )) borders[left] = true
			
		if( !elementos.find( i => i.x == x - 1 && i.y == y && i.z == z )) borders[right] = true
			
		if( !elementos.find( i => i.x == x && i.y == y + 1 && i.z == z )) borders[bottom] = true
			
		if( !elementos.find( i => i.x == x && i.y == y - 1 && i.z == z )) borders[top] = true
		let img = item.nodo.querySelector('img')
		if(!img) img = item.nodo.querySelector('canvas')

		let css = ["0px", "0px", "0px", "0px"]
		if(borders[left] && borders[top]) css[0] = "50%"
		if(borders[right] && borders[top]) css[1] = "50%"
		if(borders[right] && borders[bottom]) css[2] = "50%"
		if(borders[left] && borders[bottom]) css[3] = "50%"
		item.css = css.join(" ")

		img.style.borderRadius = css.join(" ")
		
		if(index < elementos.length - 1) update(index + 1)

	}
	if(Array.isArray(elementos)){
		if(elementos.length > 0) update(0)
	}
	return []
}



function magnetismoAtraer(iman) {
	// aqui buscaremos en un rango de 2 posiciones desde la posicion actual del iman
	// y si hay algun elemento con el tag metal lo moveremos hacia el iman
	// paso 1: recorrer las posiciones
	// obtenemos desde que celda hacemos el recorrido
	let fromX = iman.x - 4;
	let fromY = iman.y - 4;
	// generamos las posiciones alrededor del iman, sin incluir el objeto.tipo == iman
	let positions = [];
	const cellContactIman = [
		[iman.x - 1, iman.y - 1],
		[iman.x - 1, iman.y],
		[iman.x - 1, iman.y + 1],
		[iman.x, iman.y - 1],
		[iman.x, iman.y],
		[iman.x, iman.y + 1],
		[iman.x + 1, iman.y - 1],
		[iman.x + 1, iman.y],
		[iman.x + 1, iman.y + 1],
	];
	for (let x = fromX; x < fromX + 8; x++) {
		for (let y = fromY; y < fromY + 8; y++) {
			if (iman.x == x && iman.y == y) continue;
			if (
				cellContactIman.find(
					(position) => position[0] == x && position[1] == y,
				)
			)
				continue;
			positions.push([x, y]);
		}
	}
	for (let position of positions) {
		let [x, y] = position;
		// paso 2: buscar el elemento en la posicion
		let elementsMagnetic = escenaActiva().elementos.find(
			(o) =>{
				return (o.x == x &&
				o.y == y &&
				!o.propiedades("guardado") &&
				o.propiedades("material") == iman.propiedades("magnetico-material"))
			}
		);
		// paso 3: si el elemento es elementsMagnetic
		if (elementsMagnetic) {
			// paso 4: moverlo 1 posicion hacia el iman si hay espacio
			// calcular la nueva posicion entre el objeto y el iman considerando si esta a la izquierda o a la derecha o hacia arriba o abajo
			let toX = iman.x;
			let toY = iman.y;
			if (elementsMagnetic.x < iman.x) toX = toX - 1;
			if (elementsMagnetic.x > iman.x) toX = toX + 1;
			if (elementsMagnetic.y < iman.y) toY = toY - 1;
			if (elementsMagnetic.y > iman.y) toY = toY + 1;
			let next = escenaActiva().ocupada(toX, toY);

			//if(next) return escenaActiva().cambiaPosiciones(next,elementsMagnetic)
			if (!next) elementsMagnetic.mover(toX, toY);
		}
	}
}

function magnetismoRepeler(iman) {
	/*
	submit: esta funcion se encarga de separar los imanes entre si, busca imagen en un rango y calcula a donde moverlo si esta cerca de este iman

	*/
	let fromX = iman.x - 4;
	let fromY = iman.y - 4;
	let positions = [];
	for (let x = fromX; x < fromX + 8; x++) {
		for (let y = fromY; y < fromY + 8; y++) {
			if (iman.x == x && iman.y == y) continue;
			positions.push([x, y]);
		}
	}
	for (let position of positions) {
		let [x, y] = position;
		let metal = escenaActiva().elementos.find(
			(o) =>
				o.id != iman.id &&
				o.x == x &&
				o.y == y &&
				!o.propiedades("guardado") &&
				o.propiedades("magnetico"),
		);
		if (metal) {
			if (metal.x < iman.x) x = x - 1;
			if (metal.x > iman.x) x = x + 1;
			if (metal.y < iman.y) y = y - 1;
			if (metal.y > iman.y) y = y + 1;
			metal.mover(x, y);
			if (metal.x == x && metal.y == y) {
				// si no se puede mover el otro iman se movera este
				let toX = iman.x;
				let toY = iman.y;
				if (metal.x < iman.x) toX = toX + 1;
				if (metal.x > iman.x) toX = toX - 1;
				if (metal.y < iman.y) toY = toY + 1;
				if (metal.y > iman.y) toY = toY - 1;
				iman.mover(toX, toY);
			}
		}
	}
}

function listenMagnetic() {
	if (magneticListener) return;
	magneticListener = setInterval(() => {
		let imanes = escenaActiva().elementos.filter(
			(o) => o.propiedades("magnetico") && !o.propiedades("guardado"),
		);
		if (imanes.length) {
			for (let iman of imanes) {
				magnetismoAtraer(iman);
				magnetismoRepeler(iman);
			}
		}
	}, 500);
}

function posicion (elemento){
	console.log(elemento)
	// retornar todos los espacios que ocupa el objeto
	let x = elemento.x;
	let y = elemento.y;
	let w = elemento.w;
	let h = elemento.h;
	let z = elemento.z;
	let d = elemento.d;
	let positions = [];
	// tenemos que considerar el ancho y el alto y volumen es decir z en caso de que sea un cubo con varias celdas
	for (let i = 0; i < w; i++) {
		for (let j = 0; j < h; j++) {
			for (let k = 0; k < d; k++) {
				positions.push([x + i, y + j, z + k]);
			}
		}
	}

	return positions
}

function superpuestos(obj1, obj2){
	if(typeof obj1 === "string") {
		obj1 = escenaActiva().elementos.find(o => o.id == obj1)
	}
	if(typeof obj2 === "string") {
		obj2 = escenaActiva().elementos.find(o => o.id == obj2)
	}
	if(!obj1) errorRender("Objeto no encontrado o no tiene id valido" +  obj1)
	if(!obj2) errorRender("Objeto no encontrado o no tiene id valido" +  obj2)

	let positions1 = posicion(obj1);
	let positions2 = posicion(obj2);
	// buscamos si los objetos se superponen
	for (let position1 of positions1) {
		for (let position2 of positions2) {
			if(String(position1[0]) == String(position2[0]) && String(position1[1]) == String(position2[1]) && String(position1[2]) == String(position2[2])){
				return true;
			}
		}
	}

	return false
}

/**==================================================== RELATAR ============================================ */
var cursorRelatar = 0
let relatarDialog = document.querySelector("#relatar");
let markdown = document.querySelector(".markdown");
let nodoCursorRelatar = document.querySelector(".markdown [name=cursor]");
let nodoTotalRelatar = document.querySelector(".markdown [name=total]");
let contenidoRelatar = null;
function relatar(textoMarkdown) {
	if (estado() == "relatando") {
		if (contenidoRelatar[cursorRelatar]) {
			nodoCursorRelatar.innerHTML = cursorRelatar + 1;

			let content = contenidoRelatar[cursorRelatar].replaceAll('    ',"&emsp;&emsp;").replaceAll('\t',"&emsp;&emsp;");
			for (let key in imagenesImportadasData) {
				content = content.replace(
					`](${key})`,
					`](${imagenesImportadasData[key]})`,
				);
			}

			markdown.children[0].innerHTML = marked.parse(content, {
				async: false,
				breaks: true,
				extensions: null,
				gfm: true,
				hooks: null,
				pedantic: false,
				silent: false,
				tokenizer: null,
				walkTokens: null,
			});

			let items = Array.from(markdown.children[0].children)
			console.log(items)
			for(let item of items){
				// bloque codigo
				let cut = item.innerText.split('/code')
				if(cut.length > 1){
					let codigo = cut[1]
					item.innerHTML = `<p>${cut[0]}</p><pre class="copy"><code>${codigo}</code>\n\n<small>(click aquí para copiar)</small></pre>`
				}
				// bloque tablas
				if(item.innerText.startsWith("#")){
					item.style.position = 'relative'
					let tableItem = item.innerText.trim().slice(1).split(':');
					let dimensiones = tableItem[0].split('x');
					let config = {}
					if(tableItem.length > 1 && tableItem[1]){
						tableItem.splice(0,1)
						for(let itemConfig of tableItem[0].split(',')){
							let configData = itemConfig.split('=')
							if(configData.length > 1){
								let [clave,valor] = configData
								config[clave] = valor
							} else {
								config[configData[0]] = true
							}
						}
					}
					// dibujar tabla con dimensiones
					let table = document.createElement('table')
					// dibujando las tablas
					table.style.width= 'fit-content'
					for(let i = 0; i < Number(dimensiones[0]); i++){
						let tr = document.createElement('tr')
						for(let j = 0; j < Number(dimensiones[1]); j++){
							let td = document.createElement('td')
							td.name = `${i+1},${j+1}`
							td.style.fontSize = '0.7em'
							td.style.padding = '2px'
							td.style.border = '1px solid black'
							td.style.width = '10px'
							td.style.height = '10px'
							tr.appendChild(td)
						}
						table.appendChild(tr)
					}
					item.innerHTML = table.outerHTML
					
					// antes de la tabla agregamos un texto
					if(config?.n === true){
						let textX = document.createElement('small')
						textX.style = "font-size:0.7em;position:absolute;left:0px;top:-23px"
						textX.innerHTML = `y:1`
						item.prepend(textX)
						let textY = document.createElement('small')
						textY.style = "font-size:0.7em;position:absolute;left:-20px;top:-3px;"
						textY.innerHTML = `x:1`
						item.prepend(textY)
					}
					
					// si config select
					if(config?.select){
						// cremos un input para seleccionar las celdas
						const createInput = (name) => {								
							let label = document.createElement('label')
							label.innerText = name+': '
							let input = document.createElement('input')
							input.type = 'number'
							input.name = name
							input.min = 1
							input.max = dimensiones[0]
							input.value = 1
							label.appendChild(input)
							item.prepend(label)
							return input
						}
						let inputY = createInput('y')
						let inputX = createInput('x')
						let selected = null
						let fn = () => {
							if(selected) selected.style.background = "none"
							let row = item.querySelector('table').querySelector(`tr:nth-child(${inputX.value})`)
							let cell = row.querySelector(`td:nth-child(${inputY.value})`)
							cell.style.background = 'green'
							selected = cell
							
							if(config.select == inputX.value + "x" + inputY.value){
								setTimeout(() => {
									cursorRelatar++;
									relatar();
								}, 1500)
							}
						}
						inputX.onchange = fn
						inputY.onchange = fn
					}
				}
			}
			setTimeout(() => {
				markdown.style.height = markdown.children[0].offsetHeight + 20 + "px";
			}, 250);
		}
		return;
	}
	if (!textoMarkdown) {
		errorRender("No hay texto para relatar.");
		console.log({textoMarkdown});
		throw "No hay texto para relatar o no es valido.";
	}
	try {

		cursorRelatar = 0;
		contenidoRelatar = Array.isArray(textoMarkdown)
			? textoMarkdown
			: [textoMarkdown];
		estado("relatando");
		relatarDialog.classList.remove("hidden");
		nodoTotalRelatar.innerHTML = contenidoRelatar.length;
		relatar();
	} catch (error) {
		console.log(error)
		console.log({textoMarkdown});
		return ayuda("No hay texto para relatar o no es valido.");
	}
}

function ocultarRelatar() {
	cursorRelatar = 0;
	relatarDialog.classList.add("hidden");
	estado("play");
}

document.addEventListener("click", (e) => {
	if (e.target.parentNode.classList.contains("copy")) {
		// copiaremos al portapapeles el contenido del nodo
		let texto = e.target.parentNode.children[0].innerText;
		navigator.clipboard.writeText(texto);
	}
});

escuchar("s", ocultarRelatar, "relatando");

escuchar(
	"derecha",
	() => {
		if (cursorRelatar < contenidoRelatar.length - 1) {
			cursorRelatar++;
			relatar();
		}
	},
	"relatando",
);

escuchar(
	"izquierda",
	() => {
		if (cursorRelatar > -1) {
			cursorRelatar--;
			relatar();
		}
	},
	"relatando",
);


/** bar info */


/**
 * Muestra la informacion de una variable en la barra de informacion
 * @param {function} variable - la variable que se va a mostrar, () => "texto"+ variable
 * @param {number} position [1 al 4] - la columna en la que se va a mostrar la informacion
 * @abstract ejemplo: mostrar(() => "vida" + vida, 1);
 */
var barInfo = null
let listeners = {

}
function mostrar(variable, position) {
	if (!barInfo) {
		barInfo = document.querySelector("#bar-info");
		if(!barInfo) {
			barInfo = document.createElement("div");
			barInfo.id = "bar-info";
			document.body.appendChild(barInfo);
		}
		return setTimeout(() => mostrar(variable, position), 500);
	}
	// en la variable nameVar filtraremos el string con regex y habran solo letras
	let nameVar = String(variable).replace(/[^a-zA-Z]/g, "");
	let div = document.createElement("div");
	div.style.gridColumn = position;
	div.id = "var-" + nameVar;
	div.classList.add("info");
	listeners[nameVar] = {
		variable: variable,
		position: position,
		value: variable(),
		nodo: () => div,
	};
	div.innerText = variable();
	barInfo.appendChild(div);
}

/** error render */
let renderConsole = document.querySelector("#error-code");
function errorRender(...params) {
	if(!params.length) return {
		clearGroup(group, key) {
			renderConsole.querySelectorAll(`[group="${group}"]`).forEach(item => {
				if(key !== undefined){
					if(item.getAttribute('group-val') == key) item.remove()
				}else{
					item.remove()
				}
			})
		}
	}
	let nodos = []
	let texts = renderConsole.children ? Array.from(renderConsole.children).forEach(item => item.innerText) : []
	if(!texts) texts = []
	for(let item of params) {
		let div = document.createElement("div");
		div.className = "p-1 text-md me-1 flex items-center bg-red-500 m-1 justify-between rounded-lg";
		div.style.minWidth = '200px';
		div.innerHTML = `<div class="px-3 error-text">${item}</div>`;
		let close = document.createElement("button");
		close.innerText = "X";
		close.className = "bg-red-400 text-lg text-white p-1 ms-3 cursor-pointer rounded-full border-0 flex items-center justify-center";
		close.style ="width: 30px; height: 30px;";
		close.onclick = () => div.remove();
		div.appendChild(close);
		if(!texts.includes(div.innerText)) {
			texts.push(div.innerText)
			renderConsole.appendChild(div);
			nodos.push(div)
		}
	}
	nodos.setGroup = (group,val) => {
		nodos.forEach(nodo => {
			renderConsole.querySelectorAll(`[group="${group}"]`).forEach(item => {
				if(val !== undefined){
					if(item.getAttribute('group-val') == val) nodo.remove()
					return ;
				}else{
					nodo.remove()
					return ;
				}
			})

			nodo.setAttribute('group',group)
			nodo.setAttribute('group-val',val)
		})
	}
	return nodos
}