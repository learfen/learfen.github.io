let semillaStore = null;
function semilla(semilla) {
	if (!semilla) return semillaStore;
	semillaStore = semilla;
	seedNumberRandom =
		typeof semillaStore === "number"
			? semillaStore
			: hashString(semillaStore);
}

function idFromSeed() {
	return String(randomFromSeed() * 100000).slice(0, 5);
}
// 1. Generador Pseudoaleatorio (PRNG) basado en semilla numérica o string
function hashString(str) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = (hash << 5) - hash + str.charCodeAt(i);
		hash |= 0;
	}
	return Math.abs(hash);
}
let seedNumberRandom = null;
// Algoritmo Mulberry32 para números aleatorios con semilla
function randomFromSeed() {
	seedNumberRandom += 0x6d2b79f5;
	let t = seedNumberRandom;
	t = Math.imul(t ^ (t >>> 15), t | 1);
	t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function importImagesDefaultProcedural() {
	
	usarImagen("magia-1", "/games/images/magia-1.gif");
	usarImagen("mago", "/games/images/mago-abajo.gif", {
		margenY: 20,
	});
	usarImagen("mago-izquierda", "/games/images/mago-izquierda.gif", {
		margenY: 20,
	});
	usarImagen("mago-derecha", "/games/images/mago-derecha.gif", {
		margenY: 20,
	});
	usarImagen("mago-arriba", "/games/images/mago-arriba.gif", {
		margenY: 20,
	});
	usarImagen("mago-abajo", "/games/images/mago-abajo.gif", {
		margenY: 20,
	});
	usarImagen("cangrejo", "/games/images/cangrejo.gif", {
		margenY: 30
	});
	usarImagen("montaña", "/games/images/montaña.png", {
		margenY: 20,
	});
	usarImagen("agua", "/games/images/agua.gif", { margenY: 15 });
	usarImagen("tierra", "/games/images/piso-tierra.png");
	usarImagen("flor", "/games/images/flower-svgrepo-com.png", {
		escala: 0.5,
		margenY: 35,
		margenX: 10,
	});
	usarImagen("piedra", "/games/images/piedra.png", {
		escala: 0.4,
		margenY: 40,
		margenX: 15,
	});
	usarImagen("arbol", "/games/images/arbol.png", {
		alto: 2,
		margenY: -20,
	});
	usarImagen("arbusto", "/games/images/bush.svg", {
		escala: 1.5,
		margenY: 15,
	});
	usarImagen("trampa","/games/images/trampa-1.gif")
	usarImagen("lobo-izquierda", "/games/images/lobo-izquierda.gif", {
		margenY: 20,
	});
	usarImagen("lobo-derecha", "/games/images/lobo-derecha.gif", {
		margenY: 20,
	});
	usarImagen("lobo-arriba", "/games/images/lobo-arriba.gif");
	usarImagen("lobo-abajo", "/games/images/lobo-abajo.gif");
	usarImagen("suelo", "/games/images/textura-suelo-1.jpg");

	usarImagen("moneda", "/games/images/coin-gold-svgrepo-com.png", {
		escala: 0.4,
		margenY: 45,
		margenX: 20,
	});
}


function generarMapaProcedural() {
	importImagesDefaultProcedural();
	const ANCHO = 19;
	const ALTO = 19;
	const seed = semilla();
	let seedNum = typeof seed === "number" ? seed : hashString(seed);
	const piedra = "piedra"
	const arbusto = "arbusto"
	const arbol = "arbol"
	const flor = "flor"
	const cangrejo = "cangrejo";
	const mago = "mago";
	const lobo = "lobo";
	const fuego = "fuego";
	const trampa = "trampa";

	const allItems = [];
	// Algoritmo Mulberry32 para números aleatorios con semilla
	function random() {
		seedNum += 0x6d2b79f5;
		let t = seedNum;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	}

	// Matriz para controlar qué espacios ya están ocupados
	const grillaOcupada = Array.from({ length: ALTO }, () =>
		Array(ANCHO).fill(false),
	);

	// Función auxiliar para verificar si un espacio está libre para un tamaño dado
	function puedeUbicar(x, y, w, h) {
		if (x + w > ANCHO || y + h > ALTO) return false;
		for (let dy = 0; dy < h; dy++) {
			for (let dx = 0; dx < w; dx++) {
				if (grillaOcupada[y + dy][x + dx]) return false;
			}
		}
		return true;
	}

	// Función auxiliar para marcar los espacios como ocupados
	function marcarOcupado(x, y, w, h) {
		for (let dy = 0; dy < h; dy++) {
			for (let dx = 0; dx < w; dx++) {
				grillaOcupada[y + dy][x + dx] = true;
			}
		}
	}

	if (random() > 0.4)
		if (false) {
			//cambiarPiso("suelo").repetir().cubrir("18%").repetir(true);

			// --- PASO 1: Rellenar la base con Tierra ---
			for (let y = 1; y < ALTO; y++) {
				for (let x = 1; x < ANCHO; x++) {
					escenaActiva().agregar(x, y, "tierra").plano();
				}
			}
		}

	// --- PASO 2: Generar elementos grandes (Montañas / Lagos de Agua) ---
	// Intentamos colocar algunos elementos grandes de 2x2 o 33
	// numero aleatorio entre 0 y 10

	let addMount = random() > 0.5;
	if (addMount) {
		let expandir = Math.floor(random() * 3);
		let x = Math.floor(random() * ANCHO + 1);
		let y = Math.floor(random() * ALTO + 1);
		while (x === 0 || x > 14) {
			x = Math.floor(random() * ANCHO + 1);
		}
		while (y === 0 || y > 14) {
			y = Math.floor(random() * ALTO + 1);
		}
		let count = 0;
		while (expandir < 3 || expandir > 8) {
			if (count > 10) expandir = 6;
			expandir = Math.floor(random() * 10 + 3);
		}
		while (expandir + x > 18 || expandir + y > 18) {
			expandir--;
		}
		let expandirY = parseInt(expandir / 3);
		if (puedeUbicar(x, y, expandir, expandirY)) {
			escenaActiva()
				.agregar(x, y, "montaña", {
					h:3,
					w:expandir, 
					d:expandirY
				})
				.solido();
		}
	}

	let formaCuerpoAgua = {
		lineal(semilla, ancho = 18, alto = 18) {
			// respondera una serie de coordenadas x,y para dibujar distintos tipos de rio que cruzan la escena de lado a lado
			// el rio debe tener una forma diferente cada vez, guardando relacion con la semilla, el rio debe serpentear

			// 1. Reutilizamos el mismo generador pseudoaleatorio (PRNG) basado en semilla
			function hashString(str) {
				let hash = 0;
				for (let i = 0; i < str.length; i++) {
					hash = (hash << 5) - hash + str.charCodeAt(i);
					hash |= 0;
				}
				return Math.abs(hash);
			}

			let seedNum =
				typeof semilla === "number" ? semilla : hashString(semilla);

			function random() {
				seedNum += 0x6d2b79f5;
				let t = seedNum;
				t = Math.imul(t ^ (t >>> 15), t | 1);
				t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
				return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
			}

			const coordenadasRio = [];
			const visitados = new Set();

			// Decidimos aleatoriamente si el río cruza Vertical (de arriba a abajo) o Horizontal (de izq a der)
			const esVertical = random() > 0.5;

			let x, y;
			if (esVertical) {
				// Empieza en cualquier punto de la fila superior (y = 0)
				x = Math.floor(random() * ancho);
				y = 0;
			} else {
				// Empieza en cualquier punto de la columna izquierda (x = 0)
				x = 0;
				y = Math.floor(random() * alto);
			}

			coordenadasRio.push({ x, y });
			visitados.add(`${x},${y}`);

			// Bucle para hacer avanzar el río hasta que llegue al borde opuesto
			let maxPasos = ancho * alto; // Límite de seguridad para evitar bucles infinitos
			let pasos = 0;

			while (pasos < maxPasos) {
				// Condición de llegada al borde opuesto
				if (esVertical && y === alto - 1) break;
				if (!esVertical && x === ancho - 1) break;

				// Posibles movimientos: Avanzar hacia la meta y opcionalmente tambalearse a los lados
				let opciones = [];

				if (esVertical) {
					// Tendencia obligatoria: Bajar (y + 1)
					// Opciones laterales: Izquierda (x - 1) o Derecha (x + 1)
					if (y + 1 < alto) opciones.push({ x: x, y: y + 1 });
					if (x - 1 >= 0) opciones.push({ x: x - 1, y: y });
					if (x + 1 < ancho) opciones.push({ x: x + 1, y: y });
				} else {
					// Tendencia obligatoria: Ir a la derecha (x + 1)
					// Opciones verticales: Arriba (y - 1) o Abajo (y + 1)
					if (x + 1 < ancho) opciones.push({ x: x + 1, y: y });
					if (y - 1 >= 0) opciones.push({ x: x, y: y - 1 });
					if (y + 1 < alto) opciones.push({ x: x, y: y + 1 });
				}

				// Filtramos opciones para darle un sesgo natural de serpenteo (damos más peso a avanzar)
				// Ordenamos o filtramos las que no repitan casillas recientes si es posible
				let opcionesDisponibles = opciones.filter(
					(pos) => !visitados.has(`${pos.x},${pos.y}`),
				);

				// Si se encierra, permitimos re-visitar para no romper el flujo
				if (opcionesDisponibles.length === 0) {
					opcionesDisponibles = opciones;
				}

				// Seleccionamos la siguiente coordenada usando el PRNG
				const siguiente =
					opcionesDisponibles[
						Math.floor(random() * opcionesDisponibles.length)
					];

				x = siguiente.x;
				y = siguiente.y;

				coordenadasRio.push({ x, y });
				visitados.add(`${x},${y}`);
				pasos++;
			}

			return coordenadasRio;
		},
		circular(semilla, ancho = 18, alto = 18) {
			function hashString(str) {
				let hash = 0;
				for (let i = 0; i < str.length; i++) {
					hash = (hash << 5) - hash + str.charCodeAt(i);
					hash |= 0;
				}
				return Math.abs(hash);
			}

			let seedNum =
				typeof semilla === "number" ? semilla : hashString(semilla);

			function random() {
				seedNum += 0x6d2b79f5;
				let t = seedNum;
				t = Math.imul(t ^ (t >>> 15), t | 1);
				t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
				return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
			}

			const coordenadas = [];

			// Centro aleatorio del óvalo dentro de márgenes seguros
			const cx = Math.floor(ancho * 0.3 + random() * (ancho * 0.4));
			const cy = Math.floor(alto * 0.3 + random() * (alto * 0.4));

			// Radios base (qué tan grande es el óvalo)
			const radioBaseX = 3 + Math.floor(random() * 3); // Entre 3 y 5
			const radioBaseY = 3 + Math.floor(random() * 3);

			// Factor de alargamiento (excentricidad/orientación) basado en la semilla
			// Si factorX es mayor, es más horizontal; si factorY es mayor, es más vertical.
			const factorAlargadoX = 0.7 + random() * 0.8; // Varía entre 0.7 y 1.5
			const factorAlargadoY = 0.7 + random() * 0.8;

			const rx = radioBaseX * factorAlargadoX;
			const ry = radioBaseY * factorAlargadoY;

			// Rotación aleatoria del óvalo (en radianes)
			const rotacion = random() * Math.PI;
			const cosR = Math.cos(rotacion);
			const sinR = Math.sin(rotacion);

			// Factor de irregularidad para que los bordes no sean matemáticamente perfectos
			const ruidoBorde = 0.25;

			for (let y = 0; y < alto; y++) {
				for (let x = 0; x < ancho; x++) {
					// Trasladar al origen
					const dx = x - cx;
					const dy = y - cy;

					// Rotar coordenadas
					const xRot = dx * cosR - dy * sinR;
					const yRot = dx * sinR + dy * cosR;

					// Ecuación general del óvalo con variación pseudoaleatoria por celda
					const variacion = 1 + (random() * 2 - 1) * ruidoBorde;
					const valorOvalo =
						Math.pow(xRot, 2) / Math.pow(rx, 2) +
						Math.pow(yRot, 2) / Math.pow(ry, 2);

					if (valorOvalo <= variacion) {
						coordenadas.push({ x, y });
					}
				}
			}

			return coordenadas;
		},
		irregular(semilla, ancho = 18, alto = 18) {
			function hashString(str) {
				let hash = 0;
				for (let i = 0; i < str.length; i++) {
					hash = (hash << 5) - hash + str.charCodeAt(i);
					hash |= 0;
				}
				return Math.abs(hash);
			}

			let seedNum =
				typeof semilla === "number" ? semilla : hashString(semilla);

			function random() {
				seedNum += 0x6d2b79f5;
				let t = seedNum;
				t = Math.imul(t ^ (t >>> 15), t | 1);
				t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
				return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
			}

			const coordenadas = [];
			const visitados = new Set();

			// 1. Definir el centro principal de la forma
			const cx = ancho / 2 + (random() * 4 - 2);
			const cy = alto / 2 + (random() * 4 - 2);

			// 2. Crear un sistema de "puntos de control" (Blob centers) alrededor del centro
			// Esto asegura que la figura tenga sentido orgánico (se extienda hacia ciertos lados)
			const cantidadBurbujas = 4 + Math.floor(random() * 4); // Entre 4 y 7 núcleos secundarios
			const burbujas = [{ x: cx, y: cy, radio: 3 + random() * 2 }]; // Núcleo principal

			for (let i = 0; i < cantidadBurbujas; i++) {
				// Distribuir los núcleos en un ángulo aleatorio con respecto al centro
				const angulo = random() * Math.PI * 2;
				const distancia = 1 + random() * 3;

				burbujas.push({
					x: cx + Math.cos(angulo) * distancia,
					y: cy + Math.sin(angulo) * distancia,
					radio: 2 + random() * 2.5,
				});
			}

			// 3. Evaluar cada celda de la grilla basada en su distancia combinada a todas las burbujas
			for (let y = 0; y < alto; y++) {
				for (let x = 0; x < ancho; x++) {
					// Calculamos una influencia acumulada (tipo metaballs)
					let influenciaTotal = 0;

					for (let b of burbujas) {
						const distancia = Math.hypot(x - b.x, y - b.y);
						// Fórmula de influencia decreciente por radio
						if (distancia < b.radio * 1.5) {
							influenciaTotal += Math.max(
								0,
								1 - distancia / (b.radio * 1.5),
							);
						}
					}

					// Añadir un factor de ruido aleatorio sutil por celda para bordes rugosos
					const ruidoCelda = random() * 0.2;

					// Umbral: si la influencia acumulada supera cierto límite, la celda forma parte de la figura
					if (influenciaTotal + ruidoCelda > 0.45) {
						const clave = `${x},${y}`;
						if (!visitados.has(clave)) {
							visitados.add(clave);
							coordenadas.push({ x, y });
						}
					}
				}
			}

			return coordenadas;
		},
	};

	let cursorAgua = Math.floor(random() * 3);
	if (cursorAgua > 3)
		cursorAgua = parseInt(cursorAgua / Math.floor(random() * 10));

	let tipoAgua = Object.keys(formaCuerpoAgua)[cursorAgua];
	const cuerpoAgua = formaCuerpoAgua[tipoAgua](seed, 18, 18);
	const tilesAgua = [];
	for (let item of cuerpoAgua) {
		if (item.x == 0 || item.y == 0) continue;
		if (puedeUbicar(item.x, item.y, 1, 1)) {
			marcarOcupado(item.x, item.y, 1, 1);
			const el = escenaActiva().agregar(item.x, item.y, "agua", { tipo:"agua" }).plano().solido();
			tilesAgua.push({ x: item.x, y: item.y, nodo: el.nodo });
		}
	}
	esperarY(1, () => estilarElementosAgua(tilesAgua))

	// --- PASO 3: Generar elementos medianos y pequeños (Árboles y Arbustos) ---
	const densidadVegetacion = 40; // Cantidad de intentos de vegetación
	for (let i = 1; i < densidadVegetacion; i++) {
		let x = Math.floor(random() * ANCHO + 1);
		let y = Math.floor(random() * ALTO + 1);
		while (x == 0 || x == ANCHO) {
			x = Math.floor(random() * (ANCHO - 1));
		}
		while (y == 0 || y == ALTO) {
			y = Math.floor(random() * (ANCHO - 1));
		}

		const solidos = [piedra, arbol, flor, trampa];
		const tipo1 = random() > 0.4 ? arbol : piedra;
		const tipo2 = random() > 0.4 ? arbusto : flor;
		const tipo = random() > 0.5 ? tipo1 : tipo2;
		let newW = tipo == arbusto ? 2 : 1
		let newY = tipo == arbol || tipo == arbusto ? 2 : 1
		if (puedeUbicar(x, y, newW, newY)) {
			// flores: id estable (posicion+seed); si ya se recogio, no reaparece
			const idFlor = tipo == flor ? `flor-${x}-${y}-${seed}` : undefined;
			if (idFlor && datos.elementos?.[idFlor]?.destruido) continue;
			let elemento = escenaActiva().agregar(x, y, tipo, idFlor, {
				z: 0,
				w: newW ,
				h: newY ,
				d: 1,
				cubo: false,
				pausado:false,
				solido: false,
				tipo: tipo
			}).margenY(-25);
			marcarOcupado(x, y, newW, newY);
			if(tipo == arbusto) elemento.imagen("2d")
			if(tipo == flor) elemento.escala(.6).peso(1)
			if(tipo == arbol) elemento.escala(1.3).margenY(5)
			if(tipo == piedra) {
				let rand = random() + 0.1
				elemento.escala( rand ).peso(rand * 5)
			}
			allItems.push(elemento);

			if (solidos.includes(tipo)) elemento.solido();
		}
	}

	const densidadEnemigos = 10; // Cantidad de intentos de vegetación
	let enemigos = [];
	for (let i = 1; i < densidadEnemigos; i++) {
		let x = Math.floor(random() * ANCHO + 1);
		let y = Math.floor(random() * ALTO + 1);
		while (x == 0 || x == ANCHO) {
			x = Math.floor(random() * (ANCHO - 1));
		}
		while (y == 0 || y == ALTO) {
			y = Math.floor(random() * (ANCHO - 1));
		}

		if (puedeUbicar(x, y, 1, 1)) {
			marcarOcupado(x, y, 1, 1);
			const play = [cangrejo, fuego, trampa];
			const tipo2 = random() > 0.4 ? trampa : mago;
			const tipo1 = random() > 0.4 ? lobo : cangrejo;
			const tipo = random() > 0.5 ? tipo1 : tipo2;
			const usePlay = play.includes(tipo);

			const orientacionPosibles = ["arriba","izquierda","abajo","derecha"];
			
			let orientacionNumber = random()
			if(orientacionNumber < 0.26) orientacionNumber = 0
			if(orientacionNumber > 0.26 && orientacionNumber < 0.52) orientacionNumber = 1
			if(orientacionNumber > 0.52 && orientacionNumber < 0.78) orientacionNumber = 2
			if(orientacionNumber > 0.78) orientacionNumber = 3
			
			const orientacion = orientacionPosibles[orientacionNumber]
			let elemento = escenaActiva().agregar(x, y, tipo, {
				pausado: !usePlay,
				repetir: true,
				cubo: false,
				solido:true,
				orientacion,
				tipo: "Enemigo",
				z:0
			});
			elemento.solido()
			elemento.animar()
			elemento.escala(1)
			elemento.margenY(-40)
			//elemento.margenY(0)
			allItems.push(elemento);
			if (tipo == mago) {
				elemento.margenY(-60).escala(.8)
				elemento
					.lanzar({
						imagen: "magia-1", 
						distancia: 2,
						impacto(obj){
							if(obj.con.hasOwnProperty("perderVida")) obj.con.perderVida()
						}
					})
					.vision("player", (info) => {
						// aqui ponemos lo que hara luego de verlo
						elemento.animacion.play(1.5);
						elemento.disparar();
					});
			}
			if (tipo == trampa) {
				elemento.tipo = 'trampa'
				elemento.margenX(-45)
				//elemento.nodo.querySelector('canvas').style.maxWidth = "100%";
			};
			if (tipo == cangrejo)
				elemento.animar().aleatorio().margenY(0).margenX(-45).escala(.6).usarAnimacion("scale");
			if (tipo == lobo) {
				elemento.vision("player", (info) => {
					elemento.animacion.play();
					elemento
					.seguir({
						colision(a,b){
							player().restarVida()
						},
					});
				});
			}
			
			enemigos.push(elemento);
		}
		escucharUnaVez("render:procedural", () => {
			for (let item of enemigos) {
				if (!item?.animacion?.pausado) item?.animacion?.play();
			}
		});
	}

	const recoger = [piedra, flor];
	let tocando = null
	
	escuchar(["arriba", "abajo", "izquierda", "derecha"], () => {
		let encontrado = player().mirandoObjeto()
		tocando = null
		if(Array.isArray(encontrado)) {
			if(encontrado.length > 0) {
				for(let item of encontrado){
					if(!item?.tipo) continue
					if(item?.interaccion) continue
					if(!recoger.includes(item.tipo)) continue ;
					if(item.tipo == piedra && item.peso > 2) continue;
					tocando = item
					ayuda("Presiona A/Usar para recoger");
				}
			}
		}
	}, "play")

	let timeAwaitKeyPress = 0
	escuchar("a", () => {
		// aceptar solo una vez cada 500ms
		let time = Date.now()
		if(time - timeAwaitKeyPress < 500) return
		timeAwaitKeyPress = time
		if(!!tocando){
			console.log({tocando})
			player().inventario.guardar(tocando)
		}
	}, "play");

	escuchar("colision:@trampa", () => {
		player().perderVida()
	})
	
	return new Promise((resolve) => {
		setTimeout(() => {
			evento("render:procedural");
		}, 2000);
		setTimeout(() => {
			evento("render:procedural");
			resolve();
		}, 1000);
	});
}
