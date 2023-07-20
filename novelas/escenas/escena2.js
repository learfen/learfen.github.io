async function escena2() {
	dialogs.innerHTML = ''
	await crearTransicion('Ya en la escuela' , { 
		duracion:2500 ,
		text:'animate__rubberBand text-weight-bold',
		efectoEntrada:'animate__backInLeft',
		efectoSalida:'animate__backOutRight' 
	})

	fondo('aula.webp')

	const daniel = crearPersona('daniel')
	const laura = crearPersona('laura')
	let dialogo = await crearDialogo(
		daniel , laura , ` 
			Escena 2 , Hola soy @emisor, como estas @receptor?
			@respuestas 
			bien vos? 
			mal 
	`)

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