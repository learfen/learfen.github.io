

class Movimiento {
	static activar( etiqueta , nombreMovimiento ){
		etiqueta.classList.add('animar',nombreMovimiento, nombreMovimiento+'-activada')
	}
	static crear( nombre , efecto ){
		let css = document.createElement('style')
		let animation = ''
		if( efecto['x'] && efecto['y'] ) animation += ` translate(${efecto.x}, ${efecto.y}) `
		if( efecto['rotar'] ) animation += ` rotate(${efecto['rotar']}deg) `
		if( efecto['escala'] )	animation += ` scale(${efecto['escala']}) `
		
		css.innerHTML = `
		.${nombre}.${nombre}-activada {
			-webkit-transform: ${animation};
			-moz-transform: ${animation};
			-o-transform: ${animation};
			-ms-transform: ${animation};
			transform: ${animation};
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

class Mochila {
	constructor() {
		this.items = [];
		Movimiento.crear('mochila-guardar', {
			x: (window.innerWidth-150)+'px', 
			y: (window.innerHeight-150)+'px',
			escala:.2
		})
		this.mochila = document.createElement('div')
		this.mochila.id = 'mochila'
		this.mochila.className = 'animate__animated'
		document.body.appendChild(this.mochila)
		this.cerrar()
		let close = document.createElement('button')
		close.className = 'btn btn-close end-0 position-absolute top-0 m-5'
		close.onclick = () => this.cerrar()
		this.mochila.appendChild(close)

		let mochilaImage = document.createElement('div')
		mochilaImage.style = 'background-image: url("./images/mochila.png");background-size: cover;width:80px;min-height:80px'
		mochilaImage.className = 'position-fixed bottom-0 end-0 m-2 btn '
		mochilaImage.onclick = () => this.abrirCerrar()
		document.body.appendChild(mochilaImage)
	}
	abrirCerrar(){
		if(this.mochila.classList.contains('abierta')) return this.cerrar()
		this.abrir()
	}
	guardar( etiqueta ){
		this.items.push( etiqueta )
		Movimiento.activar(etiqueta , 'mochila-guardar')
		setTimeout(() => {
			etiqueta.classList.add('en-mochila')
		}, 1500);
	}
	cerrar(){
		this.mochila.classList.remove('animate__fadeIn')
		this.mochila.classList.add('animate__fadeOut')
		const renderItem = ( index ) => {
			if(!this.items[index]) return 0
			this.items[index].classList.remove('en-mochila-abierta')
			renderItem( ++index )
		}
		renderItem( 0 )
		setTimeout(()=>{
			this.mochila.classList.add('oculto')
		}, 800)
	}
	abrir(){
		this.mochila.classList.remove('oculto')
		this.mochila.classList.remove('animate__fadeOut')
		this.mochila.classList.add('animate__fadeIn')

		const renderItem = ( index ) => {
			if(!this.items[index]) return 0
			this.items[index].classList.add('en-mochila-abierta')
			this.items[index].style.transform = `translate(${((index + 1) * 120)}px,${((parseInt(index / 10) + 1) * 120)}px)`

			setTimeout(()=> renderItem( ++index ) , 150)
		}
		renderItem( 0 )
	}
}

var componenteMenu
var componenteInfo
var componenteIntro
var componenteAudio
var componenteVideo
var componenteTransicion
var mochila = new Mochila

function iniciarJuego(){
	componenteIntro.ocultar()
	componenteInfo = new ComponenteEtiqueta
	componenteInfo.instalar( 'info' )
	componenteInfo.mostrar()
	componenteMenu = new Menu
	componenteMenu.instalar( menu )
	componenteMenu.colorear('#eee')
	componenteMenu.asignarClases('p-4 shadow')
	Movimiento.crear( 'diagonal' , {x:'50px' , y:'50px'} )
	botonMostrarMenu.onclick = () => {
		componenteMenu.mostrarOcultar()
		setTimeout(()=>{
			Movimiento.activar(menu,'diagonal')
		}, 1000)
	}
}

function main(){
	let mode = 'creando'
	if(mode=='creando'){
		document.addEventListener('mousemove' , event => {
			coordenadas.innerHTML = `x: ${event.clientX} y: ${event.clientY}`
		})
	}
	componenteIntro = new Intro
	componenteIntro.instalar( inicio )
	botonIniciar.onclick = iniciarJuego
	setTimeout(()=>{
		botonIniciar.click()
	})
}

setTimeout(()=> main(), 1000)