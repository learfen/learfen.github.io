usarImagen("cofre","/games/images/cofre.gif")
usarImagen("hoyo","/games/images/hoyo-arena.webp")
usarImagen("agua2","/games/images/agua.gif")
usarImagen("bala","/games/images/bola.png")
usarImagen("tierra","/games/images/piso-tierra3.png")
usarImagen("casuta","/games/images/cabaña.png");
usarImagen("caseta","/games/images/cabaña.png");
usarImagen("casita","/games/images/cabaña.png");
usarImagen("barquito","/games/images/barco.png");
usarImagen("tiburonzote","/games/images/shark.gif");
usarImagen("arenita","/games/images/piso-tierra.png");
usarImagen("agueta","/games/images/mar-1.jpg");
usarImagen("aguota","/games/images/mar-1.jpg");
usarImagen("aguita","/games/images/mar-1.jpg");
usarImagen("agua","/games/images/mar-1.jpg");
usarImagen("verdote","/games/images/fish1.svg");
usarImagen("amarillote","/games/images/fish3.svg");
usarImagen("amarillito","/games/images/fish2.svg");
usarImagen("nemo","/games/images/fish1.gif");
usarImagen("tiburoncin","/games/images/shark.gif");
usarImagen("arenota","/games/images/piso-tierra.png");
usarImagen("arenita","/games/images/piso-tierra.png");
usarImagen("cangre","/games/images/cangrejo.gif");
usarImagen("casota","/games/images/cabaña.png");
usarImagen("corazon", "/games/images/corazon.svg");
//usarImagen("lobo", "/games/images/lobo-abajo.gif");
usarImagen("lobo-izquierda", "/games/images/lobo-izquierda.gif");
usarImagen("lobo-derecha", "/games/images/lobo-derecha.gif");
usarImagen("lobo-abajo", "/games/images/lobo-abajo.gif");
usarImagen("lobo-arriba", "/games/images/lobo-arriba.gif");
usarImagen("cartel","/games/images/cartel-cangrejo.png");
usarImagen("mapa","/games/images/mapa.png");


// importaciones basicas

function juego() {

    // escribe aqui tu codigo
    empezarEn(18, 3);
    relatar([
        `El inventario se abre con la w, o el icono de la mochila`,
        `Busca el tesoro, sigue los pasos en el mapa`,
        `En la playa hay piratas, cuidado con las balas de cañon`,
        `![mapa](/games/images/mapa.png)`
    ])
    cambiarPiso("tierra")

    // ¿ Como usar ? por ejemplo colisionar con imagenes "enemigo"
    // usarImagen("enemigo", "/games/images/enemigo1.png")
    // escuchar("colision:@enemigo", perderVida) 

    player().escala(.6).margenX(5).margenY(-30).usarVidas(3)



    escenaActiva().agregar(6,18,"cangre").expandir(3,3)
    escenaActiva().agregar(9,12,"cartel").margenY(-50).escala(1.2)
    let agua = escenaActiva().agregar(0,15,"agua2",{tipo:"agua"}).redondear(3).expandir(20,10).plano().solido().margenY(0)
    let agua2 = escenaActiva().agregar(0,15,"agua",{z:1}).redondear(3).expandir(20,10).plano().solido().margenY(40).transparencia(.5)
    agua2.transicion("margenY", 3)
    repetir(() => {
        agua2.margenY(10)
        esperarY(2.5, ()=> agua2.margenY(40)) 
    }).cada(5)
    
    escenaActiva().agregar(15,16,"tiburoncin",{id:"pez1",z:0}).expandir(3,1).animar().aleatorio('agua')
    escenaActiva().agregar(18,15,"nemo",{id:"pez12",z:0}).animar().aleatorio('agua')
    escenaActiva().agregar(7,16,"amarillito",{id:"pez13",z:0}).animar().aleatorio('agua')
    escenaActiva().agregar(14,15,"amarillote",{id:"pez14",z:0}).animar().aleatorio('agua')
    escenaActiva().agregar(6,15,"verdote",{id:"pez15",z:0}).animar().aleatorio('agua')
    escenaActiva().agregar(14,18,"tiburonzote",{id:"pez16",z:0}).expandir(3,1).animar().aleatorio('agua')
    
    let barco = escenaActiva().agregar(10,18,"barquito",{id:"pez17",z:0}).orientar("arriba").margenY(-150).expandir(3,1).animar().lanzar({
        imagen:"bala",
        distancia:10,
        tipo:"dinamico",
        cada:5,
        vision:'*',
        impacto({con}){
            con.perderVida()
        }
    }).hacia("@player")

    escenaActiva().agregar(2,5,"casota").margenX(8).expandir(3,1).interactuar(() => {
        player().decir("Esta cerrada",2)
    }, { condicion() {
        return (player().y == 6)
    }})

    escenaActiva().agregar(15,5,"casita").margenX(8).expandir(3,1).interactuar(() => {
        player().decir("Esta cerrada",2)
    }, { condicion() {
        return (player().y == 6)
    }})

    escenaActiva().agregar(6,5,"caseta").margenX(8).expandir(3,1).interactuar(() => {
        player().decir("Esta cerrada",2)
    }, { condicion() {
        return (player().y == 6)
    }})
    escenaActiva().agregar(10,5,"casuta").margenX(8).expandir(3,1).interactuar(() => {
        player().decir("Esta cerrada",2)
    }, { condicion() {
        return (player().y == 6)
    }})

    let tesoro = escenaActiva().agregar(1,4,"cofre","tesoro").noSolido().ocultar()
    
     let lobo = escenaActiva().agregar(1, 1, "lobo", "lobo").orientar("abajo").seguir({
        colision(){
            player().perderVida()
        }
     }).px(70, 50).margenY(0)

    escuchar("e",() => {
        if(player().mirandoObjeto("tesoro")) tesoro.mostrar().solido()
        else 
            escenaActiva().agregarDelante("hoyo").solido()
    },"play")
}

