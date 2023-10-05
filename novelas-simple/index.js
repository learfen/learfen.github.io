
var juego = {keys:[], state:'run'}
var intervalos = { id: 0 , data:[] , push(interval){
	intervalos.data.push( interval )
	intervalos.id++
}}
window.gameScreen = () => {
	let screen = {}
	let width = window.innerWidth
	let height = window.innerHeight
	if(width > height ){
		screen.width = height 
		screen.height = height - 64
	}else {
		screen.width = width - 12
		screen.height = width
	}
	return screen
}
let cell = gameScreen().width / 100

let movimientos = {}

class Movimiento {
	static centrar( etiqueta , nombreMovimiento ){
		etiqueta.style.left = '0px'
		etiqueta.style.top = '0px'
		etiqueta.classList.add('animar')

		etiqueta.style.transform = movimientos[nombreMovimiento]
	}
	static activar( etiqueta , nombreMovimiento ){
		etiqueta.style.left = '0px'
		etiqueta.style.top = '0px'
		etiqueta.classList.add('animar')
		if( typeof movimientos[nombreMovimiento]['animar'] == 'function')
			return movimientos[nombreMovimiento].animar( etiqueta )
		etiqueta.style.transform = movimientos[nombreMovimiento].animation
	}
	static aplicarGravedad( etiqueta , acciones , objeto ){
		let interval = setInterval(()=>{
			if(juego.state == 'pause') return 0
			if(juego.state == 'stopped') return clearInterval( interval )
			if(!objeto.etiqueta) return clearInterval( interval )
			
			let [x , y] = etiqueta.style.transform.split('translate(')[1].split(')')[0].split(',')
			y = +y.replace('px','')
			if( y < gameScreen().height ){
				etiqueta.style.transform = `translate(${ x }, ${(y + 3)}px)`
				if(acciones) {
					if(acciones['colision']) acciones['colision']( objeto , Juego.colisiones( objeto ) )
				}
				return 0
			}
			if(acciones) {
				try {				
					if(acciones['tocarPiso']) acciones['tocarPiso']( objeto )
				} catch (error) {
					console.log( error )
				}
			}
			clearInterval( interval )
		}, acciones['velocidad'] || 100 ) 
		intervalos.push( () => clearInterval( interval ) )
	}
	static crear( nombreMovimiento , efecto , animar ){
		let animation = ''
		let description = {}
		if( efecto['x'] != undefined && efecto['y'] != undefined ) {
			animation += ` translate(${(efecto.x * cell) + 1}px, ${(efecto.y * cell) + 1}px) `
			description.x = (efecto.x * cell) + 1
			description.y = (efecto.y * cell) + 1
		}
		if( efecto['rotar'] ) {
			animation += ` rotate(${efecto['rotar']}deg) `
			description.rotate = efecto.rotate  
		}
		if( efecto['escala'] ) {
			animation += ` scale(${efecto['escala']}) `
			description.scale = efecto.scale 
		}
		
		movimientos[nombreMovimiento] = {animation , description , animar: animar || null }
	}
}

Movimiento.crear('centrar', {x:50 , y:50} , etiqueta => {
	etiqueta.style.transform = `translate(${ movimientos.centrar.description.x - (etiqueta.offsetWidth / 2) }px, ${ movimientos.centrar.description.y - (etiqueta.offsetHeight / 2)}px)`
})

