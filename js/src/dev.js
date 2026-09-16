const panel = `
    <div class="dev-panel-content" >
        <div class="tab">
            <button name="play">▶️</button>
            <button name="panel-levels">🔢<small>Escenas</small></button>
            <button name="panel-images">🗺️<small>Recursos</small></button>
            <button name="actorList">👥<small>Actores</small></button>
            <button name="camaraPanel">📷<small>Camara</small></button>
            <button name="tutoriales">⁉️<small>Tutoriales</small></button>
        </div>  
        <div class="actor-list panel p-1" name="actorList">
            <div class="w-full flex justify-between">
                <h3 class="w-full">Actores</h3>
                <div class="flex">
                    x: <input type="number" style="width:5ch" placeholder="10" id="actorSearch-x" class="input">
                    y: <input type="number" style="width:5ch" placeholder="10" id="actorSearch-y" class="input">
                <button class="btn" onclick="buscarActoresUI()">🔎</button>
                </div>
            </div>
            <div class="w-full flex items-center gap-1 py-1">
                <label class="text-xs opacity-60">Tipo:</label>
                <select id="actorSearch-tipo" class="input flex-1" onchange="actualizarUI()">
                    <option value="">Todos</option>
                    <option value="player">player</option>
                    <option value="Enemigo">Enemigo</option>
                    <option value="Npc">Npc</option>
                    <option value="Objeto">Objeto</option>
                    <option value="Bloque">Bloque</option>
                    <option value="Sensor">Sensor</option>
                </select>
            </div>
            <div class="h-full overflow-y-auto"  style="max-height: 75vh" id="actorList"></div>
        </div>
        <div class="panel px-2 py-3" name="panel-levels" >
            <div id="form-escena" class="flex items-center my-2 relative">
                <label class="flex flex-wrap w-full">
                    <small class="w-full">Nueva Escena</small>
                    <input type="text" placeholder="Nombre de la Escena" id="name-escena" class="flex p-1 m-1 rounded-lg w-full">
                </label>
                <button name="nueva" class="flex relative btn w-fit p-1 rounded-lg mt-2">Crear</button>
            </div>
            <h3>Mis Escenas</h3>
            <div style="max-height:40vh;overflow-y:auto" id="myListScene">
            </div>
        </div>
        
        <!-- CÁMARA Y ZOOM -->
        <div class="btn-row panel bg-gray-800 px-2 py-3" id="camaraPanel" name="camaraPanel">
            <button class="btn toggle-btn active" id="btnCamara" onclick="toggleCamaraUI()">📹 Cámara: Juego (ON)</button>
            <button class="btn" onclick="setZoom(2.0)">Zoom 2.0x</button>
            <button class="btn" onclick="setZoom(1.6)">Zoom 1.6x</button>
            <button class="btn" onclick="setZoom(1.0)">Zoom 1.0x</button>
        </div>
        
        <div class="btn-row panel bg-gray-800 px-2 py-3 flex-wrap" id="tutoriales" name="tutoriales">
			<h4>Actores</h4>
            <button class="btn w-full p-1 flex items-center justify-center" onclick="mostrarTutorial('vidas');">Vidas</button>
            <button class="btn w-full p-1 flex items-center justify-center" onclick="mostrarTutorial('colision');">Colision</button>
            <button class="btn w-full p-1 flex items-center justify-center" onclick="mostrarTutorial('interaccion');">Interacción</button>
            <button class="btn w-full p-1 flex items-center justify-center" onclick="mostrarTutorial('mensajes');">Mensajes y dialogos</button>
            <button class="btn w-full p-1 flex items-center justify-center" onclick="mostrarTutorial('pescar');">Pescar</button>
            <button class="btn w-full p-1 flex items-center justify-center" onclick="mostrarTutorial('inventario');">Inventario</button>
			<button class="btn w-full p-1 flex items-center justify-center" onclick="mostrarTutorial('proyectil');">Disparar</button>
			<button class="btn w-full p-1 flex items-center justify-center" onclick="mostrarTutorial('perseguir');">Seguir</button>
			
			
			<h4>Escenarios</h4>
            <button class="btn w-full p-1 flex items-center justify-center" onclick="mostrarTutorial('paredes');">Paredes</button>
            <button class="btn w-full p-1 flex items-center justify-center" onclick="mostrarTutorial('lago');">Lago</button>
            <button class="btn w-full p-1 flex items-center justify-center" onclick="mostrarTutorial('paredes');">Paredes</button>
            <button class="btn w-full p-1 flex items-center justify-center" onclick="mostrarTutorial('paredes');">Paredes</button>
            <button class="btn w-full p-1 flex items-center justify-center" onclick="mostrarTutorial('paredes');">Paredes</button>

        </div>

        <div class="panel p-1" name="panel-images">
            <div class="pagination p-2">
                <!-- icon asqii redo -->
                <button onclick="imagesBackend.reload()" class="p-1 text-md">
                    🔃
                </button>
                <div class="flex">
                    <!-- back -->
                    <button class="p-1 text-md" onclick="imagesBackend.back()">
                        ◀️
                    </button>
                    <span class="p-1 text-md" id="imageIndex"></span>
                    <!-- next -->
                    <button class="p-1 text-md" onclick="imagesBackend.next()">
                        ▶️
                    </button>
                </div>
            </div>
            <div class=" p-4 flex flex-wrap max-h-[70vh] overflow-y-auto gap-2" id="images"></div>
        </div>
    </div>
`;

