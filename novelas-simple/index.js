class Movimiento {
	
	asinginarMovimiento( etiqueta , nombreMovimiento ){
		etiqueta.classList.add('animar',nombreMovimiento)
	}
	activarMovimiento( etiqueta , nombreMovimiento ){
		etiqueta.classList.add(nombreMovimiento+'-activada')
	}
	crearMovimiento( nombre , x , y ){
		let css = document.createElement('style')
		css.innerHTML = `
		.${nombre}.${nombre}-activada {
			-webkit-transform: translate(${x}, ${y});
			-moz-transform: translate(${x}, ${y});
			-o-transform: translate(${x}, ${y});
			-ms-transform: translate(${x}, ${y});
			transform: translate(${x}, ${y});
		}`
		document.body.appendChild(css)
	}
}

class Componente extends Movimiento{
	instalar( etiqueta ){
		if(typeof etiqueta == 'string') {		
			this.etiqueta = document.querySelector('#'+etiqueta)
		} else {		
			this.etiqueta = etiqueta
		}
	}
	mostrar(){
		this.etiqueta.classList.remove('oculto')
	}
	ocultar(){
		this.etiqueta.classList.add('oculto')
	}
	mostrarOcultar(){
		this.etiqueta.classList.toggle('oculto')
	}
	mover(){
		this.etiqueta.classList.add('active')
	}
	colorear( color ){
		this.etiqueta.style.backgroundColor = color
	}
	colorearTexto( color ){
		this.etiqueta.style.color = color
	}
	asignarClases( clases ){
		for(let clase of clases.split(' ')){
			this.etiqueta.classList.add(clase)
		}
	}
}

var componenteMenu
var componenteInfo
var componenteIntro
var componenteAudio
var componenteVideo
var componenteTransicion

function iniciarJuego(){
	componenteIntro.ocultar()
	componenteInfo = new ComponenteEtiqueta
	componenteInfo.instalar( 'info' )
	componenteInfo.mostrar()
	componenteMenu = new Menu
	componenteMenu.instalar( menu )
	componenteMenu.colorear('#eee')
	componenteMenu.asignarClases('p-4 shadow')
	componenteMenu.crearMovimiento( 'diagonal' , '50px' , '50px' )
	componenteMenu.asinginarMovimiento( menu , 'diagonal' )
	botonMostrarMenu.onclick = () => componenteMenu.mostrarOcultar()
	setTimeout(()=>componenteMenu.activarMovimiento(menu , 'diagonal'), 2000)
}

function main(){
	componenteIntro = new Intro
	componenteIntro.instalar( inicio )
	botonIniciar.onclick = iniciarJuego
}

setTimeout(()=> main(), 1000)