class Componente extends Movimiento{
	instalar( etiqueta ){
		if(typeof etiqueta == 'string') {		
			this.etiqueta = document.querySelector('#'+etiqueta)
		} else {		
			this.etiqueta = etiqueta
		}
		return this
	}
	imagen( url ){
		let img = this.etiqueta.style.background.split('url(')[1].split(')')[0]
		this.etiqueta.style.background = this.etiqueta.style.background.replace(img , url)
	}
	mostrar(){
		Componente.mostrar(this.etiqueta)
		return this
	}
	ocultar(){
		Componente.ocultar(this.etiqueta)
		return this
	}
	eliminar(){
		Componente.eliminar(this.etiqueta)
		delete this.etiqueta
	}
	mostrarOcultar(){
		Componente.mostrarOcultar(this.etiqueta)
		return this
	}
	usarMovimiento( name , action ){
		if( movimientos[name] != undefined )
			return Movimiento.activar(this.etiqueta  , name )
		Movimiento[name](this.etiqueta , action , this)
		return this
	}
	moverA({ x , y }){
		let transform = this.etiqueta.style.transform
		let start = transform.split('translate(')
		let end = ''
		if( start.length > 1){
			let length = transform.split('translate(')[1].split(')')[0].length
			end = transform.split('translate(')[1].slice(length + 1 , )
		}
		this.etiqueta.style.transform = start[0] + end + `translate(${parseInt(x * cell) + 1}px, ${parseInt(y * cell) + 1}px)`
		return this
	}
	rotar(grados){
		let transform = this.etiqueta.style.transform
		let start = transform.split('rotate(')
		let end = ''
		if(start.length > 1){
			let length = transform.split('rotate(')[1].split(')')[0].length
			end = transform.split('rotate(')[1].slice(length + 1 , )
		}
		this.etiqueta.style.transform = start[0] + end +  `rotate(${grados}deg)`
		return this
	}
	escalar(grados){
		let transform = this.etiqueta.style.transform
		let start = transform.split('scale(')
		let end = ''
		if(start.length > 1){
			let length = transform.split('scale(')[1].split(')')[0].length
			end = transform.split('scale(')[1].slice(length + 1 , )
		}
		this.etiqueta.style.transform = start[0] + end +  `scale(${grados})`
		return this
	}
	evento( name , fn ){
		if(this.etiqueta){
			this.etiqueta['on'+name] = event => {
				fn( this , event )
			} 
		}
		return this
	}
	colorear( color ){
		this.etiqueta.style.backgroundColor = color
		return this
	}
	personalizado( custom ){
		if(custom['clases']) this.etiqueta.className += ' '+custom.clases+' '
		if(custom['estilos']) this.etiqueta.style += ';'+custom.estilos+';'
		return this
	}
	colorearTexto( color ){
		this.etiqueta.style.color = color
		return this
	}
	asignarClases( clases ){
		for(let clase of clases.split(' ')){
			this.etiqueta.classList.add(clase)
		}
		return this
	}
	static eliminar(etiqueta){
		if(etiqueta) etiqueta.remove()
	}
	static mostrar( etiqueta ){
		etiqueta.classList.remove('oculto')
	}
	static ocultar( etiqueta ){
		etiqueta.classList.add('oculto')
	}
	static mostrarOcultar( etiqueta ){
		etiqueta.classList.toggle('oculto')
	}
}
class Info{
	constructor( type , title , value , actualizacion ){
		this.type = type
		let etiqueta = document.createElement('div')
		this.actualizacion = actualizacion
		etiqueta.innerHTML = `<b style="text-shadow:1px 1px #fff">${title} </b> `
		let classType = {
			puntos(){
				let points = document.createElement('span')
				points.innerHTML = value
				etiqueta.appendChild(points)
				return points
			},
			barra(){
				let bar = document.createElement('div')
				let container = document.createElement('div')
				bar.className = 'bg-success'
				bar.style = 'min-height:10px;transition: .5s all;width:'+value+'%'
				container.style = 'margin-top:-9px;border:1px #aaa solid;width:100px;min-height:10px'
				container.appendChild(bar)
				etiqueta.appendChild(container)
				return bar
			}
		}
		this.etiquetaValue = classType[type]()
		this.etiqueta = etiqueta
		document.querySelector('#info-container').appendChild(this.etiqueta)
	}
	eliminar(){
		if(this.etiqueta) this.etiqueta.remove()
	}
	static insertar( type , title , value , actualizacion ){
		juego.keys.push( title )
		juego[title] = new Info( type , title , value , actualizacion )
	}
	incrementar( cantidad ){
		if(this.type == 'puntos'){
			let points = +this.etiquetaValue.innerHTML + +cantidad
			this.etiquetaValue.innerHTML = points
			if(this.actualizacion) this.actualizacion( points )
			return points
		}
		if(this.type == 'barra'){
			let points = (+this.etiquetaValue.style.width.replace('%','') + +cantidad)
			points = points > 100 ? 100 : points
			points = points < 0 ? 0 : points
			this.etiquetaValue.style.width = points+'%'
			if(this.actualizacion) this.actualizacion( points )
			return points
		}
	}
	reducir( cantidad ){
		if(this.type == 'puntos'){
			let points = +this.etiquetaValue.innerHTML - +cantidad
			this.etiquetaValue.innerHTML = points
			if(this.actualizacion) this.actualizacion( points )
			return this.etiquetaValue.innerHTML
		}
		if(this.type == 'barra'){
			let points = (+this.etiquetaValue.style.width.replace('%','') - +cantidad)
			points = points < 0 ? 0 : points
			this.etiquetaValue.style.width =  points +'%'
			if(this.actualizacion) this.actualizacion( points )
			return points
		}
	}
}