function buscarActoresUI() {
	let x = document.getElementById("actorSearch-x").value;
	let y = document.getElementById("actorSearch-y").value;
	let item = escenaActiva().elementos.filter((e) => e.x == x && e.y == y);
	if (item) {
		escenaActiva().seleccionarObjeto(item[0]);
	}
}

function installDevPanel() {
	let panelDev = document.createElement("div");
	panelDev.classList.add("dev-panel");
	panelDev.id = "dev-panel";
	panelDev.innerHTML = panel;
	document.body.appendChild(panelDev);

	// cuando hago click en un button en el tab debe agregar la clase active al button y al panel
	panelDev.addEventListener("click", (event) => {
		if (event.target.getAttribute("name") == "play") {
			// reinicia el estado de la partida (escenas/objetos) al ejecutar el juego
			localStorage.removeItem("datos");
			console.log(
				"guardando... para ejecutar el juego (estado reiniciado)",
			);
			updateChanges({ force: true, next: () => location.reload() });
		}
		if (
			event.target.nodeName === "IMG" &&
			event.target.parentNode.id === "images"
		) {
			let codigo = editor.getValue();
			let url = event.target.src.split("/games")[1];
			let codeInstallImage = "";
			let alias = "";
			let cut = codigo.split(`"/games${url}"`);
			let importImage = false;
			if (cut.length === 1) {
				alias = prompt("Ingresa un alias para la imagen", "");
				if (!alias) return errorRender("El alias no puede estar vacio");
				codeInstallImage =
					codigo.split(`usarImagen("${alias}"`).length > 1
						? ""
						: `usarImagen("${alias}","/games${url}")\n`;
				importImage = true;
			} else {
				alias = cut[0].split('usarImagen("')[1].split('"')[0];
			}

			if (
				confirm(
					"Insertar el codigo en la celda seleccionada la imagen?",
				)
			) {
				// si no se eligio celda antes, se inserta en el centro del grid
				// (la celda queda seleccionada luego, asi se ve donde cayo)
				window.selectedPosition = window.selectedPosition || {
					x: 10,
					y: 10,
				};
				codigo = codigo
					.replace("juego() {", "juego(){")
					.replace(
						"juego(){",
						`juego(){\n\tescenaActiva().agregar(${window.selectedPosition.x},${window.selectedPosition.y},"${alias}").margenY(-50).escala(.8).solido()\n`,
					);

				if (importImage) usarImagen(alias, "/games" + url);

				let interval = setInterval(() => {
					if (!imagenesImportadasData.hasOwnProperty(alias)) return;
					let nodo = escenaActiva()
						.agregar(
							window.selectedPosition.x,
							window.selectedPosition.y,
							alias,
						)
						.escala(0.8)
						.margenY(-50)
						.solido();
					esperarY(0.5, () => {
						escenaActiva().seleccionarObjeto(nodo.id);
					});
					clearInterval(interval);
				}, 50);

				editor.setValue(codeInstallImage + codigo);
			} else {
				editor.setValue(codeInstallImage + codigo);
			}
		}
		if (event.target.parentNode?.classList.contains("tab")) {
			// quitamos si existe algun butotn con tab
			let buttonActived = panelDev.querySelector(".tab button.active");
			if (buttonActived) {
				buttonActived.classList.remove("active");
				panelDev
					.querySelectorAll(
						`[name=${buttonActived.getAttribute("name")}]`,
					)
					.forEach((panel) => {
						panel.classList.remove("active");
					});
			}
			/// si es distinto activamos el panel
			if (
				event.target.getAttribute("name") !==
				buttonActived?.getAttribute("name")
			) {
				const button = event.target;
				button.classList.add("active");
				button.parentElement.classList.add("active");
				panelDev
					.querySelectorAll(`[name=${button.getAttribute("name")}]`)
					.forEach((panel) => {
						panel.classList.add("active");
					});
			}
			return;
		}
		if (event.target?.classList.contains(".actor-chip")) {
			let chipActived =
				event.target?.classList.contains(".actor-chip.active");
			if (chipActived) {
				chipActived.classList.remove("active");
			}
			event.target.classList.add("active");
			return;
		}
		if (event.target.parentNode?.id === "form-escena") {
			if (event.target.tagName == "BUTTON") {
				if (event.target.getAttribute("name") === "nueva") {
					let name = document.querySelector("#name-escena").value;
					if (!name) return;
					return fetch(`/api/files/${name}`, {
						method: "POST",
					})
						.then((response) => response.json())
						.then((data) => {
							location.reload();
						});
				}
			}
		}
		if (event.target.closest?.("#myListScene") && event.target.hasAttribute("name")) {
			cambiarEscena(event.target.getAttribute("name"));
		}

		if (event.target.id === "name-escena") {
			event.target.blur = () => (focusInputEscena = false);
			focusInputEscena = true;
		}
	});
}

