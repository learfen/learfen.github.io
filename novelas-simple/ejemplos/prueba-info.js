
function iniciarJuego(){ 
	// tipos validos puntos y barras
	// let objeto = new Info ( tipo , texto visible , valor inicial )
	// creamos la vista de puntos inicia con 10 puntos
	Info.insertar('puntos','Puntos', 10)
	// creamos la barra de vida inicia en 40%
	Info.insertar('barra','Vida', 40)
	// ejecutar luego de 2 segundos
    esperar( ()=> {
		juego.Vida.incrementar( 30 )
		juego.Puntos.reducir( 10 )
	} , 2 )
// llama aqui la primer funcion 
 } 