usarImagen("pozo","/games/images/hoyo-arena.webp")
usarImagen("aliaspiso", "/games/images/textura-suelo-3.jpg")
usarImagen("fondo", "/games/images/fondo-editor-intro.jpg")
usarImagen("aliasmago", "/games/images/mago-derecha.gif");
usarImagen("aliaspared", "/games/images/muro.png");
usarImagen("aliasllave", "/games/images/key-svgrepo-com.svg");
usarImagen("aliashabitacion", "/games/images/casa-fondo.jpeg");
usarImagen("explocion", "/games/images/explosion.gif");
usarImagen("aliaspared", "/games/images/muro.png");
usarImagen("moneda", "/games/images/coin.svg");
usarImagen("aliasexplosion", "/games/images/explosion.gif");
usarImagen("aliasanjel", "/games/images/estatua-3.png");
usarImagen("casa", "/games/images/cabaña2.png");
usarImagen("aliascasa", "/games/images/cabaña2.png");
usarImagen("casa", "/games/images/cabaña2.png");
usarImagen("aliasexplosion", "/games/images/explosion.gif");
usarImagen("aliasred", "/games/images/red.png");
usarImagen("aliaspozo", "/games/images/hoyo.png");
// importaciones basicas

function juego() {
    cambiarPiso("aliaspiso", "30%")
    // escribe aqui tu codigo
    empezarEn(1, 18);
    player().margenY(-60).margenX(5).escala(.8).solido()
    let vida = 2
    mostrar(() => "vidas:" + vida)
    let explosion1 = escenaActiva().agregar(15, 9, "aliasexplosion").solido().ocultar()
    let explosion2 = escenaActiva().agregar(10, 12, "aliasexplosion").solido().ocultar()
    let explosion3 = escenaActiva().agregar(11, 8, "aliasexplosion").solido().ocultar()
    let explosion4 = escenaActiva().agregar(3, 10, "aliasexplosion").solido().ocultar()
    let explosion5 = escenaActiva().agregar(18, 2, "aliasexplosion").solido().ocultar()
    let explosion6 = escenaActiva().agregar(2, 2, "aliasexplosion").solido().ocultar()
    escenaActiva().agregar(13, 12, "aliasexplosion").solido().ocultar()
    escenaActiva().agregar(7, 16, "aliasexplosion").solido().ocultar()
    escenaActiva().agregar(10, 17, "aliasexplosion").solido().ocultar()
    escenaActiva().agregar(4, 15, "aliasexplosion").solido().ocultar()
    escenaActiva().agregar(14, 15, "aliasexplosion").solido().ocultar()
    escenaActiva().agregar(13, 6, "aliasexplosion").solido().ocultar()
    escenaActiva().agregar(17, 6, "aliasexplosion").solido().ocultar()
    escenaActiva().agregar(15, 7, "aliasllave", "llave").solido()
    escenaActiva().agregar(7, 6, "pozo").solido().expandir(2,2).interactuar(() => {
        decir("Esto me lleva a otro nivel. Ganaste!")
        esperarY(5, () => escenaActiva().reset())
    })
    let mago = escenaActiva().agregar(3, 18, "aliasmago",{pausado:true}).solido().rotarY(180)
    .interactuar(() =>{
        mago.decir('hola, soy el mago ZEUS te ayudare a pasar el juego',3)
    })
    relatar([
        'Para avanzar toca las flechas',
        'Encuentra la llave para salir (es insible) ¡Ten cuidado HAY BOMBAS!',
        'imagen de prueba (mago)[aliasmago]'
    ])
    habitacionOculta(5, 5, 4, 4,"llave")
    //habitacionOculta(11,11,4,4)
    //piso inframondo muchas bombas moustros fueguitos morados
    let idEsperar = false
    escuchar("colision:@aliasexplosion", ({con}) => {
        if(idEsperar) return ;
        idEsperar = true;
        con.mostrar()
        esperarY(1, () => con.noSolido().eliminar())
        esperarY(2, () => {
            idEsperar = false;
            vida = vida - 1;
            if (vida == 0) {
                decir("Perdiste")
                esperarY(4, () => escenaActiva().reset())
            }
        })
    })
}