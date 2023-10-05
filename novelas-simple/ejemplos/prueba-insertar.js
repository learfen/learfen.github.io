iniciarJuego = () => { 
	let life = new Info('barra','Vida', 40)
	let energy = new Info('barra','Energia', 70)

	function comer( objeto ){
		energy.incrementar( 15 )
		Juego.eliminar( objeto )
	}

	repetirCada( repeticion => {
		if(energy.reducir( 1 ) == 0) {
			detenerRepeticion( repeticion )
			alert('Perdiste')
			reset()
		}
	} , 3 )
	Juego.insertar({
		id:'mango',
		x:20,
		y:40,
		ancho:12,
		alto:10,
		url:'./images/mango.webp'
	})
	console.log(juego.mango)
	mango.onclick = () => comer( mango )
    repetirCada(()=> life.incrementar(30) , 1)
// llama aqui la primer funcion 
 } 