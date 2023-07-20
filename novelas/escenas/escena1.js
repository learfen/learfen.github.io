
async function escena1() {
	fuenteDialogos('VT323-Regular')
	// fondo('calle.webp')
	let transicion = crearTransicion('Aqui comienza esta historia'  , {
		fondo:'fondo-transicion.jpg',
		texto:'animate__rubberBand text-weight-bold fs-1',
		textoCss:'font-family: VT323-Regular, sans-serif',
	})
	fondo('fondo1.mp4')
	await transicion
	const daniel = crearPersona('daniel')
	const laura = crearPersona('laura')
	let dialogo = await crearDialogo(
		daniel , laura , ` 
			Hola soy @emisor, como estas @receptor?
			@respuestas 
			bien vos? 
			mal 
			contento
			hoy tengo tenis

	`, {
		opcionEfectoEntrada:'animate__backInRight'
	})

	if( await dialogo.respuesta() == 'mal' ) {
		daniel.triste()
		let dialogo = await crearDialogo(
			daniel , laura , `
				¿Que sucede?
				@respuestas
				Nada
				Ya se solucionará solo
			`
		)
	}

	if( await dialogo.respuesta() == 'bien vos?' ) {
		let dialogo = await crearDialogo(
			daniel , laura , `
				Bien
				@respuestas
				Feliz cumpleaños
				¿Vamos a la escuela?
			`
		)
		if(await dialogo.respuesta() == '¿Vamos a la escuela?' ) {			
			escena2()
		}
	}
}