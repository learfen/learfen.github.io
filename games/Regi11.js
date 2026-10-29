usarImagen("pan", "/games/images/pan.webp")
usarImagen("piso", "/games/images/textura-suelo-hierba-7.jpg")
usarImagen("floor", "/games/images/flower-5.png");
usarImagen("floor", "/games/images/flower-5.png");
usarImagen("floor", "/games/images/flower-5.png");
usarImagen("floor", "/games/images/flower-3.png");
usarImagen("flor", "/games/images/flower-svgrepo-com.png");
usarImagen("corazon", "/games/images/corazon.svg");
usarImagen("fuego2", "/games/images/fuego.gif");
usarImagen("fuego", "/games/images/fuego.gif");
usarImagen("casitotu", "/games/images/cabaña2.png");
usarImagen("llaves de la casa", "/games/images/key-svgrepo-com.svg");
usarImagen("perro", "/games/images/lobo-abajo.gif");
usarImagen("perro-abajo", "/games/images/lobo-abajo.gif");
usarImagen("perro-arriba", "/games/images/lobo-arriba.gif");
usarImagen("perro-izquierda", "/games/images/lobo-izquierda.gif");
usarImagen("perro-derecha", "/games/images/lobo-derecha.gif");
usarImagen("estatua", "/games/images/estatua-1.png");
usarImagen("cama", "/games/images/bed.svg");
usarImagen("arbusto", "/games/images/bosque1.png");
usarImagen("agua2", "/games/images/agua.gif");
usarImagen("fuego", "/games/images/fuego.gif");
usarImagen("arbolito", "/games/images/arbol.png");
usarImagen("molino", "/games/images/molino.gif");
usarImagen("juancho", "/games/images/shark.gif");
usarImagen("casita", "/games/images/casa-fondo.jpeg");
usarImagen("cama", "/games/images/bed.svg");

// importaciones basicas

function juego() {
    // escribe aqui tu codigo
    empezarEn(10, 10);
    player().usarVidas(3).decir("Tal vez deberiamos hacer una ofrenda para que nos regale comida.",4)
    cambiarPiso("piso", "20%")
    escenaActiva().agregar(6, 7, "casita").expandir(3, 1)
    escenaActiva().agregar(3, 12, "juancho")
    escenaActiva().agregar(6, 4, "molino").expandir(3,1)
    escenaActiva().agregar(9, 2, "arbolito").expandir(2, 1)
    escenaActiva().agregar(12, 9, "arbolito").expandir(2, 1)
    escenaActiva().agregar(5, 9, "fuego")
    escenaActiva().agregar(17, 14, "arbusto").expandir(2, 1).interactuar(() => decir("Puede haber serpientes", 2))
    escenaActiva().agregar(13, 10, "cama")
    let estatua = escenaActiva().agregar(17, 9, "estatua").expandir(2, 1).animar().usarInventario()
    escenaActiva().agregar(3,3, "perro").margenX(5).margenY(-10).animar().seguir({
        colision() {
            player().restarVida()
        }
    }).px(50, 50)
    escenaActiva().agregar(13, 4, "llaves de la casa")
    escenaActiva().agregar(13, 11, "fuego")
    escenaActiva().agregar(10, 11, "corazon")
    escenaActiva().agregar(13, 15, "floor").escala(.7).margenY(-25).margenX(5).interactuar(() => decir("Estas flores no son", 1))
    escenaActiva().agregar(17, 17, "floor").escala(.7).margenY(-25).margenX(5).interactuar(() => decir("Estas flores no son", 1))
    escenaActiva().agregar(12, 12, "floor").escala(.7).margenY(-25).margenX(5).interactuar(() => decir("Estas flores no son", 1))
    escenaActiva().agregar(2, 15, "floor").escala(.7).margenY(-25).margenX(5).interactuar(() => decir("Estas flores no son", 1))
    escenaActiva().agregar(3, 6, "floor").escala(.7).margenY(-25).margenX(5).interactuar(() => decir("Estas flores no son", 1))

    escenaActiva().agregar(5, 16, "flor").margenX(5).margenY(-35).escala(.7).solido().interactuar(({ elemento }) => player().inventario.guardar(elemento));
    escenaActiva().agregar(11, 15, "flor").margenX(5).margenY(-35).escala(.7).solido().interactuar(({ elemento }) => player().inventario.guardar(elemento));
    escenaActiva().agregar(4, 3, "flor").margenX(5).margenY(-35).escala(.7).solido().interactuar(({ elemento }) => player().inventario.guardar(elemento));
    escenaActiva().agregar(17, 1, "flor").margenX(5).margenY(-35).escala(.7).solido().interactuar(({ elemento }) => player().inventario.guardar(elemento));
    escenaActiva().agregar(17, 16, "flor").margenX(5).margenY(-35).escala(.7).solido().interactuar(({ elemento }) => player().inventario.guardar(elemento));
    escenaActiva().agregar(8, 13, "flor").margenX(5).margenY(-35).escala(.7).solido().interactuar(({ elemento }) => player().inventario.guardar(elemento));
    escenaActiva().agregar(13, 8, "flor").margenX(5).margenY(-35).escala(.7).solido().interactuar(({ elemento }) => player().inventario.guardar(elemento));
    escenaActiva().agregar(2, 10, "flor").margenX(5).margenY(-35).escala(.7).solido().interactuar(({ elemento }) => player().inventario.guardar(elemento));
    
    // usamos las funciones para sumar y perder vidas
    escuchar("destruido:player", () => {
        decir("Perdiste")
        esperarY(() => escenaActiva().reset())
    })

    escuchar("colision:@fuego", (evento) => {
        // ¿que haremos cuando el player colisione al enemigo1?
        // podemos eliminar el enemigo luego de tocar
        evento.objeto().eliminar()
    })

    repetir(()=> {
        if(estatua.inventario.contar('@flor')){
            escenaActiva().agregar(estatua.x - 1, estatua.y + 1, "pan").interactuar(({ elemento }) => {
                elemento.eliminar()
                player().sumarVida(1)
            })
        }
    }).cada(1)

}

