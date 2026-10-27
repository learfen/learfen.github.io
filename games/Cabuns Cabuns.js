usarImagen("cuchillas","/games/images/trampa-1.gif")
usarImagen("molino","/games/images/molino.gif")
usarImagen("monedas","/games/images/monedas10.png")
usarImagen("cofre","/games/images/baul.gif")
usarImagen("magia","/games/images/magia-2.gif")
usarImagen("mago","/games/images/mago-izquierda.gif")
usarImagen("espada","/games/images/espada.png")
usarImagen("arbusto","/games/images/bush.svg")
usarImagen("caballero-izquierda","/games/images/caballero-izquierda.gif")
usarImagen("caballero-arriba","/games/images/caballero-izquierda.gif")
usarImagen("PISO", "/games/images/puzzle-piedra.png")
usarImagen("agua", "/games/images/agua.gif")
usarImagen("señora", "/games/images/mujer1.svg");
usarImagen("cangrejo", "/games/images/cangrejo.gif");
usarImagen("señora", "/games/images/mujer1.svg");
usarImagen("flor", "/games/images/flower-svgrepo-com.png");
usarImagen("hoyo", "/games/images/hoyo.png");
usarImagen("arbol", "/games/images/explosion.svg");
usarImagen("piso2", "/games/images/piso1b.png")

/**
 * el juego se trata de que un ladron roba a un castillo donde esta la reina y el rey .ay un passillo donde el ladron corre  para robar la cashh
 * 
 */

function juego(){
    cambiarPiso("piso2", "20%")
	escenaActiva().agregar(3,15,"cofre",{pausado:true}).margenY(-50).escala(.8).solido().interactuar(() => decir("Vacio",1))

	escenaActiva().agregar(6,15,"cuchillas").margenY(-50).escala(.8).solido().aleatorio()

	escenaActiva().agregar(6,15,"cuchillas").margenY(-50).escala(.8).solido().aleatorio()

	escenaActiva().agregar(6,15,"cuchillas").margenY(-50).escala(.8).solido().aleatorio()

	escenaActiva().agregar(6,15,"cuchillas").margenY(-50).escala(.8).solido().aleatorio()

	escenaActiva().agregar(6,15,"cuchillas").margenY(-50).escala(.8).solido().aleatorio()

    escuchar('colision:@cuchillas', ({con}) => {
        if(con.tipo == "player") player().restarVida( 1 )
    })

	escenaActiva().agregar(15,14,"molino").margenY(-50).escala(.8).solido()

	escenaActiva().agregar(0,10,"cofre",{pausado:true}).margenY(-50).escala(.8).solido().interactuar(({ elemento }) => {
        if(player().inventario.contar('@flor') < 3) return decir("Necesitas 3 flores en la mochila/inventario",2)
        elemento.animacion.play(.6)
        esperarY(1,() => {
            escenaActiva().agregar(0,10,"monedas").margenY(130).margenX(10).escala(.8).solido() 
            elemento.eliminar()
            decir("Ganaste!")
        })
    })

	escenaActiva().agregar(15,5,"cofre",{pausado:true}).margenY(-50).escala(.8).solido().interactuar(() => decir("Vacio",1))

	escenaActiva().agregar(18,15,"arbusto").margenY(-20).solido()

	escenaActiva().agregar(18,14,"arbusto").margenY(-20).solido()

	escenaActiva().agregar(14,11,"arbusto").margenY(-20).solido()
	escenaActiva().agregar(16,10,"arbusto").margenY(-20).solido()
	escenaActiva().agregar(17,10,"arbusto").margenY(-20).solido().interactuar(({ elemento }) => {        
        escenaActiva().agregar(17,10,"flor").margenY(-50).escala(.8).solido().interactuar(({ elemento }) => player().inventario.guardar(elemento)) 
        elemento.eliminar()
    })
	escenaActiva().agregar(12,4,"caballero-izquierda").escala(.8).solido().lanzar({
        imagen:"espada",
        distancia:10,
        tipo:"dinamico",
        cada:1,
        vision:'y',
        impacto({con}){
            con.perderVida()
        }
    }).hacia("@player")



	escenaActiva().agregar(9,4,"caballero-izquierda").escala(.8).solido().lanzar({
        imagen:"espada",
        distancia:10,
        tipo:"dinamico",
        cada:1,
        vision:'y',
        impacto({con}){
            con.perderVida()
        }
    }).hacia("@player")

	escenaActiva().agregar(6,4,"caballero-izquierda").escala(.8).solido().lanzar({
        imagen:"espada",
        distancia:10,
        tipo:"dinamico",
        cada:1,
        vision:'y',
        impacto({con}){
            con.perderVida()
        }
    }).hacia("@player")


	escenaActiva().agregar(4,10,"mago").margenY(-20).escala(.8).solido().lanzar({
        imagen:"magia",
        distancia:10,
        tipo:"dinamico",
        cada:5,
        vision:'*',
        impacto({con}){
            con.perderVida()
        }
    }).hacia("@player")

    escenaActiva().agregar(8, 6, "PISO").piso()

    escenaActiva().agregar(9, 6, "PISO").piso()

    escenaActiva().agregar(10, 6, "PISO").piso()
    escenaActiva().agregar(11, 6, "PISO").piso()

    escenaActiva().agregar(12, 6, "agua").margenY(30).piso()


    escenaActiva().agregar(5, 6, "agua").expandir(2,2).escala(.8).solido()


    empezarEn(2, 1)
    player().usarVidas(3)
    // resetear
    escuchar("destruido:player", () => {
        escenaActiva().reset()
    })

    // mas directo
    //                   ¿donde?   ¿que?
    escenaActiva().agregar(6, 2, "flor").escala(.8).interactuar(({ elemento }) => player().inventario.guardar(elemento)) 
    escenaActiva().agregar(19, 8, "flor").escala(.8).interactuar(({ elemento }) => player().inventario.guardar(elemento)) 
    escenaActiva().agregar(2, 12, "flor").escala(.8).interactuar(({ elemento }) => player().inventario.guardar(elemento)) 
    paredVertical(1, 4, 18).puerta(15)
    paredHorizontal(0, 3, 20).puerta(2)
    paredHorizontal(0, 9, 20).puerta(7)
    paredHorizontal(2, 13, 18).puerta(4)

    
}