usarImagen("fuego-azul", "/games/images/fuego-azul.gif")
usarImagen("caja", "/games/images/caja-madera.png")

// importaciones basicas
function juego() {
	// escribe aqui tu codigo
	empezarEn(10, 10);
	player().escala(.8).margenY(-50).margenX(5)

	relatar(`Acomoda las cajas en las zonas azules`)

	paredHorizontal(0, 8, 5, "muro")
	paredHorizontal(0, 8, 4, "muro")
	paredHorizontal(0, 8, 4, "muro")
	paredVertical(4, 8, 2, "muro")
	paredHorizontal(5, 9, 3, "muro")
	paredVertical(0, 8, 7, "muro")
	paredHorizontal(0, 15, 5, "muro")
	paredVertical(4, 14, 2, "muro")
	paredHorizontal(5, 14, 2, "muro")
	paredVertical(7, 9, 6, "muro").puerta(3)
	
	escenaActiva().agregar(4, 13, "caja").margenX(5).solido().peso(1)
	escenaActiva().agregar(1, 12, "caja").margenX(5).solido().peso(1)
	escenaActiva().agregar(3, 9, "fuego-azul").margenX(-5).plano().noSolido()
	escenaActiva().agregar(4, 10, "fuego-azul").margenX(-5).plano().noSolido()

	let completado = 0
	escuchar("mover:@caja", ({ elemento }) => {
		if(elemento.en('@fuego-azul')){
			elemento.peso(10)
			completado = completado + 1
		}
		if(completado === 2){
			decir("Ganaste")
		}
	})












}
