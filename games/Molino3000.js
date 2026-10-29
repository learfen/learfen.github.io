usarImagen("corazon", "/games/images/corazon.svg");

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
usarImagen("pasto", "/games/images/textura-suelo-hierba-5.avif");

function juego() {
        cambiarPiso("pasto", "20%")
        empezarEn(13, 7)
        let puntos = 0
        mostrar(() => "Puntos:"+puntos)
        let tiempo = 60
        mostrar(() => "Tiempo:"+tiempo)
        repetir(() => tiempo = tiempo - 1 ).cada(1).veces(62)
        player()
        .usarVidas(3)
        .margenY(-50)
        .escala(.7)
        .margenX(5)
        .lanzar({
                tecla: 'e',
                imagen: "fuego",
                distancia: 3,
                proyectil(elemento){
                        elemento.margenY(5)
                },
                impacto({ con }) {
                        if(con.tipo == 'corazon') return;
                        con.pintar("explosion")
                        esperarY(.5, () => con.eliminar())
                        if (con.tipo === 'drop') {
                                escenaActiva().agregar(con.x, con.y, "corazon").interactuar(({ elemento })=> {
                                        elemento.eliminar()
                                        player().sumarVida()
                                })
                        }
                        puntos=puntos+1
                }
        }).decir("Dispara con la E", 2)
        
        escenaActiva()
                .agregar(9, 11, "enemigo")
                .animar()
                .aleatorio()
                .margenX(5)
                .usarAnimacion("scale")
                .seguir({
                        colision({con}){
                                if(con.tipo == "player")
                                player().restarVida()
                        }
                })
                .margenY(-40)

        escenaActiva()
                .agregar(15, 5, "enemigo", "octavio")
                .animar()
                .aleatorio()
                .margenX(5)
                .usarAnimacion("scale")
                .seguir({
                        colision({con}){
                                if(con.tipo == "player")
                                player().restarVida()
                        }
                })
                .margenY(-40)

        escenaActiva()
                .agregar(1, 15, "enemigo")
                .animar()
                .aleatorio()
                .margenX(5)
                .usarAnimacion("scale")
                .seguir({
                        colision({con}){
                                if(con.tipo == "player")
                                player().restarVida()
                        }
                })
                .margenY(-40)

        escenaActiva()
                .agregar(6, 4, "enemigo")
                .animar()
                .aleatorio()
                .margenX(5)
                .usarAnimacion("scale")
                .seguir({
                        colision({con}){
                                if(con.tipo == "player")
                                player().restarVida()
                        }
                })
                .margenY(-40)

        
        escenaActiva()
                .agregar(10, 15, "enemigo")
                .animar()
                .aleatorio()
                .margenX(5)
                .usarAnimacion("scale")
                .seguir({
                        colision({con}){
                                if(con.tipo == "player")
                                player().restarVida()
                        }
                })
                .margenY(-40)

        decir("Puedes lanzar fuego con la tecla G", 2)

        repetir(() => {
                escenaActiva()
                        .agregar(1, 19, "enemigo")
                        .animar()
                        .aleatorio()
                        .margenX(5)
                        .usarAnimacion("scale")
                        .seguir({
                                colision({con}){
                                        if(con.tipo == "player")
                                        player().restarVida()
                                }
                        })
                        .margenY(10)

                escenaActiva()
                        .agregar(1, 1, "enemigo", {tipo:"drop"})
                        .animar()
                        .aleatorio()
                        .margenX(5)
                        .usarAnimacion("scale")
                        .seguir({
                                colision({con}){
                                        if(con.tipo == "player")
                                        player().restarVida()
                                }
                        })
                        .margenY(10)

                escenaActiva()
                        .agregar(19, 1, "enemigo")
                        .animar()
                        .aleatorio()
                        .margenX(5)
                        .usarAnimacion("scale")
                        .seguir({
                                colision({con}){
                                        if(con.tipo == "player")
                                        player().restarVida()
                                }
                        })
                        .margenY(10)

                escenaActiva()
                        .agregar(19, 19, "enemigo", {tipo:"drop"})
                        .animar()
                        .aleatorio()
                        .margenX(5)
                        .usarAnimacion("scale")
                        .seguir({
                                colision({con}){
                                        if(con.tipo == "player")
                                        player().restarVida()
                                }
                        })
                        .margenY(10)

        }).cada(5)
        
        escuchar("destruido:player", () => {
                decir("Hiciste "+puntos+" puntos")
                ayuda("Presiona A para reiniciar")
                estado("Fin")
        })
        esperarY(60, () => {
                decir("Hiciste "+puntos+" puntos")
                ayuda("Presiona A para reiniciar")
                estado("Fin")
        })
        escuchar("a", ()=> escenaActiva().reset(), "Fin")
}
