usarImagen("llave", "/games/images/llave-1.png")
usarImagen("magia-1", "/games/images/fuego-morado-2.gif")
usarImagen("PIEDRA", "/games/images/textura-suelo-piedra.avif");
usarImagen("CAZA", "/games/images/cabaña2.png");
usarImagen("vida", "/games/images/corazon.svg");
usarImagen("tesoro", "/games/images/tesoro.gif");
usarImagen("explosion", "/games/images/explosion.gif");
usarImagen("supersayan", "/games/images/fuego.gif");
usarImagen("elbicho", "/games/images/zombie.gif");

// importaciones basicas
function juego() {
    // escribe aqui tu codigo 
    cambiarPiso("PIEDRA","20%")
    empezarEn(10, 19);
    player().usarVidas(3)
    player().escala(.7).margenX(5).margenY(-30)
    paredVertical(3, 5, 18)

    paredVertical(11, 5, 7)
    paredVertical(16, 18, 2)
    paredVertical(16, 15, 2)

    paredHorizontal(3, 4, 15)
    paredHorizontal(9, 14, 12)
    paredHorizontal(3, 14, 5)


    player().lanzar({
        tecla: "e",
        imagen: "magia-1",
        distancia: 10,
        impacto({ con }) {
            if (con.tipo === "elbicho") con.perderVida()
        }
    })

    
    escenaActiva().agregar(6, 8, "elbicho").usarVidas(2).margenX(5).animar().aleatorio().visionCircular("@player",({ elemento }) => {
            elemento.seguir({
            colision(){ 
                player().restarVida()
            }
        })
    }, 2)
    escenaActiva().agregar(6, 9, "elbicho").usarVidas(2).margenX(5).animar().aleatorio().visionCircular("@player",({ elemento }) => {
            elemento.seguir({
            colision(){
                player().restarVida()
            }
        })
    }, 2)
    escenaActiva().agregar(6, 10, "elbicho").usarVidas(2).margenX(5).animar().aleatorio().visionCircular("@player",({ elemento }) => {
            elemento.seguir({
            colision(){
                player().restarVida()
            }
        })
    }, 2)
    escenaActiva().agregar(6, 11, "elbicho").usarVidas(2).margenX(5).animar().aleatorio().visionCircular("@player",({ elemento }) => {
            elemento.seguir({
            colision(){
                player().restarVida()
            }
        })
    }, 2)
    escenaActiva().agregar(6, 12, "elbicho").usarVidas(2).margenX(5).animar().aleatorio().visionCircular("@player",({ elemento }) => {
            elemento.seguir({
            colision(){
                player().restarVida()
            }
        })
    }, 2)

    repetir(({ index }) => {
        escenaActiva().agregar(18, 4+index(), "elbicho").usarVidas(2).margenX(5).animar().aleatorio().visionCircular("@player",({ elemento }) => {
                elemento.seguir({
                colision(){
                    player().restarVida()
                }
            })
        }, 2)
    }).veces(7)

    
    repetir(({ index }) => {
        escenaActiva().agregar(1, 1+index(), "elbicho").usarVidas(2).margenX(5).animar().aleatorio().visionCircular("@player",({ elemento }) => {
                elemento.seguir({
                colision(){
                    player().restarVida()
                }
            })
        }, 2)
    }).veces(7)

    escenaActiva().agregar(18, 17, "tesoro",{pausado:true, repetir:false}).margenX(5).margenY(-70).escala(3).interactuar(({ elemento }) => {
        if(player().inventario.buscar('@llave')){
            elemento.animacion.play()
            decir("Ganaste!")
        } else {
            decir("No tengo la llave!",2)
        }
    })

    escenaActiva().agregar(1, 18, "llave", "llave1").solido().escala(.7).margenY(-60).margenX(5).interactuar(({ elemento }) => player().inventario.guardar(elemento))

    escuchar("destruido:player", () =>{
        escenaActiva().reset()
    })













}