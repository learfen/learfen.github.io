const screen = document.getElementById('screen')
const background = document.getElementById('background')
const dialogs = document.getElementById('dialogs')

dialogs.className = 'h-100'

const voces = {
	'Helena':0 
	, 'Laura':1 
	, 'Pablo':2 
	, 'Alvaro':260 
	, 'Elvira':261 
}

let voices = []
function populateVoiceList() {
	if (typeof speechSynthesis === "undefined") return;
	voices = speechSynthesis.getVoices();
}

populateVoiceList();
if (
	typeof speechSynthesis !== "undefined" &&
	speechSynthesis.onvoiceschanged !== undefined
) {
	speechSynthesis.onvoiceschanged = populateVoiceList;
}


let styleFonts = document.createElement('style')
styleFonts.id = 'styleFonts'
for(let font of fuentes()){
	styleFonts.innerHTML += `
	@font-face {
		font-family: ${font.split('.')[0]};
		src: url(./fonts/${font});
	}
	`
}
document.head.appendChild(styleFonts)

if (!String.prototype.trim) {
    (function() {
        // Make sure we trim BOM and NBSP
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        String.prototype.trim = function() {
            return this.replace(rtrim, '');
        };
    })();
}

let barStateActions = []
let barStateActionsUUID = 0
function usarBarra(title, person , action ){
	barStateActionsUUID++
	let barState = document.createElement('div')
	barState.setAttribute('name' , person.nombre)
	barState.style="height:46px"
	barState.className = 'barState text-white m-1 w-100 p-1 '+title.split(' ').join('-')
	barState.innerHTML = `<small style="margin-top:-10px;float:left" class="bg-primary text-white px-2 rounded-2">${title}</small><div class="bar d-block bg-success text-center p-0 rounded-2 fs-6" style="width:100%;max-width:99%">${person.nombre}</div>`
	document.querySelector('#boxBar').appendChild(barState)
	const id = barStateActionsUUID
	barStateActions.push({
		id,
		action,
		title,
		personNombre:person.nombre,
		barState
	})

	return {
		eliminar(){
			barStateActions = [...barStateActions.filter( i => id != i.id )]
		}
	}
}

function eliminarBarra( person , title ){
	if( title ){
		barStateActions = barStateActions.filter( i => {
			let result = (i.personNombre == person.nombre && i.title == title)
			if(result) i.barState.remove()
			return !result
		}) 
		return 0
	}
	
	barStateActions = barStateActions.filter( i => {
		let result = (i.personNombre == person.nombre)
		if(result) i.barState.remove()
		return !result
	}) 
}

function quitarPersona( person ){
	document.querySelectorAll('#dialogs [name='+person.nombre.split(' ').join('-')+']').remove()
}

function actualizarBarra( title , persona , newState ){
	for(const estado of document.querySelectorAll('.barState.'+title.split(' ').join('-'))){
		if( estado.getAttribute('name') == persona.nombre){
			const bar = estado.children[1]
			const width = (+(bar.style.width.replace('%','')) + newState)
			if(barStateActions[title]) barStateActions[title].action(width , barStateActions[title] )
			bar.style.width = width + '%'
			return 0
		}
	}
}

function fondo( src , config ){
	return new Promise((resolve, reject) => {
		let imgs = ['png','webp','jpg','jijg','gif']
		let ext = src.split('.')[1]
		background.innerHTML = ''
		if(imgs.indexOf(ext) > -1){
			let screen = document.querySelector('#screen')
			screen.style.backgroundImage = `url(./images/${ src })`
			screen.style.backgroundSize = 'cover'
			resolve( true )
		}
		if(ext == 'mp4'){
			let video = document.createElement('video')
			video.src = `./videos/${ src }`
			video.style = 'width:100%'
			document.querySelector('.transition button').addEventListener('click', () => {
				video.play()
			})
			if(config){
				if(config['repeat']) {
					video.loop = true
				}else{
					video.addEventListener('ended', () => {
						resolve( true )
					})
				}
			}
			background.appendChild(video)
		}
	})
}

function crearPersona( name , config ){
	let person = {
		nombre:name,
		image(){
			return './images/' + name
		}
	}
	for(let estado of estadosPersonas()){
		person[estado] = () => {
			document.querySelector('[name='	+ name + ']').src = './images/' + name + '-' + estado
		}
	}
	if(config){
		if(config.voz){
			const voice = voices[voces[config.voz]]
			person.speak = (p) => {
				try {
					const ssu = new SpeechSynthesisUtterance(p);
					ssu.lang = 'es-ES';
					ssu.voice = voice;
					ssu.rate = 0.7
					speechSynthesis.speak(ssu);
				} catch (error) {
					
				}
			}
		}
	}
	return person
}

function fuenteDialogos( name ){
	let styleFonts = document.createElement('style')
	styleFonts.innerHTML += `
	.bubble {
		font-family: ${name};
	}
	`
	document.body.appendChild(styleFonts)
}

async function crearDialogo( emit , recept , text , config ){
	if(window.configDialogo){
		if(!config) config = {}
		for(let key in window.configDialogo){
			if(!config[key]) config[key] = window.configDialogo[key]
		}
	}
	const textAsArray = text.split('@respuestas')
	let dialogText = textAsArray[0]

	let answers = []
	if(textAsArray.length > 1) answers = textAsArray[1]

	dialogText = dialogText
			.split('@receptor')
			.join(recept.nombre)
			.split('@emisor').join(emit.nombre)
	let dialog = document.querySelector('.dialog')
	if(!dialog) {
		dialog = document.createElement('div')
		dialog.className = 'dialog h-100'
		dialog.innerHTML = `
		<div class="dialog__content h-100 d-flex flex-column justify-content-between">
			<div></div>
			<div class="d-flex between">
				<div class="d-flex align-items-start h-50 w-50"  name="${emit.nombre}">
					<div class="dialog__image">
						<img class="w-75" name="${emit.nombre}" src="${emit.image()}" alt="">
					</div>
					<div name="dialog" class="position-absolute bubble bubble-bottom-left">
					</div>
				</div>
				<div class="d-flex w-50"  name="${recept.nombre}">
					<div class="dialog__image d-flex justify-content-end">
						<img class="recept w-75"  name="${recept.nombre}" src="${recept.image()}" alt="">
					</div>
				</div>
			</div>
			<div class="answers d-flex flex-wrap justify-content-end"></div>
		</div>		
		`
		dialogs.appendChild(dialog)
	}
	
	if(emit['speak']) emit['speak'](dialogText)
	
	const writeDialog = () => {
		dialog.querySelector('[name=dialog]').innerHTML = ''
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
	let count = 1
	for(let optionText of answers.split('\n')){
		optionText = optionText.trim()
		if(optionText){
			let option = document.createElement('button')
			option.className = 'w-75 dialog__option animate__animated '
			option.innerHTML = optionText
			if(config){
				if(config['opcionEfectoEntrada']) {
					option.className += config.opcionEfectoEntrada
				}
			}
			option.onclick = () => {
				answerTarget = optionText
				dialog.querySelector('.answers').innerHTML = ''
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
	if(window.configTransicion){
		if(!config) config = {}
		for(let key in window.configTransicion){
			if(!config[key]) config[key] = window.configTransicion[key]
		}
	}
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
					eval('window.escena'+n+' = ' + text.replace('{',`{ 
						dialogs.innerHTML = '' 
						`))
					findEscenes(++n)
				}else {
					escena1()
				}
			})
	} catch (error) {
		
	}
}
findEscenes( 1 )