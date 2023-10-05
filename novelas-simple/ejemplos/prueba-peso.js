iniciarJuego = () => {
	try {
		Info.insertar('barra','Vida', 90);
		Juego.insertar({
			id:'mango',
			x:50,
			y:70,
			ancho:12,
			url:'./images/mango.webp'
		})
		.evento('click', (objeto) => {
			objeto.eliminar();
			juego.Vida.incrementar(10)
		})
		.usarMovimiento('aplicarGravedad', {
			velocidad:50
		})

	} catch (error) {
		alert('ocurrio un error')
	}
 } 