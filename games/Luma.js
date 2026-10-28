usarImagen("piso","/games/images/textura-suelo-hierba-8.jpg")
usarImagen("casa", "/games/images/caba%C3%B1a2.png")
usarImagen("arbol", "/games/images/arbol.png")

usarImagen("arbusto", "/games/images/bush.svg")
usarImagen("molino", "/games/images/trampa-1.gif")
usarImagen("llave", "/games/images/llave-1.png")
usarImagen("lobo", "/games/images/lobo-derecha.gif");
usarImagen("explotar", "/games/images/explosion.gif");
usarImagen("fuego", "/games/images/fuego.gif");

usarImagen("enemigo", "/games/images/enemigo1.png")
usarImagen("fuego", "/games/images/fuego.gif", {
    margenX: -3,
    margenY: -40
})
usarImagen("agua", "/games/images/agua.gif", {
    margenX: 5,
    margenY: 30,
    escala: .9
})
usarImagen("explosion", "/games/images/explosion.gif")

usarImagen("puerta", "/games/images/door-svgrepo-com.svg");



function juego() {
    cambiarPiso("piso")

    escenaActiva().agregar(7, 8, "puerta").margenY(-50).escala(.8).solido()
    paredHorizontal(0,3,6)
    escenaActiva().agregar(6, 3, "puerta").margenY(-30).margenX(5).solido().interactuar(({ elemento }) => {
        //cambiarEscena("suelo")
        if (player().inventario.contar('llave1'))
            decir("Ganaste!")
        else
            decir("Necesitas una llave")
            
    })
    paredHorizontal(7,3,2)

    escenaActiva().agregar(9, 3, "puerta").margenY(-30).margenX(5).solido()

    paredHorizontal(10,3,10)

    escenaActiva().agregar(1, 7, "arbol").escala(1.8).margenX(5).margenY(-80).solido()

    escenaActiva().agregar(16, 8, "casa").margenY(-180).solido().expandir(4,2)

    escenaActiva().agregar(7, 10, "arbusto").margenY(-50).escala(.8).solido().expandir(2, 1)

    escenaActiva().agregar(5, 9, "molino").margenY(-50).escala(.8).solido().expandir(2, 1).aleatorio()
    escenaActiva().agregar(15, 19, "molino").margenY(-50).escala(.8).solido().expandir(2, 1).aleatorio()
    escenaActiva().agregar(5, 19, "molino").margenY(-50).escala(.8).solido().expandir(2, 1).aleatorio()
    escenaActiva().agregar(15, 9, "molino").margenY(-50).escala(.8).solido().expandir(2, 1).aleatorio()


    empezarEn(13, 7)
    player()
        .escala(.8)
        .margenY(-50)
        .margenX(5)
        .decir("puedes lanzar fuego con la E",3)
        .usarVidas(2)
        .lanzar({
            imagen: "fuego",
            tecla: "e",
            proyectil(elemento){
                elemento.margenX(5)
            },
            impacto({ con }) {
                if (con.tipo != "enemigo") return;
                con.restarVida()
                if (con.vidas() === 0) con.pintar("explotar")
                esperarY(1, () => con.eliminar())
            }

        })
        
    escenaActiva()
        .agregar(9, 11, "enemigo")
        .animar()
        .aleatorio()
        .usarVidas(1)
        .escala(1.4)
        .margenX(5)
        .visionRecta('@player', ({elemento}) => {
            elemento.decir("Comida!",.8)
            elemento.seguir({colision:player().perderVida})
        },3)
        .usarAnimacion("scale")

    escenaActiva()
        .agregar(12, 15, "enemigo")
        .animar()
        .aleatorio()
        .usarVidas(1)
        .escala(1.4)
        .margenX(5)
        .visionRecta('@player', ({elemento}) => {
            elemento.decir("Comida!",.8)
            elemento.seguir({colision:player().perderVida})
        },3)
        .usarAnimacion("scale")

    escenaActiva()
        .agregar(7, 11, "enemigo", "rencoroso")
        .animar()
        .aleatorio()
        .usarVidas(1)
        .escala(1.4)
        .margenX(5)
        .visionRecta('@player', ({elemento}) => {
            elemento.decir("Comida!",.8)
            elemento.seguir({colision:player().perderVida})
        },3)
        .usarAnimacion("scale")

    escenaActiva()
        .agregar(0, 4, "enemigo", "rencoroso2")
        .animar()
        .aleatorio()
        .usarVidas(1)
        .escala(1.4)
        .margenX(5)
        .visionRecta('@player', ({elemento}) => {
            elemento.decir("Comida!",.8)
            elemento.seguir({colision:player().perderVida})
        },3)
        .usarAnimacion("scale")

    escenaActiva()
        .agregar(7, 11, "enemigo")
        .animar()
        .aleatorio()
        .usarVidas(1)
        .escala(1.4)
        .margenX(5)
        .visionRecta('@player', ({elemento}) => {
            elemento.decir("Comida!",.8)
            elemento.seguir({colision:player().perderVida})
        },3)
        .usarAnimacion("scale")

    escenaActiva()
        .agregar(7, 11, "enemigo")
        .animar()
        .aleatorio()
        .usarVidas(1)
        .escala(1.4)
        .margenX(5)
        .visionRecta('@player', ({elemento}) => {
            elemento.decir("Comida!",.8)
            elemento.seguir({colision:player().perderVida})
        },3)
        .usarAnimacion("scale")

    escenaActiva()
        .agregar(7, 11, "enemigo")
        .animar()
        .aleatorio()
        .usarVidas(1)
        .escala(1.4)
        .margenX(5)
        .visionRecta('@player', ({elemento}) => {
            elemento.decir("Comida!",.8)
            elemento.seguir({colision:player().perderVida})
        },3)
        .usarAnimacion("scale")


    escenaActiva().agregar(9, 9, "agua").plano().escala(1.1).expandir(2,2).margenY(8).margenX(-8)
    escenaActiva().colisionarPorTipo("agua", () => {
        decir("Esta fria",1)
    })

    habitacionOculta(0, 15, 2, 2, "llave2")

    escuchar("destruido:player", ({ elemento }) => {
        escenaActiva().reset()
    })

    escuchar("destruido:rencoroso", ({elemento}) => {
        decir("bum",1)
        escenaActiva().agregar(elemento.x, elemento.y, "llave","llave1").solido()
            .interactuar(({ elemento }) => player().inventario.guardar(elemento))
    })

    escuchar("destruido:rencoroso2", ({elemento}) => {
        decir("bum",1)
        escenaActiva().agregar(elemento.x, elemento.y, "llave","llave2").solido()
            .interactuar(({ elemento }) => player().inventario.guardar(elemento))
    })
}