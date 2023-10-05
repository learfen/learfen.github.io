window.iniciarJuego = function() {
		Info.insertar('barra', 'Vida', 90 , valor => {
			if(valor === 0) {
				Juego.fin('Perdiste')
			}
		})
		let count= 0
		repetirCada(() => {
			let random = parseInt(Math.random() * 100)
			if(random > 90) random = 90
			Juego
				.insertar({
					id: 'mango-' + count++,
					x: random,
					y: 10,
					ancho: 12,
					url: './images/mango.webp'
				})
				.evento('click', (objeto) => {
					objeto.eliminar()
					juego.Vida.incrementar(10)
				})
				.usarMovimiento('aplicarGravedad', {
					velocidad:50,
					tocarPiso(objeto) {
						objeto.eliminar()
						juego.Vida.reducir(10)
					},
					colision(objeto , objetos) {
						if(objetos){
							if(objetos.length > 0) {
								objeto.cancelarGravedad()
							}
						}
					}
				})
		}, 1)
}
