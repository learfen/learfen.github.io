iniciarJuego = () => { 
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
}