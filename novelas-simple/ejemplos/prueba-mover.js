iniciarJuego = () => { 

	Movimiento.crear('cruzarPantalla', {x:80 , y:20})
		
	Juego.insertar({
		id:'mango',
		x:10,
		y:50,
		ancho:10,
		url:'./images/mango.webp'
	})
	
	esperar(() => {
		juego.mango.moverA({x:90 , y:90})
		/** usar movimientos almacenados */
		esperar(()=> juego.mango.usarMovimiento('cruzarPantalla') , 2)
	} , 2)

 } 