// En multijugador se muestra la interfaz de juego, no las herramientas de edición.
if (new URLSearchParams(location.search).has("neto")) {

	// modo pantalla completa
	let fullScreen = document.querySelector("#fullScreen");
	fullScreen?.addEventListener("click", () => {
		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			document.documentElement.requestFullscreen();
		}
	});

	// anular los scroll
	document.body.onscroll = () => {
		document.body.scrollTop = 0;
		document.documentElement.scrollTop = 0;
	};

	// anular scroll en el telefono
	window.addEventListener("orientationchange", () => {
		document.body.scrollTop = 0;
		document.documentElement.scrollTop = 0;
	});

	// anular scroll en el telefono
	window.addEventListener("resize", () => {
		document.body.scrollTop = 0;
		document.documentElement.scrollTop = 0;
	});

	// anular scroll en el telefono
	window.addEventListener("touchmove", (e) => {
		// No interceptar el joystick: necesita recibir los gestos táctiles.
		if (e.target.closest?.("#neto-controls")) return;
		document.body.scrollTop = 0;
		document.documentElement.scrollTop = 0;
		e.preventDefault();
	});

	setTimeout(() => {
		document.body.scrollTop = 0;
		document.documentElement.scrollTop = 0;
	}, 500)

	setInterval(() => {
		// body scroll Y = 0
		document.body.scrollTop = 0;
	}, 1000)
}else{
	installDevPanel();
}
function mostrarTutorial(select) {
	let buttonActived = document.querySelector(".tab button.active")
	buttonActived.click()
    if(estado() !== "play") {
        evento("s")
    }
    // mover el scroll de la pagina hasta el 0
    window.scrollTo(0, 0);
	let tutoriales = {
		vidas: [
			`
#### ¿A quien podemos ponerle vidas?
Cualquier objeto puede tener vidas.  

player()
/code
    .animar()
    .usarVidas(3)
`,
			`
#### ¿Como puedo restar vidas?  

player()
/code
    .restarVida( 1 )
`,
			`
#### ¿Como puedo sumar vidas?  

player()
/code
    .sumarVida( 1 )
`,
			`
#### Ejemplo de objetos
**Si no entiendes el codigo, ve al tutorial de colisiones**

Si un proyectil colisiona con un slime, restamos vida al slime

/code
let slime = escenaActiva()  
    .agregar(10,10,"slime", {
        tipo: "enemigo"
    })  
    .solido()  
    .animar()
    .usarVidas(3)  
escuchar("colision:@proyectil",({quien,con})=>{  
    if(con.tipo == 'enemigo') con.restarVida(1)
    if(con.vidas() === 0) con.eliminar()
})
`,
		],
		colision: [
			`
## ¿Qué es una colision?
Es cuando 2 objetos se tocan o se colisionan. Podemos escuchar la colision del objeto en movimiento.

Podemos escuchar todas las colisiones y filtrar utilizando ":"

#### Filtrando por id
colision:player


#### Filtrando por tipo 
colision:@fuego
`,
			`
#### Escuchamos las colisiones y filtramos por el selector id del objeto
Filtro sera el id o el tipo
/code
    escuchar("colision:filtro",({quien,con})=>{  
        // tu codigo
    })
`,
			`
#### Ejemplo  

Ahora sabemos cuando el Player colisiona con cualquier objeto, usamos un if para saber el id coincide con la puerta(id = cabaña) y luego cambiamos la escena

- con: contiene el objeto con el que colisiono el player

/code
    escuchar("colision:player",({quien,con})=>{  
        if(con.id == "cabaña"){
            cambiarEscena("dentro-de-cabaña")
        }
    })
`,
			`
#### Ejemplo: y si fueran las puertas de un tren y tuvieramos que pagar para entrar

Escuchamos las colisiones del player, y con un if comprobamos si el objeot es tipo = puerta-tren y si tiene dinero

/code
    escuchar("colision:player",({quien,con})=>{  
        if(con.tipo == 'puerta-tren'){
            if(dinero == 0){
                player().decir("No me alcanza para este viaje")
            } else {
                dinero -= 1
                cambiarEscena("dentro-de-tren")
            }
        }
    })
`,
			`
#### Ejemplo: ¿y si fuera un proyectil contra un objeto? Eliminaremos el enemigo
Tendremos que usar el selector @ porque el proyectil no tiene un id
- proyectil es tipo = magia  
- objeto es tipo = enemigo  


/code
    escuchar("colision:@magia",({quien,con})=>{  
        if(con.tipo == 'enemigo'){
            con.eliminar()
        }
    })
`,
		],
		interaccion: [
			`
#### ¿Que es interactuar?  
Presionar (A) tocando un objeto  

/code
let molino = escenaActiva().agregar(10, 10, "molino").solido();  
// agregamos al molino un dato, asi sabemos que inicia apagado  
molino.encendido = false  
molino.interactuar(() => {  
    if(molino.encendido) {  
        molino.encendido = false  
        molino.animacion.pausa()  
    } else {  
        molino.encendido = true  
        molino.animacion.play()  
    }  
})  
`,
		],
        mensajes: [
            `
#### ¿Como hacer que el player o cualquier elemento diga algo?

/code
player().decir("hola")
`,
`
#### ¿Mensajes para guiar al jugador?
/code
ayuda("Este es un texto de ayuda")
`,
`
#### Usando preguntar  
preguntar( **actor** , **pregunta**, **respuestas** )

- actor: sobre quien aparecera la pregunta
- pregunta: el texto de la pregunta
- respuestas: una lista de las posibles respuestas

#### Siempre es el player quien responderá  
¿Como sabemos que eligio el player? La funcion pregunta responde el **texto** y el **indice**

/code
let respuesta = preguntar(player(),"¿Comida?", ["Si","No"])
`,
`
#### Usando preguntar y el texto de la respuesta
escenaActiva().agregar(10,12,"bola").margenY(-30).escala(.8).solido()
/code
    .interactuar(() => {
        let respuesta = preguntar(player(),"¿Comida?", ["Si","No"])
        if(respuesta.texto === 'Si'){
            player().decir("El metal no se come",2)
        }
        else player().cerrarDecir()
    })

`,
`
#### Usando preguntar y el indice de la respuesta
escenaActiva().agregar(10,12,"bola").margenY(-30).escala(.8).solido()  
0:Si  
1:No  
/code
    .interactuar(() => {
        let respuesta = preguntar(player(),"¿Comida?", ["Si","No"])
        if(respuesta.indice === 0)
            player().decir("El metal no se come",2)
        else player().cerrarDecir()
    })

`
        ],
        pescar:[`
#### ¿El player puede pescar?
Necesitamos hacer 2 cosas

- Importar las imagenes de la pescar
- Crear la caña (siempre ponle id a la caña)
- Crear el evento
`,
`
#### Importar las imagenes  
Ve a escenas/global y pega este codigo, en pescar([ "**aqui agregas tus alias**" ])
/code
escuchar("creado:player", () => {
    imagenesPesca()
    player().inventario.opciones('@caña', {
        Usar(){
            pescar(["pez1","pez2"])
        }
    })
})
`,
`
#### Crear una caña
/code
escenaActiva().agregar(10, 10, "caña", "caña-unica");
`,
`
#### Pescando
Una vez el player tenga una caña debera:
- Abrir el inventario
- Seleccionar la **caña**
- Seleccionar **Usar**
`
        ],
        paredes:[
`
#### Pared horizontal y vertical 
- x,y : Coordenadas.  
- tamaño : Cuantos espacios ocupa.  
- Imagen: Alias de la imagen que usaremos para cada bloque de la pared.  
**Ejemplos**  
paredHorizontal( x , y , tamaño, imagen )
paredVertical( x , y , tamaño, imagen )

/code
paredHorizontal(0,8,10, "muro")  
`,
`
#### Pared horizontal con puerta
En esta la pared horizontal el tamaño es 10, es decir, ocupan 10 bloques.  
Agregaremos la puerta en el bloque 8 de la pared.  
paredHorizontal(0,8,10, "muro")  
/code
    .puerta(8)
    .interactuar((info) => info.elemento.usar())
`,
`
#### Pared vertical con puerta
En esta la pared vertical el tamaño es 10, es decir, ocupan 10 bloques.  
Agregaremos la puerta en el bloque 8 de la pared, y ademas interactuar para que abra la puerta.  
paredVertical(0,8,10, "muro")
/code
    .puerta(4)
`,
`
#### ¿Como hacer que la puerta use llave?  
Usar la llave por id es util para cuando la llave estara en una escena y la puerta en otra
1- Creamos la llave con id "llave-patio" y hacemos que el player la pueda recoger  
escenaActiva().agregar(0,8,"llave", "llave-patio")  
    .interactuar(({ elemento }) => player().inventario.guardar(elemento))
2- Usamos ese id de la llave para crear la puerta  
paredVertical(0,8,10, "muro")  
/code
    .puerta(4, "llave-patio")
`
        ],
        lago:[
			`
#### ¿Como podria hacer un lago con peces?
- Creamos el agua donde se movera el pez
- Creamos el agua que "tapara" al pez para que parezca estar debajo
- Creamos los peces y utilizamos la funcion aleatorio limitando a que solo puedan moverse en los bloques tipo agua.
**Ejemplos**  
/code
// agua invisible
escenaActiva().agregar(6, 5, 'agua', { z: -2 }).margenY(0).transparencia(0).expandir(3, 3).noSolido()
// agua visible
escenaActiva().agregar(6, 6, 'agua', { z: 0 }).transparencia(.8).expandir(4, 3).solido().escala(1.1).margenX(0).margenY(-150)
// peces
escenaActiva().agregar(7, 5, 'pez1', {z: -2}).escala(.4).aleatorio("agua").margenX(50)
escenaActiva().agregar(7, 5, 'pez1', {z: -2}).escala(.4).aleatorio("agua").margenX(50)
escenaActiva().agregar(7, 5, 'pez1', {z: -2}).escala(.4).aleatorio("agua").margenX(50)
`
        ],
		inventario: [
`
#### ¿Como un objeto puede tener inventario?

- Creamos un objeto con inventario y guardamos en la variable "cofre".  

let cofre = escenaActiva().agregar(1,3,"caja", { pausado:true }).solido().escala(.7).margenY(-60).margenX(-40)

/code	
.animar().usarInventario()
`,
`
#### ¿Guardar en el inventario de un objeto?

- Creamos una pocion
let pocion = escenaActiva().agregar(0,1,"pocion", "pocion-1").margenY(-50).escala(.8).solido()  

- Guardamos la pocion en el inventario del cofre.  

/code
cofre.inventario.guardar(pocion)
`
		],
		inventario_opciones:[
			`
#### ¿Como crear la accion de "Usar" en el inventario?
- Creamos una pocion
let pocion = escenaActiva().agregar(0,1,"pocion", "pocion-1").margenY(-50).escala(.8).solido()
/code
pocion.Usar = (con, objeto) => {
	player().sumarVida()
	objeto.eliminar()	
}
`,
`
#### ¿Como asignar una accion a todos los objetos del mismo tipo?
/code
player().inventario.opciones('@pocion', {
        Usar(con, objeto){ 
			player().sumarVida()
			objeto.eliminar()	
        }
    })
`,
`
#### ¿Como usar objeto con el escenario?

Solo pesca cuando usamos la caña frente a un bloque de agua

/code
player().inventario.opciones('@caña', {
        Usar(con, objeto){ 
			if(con.tipo === 'agua') pescar()
        }
    })
`
		]
		,
		proyectil: [
`
#### ¿El player lanza proyectil?  
Impacto, **info** contiene datos del impacto:

- **info.con:** el objeto que fue golpeado.  
- **info.origen:** el objeto que lanzo el proyectil.  
- **info.objeto:** el proyectil.  

player()  
/code
	.lanzar({
		tecla:"e",
		imagen: "magia-1", 
		distancia: 2,
		impacto(info){
			if(info.con.tipo === "enemigo") info.con.perderVida()
		}
	})
`,
`
#### ¿El proyectil va recto o rápido?
Por defecto **recto** avanza celda por celda. Con **modo:"dinamico"** ignora las celdas, vuela en línea recta hasta **distancia** y recién ahí dispara impacto/colisión como si entrara moviéndose normal

player()
/code
	.lanzar({
		tecla:"e",
		imagen: "bomba-1", 
		distancia: 15,
		modo: "dinamico",
		impacto(info){
			if(info.con.tipo === "enemigo") info.con.perderVida()
		}
	})
`,
`
#### ¿Como acomodar el proyectil?
Tal vez, lo que lanzamos no se ve correctamente  

- Supongamos que el proyectil se ve un poco abajo cuando lo lanzamos hacia la izquierda
- Cancelar: **info** contiene la funcion para cancelar el disparo  

player()
/code
	.lanzar({
		tecla:"e",
		imagen: "magia-1", 
		distancia: 2,
		proyectil( proyectil , info ){
			if(player().mirando() == 'izquierda') proyectil.margenY(-10)
			if(player().mirando() == 'derecha') info.cancelar()
		}
		impacto(info){
			if(info.con.tipo === "enemigo") info.con.perderVida()
		}
	})
`,
`
#### ¿Un enemigo lanza proyectil?  
**Si no agregaste .animar() no funcionará lanzar()**  
Haremos que si el proyectil golpea al player resta una vida  

let mago = escenaActiva().agregar(9,9,"mago", {pausado:true, repetir:true})
/code
        .animar()
        .lanzar({
            imagen: "magia-1", 
            distancia: 2,
            impacto(obj){
                if(obj.con === player()) player().perderVida()
            }
        })
`,
`
#### El enemigo ya sabe lanzar un proyectil, pero...
El player lanza presionando una tecla, pero queremos que el enemigo sea automatico, para lo que utilizaremos visión

- **selector**: el objeto que escucharemos, puedes poner id o @tipo
- **accion**: la accion que se ejecutara

vision( selector , accion )
/code
.vision("player", (info) => mago.disparar() )
`

		],
		perseguir: [
`
#### ¿Como perseguir al player?

- **selector**: el objeto que escucharemos, puedes poner id o @tipo
- **accion**: la accion que se ejecutara
vision( selector , accion )  

let lobo = escenaActiva().agregar(9,9,"lobo", {pausado:true, repetir:true})
/code
.vision("player", (info) => lobo.seguir() )
`,

`
#### ¿Que hacer cuando alcance al player?
**info.con: ** el objeto que fue golpeado.
**info.objeto: ** quien persigue.  

let lobo = escenaActiva().agregar(9,9,"lobo", {pausado:true, repetir:true})
/code
lobo.seguir({
	colision(info){
		if(info.con.id === 'player')
			player().perderVida()
	}
})
`,`
#### ¿Y si queremos que el lobo empiece a perseguir solo cuando vea al player?

- vision( selector , accion )  
- **selector**: el objeto que escucharemos, puedes poner id o @tipo
- **accion**: la accion que se ejecutara  

let lobo = escenaActiva().agregar(9,9,"lobo", {pausado:true, repetir:true})
/code
.vision("player", (info) => {
	lobo.seguir()
})
`,

		],
	};
	if (tutoriales.hasOwnProperty(select)) {
		relatar(tutoriales[select]);
	}
}