function esperar( fn , seconds ){
	setTimeout(fn, seconds * 1000)
}

function repetirCada( fn , seconds ){
	let interval = setInterval(()=> {
		if(juego.state == 'pause') 
			return 0
		if(juego.state == 'stopped') 
			return clearInterval( interval )
		fn( interval )
	}, seconds * 1000)
	intervalos.push( () => clearInterval( interval ) ) 
	return interval
}

function detenerRepeticion( x ){
	clearInterval( x )
}

class Juego{
	static fin( mensaje ){
		alert(mensaje)
		reset()
		return 0
	}
	static colisiones(){

	}
	static eliminar( objeto ){
		if(objeto) objeto.remove()
	}
	static repetirCada( fn , seconds ){
		repetirCada( fn , seconds )
	}
	static insertar( data ){
		let ima = document.createElement('img')
		ima.src = data.url
		ima.style='z-index:-1;width:100px;height:auto;opacity:0;position:absolute'
		ima.onload = e => {
			let rel = ima.offsetHeight / 100
			imagen.style.height = (cell * data.ancho * rel) + 'px'
			ima.remove()
		}
		let imagen = document.createElement('div')
		imagen.id = data.id
		imagen.className = 'position-absolute ' 
		if(data['customClass'])
			imagen.className += data['customClass']
		if(data['option']){
			imagen.classList.add('item-option') 
		}
		imagen.style.left = '0px'
		imagen.style.top = '0px'
		imagen.style.background = `url(${data.url})`
		imagen.style.backgroundSize = 'contain'
		imagen.style.backgroundRepeat = 'no-repeat'
		imagen.style.transition = 'all 1s ease'
		imagen.style.width = (cell * data.ancho) + 'px'
		game.appendChild(imagen)
		juego.keys.push(data.id)
		juego[data.id] = new ComponenteEtiqueta
		juego[data.id].instalar( imagen )
		juego[data.id].etiqueta = imagen
		juego[data.id].descripcion = data['descripcion'] || ''
		juego[data.id].usar = data['usar'] || ''
		juego[data.id].etiqueta.setAttribute('name' , data.id )
		juego[data.id].moverA( {x:data.x , y:data.y} )
		juego[data.id].url = data.url
		document.body.appendChild(ima)
		return juego[data.id]
	}
	static iniciar(){
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
		if( window['iniciarJuego'] != undefined ) {
			iniciarJuego()
		}
	}
}
class Mochila {
	constructor() {
		this.items = [];
		Movimiento.crear('mochila-guardar', {
			x: 3, 
			y: 90,
			escala:.2
		})
		this.mochila = document.createElement('div')
		this.mochila.id = 'mochila'
		this.eventos = {}
		this.mochila.className = 'animate__animated rounded-2 '
		document.body.appendChild(this.mochila)
		this.cerrar()
		let close = document.createElement('button')
		close.className = 'btn btn-close end-0 position-absolute top-0 m-3'
		close.onclick = () => this.cerrar()
		this.mochila.appendChild(close)

		let mochilaImage = document.createElement('div')
		mochilaImage.style = 'background-image: url("./images/mochila.png");background-size: contain;background-clip: padding-box;width:80px;min-height:80px;max-width:80px'
		mochilaImage.className = 'position-fixed bottom-0 start-0 btn ms-2 mb-3'
		mochilaImage.onclick = () => this.abrirCerrar()
		document.body.appendChild(mochilaImage)
	}
	abrirCerrar(){
		if(this.mochila.classList.contains('abierta')) return this.cerrar()
		this.abrir()
	}
	evento( key , fn ){
		if(!this.eventos[key]) this.eventos[key] = []
		this.eventos[key].push(fn)
	}
	guardar( etiqueta ){
		this.items.push( etiqueta )
		Movimiento.activar(etiqueta , 'mochila-guardar')
		setTimeout(() => {
			etiqueta.classList.add('en-mochila')
			let tooltop = document.createElement('div')
			tooltop.innerHTML = juego[etiqueta.getAttribute('name')].descripcion
			tooltop.style = 'width:180px'
			tooltop.className = 'p-2 position-fixed bg-dark text-white d-none '
			let buttonUsar = document.createElement('button')
			buttonUsar.className = 'w-100 btn btn-primary my-2 btn-sm'
			buttonUsar.textContent = 'Usar'
			buttonUsar.onclick = () => {
				if(juego[etiqueta.getAttribute('name')].usar)
				juego[etiqueta.getAttribute('name')].usar( juego[etiqueta.getAttribute('name')] )
				for(let eventosUsar of this.eventos['usar']){
					eventosUsar( juego[etiqueta.getAttribute('name')] , mochila )
				}
			}
			tooltop.appendChild(buttonUsar) 
			etiqueta.appendChild( tooltop )
			etiqueta.onclick = () => {
				etiqueta.style.zIndex = '1003'
				tooltop.classList.toggle('d-none')
			}
			tooltop.addEventListener('add' , () => {
				etiqueta.style.zIndex = '1001'
				tooltop.classList.add('d-none')
			})

			for(let eventosGuardar of this.eventos['guardar']){
				eventosGuardar( juego[etiqueta.getAttribute('name')] , mochila )
			}
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
		juego.state = 'pause'
		this.mochila.style.maxWidth=(+gameScreen().width - 20) + 'px'
		this.mochila.style.maxHeight=(+gameScreen().height - 20) + 'px'
		this.mochila.classList.remove('oculto')
		this.mochila.classList.remove('animate__fadeOut')
		this.mochila.classList.add('animate__fadeIn')
		if(!this.items.length)	return 0
		let itemWidth = gameScreen().width / 5
		let space = itemWidth / 5
		let row = 0
		let count = 0
		let marginTop = 30
		const renderItem = ( index ) => {
			if(this.items.length == index ) return 0

			if( gameScreen().width < +(100 * count)+100+10 ) {
				row += 1
				count = 0
			}
			let rel = +this.items[index].style.height.replace('px','') / +this.items[index].style.width.replace('px','')
			this.items[index].style.height = (100 * rel) + 'px'
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
function reset(){
	for(let key of juego.keys){
		if(juego[key]?.etiqueta) juego[key].etiqueta.remove()
		delete juego[key]
	}
	juego = {state:'stopped' , keys:[]}
	document.querySelector('#info-container').innerHTML = ''
	game.innerHTML = ''
	for(let key of intervalos.data){
		key()
	}
	intervalos.id = 0
	main()
}
function main(){
	let mode = 'creando'
	juego.state = 'run'
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
		main()
		clearInterval( x )
	}
},100)