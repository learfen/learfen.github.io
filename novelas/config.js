window.configDialogo = {
	opcionEfectoEntrada:'animate__backInRight'
}

window.configTransicion = {
	fondo:'fondo-transicion.jpg',
	texto:'animate__rubberBand text-weight-bold fs-1',
	textoCss:'font-family: VT323-Regular, sans-serif',
}

function inicio( escena ){
	fuenteDialogos('VT323-Regular')
	if(escena == 1) fondo('fondo1.mp4')
}