// revisar: laberinto

usarImagen("hamburger","/games/images/comida-hamburguesa.png");
usarImagen("corazon","/games/images/corazon.svg");


usarImagen("coin","/games/images/coin-gold-svgrepo-com.png");
usarImagen("heart","/games/images/corazon.svg");
usarImagen("pared","/games/images/muro.png");
usarImagen("explosion","/games/images/explosion.gif");
usarImagen("vendedor","/games/images/characters-svgrepo-com.png");

	usarImagen("piso2", "/games/images/piso1b.png")
usarImagen("casa", "/games/images/casa.png" , {
	ancho:4
});
usarImagen("molino", "/games/images/molino.png",{
	escala:4,
	margenY: -60,
	margenX: -30
});
usarImagen("muro", "/games/images/muro.png");
usarImagen("enemigo", "/games/images/enemigo1.png");
usarImagen("puerta", "/games/images/door-svgrepo-com.svg");
usarImagen("trampas", "/games/images/trampa-1.gif", {
    escala: .8
});
usarImagen("meta", "/games/images/coin-gold-svgrepo-com.png", {
    escala: .8
});
usarImagen("piedra", "/games/images/piedra.png");
usarImagen("explosion", "/games/images/explosion.gif");

function juego() {
    empezarEn(2, 2)
    player().usarVidas(3)
    cambiarPiso("piso2","20%")
    let tienePiedra = false
    let bloquearDanio = false
    
    mostrar(() => "Vidas: " + player().vidas(), 1)
    mostrar(() => (tienePiedra ? "Lanza piedras (G)" : ""), 2)

    // paredes del laberinto
    paredHorizontal(4, 2, 6)
    paredHorizontal(4, 5, 2)
    paredHorizontal(8, 5, 5)
    paredHorizontal(4, 8, 3)
    paredHorizontal(9, 8, 4)
    paredHorizontal(2, 11, 5)
    paredHorizontal(9, 11, 4)
    paredHorizontal(4, 14, 9)
    paredHorizontal(0, 14, 2)

    paredVertical(4, 0, 6)
    paredVertical(8, 7, 3)
    paredVertical(12, 6, 5)
    paredVertical(6, 9, 3)
    paredVertical(10, 9, 3)
    paredVertical(2, 12, 3)
    paredVertical(8, 12, 3)
    

    paredHorizontal(2,5,3)
    paredHorizontal(3,4,5)
    paredHorizontal(0,17,20)
    paredVertical(0, 15, 20)

    escenaActiva().agregar(1, 15, "hamburger").margenX(5).interactuar(() => {
        player().sumarVida()
    })

    // celdas de trampas
    let entrada = escenaActiva().agregar(7, 4, "trampas", "entrada").margenX(5).margenY(10).aleatorio()
    let salida = escenaActiva().agregar(13, 13, "trampas", "salida").margenX(5).margenY(10).aleatorio()
    let entrada2 = escenaActiva().agregar(14, 4, "trampas", "entrada2").margenX(5).margenY(10).aleatorio()
    let salida2 = escenaActiva().agregar(3, 13, "trampas", "salida2").margenX(5).margenY(10).aleatorio()

    // enemigo que patrulla
    
    escenaActiva().agregar(1, 11, "piedra").margenX(10).escala(.5).solido().interactuar(({elemento}) => {
        player().inventario.guardar(elemento)
    })
    escenaActiva().agregar(7, 9, "piedra").margenX(10).escala(.5).solido().interactuar(({elemento}) => {
        player().inventario.guardar(elemento)
    })
    escenaActiva().agregar(11, 7, "piedra").margenX(10).escala(.5).solido().interactuar(({elemento}) => {
        player().inventario.guardar(elemento)
    })
    escenaActiva().agregar(11, 12, "piedra").margenX(10).escala(.5).solido().interactuar(({elemento}) => {
        player().inventario.guardar(elemento)
    })
    escenaActiva().agregar(11, 7, "enemigo").solido().animar().aleatorio().visionCircular("@player",({elemento}) => elemento.seguir(), 2)

    // enemigo en otra zona
    escenaActiva().agregar(13, 8, "enemigo").solido().animar().aleatorio().visionCircular("@player",({elemento}) => elemento.seguir({colision(){player().perderVida()}}), 2)
    escenaActiva().agregar(14, 3, "enemigo").solido().animar().aleatorio().visionCircular("@player",({elemento}) => elemento.seguir({colision(){player().perderVida()}}), 2)
    escenaActiva().agregar(13, 13, "enemigo").solido().animar().aleatorio().visionCircular("@player",({elemento}) => elemento.seguir({colision(){player().perderVida()}}), 2)

    // meta (salida)
    let meta = escenaActiva().agregar(8, 3, "meta", "meta").solido().interactuar(() => decir("GANASTE!!"))

    // lanzar piedra
    player().lanzar({
        tecla:"g",
        imagen:"piedra",
        distancia:3,
        condicion(){
            if(player().inventario.contar("@piedra") < 1) {
                ayuda("No tienes piedras, buscalas en el suelo")
                return false
            }
            return true
        },
        proyectil(elemento){
            elemento.escala(.5)
        },
        impacto({ elemento }){            
            if(elemento.tipo === "enemigo"){
                elemento.pintar("explosion")
                esperarY(1, () => elemento.eliminar())
                player().inventario.eliminar('@piedra')
            }
        }
    })

    // A para interactuar con objetos
    escuchar("a", () => {
        if(typeof player().tocando === "function" && player().tocando()?.interaccion) {
            player().tocando().interaccion()
        }
    })


    // colision con enemigos: pierde vida
    escuchar("colision:@trampas", ({con}) => {
        if(con.tipo == "player") player().perderVida()
    })

    //ayuda(() => "Usa G para lanzar piedra, A para interactuar", 3)


escuchar("destruido:player", () => {
    escenaActiva().reset()
})
}