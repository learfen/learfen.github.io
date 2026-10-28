usarImagen("llave","/games/images/llave-4.png")
usarImagen("ciudad","/games/images/cementerio-2.png")
usarImagen("guerrero","/games/images/arquero-1.gif")
usarImagen("arbol","/games/images/arbol.png")
usarImagen("pastooo","/games/images/bosque2.png")
usarImagen("agua","/games/images/agua.gif")
function juego(){
	
	cambiarPiso("pastooo")


	escenaActiva().agregar(7,12,"ciudad").margenY(-50).escala(.8).solido().expandir(2,1)

	semilla("kkasad")
	generarMapaProcedural({enemigos:false})
	decir("perdi mi llave")

	escenaActiva().agregar(11,11,"arbol").margenX(5).escala(1.3).solido()

	escenaActiva().agregar(12,10,"arbol").margenX(5).escala(1.3).solido()



	escenaActiva().agregar(13,13,"agua").margenY(-150).margenX(-5).solido().expandir(3,3)

	let cant = aleatorio(3,4)
	escuchar("inventario:guardar:@piedra", () => {
		decir("evento guardar:"+player().inventario.contar('@piedra'),1)
		if(player().inventario.contar('@piedra') == cant){
			escenaActiva().agregar(17,2,"llave","llave1").margenY(-50).escala(.8).solido().interactuar(({ elemento }) => {
				player().inventario.guardar(elemento)
			})
		}
	})

	escuchar("mover:player", () => {
		if(player().x ==1 && player().y == 15) {
			decir("Ganaste")
			esperarY(3,() => escenaActiva().reset())
		}
	})

	empezarEn(0, 0);
	player().escala(.8).margenY(-50).margenX(5)
	habitacionOculta(0,12,3,3,"llave1")


	// fin juego
	}