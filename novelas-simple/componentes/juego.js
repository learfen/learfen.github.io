let sesion = {}

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
		{id:'bosque', url:'./images/bosque.jpg', alto:35 , ancho:35, x:10 , y:0,option:true},
		{id:'mar', url:'./images/mar.jpg', alto:35 , ancho:35, x:55 , y:0,option:true},
	]
	for(let objeto of objetos){
		Juego.insertar( objeto )	
	}
	function activarOpcion( abrir , cerrar ){
		cerrar.remove()
		abrir.classList.add('background-active')
		abrir.classList.remove('item-option')
		abrir.style.transform = 'translate(0px,0px)'
		abrir.style.width = gameScreen().width + 'px'
		abrir.style.height = gameScreen().height + 'px'
		let relSofia = 15 / 20 
		Juego.insertar( {id:'sofia' , url:'./images/sofia.png',alto:40 , ancho:relSofia * 40, x:45 , y:40 } )
		setTimeout(()=>{
			Juego.insertar( {id:'dialogo' , url:'./images/mensaje.webp',alto:30 , ancho:85, x:5 , y:55 , customClass:'d-flex justify-content-center align-items-center text-center  px-md-5 px-sm-3'} )
			let mensaje
			let conversacion = new Conversacion(
				dialogo
				, [
					'Hola soy Sofia' 
					, '¿Quien eres tu?'
					, () => {
						conversacion.nombre = prompt('Tu nombre')
						return 'Hola '+conversacion.nombre
					}
					, 'Lanzaré una moneda si sale cara inicias con 1 moneda de oro, si sale seca inicias con 1 moneda de plata'
					, () => {
						let resultado = Conversacion.lanzarMoneda()
						setTimeout(()=>{
							if( resultado == 'cara'){
								mensaje = 'Empiezas con una moneda de oro'
								Juego.insertar( {id:'monedaOro' , url:'./images/coin-oro.svg',alto:10 , ancho:10, x:45 , y:40 } )
								monedaOro.onclick = () => mochila.guardar( monedaOro )
							}else{
								mensaje = 'Empiezas con una moneda de plata'
								Juego.insertar( {id:'monedaPlata' , url:'./images/coin-plate.svg',alto:10 , ancho:10, x:45 , y:40 } )
								monedaOro.onclick = () => mochila.guardar( monedaOro )
							}
						}, 3000)
						return 'Lanzaré'
					}, () => mensaje 
					,'Ahora te haré de guia por el bosque de los novatos'
				])
			conversacion.hablar()
		})
	}
	setTimeout(()=> {
		bosque.onclick = () => activarOpcion( bosque , mar )
		mar.onclick = () => activarOpcion( mar , bosque )
	}, 2000)
	setTimeout(()=> bosque.click() , 2500 )
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