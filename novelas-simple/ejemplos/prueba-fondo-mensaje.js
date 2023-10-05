iniciarJuego = () => { 
    let mensaje = Mensaje.insertar('Un dia Omar decidio ir a ver <br> que habia en la luna', {y:15,x:5})
    mochila.evento('guardar' , (objeto , mochila) => {
        let count = 0
        for( let item of mochila.items){
            if(item.url == './images/caja-tecnologica.png'){
                count++
            }
        }
        if(count == 4){
            mensaje.texto('Ya no hay nada que sirva. Volveré a la nave')
            .usarMovimiento('centrar')
            .mostrar()
        }
    })
    Juego.insertar({
        x:1,
        y:0,
        url:'https://t4.ftcdn.net/jpg/02/31/11/83/240_F_231118377_izjlBZqPMxIncVTE9ickoUaKiMQhATMj.jpg',
        id:'fondo1',
        ancho:100
    })
    mensaje.etiqueta.style.zIndex = '100'
    mensaje.usarMovimiento('centrar')
    mensaje.mostrar()
    mensaje.colorear('rgba(255,255,255,.7)')
    mensaje.evento('click', objeto => {
        juego.fondo1.eliminar()
        let fondo2 = Juego.insertar({
            x:0,
            y:0,
            url:'https://img.freepik.com/premium-photo/collage-with-sharks-desert_23-2150385886.jpg?size=626&ext=jpg',
            id:'fondo2',
            ancho:100
        }).ocultar()

        Juego.insertar({
            x:30,
            y:60,
            id:'caja',
            descripcion:'Celda de energia',
            url:'./images/caja-tecnologica.png',
            ancho:4
       })
	   .rotar(-30)
	   .ocultar()
       .evento('click', objeto => {
            objeto.escalar(3)
            esperar( () => mochila.guardar(objeto.etiqueta) , 1)
       })

        mensaje
        .moverA({x:50, y:65})
        .texto('Pero solo se encontro con arena <br>y restos de naves')
        esperar( () => { 
            fondo2.mostrar()
            juego.caja.mostrar()

            Juego.insertar({
                x:30,
                y:70,
                id:'caja1',
                descripcion:'Celda de energia',
                url:'./images/caja-tecnologica.png',
                ancho:4
            })
            .evento('click', objeto => {
                    objeto.escalar(3)
                    esperar( () => mochila.guardar(objeto.etiqueta) , 1)
            })

            Juego.insertar({
                x:70,
                y:60,
                id:'caja2',
                descripcion:'Celda de energia',
                url:'./images/caja-tecnologica.png',
                ancho:4
            })
            .evento('click', objeto => {
                    objeto.escalar(3)
                    esperar( () => mochila.guardar(objeto.etiqueta) , 1)
            })

            Juego.insertar({
                x:70,
                y:38,
                id:'caja3',
                descripcion:'Celda de energia',
                url:'./images/caja-tecnologica.png',
                ancho:2
            })
            .evento('click', objeto => {
                    objeto.escalar(3)
                    esperar( () => mochila.guardar(objeto.etiqueta) , 1)
            })
            
         } , 3 ) 
    
    })
} 