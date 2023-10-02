class Movimiento {
	static activar( etiqueta , nombreMovimiento ){
		if(etiqueta.style.transform != ''){
			etiqueta.classList.add('animar')
			const css = document.querySelector('#effect-'+nombreMovimiento)
			return etiqueta.style.transform = css.getAttribute('animation')
		}
		etiqueta.classList.add('animar',nombreMovimiento, nombreMovimiento+'-activada')
	}
	static crear( nombre , efecto ){
		let css = document.createElement('style')
		let animation = ''
		if( efecto['x'] && efecto['y'] ) animation += ` translate(${efecto.x}, ${efecto.y}) `
		if( efecto['rotar'] ) animation += ` rotate(${efecto['rotar']}deg) `
		if( efecto['escala'] )	animation += ` scale(${efecto['escala']}) `
		css.id = 'effect-'+nombre
		css.setAttribute('animation',animation)
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
		Componente.mostrar(this.etiqueta)
	}
	ocultar(){
		Componente.ocultar(this.etiqueta)
	}
	eliminar(){
		Componente.eliminar(this.etiqueta)
	}
	mostrarOcultar(){
		Componente.mostrarOcultar(this.etiqueta)
	}
	static eliminar(){
		this.etiqueta.remove()
	}
	static mostrar( etiqueta ){
		etiqueta.classList.remove('oculto')
	}
	static ocultar( etiqueta ){
		console.log( etiqueta )
		etiqueta.classList.add('oculto')
	}
	static mostrarOcultar( etiqueta ){
		etiqueta.classList.toggle('oculto')
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
class Info{
	static sumarPuntos( cantidad ){
		puntos.innerHTML = +puntos.innerHTML + +cantidad
	}
}
class Juego{
	static insertar( data ){
		let imagen = document.createElement('img')
		imagen.src = data.url
		imagen.id = data.id
		imagen.className = 'position-absolute'
		imagen.style.left = '0px'
		imagen.style.top = '0px'
		let cell = window.innerWidth / 100
		console.log(cell)
		data.y = data.y * cell
		data.x = data.x * cell
		imagen.style.width = (cell * data.ancho) + 'px'
		imagen.style.transform = `translate(${data.x}px,${data.y + 10}px)`
		game.appendChild(imagen)
	}
	static iniciar(){
		console.log('start game')
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
		iniciarJuego()
	}
}
class Mochila {
	constructor() {
		this.items = [];
		Movimiento.crear('mochila-guardar', {
			x: '5px', 
			y: (window.innerHeight-100)+'px',
			escala:.2
		})
		this.mochila = document.createElement('div')
		this.mochila.id = 'mochila'
		this.mochila.className = 'animate__animated rounded-2 '
		document.body.appendChild(this.mochila)
		this.cerrar()
		let close = document.createElement('button')
		close.className = 'btn btn-close end-0 position-absolute top-0 m-3'
		close.onclick = () => this.cerrar()
		this.mochila.appendChild(close)

		let mochilaImage = document.createElement('div')
		mochilaImage.style = 'background-image: url("./images/mochila.png");background-size: cover;background-clip: padding-box;width:80px;min-height:80px;max-width:80px'
		mochilaImage.className = 'position-fixed bottom-0 start-0 btn ms-2 mb-3'
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
		}, 800);
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
		if(!this.items.length)	return 0
		let itemWidth = window.innerWidth / 5
		let space = itemWidth / 5
		let row = 0
		let count = 0
		let marginTop = 30
		const renderItem = ( index ) => {
			if(this.items.length == index ) return 0

			if( window.innerWidth < +(100 * count)+100+10 ) {
				row += 1
				count = 0
			}
			this.items[index].style.width = '100px'
			this.items[index].style.transform = `translate(${+(100 * count)+10}px,${+(140 * row)+marginTop}px)`
			
			count++
			
			this.items[index].classList.add('en-mochila-abierta')
			
			setTimeout(()=> renderItem(++index) , 250)
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

function main(){
	console.log('main exe ')
	let mode = 'creando'
	if(mode=='creando'){
		document.addEventListener('mousemove' , event => {
			coordenadas.innerHTML = `x: ${event.clientX} y: ${event.clientY}`
		})
		setTimeout(()=> botonIniciar.click() , 1000)
	}
	componenteIntro = new Intro
	componenteIntro.instalar( inicio )
	botonIniciar.onclick = () => Juego.iniciar()
}

let x = setInterval(()=>{
	if( Intro ){
		console.log('exe')
		main()
		clearInterval( x )
	}
},100)