usarImagen("flor-hielo","/games/images/flower-3.png")
usarImagen("pocion-hielo","/games/images/botella-2.png")
usarImagen("baballero", "/games/images/caballero-ataca-arriba.gif")
usarImagen("agua", "/games/images/agua.gif")
usarImagen("caldero", "/games/images/caldero-1.gif")
usarImagen("piso", "/games/images/textura-suelo-hierba-3.webp")
usarImagen("b bn", "/games/images/fogata-2.gif")
usarImagen("lj", "/games/images/ciudad-1.jpg")
usarImagen("señor de los per", "/games/images/arquero-1.gif")
usarImagen("pocion", "/games/images/botella-3.png")
usarImagen("cw345", "/games/images/baul.gif")
usarImagen("arbol", "/games/images/arbol.png")
usarImagen("pasto", "/games/images/bosque1.png")
usarImagen("lobito", "/games/images/lobo-derecha.gif");
usarImagen("gugugaga", "/games/images/enemigo1.png");
usarImagen("casa", "/games/images/cabaña2.png");

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
// importaciones basicas
function juego(){
	relatar([
		`Para ganar necesitas congelar el rio`,
		`Puedes hacer una pocion para eso, guarda en el caldero 3 pociones rojas 
   
![pocion](pocion)  

y una flor de hielo

![flor](flor-hielo)

`
	])
	escenaActiva().agregar(2,18,"flor-hielo").margenY(-50).escala(.8).solido().interactuar(({ elemento }) => {
		player().inventario.guardar(elemento)
	})

	escenaActiva().agregar(1,18,"flor-hielo").margenY(-50).escala(.8).solido().interactuar(({ elemento }) => {
		player().inventario.guardar(elemento)
	})

	escenaActiva().agregar(1,16,"flor-hielo").margenY(-50).escala(.8).solido().interactuar(({ elemento }) => {
		player().inventario.guardar(elemento)
	})

	escenaActiva().agregar(1,17,"flor-hielo").margenY(-50).escala(.8).solido().interactuar(({ elemento }) => {
		player().inventario.guardar(elemento)
	})

	escenaActiva().agregar(2,17,"flor-hielo").margenY(-50).escala(.8).solido().interactuar(({ elemento }) => {
		player().inventario.guardar(elemento)
	})

	escenaActiva().agregar(2,16,"flor-hielo").margenY(-50).escala(.8).solido().interactuar(({ elemento }) => {
		player().inventario.guardar(elemento)
	})

	let caldero = escenaActiva().agregar(9,10,"caldero").margenY(-40).margenX(5).escala(.8).solido().usarInventario()

	escuchar("inventario:guardar",()=>{
		if(caldero.inventario.contar('@pocion') == 3){
			if(caldero.inventario.contar('@flor-hielo') == 1){
				escenaActiva().agregar(8, 11, "pocion-hielo","pocion-hielo").margenX(5).escala(.5).solido().interactuar(({ elemento }) => {
					player().inventario.guardar(elemento)
				})
			}
		}
	})

	escenaActiva().agregar(9, 15, "baballero").margenY(-50).escala(.8).solido()

	escenaActiva().agregar(9, 16, "pocion").margenX(5).escala(.5).solido().interactuar(({ elemento }) => {
		player().inventario.guardar(elemento)
	})

	escenaActiva().agregar(2, 10, "pocion").margenX(5).escala(.5).solido().interactuar(({ elemento }) => {
		player().inventario.guardar(elemento)
	})

	escenaActiva().agregar(17, 13, "pocion").margenX(5).escala(.5).solido().interactuar(({ elemento }) => {
		player().inventario.guardar(elemento)
	})


	escenaActiva().agregar(11, 16, "pocion").margenX(5).escala(.5).solido().interactuar(({ elemento }) => {
		player().inventario.guardar(elemento)
	})

	escenaActiva().agregar(16, 8, "agua").margenY(-160).solido().expandir(4, 4)
	escenaActiva().agregar(0, 4, "agua", {redondear:0,pausado:false,repetir:false}).piso(20,1,false).margenY(0).margenX(-5).solido().interactuar(({ elemento }) => {
		if(player().inventario.contar('@pocion-hielo')){
			elemento.animacion.pausa()
			elemento.noSolido()
			elemento.filtro("saturar",4)
		}
	})

	escuchar("mover:player", ()=>{
		if(player().en('@agua')) decir("Ganaste")
	})



	// escribe aqui tu codigo
	empezarEn(10, 10)
	let vidas = 3
	escenaActiva().agregar(10, 8, "casa").margenY(-180).expandir(4, 2).solido()

	cambiarPiso("piso")








}