usarImagen("suelo", "/games/images/piso1b.png")
usarImagen("piletita", "/games/images/pozo-1.png")
usarImagen("piedritas ", "/games/images/textura-suelo-2.jpg")
usarImagen("pasto realistico", "/games/images/textura-suelo-hierba-2.webp")
usarImagen("magia-1", "/games/images/magia-2.gif")
usarImagen("pasto", "/games/images/textura-suelo-1.jpg")
usarImagen("labubu", "/games/images/accelerate-svgrepo-com.png")
usarImagen("castillo", "/games/images/castillo-1.png")
usarImagen("hamburguesa", "/games/images/comida-hamburguesa.png")
usarImagen("mandy", "/games/images/mago-abajo.gif")
usarImagen("mago os", "/games/images/mago-izquierda.gif")
usarImagen("luffy", "/games/images/luffy-ataca-2.gif")
usarImagen("cielo espacial", "/games/images/fondo-editor-intro.jpg")
usarImagen("mago kakas", "/games/images/mago-derecha.gif")
usarImagen("arco chico", "/games/images/arquero-1.gif")
usarImagen("charizard", "/games/images/pokemon-charizard-atack.gif")
usarImagen("cascada", "/games/images/monta%C3%B1a.png")
usarImagen("guccimilosocratesmessichocomisskell", "/games/images/lobo.webp");
usarImagen("julian", "/games/images/mujer1.svg");
usarImagen("arcoiris", "/games/images/rainbow-svgrepo-com.png");
usarImagen("negro", "/games/images/vacio.png");
usarImagen("tiburon", "/games/images/shark.gif");
usarImagen("argentina", "/games/images/salchicha_becd36c0-c6ec-4b73-a373-e3442e726948.png");
usarImagen("mar", "/games/images/agua.gif");
// importaciones basicas
function juego() {
	//escenaActiva().agregar(10, 10, "suelo").margenY(-50).escala(.8).solido()

	escenaActiva().agregar(5, 14, "piletita").margenY(-50).margenX(5).escala(1).solido().expandir(3,2).interactuar(() => {
		player().sumarVida(3 - player().vidas())
	})

	cambiarPiso("suelo", "10%")

	escenaActiva().agregar(10, 10, "castillo").margenY(-350).escala(1.5).solido().expandir(5,5)

	escenaActiva().agregar(2, 6, "mandy").margenY(-50).escala(1.1).solido().animar().lanzar({
		imagen: "magia-1",
		distancia: 5,
		cada:1.7,
		vision: '*',
		modo: 'dinamico',
		impacto(info) {
			if (info.con.tipo === "player") info.con.perderVida()
		}
	}).hacia('@player')


	escenaActiva().agregar(14, 4, "mago os").margenY(-150).escala(1.5).solido().animar().lanzar({
		imagen: "magia-1",
		distancia: 5,
		cada:1.7,
		vision: '*',
		modo: 'dinamico',
		impacto(info) {
			if (info.con.tipo === "player") info.con.perderVida()
		}
	}).hacia('@player')


	escenaActiva().agregar(1, 8, "mago kakas").margenY(-150).escala(1.5).solido().lanzar({
		imagen: "magia-1",
		distancia: 5,
		cada:1.7,
		vision: '*',
		modo: 'dinamico',
		impacto(info) {
			if (info.con.tipo === "player") info.con.perderVida()
		}
	}).hacia('@player')


	escenaActiva().agregar(15, 7, "mago kakas").margenY(-150).escala(1.5).solido().lanzar({
		imagen: "magia-1",
		distancia: 5,
		cada:1.7,
		vision: '*',
		modo: 'dinamico',
		impacto(info) {
			if (info.con.tipo === "player") info.con.perderVida()
		}
	}).hacia('@player')


	//escenaActiva().agregar(10, 10, "guccimilosocratesmessichocomisskell").expandir(1, 4)

	empezarEn(5, 16)
	let contarMagos = 0
	player().usarVidas(3).lanzar({
		tecla:'e',
		imagen:'magia-1',
		distancia:5,
		impacto({ elemento }){
			if(elemento.tipo == 'mago') elemento.restarVida()
			if(elemento.vidas() === 0) {
				elemento.eliminar()
				contarMagos = contarMagos + 1
				if(contarMagos === 4) decir("Ganaste")
			}
		}
	})
	decir("Busca el agua cuando te sientas debil", 3)

	escuchar("destruido:player", () => escenaActiva().reset())

	paredHorizontal(0, 12, 10, "muro")

	paredHorizontal(5, 8, 8, "muro")
	paredVertical(9, 1, 8, "muro")

}