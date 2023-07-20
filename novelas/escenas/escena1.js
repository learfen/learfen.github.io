async function escena1() {
	// fondo('calle.webp')
	let transicion = crearTransicion('Aqui comienza esta historia')
	await transicion
	const daniel = crearPersona('daniel' /**, {voz:'Pablo'} */)
	const laura = crearPersona('laura')
	usarBarra('animo',daniel)
	usarBarra('animo',laura)
	usarBarra('salud',daniel , salud => {
		if(salud < 11) escena3()
	})
	let dialogo = await crearDialogo(
		daniel , laura , ` 
			Hola soy @emisor, como estas @receptor?
			@respuestas 
			bien vos? 
			mal 
			contento
			hoy tengo tenis
			me siento mal, *se desmaya*
	`)
	laura.saludando()
	daniel.saludando()

	if( await dialogo.respuesta() == 'mal' ) {
		daniel.triste()
		actualizarBarra('animo', daniel , -20)
		let dialogo = await crearDialogo(
			daniel , laura , `
				¿Que sucede?
				@respuestas
				Nada
				Ya se solucionará solo
			`)
	}

	if( await dialogo.respuesta() == 'bien vos?' ) {
		laura.normal()
		daniel.normal()
		let dialogo = await crearDialogo(
			daniel , laura , `
				Bien
				@respuestas
				Feliz cumpleaños
				¿Vamos a la escuela?
			` )
		if(await dialogo.respuesta() == '¿Vamos a la escuela?' ) {			
			escena2()
		}
	}

	if(await dialogo.respuesta() == 'hoy tengo tenis'){
		eliminarBarra( daniel )
	}

	if(await dialogo.respuesta() == 'me siento mal, *se desmaya*'){
		actualizarBarra('salud', daniel , -90)
	}
}