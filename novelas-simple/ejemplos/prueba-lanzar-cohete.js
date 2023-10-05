iniciarJuego = () => { 

	Movimiento.crear('cruzarPantalla', {x:80 , y:20})
		
	Juego.insertar({
		id:'mango',
		x:50,
		y:70,
		ancho:10,
		url:'./images/cohete-apagado.png'
	}).mostrar()
	
	esperar(() => {
		juego.mango.moverA({x:55 , y:70})
	} , .25)
	esperar(() => {
        juego.mango.imagen('./images/cohete-encendido.png')
		juego.mango.moverA({x:50 , y:67})
	} , .5)
	esperar(() => {
		juego.mango.moverA({x:54 , y:60})
	} , .75)
	esperar(() => {
		juego.mango.moverA({x:51 , y:50})
	} , 1)
	esperar(() => {
		juego.mango.moverA({x:54 , y:40})
	} , 1.1)
	esperar(() => {
		juego.mango.moverA({x:52 , y:10})
	} , 1.2)

 } 