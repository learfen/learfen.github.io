iniciarJuego = () => { 
	Mensaje.insertar('Soy un electricista dislexico, ayudame a comprender este circuito',{
		x:10,
		y:40,
		ancho:90,
		estilos:{
			clases:' p-5 text-white btn btn-success '
		}
	})
	.mostrar()
	.evento('click' , objeto => {
		    objeto.eliminar()
		
			Puzzle.insertar({
				id:'ejemplo',
				imagenes:[
					'./images/puzzle-1.png',
					'./images/puzzle-2.png',
					'./images/puzzle-3.png',
					'./images/puzzle-4.png',
					'./images/puzzle-5.png',
					'./images/puzzle-6.png',
					'./images/puzzle-7.png',
					'./images/puzzle-8.png',
					'./images/puzzle-9.png'
				]
				, completado(){
					alert('completado')
				}
			})
	})
}