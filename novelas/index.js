const screen = document.getElementById('screen')
const background = document.getElementById('background')
const dialogs = document.getElementById('dialogs')

dialogs.className = 'h-100'


let link = document.createElement('style')
for(let font of fuentes()){
	link.innerHTML += `
	@font-face {
		font-family: ${font.split('.')[0]};
		src: url(/fonts/${font});
	}
	`
}
document.head.appendChild(link)

if (!String.prototype.trim) {
    (function() {
        // Make sure we trim BOM and NBSP
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        String.prototype.trim = function() {
            return this.replace(rtrim, '');
        };
    })();
}

function fondo( src , config ){
	let imgs = ['png','webp','jpg','jijg','gif']
	let ext = src.split('.')[1]
	if(imgs.indexOf(ext) > -1){
		let screen = document.querySelector('#screen')
		screen.style.backgroundImage = `url(./images/${ src })`
		screen.style.backgroundSize = 'cover'
	}
	if(ext == 'mp4'){
		let video = document.createElement('video')
		video.src = `./videos/${ src }`
		video.style = 'width:100%'
		document.querySelector('.transition button').addEventListener('click', () => {
			video.play()
		})
		if(config){
			if(config['repeat']) video.loop = true
		}
		background.appendChild(video)
	}
}

function crearPersona( name ){
	let persona = {
		name,
		image(){
			return './images/' + name
		}
	}
	for(let estado of estadosPersonas()){
		persona[estado] = () => {
			document.querySelector('[name='	+ name + ']').src = './images/' + name + '-' + estado
		}
	}
	return persona
}

async function crearDialogo( emit , recept , text , config ){
	const textAsArray = text.split('@respuestas')
	let dialogText = textAsArray[0]
	let answers = []
	if(textAsArray.length > 1) answers = textAsArray[1]

	dialogText = dialogText
			.split('@receptor')
			.join(recept.name)
			.split('@emisor').join(emit.name)
	let dialog = document.querySelector('.dialog')
	if( !dialog ){
		dialog = document.createElement('div')
		dialog.className = 'dialog h-100'
		dialog.innerHTML = `
		<div class="dialog__content h-75 d-flex flex-column justify-content-between">
			<div></div>
			<div class="d-flex between">
				<div class="d-flex align-items-start h-50 w-50">
					<div class="dialog__image">
						<img class="w-75" name="${emit.name}" src="${emit.image()}" alt="">
					</div>
					<div name="dialog" class="position-absolute bubble bubble-bottom-left">
					</div>
				</div>
				<div class="d-flex w-50">
					<div class="dialog__image d-flex justify-content-end">
						<img class="recept w-75"  name="${recept.name}" src="${recept.image()}" alt="">
					</div>
				</div>
			</div>
			<div class="answers d-flex flex-wrap justify-content-end"></div>
		</div>		
		`
		dialogs.appendChild(dialog)
	}
	
	dialog.querySelector('[name=dialog]').innerHTML = ''
	const writeDialog = () => {
		return new Promise((resolve, reject) => {
			const nextLetter = index => {
				if(index >= dialogText.length) return resolve(true)
				dialog.querySelector('[name=dialog]').innerHTML += dialogText[index]
				setTimeout(()=> nextLetter(index+1), 50)
			}
			nextLetter(0)
		})
	}
	await writeDialog()
	let answerTarget = null	
	dialog.querySelector('.answers').innerHTML = ''
	let count = 0
	for(let optionText of answers.split('\n')){
		optionText = optionText.trim()
		if(optionText){
			let option = document.createElement('button')
			option.className = 'btn w-50 dialog__option animate__animated '
			option.innerHTML = optionText
			if(config){
				if(config['opcionEfectoEntrada']) {
					option.className += config.opcionEfectoEntrada
				}
			}
			option.onclick = () => {
				answerTarget = optionText
			}
			setTimeout(()=> dialog.querySelector('.answers').appendChild(option) , 500 + (count * 500))
			count++
		}
	}

	return {
		respuesta(){
			return new Promise((resolve, reject) => {
				let x = setInterval(() => {
					if(answerTarget){
						resolve(answerTarget)
						clearInterval( x )
					}
				}, 100)
			})
		}
	}
}

function crearTransicion( text , config ){
	return new Promise((resolve, reject) => {
		let transicion = document.createElement('div')
		transicion.className = ' transition animate__animated  '
		if( config['efectoEntrada']) transicion.classList.add(config['efectoEntrada'])
		
		let textNode = document.createElement('h3')
		textNode.innerHTML = text
		// config text
		if(config){			
			if(config['texto']) textNode.className = 'animate__animated '+config.texto
			if(config['textoCss']) textNode.style = config.textoCss
		}
		transicion.appendChild( textNode )

		const transitionClose = () => {
			if(config){
				if(config['efectoSalida'])
					transicion.classList.add(config.efectoSalida)
				else
					transicion.classList.add('transparent')
			}else{
				transicion.classList.add('transparent')
			}
			setTimeout(() => {
				transicion.classList.add('hidden')
				transicion.remove()
				resolve(true)
			}, 1000)
		}
		document.body.appendChild(transicion)
		if(config){
			if(config['fondo']) {
				transicion.style = 'background-image: url(./images/' + config['fondo'] + ');background-size: cover;'
			}
			if(config['duracion']) return setTimeout( ()=> transitionClose() , config.duracion)
		}
		
		let next = document.createElement('button')
		next.className = 'next btn btn-primary'
		next.innerHTML = 'Continuar'
		next.addEventListener('click', () => {
			transitionClose()
			resolve( true )
		})
		transicion.appendChild(next)
	})
}

const findEscenes = (n) => {
	try {
		fetch('/escenas/escena'+n+'.js')
			.then(res => res.text())
			.then(text => {
				if(text.search('DOCTYPE') == -1) {
					eval('window.escena'+n+' = ' + text)
					findEscenes(++n)
				}else {
					escena1()
				}
			})
	} catch (error) {
		
	}
}
findEscenes( 1 )