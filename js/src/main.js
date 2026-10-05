var imagenesImportadas = {};
var imagenesImportadasData = {};
let imagenesListas = false;
let assetsLoaded = false;
var yo;
var caches = window.caches;

function mostrarLoader() {
	let el = document.getElementById("asset-loader");
	if (el) el.classList.remove("hidden");
}
function ocultarLoader() {
	let el = document.getElementById("asset-loader");
	if (el) el.classList.add("hidden");
}
function insertarImagenEnNodo(nodo, imagenAlias, prop){
	if(!imagenesImportadasData[imagenAlias]){
		let x = setInterval(() =>{
			if(imagenesImportadasData[imagenAlias]){
				clearInterval(x)
				if(prop === "background") 
					nodo.style.backgroundImage = `url(${imagenesImportadasData[imagenAlias]})`;
				else nodo.src = imagenesImportadasData[imagenAlias];
			}
		},10)
	} else 
		nodo.src = imagenesImportadasData[imagenAlias];
}

const DIRECCIONES_SPRITE = ["arriba", "abajo", "izquierda", "derecha"];
let listaImagenesTotal = null;
let precargasPendientes = [];
let gameInstalled = false
function revisarAssets() {
	/*
	if (precargasPendientes.length) {
		Promise.all(precargasPendientes).then(revisarAssets);
		return;
	}
		*/
	if (
		Object.keys(imagenesImportadasData).length ===
		Object.keys(imagenesImportadas).length
		//&& gameInstalled
	) {
		evento("ready:assets");
	}
}


