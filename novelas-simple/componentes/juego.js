function ejemploRecoleccion(){
	function tazaEncontrada( event ){
		mochila.guardar( event.target )
		Info.sumarPuntos( 10 )
	}
	const objetos = [
		{id:'taza1', url:'./images/taza-cafe.png', ancho:15, x:5 , y:0},
		{id:'taza2', url:'./images/taza-cafe.png', ancho:15, x:30 , y:0},
		{id:'taza3', url:'./images/taza-cafe.png', ancho:15, x:45 , y:0},
		{id:'taza4', url:'./images/taza-cafe.png', ancho:15, x:0 , y:10},
		{id:'mango', url:'./images/mango.webp', ancho:10, x:0 , y:20}
	]
	for(let objeto of objetos){
		Juego.insertar( objeto )	
	}
	taza1.onclick = tazaEncontrada
	taza2.onclick = tazaEncontrada
	taza3.onclick = tazaEncontrada
	taza4.onclick = tazaEncontrada
	mango.onclick = tazaEncontrada
}

function ejemploEligeElCamino(){
	
	const objetos = [
		{id:'bosque', url:'./images/bosque.jpg', ancho:80, x:10 , y:0},
		{id:'mar', url:'./images/mar.jpg', ancho:80, x:10 , y:45},
	]
	for(let objeto of objetos){
		Juego.insertar( objeto )	
	}
}

function ejemploPregunta(){
	const eligeCamino = (tipo) => {
		alert(tipo)
	}
	const respondeCorrectamente = (respuesta) => {
		if( respuesta ) Info.sumarPuntos( 20 )

		pregunta2.preguntar()
		
	}
	let pregunta1 = new Pregunta('¿Qué es la novela?', ['novela1', 'novela2', './images/taza-cafe.png', 'novela4'] , respondeCorrectamente , 0 )

	let pregunta2 = new Pregunta('¿Que tipo de luchador eres?', ['mago', 'guerrero', 'caballero', 'ninja', 'vikingo'] , eligeCamino )
	pregunta1.preguntar()
}

function iniciarJuego(){
	
	ejemploEligeElCamino()
	
}