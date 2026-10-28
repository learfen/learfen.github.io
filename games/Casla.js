usarImagen("piso", "/games/images/textura-suelo-4.jpg")
usarImagen("dragon", "/games/images/pokemon-charizard-atack.gif")
usarImagen("castillo", "/games/images/castillo-1.png")
usarImagen("explosion", "/games/images/explosion.gif");
usarImagen("perro", "/games/images/lobo-izquierda.gif");
usarImagen("persona", "/games/images/characters-svgrepo-com.png");
usarImagen("arbol", "/games/images/arbol.png");
usarImagen("fuego", "/games/images/fuego.gif");
usarImagen("arbusto", "/games/images/bosque4.png");
usarImagen("monstruo", "/games/images/enemigo1.png");
usarImagen("casa", "/games/images/cabaña2.png");

// importaciones basicas
function juego() {

    // escribe aqui tu codigo
    empezarEn(10, 3)
    cambiarPiso("piso", "20%")
    let paredDerecha = paredVertical(11, 12, 8).pared()
    paredDerecha.animar().usarVidas(10)

    paredHorizontal(5, 12, 6).pared().animar().usarVidas(10)

    escenaActiva().agregar(1, 11, "castillo").margenY(-200).escala(1.3).solido().expandir(4, 2)

    player()
        .decir("Puedes lanzar fuego con la tecla E", 2)
        .usarVidas(3)
        .lanzar({
            tecla: 'e',
            imagen: 'fuego',
            distancia: 3,
            impacto({ elemento }) {
                elemento.restarVida()
                if (elemento.tipo === "monstruo" && elemento.vidas() === 0) {
                    elemento.pintar("explosion")
                    esperarY(1, () => elemento.eliminar())
                }
            }
        })

    esperarY(3, () => decir("Debemos proteger el muro del dragon", 2))

    escenaActiva()
        .agregar(9, 11, "monstruo")
        .animar()
        .usarAnimacion("scale")
        .usarVidas(1)
        .seguir({colision({con}){
            if(con.tipo == "player") player().restarVida()
        }})

    escenaActiva()
        .agregar(19, 15, "monstruo")
        .animar()
        .usarAnimacion("scale")
        .usarVidas(1)
        .seguir({colision({con}){
            if(con.tipo == "player") player().restarVida()
        }})

    escenaActiva()
        .agregar(12, 11, "monstruo")
        .animar()
        .usarAnimacion("scale")
        .usarVidas(1)
        .seguir({colision({con}){
            if(con.tipo == "player") player().restarVida()
        }})

    escenaActiva()
        .agregar(19, 11, "monstruo")
        .animar()
        .usarAnimacion("scale")
        .usarVidas(1)
        .seguir({colision({con}){
            if(con.tipo == "player") player().restarVida()
        }})

    escenaActiva()
        .agregar(19, 15, "monstruo")
        .animar()
        .usarAnimacion("scale")
        .usarVidas(1)
        .seguir({colision({con}){
            if(con.tipo == "player") player().restarVida()
        }})

    escenaActiva()
        .agregar(19, 18, "monstruo")
        .animar()
        .usarAnimacion("scale")
        .usarVidas(1)
        .seguir({colision({con}){
            if(con.tipo == "player") player().restarVida()
        }})

    escenaActiva()
        .agregar(19, 19, "monstruo")
        .animar()
        .usarAnimacion("scale")
        .usarVidas(1)
        .seguir({colision({con}){
            if(con.tipo == "player") player().restarVida()
        }})

    escenaActiva()
        .agregar(19, 20, "monstruo")
        .animar()
        .usarAnimacion("scale")
        .usarVidas(1)
        .seguir({colision({con}){
            if(con.tipo == "player") player().restarVida()
        }})

    escenaActiva()
        .agregar(19, 17, "monstruo")
        .animar()
        .usarAnimacion("scale")
        .usarVidas(1)
        .seguir({colision({con}){
            if(con.tipo == "player") player().restarVida()
        }})

    escenaActiva() 
        .agregar(13, 9, "monstruo")
        .animar()
        .usarAnimacion("scale")
        .usarVidas(1)
        .seguir({colision({con}){
            if(con.tipo == "player") player().restarVida()
        }})


    escenaActiva()
        .agregar(10, 1, "casa").expandir(2, 2)

    escenaActiva()
        .agregar(4, 4, "arbol").escala(3).expandir(1, 1).margenY(-60)
    escenaActiva()
        .agregar(4, 7, "arbol").escala(3).expandir(1, 1).margenY(-60)
    escenaActiva()
        .agregar(4, 10, "arbol").escala(3).expandir(1, 1).margenY(-60)

    escuchar("colision:@monstruo", ({ con, quien }) => {
        if (quien.tipo == "monstruo") {
            if (con.tipo == "player" || con.tipo == "muro") {
                if (con.vidas() > 0) {
                    con.restarVida()
                }
                if (con.vidas() === 0) con.eliminar()
            }
        }
    })

    escenaActiva()
        .agregar(9, 10, "perro")


    let dragon = escenaActiva().agregar(14, 12, "dragon", {
        tipo: 'monstruo',
        pausado: true,
        repetir: false
    }).margenY(-70).margenX(-80).expandir(1, 1).escala(6).solido().orientar('izquierda').usarVidas(5)

    esperarY(6, () => {
        repetir(({ index }) => {
            if (index() < 10 && dragon.destruido === false) {
                dragon.animacion.play(2)
                paredDerecha.restarVida()
            }
        }).cada(3)
    })

    escuchar('destruido:dragon', () => {
        decir('Ganaste')
    })
    escuchar('destruido:@muro', () => {
        decir('Perdiste')
        esperarY(4, () => escenaActiva().reset())
    })
    escuchar('destruido:player', () => {
        decir('Perdiste')
        esperarY(4, () => escenaActiva().reset())
    })
}