let imageStatus = document.querySelector("#image-status");
const updateImagesStatus = (alias, value) => {
	if(alias && value === false) {
		// imagen png vacia o 1 bit negro
		imagenesImportadasData[alias] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";
	}
	if(imageStatus) imageStatus.innerHTML = Object.keys(imagenesImportadasData).length + '/' + Object.keys(imagenesImportadas).length
	setTimeout(() => revisarAssets(), 1000)
}
function usarImagen(alias, url) {
	if(imagenesImportadas.hasOwnProperty(alias)) return ;
	if(!imageStatus ) imageStatus = document.querySelector("#images-status");
	//console.log('importando imagen ', alias, url);
	imagenesImportadas[alias] = url;
	//imagenesImportadas[alias] = "https://raw.githubusercontent.com/learfen/learfen.github.io/refs/heads/main/"+url;
	updateImagesStatus()
	// const precarga = precargarVariantesDireccion(alias, url).catch(() => {});
	// precargasPendientes.push(precarga);
	let completed = false;

	return new Promise(async (resolve, reject) => {

		setTimeout(() => {
			if (!completed) {
				updateImagesStatus(alias, false);
				completed = true;
				errorRender("No se pudo cargar @" + alias + ": " + url);
				reject();
			}
		}, 5000);
		const getImageBlob = async function (url) {
			if (typeof caches === "undefined") return (await fetch(url)).blob();
			const cache = await caches.open("imagenes-v1");
			const cached = await cache.match(url);

			if (cached) {
				return cached.blob();
			}

			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${url}`);
			}

			await cache.put(url, response.clone());

			return response.blob();
		}

		try {
			const blob = await getImageBlob(url);

			const reader = new FileReader();

			reader.onloadend = () => {
				imagenesImportadasData[alias] = reader.result;
				completed = true;
				resolve();
				updateImagesStatus();
			};

			reader.onerror = (e) => {
				completed = true;
				updateImagesStatus(alias, false);
				reject(e);
			};

			reader.readAsDataURL(blob);

		} catch (e) {
			completed = true;
			updateImagesStatus(alias, false);
			reject(e);
		}
	});
}


// al importar un alias base, revisa la lista de imágenes completa si existen las
// variantes de dirección (<alias>-arriba/-abajo/-izquierda/-derecha) y las importa
// también: sin esto el sprite solo se espeja (rotarY) al caminar y no se anima.
async function obtenerListaImagenes() {
	if (listaImagenesTotal) return listaImagenesTotal;
	try {
		let cache = localStorage.getItem("images");
		if (cache) { listaImagenesTotal = JSON.parse(cache); return listaImagenesTotal; }
	} catch (e) {}
	try {
		listaImagenesTotal = await getImagesFromGithub();
	} catch (e) {
		listaImagenesTotal = [];
	}
	return listaImagenesTotal;
}

async function precargarVariantesDireccion(alias, url) {
	if (!alias || typeof alias !== "string") return;
	if (DIRECCIONES_SPRITE.some((d) => alias.endsWith("-" + d))) return;
	const lista = await obtenerListaImagenes();
	const ultimoSlash = url.lastIndexOf("/");
	const dirUrl = ultimoSlash > -1 ? url.slice(0, ultimoSlash + 1) : "";
	const nombreArchivo = url.slice(ultimoSlash + 1);
	const ext = (nombreArchivo.match(/\.\w+$/) || [""])[0];
	const base = nombreArchivo
		.slice(0, -ext.length)
		.replace(/-(arriba|abajo|izquierda|derecha)$/i, "");
	if (!nombreArchivo.includes(".")) return;
	for (const dir of DIRECCIONES_SPRITE) {
		const variante = alias + "-" + dir;
		if (imagenesImportadas.hasOwnProperty(variante)) continue;
		let existe = false;
		if (Array.isArray(lista) && lista.length) {
			existe = lista.some((n) => n.toLowerCase() === (base + "-" + dir + ext).toLowerCase());
		} else {
			// sin lista disponible: probamos que la variante exista (GET, solo status)
			try {
				existe = (await fetch(dirUrl + base + "-" + dir + ext, { method: "GET" })).ok;
			} catch (e) { existe = false; }
		}
		if (existe) {
			if(false) usarImagen(variante, dirUrl + base + "-" + dir + ext);
		}
	}
}

function aleatorio(start, end) {
	return Math.floor(Math.random() * (end - start + 1) + start);
}

function setTransform(elemento, key, val) {
	let currentTransform = elemento.style.transform;

	if (currentTransform.includes(key)) {
		// 1. Creamos la expresión regular de forma dinámica con 'new RegExp'
		// El doble 'backslash' (\\) es necesario para que JS entienda el paréntesis de la RegExp
		const regex = new RegExp(key + "\\([^)]*\\)");

		// 2. Reemplazamos la propiedad vieja por la nueva
		elemento.style.transform = currentTransform.replace(
			regex,
			`${key}(${val})`,
		);
	} else {
		// Si no existe, lo agrega al final
		elemento.style.transform += ` ${key}(${val}) `;
	}
}

let importBasics = false
function imagenesBasicas() {
	if(importBasics) return
	importBasics = true
	let imagesDefault = {
		vacio: "/games/images/vacio.png",
		fuego: "/games/images/fuego.gif",
		"player-abajo": "/games/images/player-abajo.gif",
		"player-arriba": "/games/images/player-arriba.gif",
		"player-izquierda": "/games/images/player-izquierda.gif",
		"player-derecha": "/games/images/player-derecha.gif",
		madera: "/games/images/puente.png",
		puerta: "/games/images/door-svgrepo-com.svg",
	};

	for (let key in imagesDefault) {
		usarImagen(key, imagesDefault[key]);
	}
}

function imagenesPesca(){
	
	let imagesDefault = {
		"pesca-abajo": "/games/images/pescar-abajo.gif",
		"pesca-arriba": "/games/images/pescar-arriba.gif",
		"pesca-izquierda": "/games/images/pescar-izquierda.gif",
		"pesca-derecha": "/games/images/pescar-derecha.gif",
		"caña":"/games/images/caña.png"
	};

	for (let key in imagesDefault) {
		usarImagen(key, imagesDefault[key]);
	}
}

imagenesBasicas()

// Renderizado inicial de celdas del tablero (20x20)
const gridEl = document.getElementById("grid");
const gridWrap = document.querySelector(".grid-wrap");
// ponytail: la camara la maneja sceneManager.actualizarCamara (transform
// transicionado). Este objeto existia solo para reescribir perspective y
// perspective-origin desde el jugador en cada paso; como no son transicionables
// (Blink reconstruye capas -> celdas negras), eso reproyectaba la escena de
// golpe y se veia como vibracion. updateFromPlayer queda como no-op para no
// tocar los 4 llamadores. Si hace falta alterar la proyeccion a mano:
//   gridWrap.style.perspective = "2400px";
//   gridWrap.style.perspectiveOrigin = "50% 50%";
const camera = {
	x: 10,
	y: 50,
	updateX(porcentaje) {
		this.update(porcentaje, this.y);
	},
	updateY(porcentaje) {
		this.update(this.x, porcentaje);
	},
	perspective(perspective) {
		gridWrap.style.perspective = `${perspective}px`;
	},
	update(x, y) {
		gridWrap.style.perspectiveOrigin = `${x}% ${y}%`;
		camera.x = x;
		camera.y = y;
	},
	updateFromPlayer() {},
};
if (gridEl) {
	gridEl.innerHTML = "";
	for (let i = 0; i < 400; i++) {
		const cell = document.createElement("div");
		cell.className = "cell";
		gridEl.appendChild(cell);
	}
}

// ---------------------------------------------------------------------
// 1. SISTEMA GLOBAL DE TECLAS CON COOLDOWN Y EMISIÓN VÍA EVENTBUS
// ---------------------------------------------------------------------
let ultimoTiempoTecla = 0;
const COOLDOWN_TECLAS_MS = 200; // Límite de tiempo para evitar spam o desplazamiento acelerado
let agarrando = false; // Mantener "s" para empujar/tirar
var focusInputEscena = false
document.addEventListener("keypress", (e) => {
	if(window.scrollY < 200 && e.key === "ArrowDown") e.preventDefault();
})
document.addEventListener("keydown", (e) => {
	if(window.scrollY > 200 || !player()) return ;
	// repet del SO: cada pulsacion fisica = 1 evento (el desliz maneja el movimiento continuo)
	if (e.repeat) return;
	if(focusInputEscena) return;
	if(player().hasOwnProperty("ocupado") && player()?.ocupado) return
	// Ignorar si el estado está en pausa
	if (estado() === "pausa") return;

	const ahora = Date.now();
	if (ahora - ultimoTiempoTecla < COOLDOWN_TECLAS_MS) {
		e.preventDefault();
		return;
	}

	const tecla = e.key.toLowerCase();

	// Mapeo de teclas de flechas a nombres legibles
	const aliasesFlechas = {
		arrowup: "arriba",
		arrowdown: "abajo",
		arrowleft: "izquierda",
		arrowright: "derecha",
	};

	const canalTecla = aliasesFlechas[tecla] || tecla;

	// Prevenir scroll en navegador para teclas de control/movimiento habituales
	if (
		[
			"w",
			"a",
			"s",
			"d",
			"q",
			"e",
			"f",
			"arriba",
			"abajo",
			"izquierda",
			"derecha",
			" ",
		].includes(canalTecla)
	) {
			e.preventDefault();
	}

	ultimoTiempoTecla = ahora;

	// Emitir evento con el nombre de la tecla hacia el EventBus
	evento(canalTecla, { tecla, eventoOriginal: e });
});

// Mantener "s" activa el modo empujar/tirar; al soltarla se desactiva
document.addEventListener("keydown", (e) => {
	if(window.scrollY > 200) return ;
	if (e.key.toLowerCase() === "s" && estado() === "play") agarrando = true;
});
document.addEventListener("keyup", (e) => {
	if(window.scrollY > 200) return ;
	if (e.key.toLowerCase() === "s") agarrando = false;
});

// ---------------------------------------------------------------------
// DESLIZAR: seguimiento de flechas sostenidas + avance continuo
// ---------------------------------------------------------------------
const ALIASES_FLECHAS = {
	arrowup: "arriba",
	arrowdown: "abajo",
	arrowleft: "izquierda",
	arrowright: "derecha",
};
const FLECHA_DESLIZAR = {
	arriba: ["arriba", 0, -1],
	abajo: ["abajo", 0, 1],
	izquierda: ["izquierda", -1, 0],
	derecha: ["derecha", 1, 0],
};
const teclasPresionadas = [];
const deslizarMover = (vista, dx, dy) => {
	const p = window.player?.();
	if (!p || p.ocupado === true) return;
	const sel = escenaActiva().seleccionado();
	if (sel?.id === p.id) return moverOManiobrarAnimado(dx, dy, 0, vista, agarrando);
	return window.physicsEngine.intentarMover(p, dx, dy, 0, false, false);
};
document.addEventListener("keydown", (e) => {
	if (window.scrollY > 200 || focusInputEscena) return;
	const k = ALIASES_FLECHAS[e.key.toLowerCase()] || e.key.toLowerCase();
	if (!FLECHA_DESLIZAR[k]) return;
	if (e.repeat || teclasPresionadas.includes(k)) return;
	teclasPresionadas.push(k);
	// respuesta inmediata al tocar una flecha, aun en modo deslizar
	if (estado() === "play" && window.player?.()?.deslizando) {
		const [vista, dx, dy] = FLECHA_DESLIZAR[k];
		deslizarMover(vista, dx, dy);
	}
});
document.addEventListener("keyup", (e) => {
	if (window.scrollY > 200 || focusInputEscena) return;
	const k = ALIASES_FLECHAS[e.key.toLowerCase()] || e.key.toLowerCase();
	const i = teclasPresionadas.indexOf(k);
	if (i > -1) teclasPresionadas.splice(i, 1);
});

escuchar("d", () => {
	const p = window.player?.();
	if (p && !p.ocupado) p.saltar();
}, "play")

let intervaloDeslizar = null;

// un paso por cada tick del timer; la transicion del bloque (mismo tiempo) hace el desliz
const INTERVALO_DESLIZAR_MS = 300; // ms por celda del desliz; ajustalo para ir mas lento/rapido
function tickDeslizar() {
	const p = window.player?.();
	if (!p?.deslizando || estado() !== "play") return;
	const dir = [...teclasPresionadas].reverse().find((k) => FLECHA_DESLIZAR[k]);
	if (!dir) return;
	const [vista, dx, dy] = FLECHA_DESLIZAR[dir];
	deslizarMover(vista, dx, dy);
	// mantener la tecla = repetir la pulsación: re-emite la dirección para
	// que listeners de animación (player().animacion.play) sigan el avance
	evento(dir);
}
intervaloDeslizar = setInterval(tickDeslizar, INTERVALO_DESLIZAR_MS);

// ---------------------------------------------------------------------
// 2. LISTENERS DE EVENTOS Y LOGS
// ---------------------------------------------------------------------
escuchar(
	"colision:player",
	({ objeto, con }) => {
		const msg = `[PLAY] Colisión de Jugador con #${con.id} (${con.tipo}) - Peso: ${con.propiedades("peso")}`;
		document.getElementById("status").textContent = msg;
	},
	"play",
);

let ayudaNodo = document.getElementById("ayuda");
let ayudaTimeout = null;
function ayuda(message, duration) {
	clearTimeout(ayudaTimeout);
	ayudaNodo.innerHTML = message;
	ayudaNodo.parentNode.style.display = "flex";
	ayudaNodo.cerrar = () => {
		clearTimeout(ayudaTimeout);
		ayudaTimeout = setTimeout(() => {
			ayudaNodo.parentNode.style.display = "none";
		}, 250);
	};
	if (duration) {
		ayudaTimeout = setTimeout(() => {
			ayudaNodo.parentNode.style.display = "none";
		}, duration * 1000);
	}
}

function cerrarAyudas() {
	if(ayudaNodo && ayudaNodo?.cerrar) ayudaNodo.cerrar()
}

escuchar(["arriba", "abajo", "izquierda", "derecha"], (info) => {
	// el desliz re-emite la direccion sostenida en cada tick: no es un toque nuevo
	// y no debe cerrar la ayuda (antes se cerraba apenas abria). Igual con el
	// re-emit del joystick neto mientras se mantiene pulsado. Solo un direccional
	// realmente presionado (no sostenido) la cierra.
	if (
		!teclasPresionadas.includes(info.evento) &&
		info.evento !== window.direccionSostenida
	) {
		cerrarAyudas();
	}
}, "play");

escuchar("colision", ({ objeto, con }) => {
	if (estado() !== "play") {
		document.getElementById("status").textContent =
			`[ESTADO: ${estado()}] Colisión registrada`;
	}
});

// ---------------------------------------------------------------------
// 3. CONTROLES Y MOVIMIENTO RE-DISEÑADOS CON `escuchar()`
// ---------------------------------------------------------------------
function moverOManiobrarAnimado(dx, dy, dz, orientacionDeseada, agarrando = false) {
	let p = escenaActiva().seleccionado();
	if (!p) return;
	if (p.ocupado === true) return; // ocupado: no se mueve, no gira (ataques, dialogos, etc.)

	if (p.id == "player" || p === player()) {
		// 1. Giro previo si cambia la orientación cardinal
		if (orientacionDeseada && p.orientacion !== orientacionDeseada) {
			p.orientacion = orientacionDeseada;
			window.sceneManager.actualizarTransformNodo(p);
			if (p.animado) {
				p.pintar(p.imagenAlias, p.configOriginal);
			}

			// Con "s" se empuja/arrastra en el primer toque aunque gire
			if (agarrando) return empujarOTirar(p, dx, dy, dz);

			const objsMirando = p.mirandoObjeto ? p.mirandoObjeto() : [];
			document.getElementById("status").textContent =
				`Girado hacia: ${p.mirando()}. Objetos enfrente: ${objsMirando.length}`;
			return;
		}

		// 2. Con "s" presionada se empuja o arrastra
		if (agarrando) return empujarOTirar(p, dx, dy, dz);

		// 3. Sin "s" el jugador no empuja: camina o choca y se detiene
		const info = {
			x: p.x + dx,
			y: p.y + dy,
			z: p.z + dz,
			detenido: false,
			preventDefault() { this.detenido = true; },
		};
		evento("por-mover:player", info);
		if (info.detenido) return;
		const movido = window.physicsEngine.intentarMover(p, dx, dy, dz, false, false);
		if (movido) {
			actualizarUI(p.id);
			const objsMirando = p.mirandoObjeto ? p.mirandoObjeto() : [];
			if(window.selectedPosition)
			document.getElementById("status").textContent =
				`Avanzó hacia ${p.mirando()} (${p.x},${p.y},${p.z}). Objetos enfrente: ${objsMirando.length}<br>`+
				// celda seleccionada 
				`Celda: ${window.selectedPosition.x}, ${window.selectedPosition.y}, ${window.selectedPosition.z}`
				;
			camera.updateFromPlayer();
		}
	} else {
		p.orientacion = orientacionDeseada;
		window.sceneManager.actualizarTransformNodo(p);
		if (p.animado) {
			p.pintar(p.tipo, p.configOriginal);
		}

		// Movimiento efectivo
		const movido = window.physicsEngine.intentarMover(p, dx, dy, dz);
		if (movido) {
			actualizarUI(p.id);
			setZoom(1.0);
		}
	}
}

// Empujar (objeto adelante) o arrastrar (objeto atrás) manteniendo "s" y una dirección
function empujarOTirar(p, dx, dy, dz) {
	const resultado = window.physicsEngine.tirar(p, dx, dy, dz);
	if (resultado === 0) return;
	if (resultado === 1) {
		actualizarUI(p.id);
		document.getElementById("status").textContent =
			`Arrastró un objeto hacia ${p.mirando()} (${p.x},${p.y},${p.z})`;
		camera.updateFromPlayer();
		return;
	}
	// No hay nada detrás: empuja o camina en la dirección
	const movido = window.physicsEngine.intentarMover(p, dx, dy, dz, false, true);
	if (movido) {
		actualizarUI(p.id);
		document.getElementById("status").textContent =
			`Empujó hacia ${p.mirando()} (${p.x},${p.y},${p.z})`;
		camera.updateFromPlayer();
	}
}

// Suscripción de movimiento usando teclas individuales / aliases
escuchar("arriba", () => moverSeleccionado(0, -1, 0, "arriba"), "play");
escuchar("abajo", () => moverSeleccionado(0, 1, 0, "abajo"), "play");
escuchar("izquierda", () => moverSeleccionado(-1, 0, 0, "izquierda"), "play");
escuchar("derecha", () => moverSeleccionado(1, 0, 0, "derecha"), "play");

//escuchar("q", () => moverOManiobrarAnimado(0, 0, 1, null), "play");

// ---------------------------------------------------------------------
// 4. FUNCIONES DE INTERFAZ DE USUARIO (UI)
// ---------------------------------------------------------------------
function cambiarEstadoUI(nuevoEstado) {
	window.eventBus.setEstado(nuevoEstado);
}

function eliminarSeleccionadoUI() {
	const id = window.sceneManager.idSeleccionado;
	if (id) window.sceneManager.eliminarObjeto(id);
}

function crearBloqueDesdeUI(solido) {
	const w = parseInt(document.getElementById("dimW").value) || 1;
	const h = parseInt(document.getElementById("dimH").value) || 1;
	const d = parseInt(document.getElementById("dimD").value) || 1;
	window.sceneManager.crearObjeto(
		Math.floor(Math.random() * 15),
		Math.floor(Math.random() * 15),
		solido ? "Caja" : "Sensor",
		{
			z: 0,
			w,
			h,
			d,
			solido,
			peso: 10,
		},
	);
}

function cambiarEscena(nuevaEscena, config) {
	let user = localStorage.getItem("username");
	if (config) {
		// para abrir escenas desde tutoriales
		if(config?.tutorial) user = "tutorial";	
		localStorage.setItem("escenaConfig", JSON.stringify(config));
		//localStorage.setItem("userFile", "tutorial");
	} else{
		localStorage.setItem("userFile", user);
	}
	
	localStorage.setItem(keyLocalstorageEscenaActiva, nuevaEscena);
	// "/" NO sirve: la ruta raiz solo devuelve index.html si hay cookie httpOnly
	// "token" valida (index.ts), y el login via Apps Script nunca la deja seteada
	// -> el server caia a login.html y el cambio de escena parecia un logout.
	// "/index.html" es estatico y ya trae su propio guardia (si no hay
	// username llama logout()), que es la proteccion que realmente se quiere.
	location.href = "/index.html";
}

function player(nuevo) {
	if (!nuevo) return window.sceneManager.jugador;
	if (!nuevo.animado && nuevo.animar) nuevo.animar();
	const anterior = window.sceneManager?.jugador;
	if (anterior && anterior !== nuevo) anterior.esPlayer = false;
	// "yo" es el jugador controlado; algunas escenas lo reasignan (neto/caballero)
	if (window.yo === undefined) window.yo = nuevo;
	nuevo.esPlayer = true;
	window.sceneManager.jugador = nuevo;
	if (!nuevo.inventario)
		usarInventario(() => nuevo, datos?.elementos?.[nuevo.id]?.items || []);
	window.sceneManager.seleccionarObjeto(nuevo.id);
	window.sceneManager.actualizarCamara();
	if(anterior && anterior != nuevo)
		evento("creado:player", { nuevo:true, elemento:nuevo });
	return nuevo;
}

function crearJugadorUI(x,y, image, config) {
	if (config === undefined) config = {};
	if (window.sceneManager?.jugador) return window.sceneManager.jugador;
	window.sceneManager.jugador = window.sceneManager
		.agregar(x || 10, y || 10, image, "player", {
			tipo: "player",
			esPlayer: true,
			orientacion: "abajo",
			fuerza:2,
			...config,
		})
		.margenX(-18)
		.margenY(-15)
		.animar()
		// restauramos el inventario guardado del player en partidas anteriores
		usarInventario( player , datos?.elementos?.["player"]?.items || [])
	if (window.yo === undefined) window.yo = window.sceneManager.jugador;
	// la pintura diferida apunta al jugador CREADO, no al global: si luego el
	// juego hizo player(otro), no repintar con la imagen del player por defecto
	const creado = window.sceneManager.jugador;
	esperarY(1 , () => {
		if (window.sceneManager.jugador === creado) creado.pintar(image, config)
	});
	evento("creado:player", player);
	return window.sceneManager.jugador;
}

function empezarEn(x, y) {
	// $empezarEn
	let z = 0
	let config = localStorage.getItem('escenaConfig')
	if( config !== undefined && config ){
		config = JSON.parse(config)
		if(config){
			if(config.hasOwnProperty('x')) x = config.x
			if(config.hasOwnProperty('y')) y = config.y
			if(config.hasOwnProperty('z')) z = config.z
			localStorage.removeItem('escenaConfig')
		}
	}
	
	return crearJugadorUI(
		x, y,
		"player",
		{
			pausado: false,
			repetir: true,
			orientacion: "abajo",
			solido:true,
			animadoImagen: {
				escala: 0.8,
			},
			z
		}
	);
}

function toggleCamaraUI() {
	const activa = window.sceneManager.toggleModoCamara();
	const btn = document.getElementById("btnCamara");
	if (btn) {
		btn.textContent = activa
			? "📹 Cámara: Juego (ON)"
			: "🛠️ Cámara: Libre (OFF)";
		btn.className = `btn toggle-btn ${activa ? "active" : "inactive"}`;
	}
}

function moverSeleccionado(dx, dy, dz, vista) {
	const scene = window.sceneManager;
	if (!scene.idSeleccionado) return;
	const obj = scene.elementos.find((o) => o.id === scene.idSeleccionado);

	if (obj?.ocupado === true) return;
	if (obj?.deslizando) return; // el bucle de deslizamiento maneja el avance
	
	if(typeof dx == 'object') {
		if(dx.z) return obj.capa( obj.z + dx.z);
	}
	if (obj?.animado)
		return moverOManiobrarAnimado(dx, dy, dz, vista, agarrando && obj === player());
	if (obj) window.physicsEngine.intentarMover(obj, dx, dy, dz, false, false);
}

function setZoom(val) {
	window.sceneManager.zoom = val;
	window.sceneManager.actualizarCamara();
}

function exportarEstadoUI() {
	prompt(
		"Copia el JSON del estado actual:",
		window.sceneManager.exportarJSON(),
	);
}

function importarEstadoUI() {
	const input = prompt("Pega el JSON a cargar:");
	if (input) window.sceneManager.cargarJSON(input);
}

function limpiarEscenaUI() {
	window.sceneManager.limpiarEscena();
}

function actualizarUI(id) {
	const list = document.getElementById("actorList");
	if (!list) return;
	const seleccionado = id || window.sceneManager.idSeleccionado;
	list.innerHTML = "";
	document
		.querySelector(`.actor-chip.selected`)
		?.classList.remove("selected");
	let filter = document.getElementById("actorSearch-tipo");
	let filterTipo = filter?.value || "";
	const tipos = [
		...new Set(window.sceneManager.elementos.map((o) => o.tipo || "desconocido")),
	];
	if (filter) {
		const actual = filter.value;
		filter.innerHTML =
			`<option value="">Todos</option>` +
			tipos
				.map((t) => `<option value="${t}">${t}</option>`)
				.join("");
		filter.value =
			tipos.includes(actual) || actual === "" ? actual : "";
		filterTipo = filter.value;
	}
	window.sceneManager.elementos
		.filter((o) => !filterTipo || o.tipo === filterTipo)
		.forEach((o) => {
			let chipCreated = document.querySelector(`.actor-chip[name="${o.id}"]`);
			if (!chipCreated) {
				chipCreated = document.createElement("div");
				chipCreated.setAttribute("name", o.id);
				chipCreated.style = `display:flex;background:${o.esPlayer ? "teal" : "transparent"}`;
				chipCreated.className = "actor-chip";
				chipCreated.onclick = () =>
					window.sceneManager.seleccionarObjeto(o.id);
				list.appendChild(chipCreated);
			}
			if (seleccionado && seleccionado === o.id) {
				chipCreated.classList.add("selected");
				escenaActiva().actualizarCamara();
			}
			chipCreated.innerHTML = `<div class="coordenadas"><span>x:${o.x}</span><span>y:${o.y}</span><span>z:${o.z}</span></div><div>${o.tipo} #${o.id}</div><button class="btn" onclick="event.stopPropagation();verPropiedadesUI('${o.id}')">⚙️</button>`;
		});
}

function verPropiedadesUI(id) {
	if (!window.verPropiedadesDialog) {
		window.verPropiedadesDialog = document.createElement("dialog");
		window.verPropiedadesDialog.className = "ver-propiedades";
		document.body.appendChild(window.verPropiedadesDialog);
	}
	const o = window.sceneManager.elementos.find((e) => e.id === id);
	if (!o) return;
	const props = o.propiedades();
	const valores = {
		id: o.id,
		x: o.x,
		y: o.y,
		z: o.z,
		w: o.w,
		h: o.h,
		d: o.d,
		tipo: o.tipo,
		imagenAlias: o.imagenAlias,
		orientacion: o.orientacion,
		esPlayer: o.esPlayer,
		installed: o.installed,
		...Object.fromEntries(Object.entries(props).filter(([, v]) => typeof v !== "function")),
	};
	const filas = Object.entries(valores)
		.map(
			([k, v]) =>
				`<tr><td class="p-1 font-bold">${k}</td><td class="p-1 break-all">${typeof v === "object" ? JSON.stringify(v) : v}</td></tr>`,
		)
		.join("");
	window.verPropiedadesDialog.innerHTML = `
		<form method="dialog" class="p-4 max-w-md">
			<div class="flex justify-between items-center mb-2">
				<h3 class="text-lg font-bold">#${o.id}</h3>
				<button class="btn" value="false">✖️</button>
			</div>
			<div class="overflow-y-auto" style="max-height:70vh">
				<table class="w-full text-sm border-collapse">
					${filas}
				</table>
			</div>
		</form>`;
	window.verPropiedadesDialog.showModal();
}

escuchar("mover", () => actualizarUI());

// ---------------------------------------------------------------------
// 5. INICIALIZACIÓN DE LA ESCENA
// ---------------------------------------------------------------------
let gameStarted = false;

// el archivo global no es una escena: se ejecuta en TODAS las escenas.
// se llama despues de que `juego()` crea al player, asi puede registrar
// opciones/funciones compartidas (ej: player().inventario.opciones(...)).
let globalCargado = false;
let globalListos = false;
const keyLocalstorageEscenaActiva = "escenaSeleccionada"
function cargarGlobal() {
	if (globalCargado) return;
	globalCargado = true;
	// si el tag <script src="/api/files/global.js"> ya lo cargo, no inyectar otra
	// copia (cada escuchar del archivo quedaria registrado dos veces)
	if (document.querySelector('script[src="/api/file/global"]')) return;
	const inyectar = (html) => {
		const script = document.createElement("script");
		script.innerHTML = html;
		document.body.appendChild(script);
		globalListos = true;
	};
	const cache = localStorage.getItem("file:global");
	if (localStorage.getItem(keyLocalstorageEscenaActiva) !== "global" && cache) {
		inyectar(cache);
		return;
	}
	return $fetch("/api/file/global.js")
		.then((res) => {
			// la API devuelve {status, code}; code vacio => archivo inexistente
			if (typeof res?.code !== "string" || !res.code) return;
			// misma sintaxis amigable que las escenas
			// "interactuar" se normaliza a un token antes de Expandirlo a async:
			// con replaceAll en cadena el source que ya venia "interactuar( async"
			// salia "interactuar( async  async" -> SyntaxError que mataba TODO el
			// script global. El token hace la pasada idempotente.
			const html = `try{${res.code
				.replaceAll("interactuar ( async", "@INTERACTUAR@")
				.replaceAll("interactuar( async", "@INTERACTUAR@")
				.replaceAll("interactuar (", "@INTERACTUAR@")
				.replaceAll("interactuar(", "@INTERACTUAR@")
				.replaceAll("@INTERACTUAR@", "interactuar( async ")
				.replaceAll(" si(", "if(")
				.replaceAll(" si (", "if(")
				.replaceAll(" sino (", "sino(")
				.replaceAll(" sino(", "else if(")
				.replaceAll(" sino{", "else{")
				.replaceAll(" sino {", "else{")};
				} catch(error){ console.log(error); }`;
			localStorage.setItem("file:global", html);
			inyectar(html);
		})
		.catch(() => {});
}

const iniciarJuego = () => {
	
	if (!window.hasOwnProperty("sceneManager") || !assetsLoaded) return;
	if (gameStarted) return;
	gameStarted = true;
	let count = 0;
	console.log('iniciar juego')

	let x = setInterval(() => {
		try {
			if (typeof juego === "function") {
				console.log('------- juego() ----------')
				// se ejecuta el global despues de que el player existe
				cargarGlobal();
				let xPlayer = setInterval(() => {
					// global.js solo reacciona a { nuevo:true }; sin esto su
					// init (imagenesPesca, inventario, los escuchar) nunca corre
					if(player() && globalListos) {
						evento("creado:player", { nuevo:true, elemento: player() });
						clearInterval(xPlayer);
					}
				}, 100);
				juego();
				console.log('------- gameInstalled ----------', gameInstalled)
				gameInstalled = true
				
				// restauramos los inventarios guardados de cajas/almacenes de esta escena
				for (let [id, saved] of Object.entries(datos?.elementos || {})) {
					if (!saved?.items?.length || id == "player" || saved.destruido) continue;
					if (saved.escena === undefined || saved.escena != escenaActiva().name) continue;
					let el = escenaActiva().elementos.find((e) => e.id == id);
					if (!el) continue;
					try { usarInventario(() => el, saved.items); } catch (e) { console.log(e); }
				}
				escenaActiva().seleccionarObjeto(window.sceneManager.jugador?.id || "player");
				camera.updateFromPlayer();
				window.eventBus.setEstado("start");
				setZoom(1.0);
				setTimeout(() => {
					window.eventBus.setEstado("play");
					actualizarUI();
					esperarY(1, () => estilarElementosAgua(escenaActiva().elementos.filter((e) => e.tipo == 'agua' && !e.propiedades("redondear") )));
				}, 500);
				clearInterval(x);
			}
		} catch (error) {
			console.log(error);
			errorRender(error);
			console.log(String(juego))
			if (count === 1000) {
				clearInterval(x);
				throw "Error al cargar el juego";
			}
		}
		count++;
	}, 500);
};

escuchar("ready:assets", () => {
	if(!gameInstalled){
		assetsLoaded = true;
		iniciarJuego();
	} else{
		ocultarLoader();
	}
});
escuchar("ready:scene", iniciarJuego);
// fallback: si el estado llega a play, las imagenes ya no son bloqueantes
escuchar("estado:cambio", (e) => {
	if (e.estado === "play") ocultarLoader();
});
escuchar("creado", (obj) => {
	//console.log("creado" , obj);
})


function repetir(accion) {
	let n = 1;
	let limit = 100000
	const fn = () => {
		n++
		if(n < limit) {
			accion(manager)
		} else{
			if(interval) clearInterval(interval)
		}
	}
	let manager = {
		cada(segundos) {
			clearInterval(interval);
			fn(interval)
			interval = setInterval(() => {
				fn();
			}, segundos * 1000);
			return manager
		},
		detener() {
			clearInterval(interval);
			return manager
		},
		veces(veces) {
			limit = veces
			if(!interval){
				for (let i = 0; i < veces; i++) {
					fn(i);
				}
			}
			return manager
		}
	};
	let interval = setInterval(() => {
		fn();
	}, n * 1000);
	return manager
}
