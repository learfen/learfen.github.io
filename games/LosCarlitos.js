usarImagen("cimiento","/games/images/blanco.png")
usarImagen("arbusto","/games/images/bosque1.png")
usarImagen("cofre","/games/images/baul.gif")
usarImagen("barril","/games/images/barril-1.png")
usarImagen("flecha","/games/images/arquero-flecha.webp")
usarImagen("flecha2","/games/images/arquero-flecha-vertical.webp")
usarImagen("arquero","/games/images/arquero-1.gif")
usarImagen("torre-arquero","/games/images/torre-arquero.png")

function juego(){

	cambiarPiso("cimiento")

	escenaActiva().agregar(15,6,"arbusto").margenY(-50).escala(.8).solido()

	escenaActiva().agregar(8,13,"cofre",{ pausado:true, repetir:false }).margenY(-50).solido().interactuar(({ elemento }) => {
		elemento.animacion.play()
		player().decir("Ganaste")
		actualizarEstado("Fin")
	})

	escuchar("a", () => {
		escenaActiva().reset() 
	}, "Fin")

	escenaActiva().agregar(8,13,"barril").peso(1).margenX(5).margenY(0).solido()

	escenaActiva().agregar(12,12,"barril").peso(1).margenX(5).margenY(0).solido()

	escenaActiva().agregar(12,13,"barril").peso(1).margenX(5).margenY(0).solido()

	escenaActiva().agregar(12,15,"barril").peso(1).margenX(5).margenY(0).solido()

	escenaActiva().agregar(12,15,"barril").peso(2).margenX(5).margenY(0).solido()

	escenaActiva().agregar(12,16,"barril").peso(1).margenX(5).margenY(0).solido()


	escenaActiva().agregar(14,1,"torre-arquero").margenY(-50).escala(.8).solido().lanzar({
		imagen:'flecha2',
		vision:'*',
		tipo:'dinamico',
		distancia:6,
		cada:1,
		orientar:false,
		proyectil(elemento){
			elemento.px(10,50)
		},
		impacto({ con }){
			if(con.tipo === 'player') player().restarVida()
		}
	}).hacia('player')

	escenaActiva().agregar(16,1,"torre-arquero").margenY(-50).escala(.8).solido().lanzar({
		imagen:'flecha2',
		vision:'*',
		tipo:'dinamico',
		distancia:6,
		cada:1,
		orientar:false,
		proyectil(elemento){
			elemento.px(10,50)
		},
		impacto({ con }){
			if(con.tipo === 'player') player().restarVida()
		}
	}).hacia('player')

	escenaActiva().agregar(19,9,"arquero").margenY(-10).escala(1.2).solido().lanzar({
		imagen:'flecha',
		vision:'*',
		tipo:'dinamico',
		distancia:6,
		cada:1,
		impacto({ con }){
			if(con.tipo === 'player') player().restarVida()
		}
	}).hacia('player')

	escenaActiva().agregar(19,7,"arquero").margenY(-10).escala(1.2).solido().lanzar({
		imagen:'flecha',
		vision:'*',
		tipo:'dinamico',
		distancia:6,
		cada:1,
		impacto({ con }){
			if(con.tipo === 'player') player().restarVida()
		}
	}).hacia('player')

	escenaActiva().agregar(19,5,"arquero").margenY(-10).escala(1.2).solido().lanzar({
		imagen:'flecha',
		vision:'*',
		tipo:'dinamico',
		distancia:6,
		cada:1,
		impacto({ con }){
			if(con.tipo === 'player') player().restarVida()
		}
	}).hacia('player')

	escenaActiva().agregar(10,12,"arquero").margenY(-10).escala(1.2).solido().lanzar({
		imagen:'flecha',
		vision:'*',
		tipo:'dinamico',
		distancia:6,
		cada:1,
		impacto({ con }){
			if(con.tipo === 'player') player().restarVida()
		}
	}).hacia('player')

	escenaActiva().agregar(10,8,"arquero").margenY(-10).escala(1.2).solido().lanzar({
		imagen:'flecha',
		vision:'*',
		tipo:'dinamico',
		distancia:6,
		cada:1,
		impacto({ con }){
			if(con.tipo === 'player') player().restarVida()
		}
	}).hacia('player')

	escenaActiva().agregar(4,6,"arquero").margenY(-10).escala(1.2).solido().lanzar({
		imagen:'flecha',
		vision:'*',
		tipo:'dinamico',
		distancia:6,
		cada:1,
		impacto({ con }){
			if(con.tipo === 'player') player().restarVida()
		}
	}).hacia('player')

	habitacionOculta(16,11,3)
	paredVertical(11,0,20).puerta(3)
	empezarEn(14,14).escala(.8).margenX(5).usarVidas(1).fuerza(1);

	escuchar('destruido:@player', () => {
		decir("Perdiste")
		esperarY(2, () => escenaActiva().reset())
	})
	/*
	relatar([`
	#### Controles

	- Usa las flechas del teclado para moverte
	- Presiona E para atacar
	- Presiona D para saltar

	[Jugar](/?neto=1&escena=nivel1&sala=prueba-nivel1)

	`])
	*/

	// fin juego
	}