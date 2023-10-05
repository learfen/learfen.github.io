
const mix = total => {
	let d=[];
	while(d.length < total ){
		let n = parseInt(Math.random() * 10)
		if(n < total && d.indexOf(n) == -1) d.push( n )
	}
	if(d.join(',').search('1,2,3,4') > -1) d = mix( total )
	return d 
}

class Puzzle extends ComponenteEtiqueta{
	constructor( id , etiqueta , imagenes , completado , estilos ){
		super()
		this.id = id
		this.instalar(etiqueta)
		this.completado = completado
		this.imagenes = imagenes
		etiqueta.className += estilos ? ` ${estilos}` : ''
	}
	static insertar( { id , imagenes , completado , estilos } ){
		let notes = {}
		let order = mix(imagenes.length)
		let puzzle = document.createElement('div')
		puzzle.className = 'puzzle animate__animated animate__zoomIn'
		let images = document.createElement('div')
		images.className = 'puzzle-images'
		
		/*
		let answer = document.createElement('div')
		answer.className = 'puzzle-answer'
		for(let img of imagenes){
			answer.appendChild(document.createElement('img')).src = img
		}
		document.body.appendChild(answer)
		*/

		for(let i of order){
			notes[ images.children.length ] = i
			let img = document.createElement('div')
			img.setAttribute('name', 'puzzle-image-'+images.children.length )
			img.style = 'background-image:url('+imagenes[i]+')'
			img.className = 'puzzle-image'
			img.setAttribute('draggable','true')
			img.addEventListener('dragstart', ev => ev.dataTransfer.setData("text", ev.target.getAttribute('name')) )
			images.appendChild(img)
		}
		let sockets = document.createElement('div')
		sockets.className = 'puzzle-sockets'
		
		for(let i = 0; i < imagenes.length; i++){
			let socket = document.createElement('div')
			socket.setAttribute('name', 'puzzle-socket-'+i )
			socket.className = 'puzzle-socket'
			socket.addEventListener('dragover', ev => ev.preventDefault())
			socket.addEventListener('drop', ev => {
				ev.preventDefault()
				ev.target.appendChild(puzzle.querySelector('[name='+ev.dataTransfer.getData("text")+']'))
				
				let count = 1
				for(let socket of Array.from(sockets.children)){
					try {
						if(socket.children.length == 1) {
							if(imagenes[count] == String(socket.children[0].style.backgroundImage).split('url(')[1].slice(1 , -2))
								count++
						}
					} catch (error) {
					}
					if(count == imagenes.length) juego[id].completado()
				}
			} )
			sockets.appendChild(socket)
		}

		puzzle.appendChild(images)
		puzzle.appendChild(sockets)
		
		juego[id] = new Puzzle( id , puzzle , imagenes , completado , estilos )
		juego[id].mostrar()
		juego[id].moverA({x:5,y:5})
		game.appendChild(puzzle)
		return juego[id]
	}
}