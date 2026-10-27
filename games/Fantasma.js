usarImagen("sal","/games/images/harina.png")
usarImagen("varita","/games/images/magic-svgrepo-com.png")
usarImagen("cementerio","/games/images/cementerio-1.png")
usarImagen("suelo","/games/images/textura-suelo-2.jpg")
usarImagen("pocion","/games/images/botella-3.png")
usarImagen("fuego", "/games/images/fuego-azul.gif")
usarImagen("enemigo3", "/games/images/pokemon-charizard-atack.gif")
usarImagen("fantasma", "/games/images/espectro.gif")
usarImagen("vida", "/games/images/corazon.svg")



usarImagen("muro", "/games/images/muro.png");
usarImagen("enemigo", "/games/images/enemigo1.png");
usarImagen("puerta", "/games/images/door-svgrepo-com.svg");
usarImagen("teletransporte", "/games/images/magic-svgrepo-com.png", {
    escala: .8
});
usarImagen("meta", "/games/images/coin-gold-svgrepo-com.png", {
    escala: .8
});
usarImagen("piedra", "/games/images/piedra.png");
usarImagen("explosion", "/games/images/explosion.gif");


function juego(){
	escenaActiva().agregar(10,6,"sal","sal").margenY(10).margenX(15).escala(.6).interactuar(({elemento}) => player().inventario.guardar(elemento)) 
	escenaActiva().agregar(10,6,"cementerio").noSolido().capa(-2).margenY(-170).margenX(50).escala(1.5).expandir(4,1)


    cambiarPiso("suelo")
    escenaActiva().agregar(14, 12, "vida").margenY(-50).margenX(5).escala(.8).solido().interactuar(({ elemento }) => {
        player().sumarVida()
        elemento.eliminar()
    })

    escenaActiva().agregar(3, 14, "vida").margenY(-50).escala(.8).solido().interactuar(({ elemento }) => {
        player().sumarVida()
        elemento.eliminar()
    })

    empezarEn(2, 6)

    player().usarVidas(3).margenY(-40).margenX(5).escala(.6)

    let fantasma = escenaActiva().agregar(1, 8, "fantasma").margenY(-50).solido().escala(.8).solido().animar()
    fantasma.interactuar(() => {
        if(player().inventario.contar('@sal') == 1) {
            fantasma.eliminar()
            decir("Exorcisamos al fantasma. Ganaste")
        }
    })
    fantasma.visionRecta('@player', () => {
        if(fantasma?.maldicion === true) return fantasma.decir("Jajajaja",2);
        fantasma.maldicion = true
        fantasma.decir("Te maldigo a que nunca puedas parar de moverte",3)
        esperarY(3, () => player().decir("Debo buscar una pocion para anular la maldición",3))
        esperarY(4, () => {

                let maldicion = repetir(() => {
                    let x = player().x
                    let y = player().y
                    esperarY(1, () => {
                        let fuego = escenaActiva().agregar(x, y, "fuego").margenY(-20).noSolido()
                        if (player().x === x && player().y === y) {
                            player().perderVida()
                            if (player().vidas() === 0) {
                                teletransportar(player(), 2, 4)
                                player().usarVidas(3)
                            }
                        }
                        esperarY(2, () => fuego.eliminar())
                    })
                }).cada(4)


                escenaActiva().agregar(6, 14, "pocion").margenY(-50).escala(.8).solido().interactuar(({ elemento }) => {
                    maldicion.detener()
                    elemento.eliminar()
                    decir("Tal vez la sal pueda exorcisar al fantasma.")
                })
        })
    }, 4)

    // paredes del laberinto
    paredHorizontal(2, 11, 5)
    paredHorizontal(2, 8, 5)
    paredVertical(6, 4, 5)
    paredHorizontal(2, 16, 15)
    paredHorizontal(7, 3, 10)
    paredVertical(16, 4, 12)
    paredVertical(1, 11, 6)

    // enemigo que patrulla 
    let slime1 = escenaActiva().agregar(11, 7, "enemigo").solido().animar().aleatorio().usarVidas(3).visionCircular('player',() => {
        slime1.seguir({colision(){
            player().perderVida()
            if (player().vidas() === 0) {
                teletransportar(player(), 2, 4)
                player().usarVidas(3)
            }
        }})
    },3)

    // enemigo en otra zona
    let slime2 = escenaActiva().agregar(6, 13, "enemigo").solido().animar().aleatorio().usarVidas(3).visionCircular('player',() => {
        slime2.seguir({colision(){
            player().perderVida()
            if (player().vidas() === 0) {
                teletransportar(player(), 2, 4)
                player().usarVidas(3)
            }
        }})
    },3)

    // enemigo en otra zona
    let slime3 = escenaActiva().agregar(14, 13, "enemigo").solido().animar().aleatorio().usarVidas(3).visionCircular('player',() => {
        slime3.seguir({colision(){
            player().perderVida()
            if (player().vidas() === 0) {
                teletransportar(player(), 2, 4)
                player().usarVidas(3)
            }
        }})
    },3)

    // enemigo en otra zona
    let slime4 = escenaActiva().agregar(16, 7, "enemigo").solido().animar().aleatorio().usarVidas(3).visionCircular('player',() => {
        slime4.seguir({colision(){
            player().perderVida()
            if (player().vidas() === 0) {
                teletransportar(player(), 2, 4)
                player().usarVidas(3)
            }
        }})
    },3)

    // colision con enemigos: pierde vida
    escuchar("colision:@fuego", ({ con }) => {
        con.perderVida()
    })
    escuchar("colision:@enemigo", ({ con, quien }) => {
        if (con.tipo == 'player') {
            player().perderVida()
            if (player().vidas() === 0) {
                teletransportar(player(), 2, 4)
                player().usarVidas(3)
            }
        }
        if (con.tipo == 'fuego') {
            quien.perderVida()
        }
    })

}

























