usarImagen("piso","/games/images/textura-suelo-tierra.jpg")
usarImagen("charco", "/games/images/pozo-2.png")
usarImagen("red ", "/games/images/red.png")
usarImagen("arcoiris", "/games/images/rainbow-svgrepo-com.png")
usarImagen("agua", "/games/images/agua.gif")
usarImagen("cespe", "/games/images/textura-suelo-hierba-2.webp")
usarImagen("llave", "/games/images/llave-2.png")
usarImagen("iman", "/games/images/iman.svg")
usarImagen("perro", "/games/images/lobo-abajo.gif")
usarImagen("casa", "/games/images/casa.png")
usarImagen("fogata", "/games/images/fogata-2.gif")
usarImagen("flor", "/games/images/flower-3.png")
usarImagen("corazon", "/games/images/corazon.svg")
usarImagen("nuves", "/games/images/cielo-1.png")
usarImagen("monedas", "/games/images/coin.svg")
usarImagen("arbol", "/games/images/arbol.png")
usarImagen("pasto", "/games/images/bosque1.png")

// importaciones basicas
function juego() {
	cambiarPiso("piso")

	escenaActiva().agregar(10, 12, "charco").margenY(-50).escala(.8).solido()

	escenaActiva().agregar(10, 12, "red ").margenY(-50).escala(.8).solido()

	escenaActiva().agregar(10, 12, "red ").margenY(-50).escala(.8).solido()

	escenaActiva().agregar(18, 7, "arcoiris").margenY(-50).escala(.8).solido().interactuar(() => {
		teletransportar(player(), 1,19)
		escenaActiva().actualizarCamara();
	})

	escenaActiva().agregar(1, 8, "arcoiris").margenY(-50).escala(.8).solido().interactuar(() => {
		teletransportar(player(), 18,1)
		escenaActiva().actualizarCamara();
	})

	escenaActiva().agregar(18, 19, "arcoiris").margenY(-50).escala(.8).solido().interactuar(() => {
		teletransportar(player(), 18,1)
		escenaActiva().actualizarCamara();
	})

	escenaActiva().agregar(18, 1, "arcoiris").margenY(-50).escala(.8).solido().interactuar(() => {
		teletransportar(player(), 18,19)
		escenaActiva().actualizarCamara();
	})

	escenaActiva().agregar(2, 1, "arcoiris").margenY(-50).escala(.8).solido().interactuar(() => {
		decir("Encontraste la salida. Ganaste!", 2)
		esperarY(3, () => decir("Tus puntos son "+player().inventario.contar('@monedas') + "/4"))
		esperarY(6 , () => escenaActiva().reset())
	})

	escenaActiva().agregar(0, 19, "arcoiris").margenY(-50).escala(.8).solido().interactuar(() => {
		teletransportar(player(), 0,9)
		escenaActiva().actualizarCamara();
	})

	escenaActiva().agregar(14, 14, "arcoiris").margenY(-50).escala(.8).solido().interactuar(() => {
		teletransportar(player(), 17,19)
		escenaActiva().actualizarCamara();
	})

	escenaActiva().agregar(6, 12, "arcoiris").margenY(-50).escala(.8).solido().interactuar(() => {
		teletransportar(player(), 13,15)
		escenaActiva().actualizarCamara();
	})

	escenaActiva().agregar(14, 2, "arcoiris").margenY(-50).escala(.8).solido().interactuar(() => {
		teletransportar(player(), 18,1)
		escenaActiva().actualizarCamara();
	})

	escenaActiva().agregar(12, 12, "agua").margenY(-50).escala(.8).solido()

	escenaActiva().agregar(11, 12, "agua").margenY(-50).escala(.8).solido()

	escenaActiva().agregar(11, 12, "cespe").margenY(-50).escala(.8).solido()

	escenaActiva().agregar(11, 12, "cespe").margenY(-50).escala(.8).solido()

	escenaActiva().agregar(14, 1, "pasto").margenY(-50).escala(.8).solido()

	escenaActiva().agregar(2, 3, "casa").margenY(-100).escala(.8).solido().expandir(3,1)

	escenaActiva().agregar(14, 2, "fogata").margenY(-50).escala(.8).solido()

	escenaActiva().agregar(14, 2, "flor").margenY(-50).escala(.8).solido()

	escenaActiva().agregar(14, 2, "corazon").margenY(-50).escala(.8).solido()

	escenaActiva().agregar(14, 2, "corazon").margenY(-50).escala(.8).solido()

	escenaActiva().agregar(14, 9, "nuves").margenY(-50).escala(.8).solido()

	escenaActiva().agregar(18, 4, "monedas").margenY(-50).margenX(10).escala(.5).solido().interactuar(({ elemento }) => {
		player().inventario.guardar(elemento)
	})

	escenaActiva().agregar(15, 8, "monedas").margenY(-50).margenX(10).escala(.5).solido().interactuar(({ elemento }) => {
		player().inventario.guardar(elemento)
	})

	escenaActiva().agregar(7, 18, "monedas").margenY(-50).margenX(10).escala(.5).solido().interactuar(({ elemento }) => {
		player().inventario.guardar(elemento)
	})

	escenaActiva().agregar(10, 18, "monedas").margenY(-50).margenX(10).escala(.5).solido().interactuar(({ elemento }) => {
		player().inventario.guardar(elemento)
	})

	escenaActiva().agregar(9, 4, "monedas").margenY(-50).margenX(10).escala(.5).solido().interactuar(({ elemento }) => {
		player().inventario.guardar(elemento)
	})

	escenaActiva().agregar(14, 12, "arbol").margenY(-50).escala(.8).solido()

	escenaActiva().agregar(14, 12, "arbol").margenY(-50).escala(.8).solido()

	repetir(({ cursor }) => {
		escenaActiva().agregar(6+cursor(),9, "pasto").margenX(0).px(70,100).margenY(-30).escala(1).solido()
	}).cada(.1).veces(14)

	repetir(({ cursor }) => {
		escenaActiva().agregar(8,8+cursor(), "pasto").margenX(0).px(70,100).margenY(-30).escala(1).solido()
	}).cada(.1).veces(12)

	escenaActiva().agregar(11, 10, "pasto").margenY(-50).solido()

	escenaActiva().agregar(10, 10, "pasto").margenY(-50).solido()

	// escribe aqui tu codigo
	empezarEn(10, 10);
}























































































