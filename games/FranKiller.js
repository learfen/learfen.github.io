usarImagen("hospital","/games/images/hospital.png")
usarImagen("arbusto","/games/images/bosque1.png")
usarImagen("matafuego-humo","/games/images/matafuego-humo-1.gif")
usarImagen("matafuego","/games/images/matafuego-1.png")
usarImagen("fuego2","/games/images/fuego-2.gif")
usarImagen("cabaña","/games/images/caba%C3%B1a2.png")
usarImagen("ciudad","/games/images/ciudad-1.jpg")

function juego(){

	cambiarPiso("ciudad")

	escenaActiva().agregar(11,3,"hospital").expandir(8,2)

	escenaActiva().agregar(10,4,"matafuego").margenY(-50).escala(.8).solido().interactuar(({ elemento }) => {
		decir("Presiona E cerca del fuego",2)
        player().inventario.guardar(elemento)
	})
	escenaActiva().agregar(7,19,"matafuego").margenY(-50).escala(.8).solido().interactuar(({ elemento }) => {
		decir("Presiona E cerca del fuego",2)
        player().inventario.guardar(elemento)
	})
	escenaActiva().agregar(10,18,"matafuego").margenY(-50).escala(.8).solido().interactuar(({ elemento }) => {
		decir("Presiona E cerca del fuego",2)
        player().inventario.guardar(elemento)
	})

    
	escenaActiva().agregar(1,8,"matafuego").margenY(-50).escala(.8).solido().interactuar(({ elemento }) => {
		decir("Presiona E cerca del fuego",2)
        player().inventario.guardar(elemento)
	})
	escenaActiva().agregar(3,5,"matafuego").margenY(-50).escala(.8).solido().interactuar(({ elemento }) => {
		decir("Presiona E cerca del fuego",2)
        player().inventario.guardar(elemento)
	})
	escenaActiva().agregar(7,14,"matafuego").margenY(-50).escala(.8).solido().interactuar(({ elemento }) => {
		decir("Presiona E cerca del fuego",2)
        player().inventario.guardar(elemento)
	})

	repetir(({ index }) => {
	    escenaActiva().agregar(10+index(),10, "arbusto").margenY(-40).solido().escala(1.1)
	}).veces(10).cada(0)
	escenaActiva().agregar(1,11,"cabaña").expandir(3,1).margenY(-30).escala(.8).solido()
	escenaActiva().agregar(1,1,"cabaña").expandir(3,1).margenY(-30).escala(.8).solido()
	escenaActiva().agregar(15,10,"cabaña").margenY(-30).escala(.8).expandir(3,1).solido()
	escenaActiva().agregar(15,11,"fuego2").margenY(-110).margenX(10).escala(.8).solido()
	escenaActiva().agregar(15,11,"fuego2").margenY(-130).margenX(30).escala(.8).solido()
	escenaActiva().agregar(15,11,"fuego2").margenY(-120).margenX(65).escala(.8).solido()

	repetir(({ index }) => {
	    escenaActiva().agregar(10+index(),12, "arbusto").margenY(-30).solido().escala(1.1)
	}).veces(10).cada(0)
	escenaActiva().agregar(15,12,"cabaña").margenY(-30).escala(.8).expandir(3,1).solido()
	escenaActiva().agregar(15,13,"fuego2").margenY(-110).margenX(10).escala(.8).solido()
	escenaActiva().agregar(15,13,"fuego2").margenY(-130).margenX(30).escala(.8).solido()
	escenaActiva().agregar(15,13,"fuego2").margenY(-120).margenX(65).escala(.8).solido()


	repetir(({ index }) => {
	    escenaActiva().agregar(10+index(),14, "arbusto").solido().escala(1.1)
	}).veces(10).cada(0)
	// ¿Donde empieza el jugador?
	empezarEn(0, 0);
	player().decir("Apaga el fuego",2)
	/*
	semilla("ccaghhe")
	generarMapaProcedural({
		enemigos:false
	})
	*/
    let cant = 6
	escuchar("e", () => {
		if(player().inventario.contar("@matafuego") > 0){
			player().inventario.eliminar("@matafuego")

			let matafuego = escenaActiva().agregarDelante("matafuego",{
				pausado:false,
				repetir:true
			}).margenY(-50).escala(.6).rotarX(-120).rotarY(180)

			esperarY(.5, () => {
				
				let humo = escenaActiva().agregarDelante("matafuego-humo",{
					pausado:false,
					repetir:true
				}).margenY(-25).margenX(5).escala(.8).rotarY(180).rotarZ(30)

				esperarY(3,() => {
					matafuego.eliminar()
					humo.eliminar()
					player().mirandoUnObjeto('@fuego2')?.eliminar()
                    cant = cant - 1
                    if(cant === 0){
                        decir("Ganaste")
                        esperarY(3, () => {
                            escenaActiva().reset()
                        })
                    }

				})
			})
			
			
		}
	})
	
	escuchar("colision:@agua", () => {
		ayuda("Presiona A par")
	})

	// fin juego
}