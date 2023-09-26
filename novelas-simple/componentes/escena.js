class Mensaje extends Componente{
	constructor(texto){
		super()
		this.etiqueta = document.createElement('div')
		this.etiqueta.className = 'position-fixed mensaje-caja animate__animated animate__fadeIn'
		this.etiqueta.texto = texto
		this.ocultar()
		game.appendChild(this.etiqueta)
	}
}
class Pregunta extends Componente{
	constructor(pregunta,respuestas,luegoDeResponder,correcta){
        super();
		this.pregunta = pregunta;
		this.correcta = correcta === undefined ? 'x' : correcta 
		this.respuestas = respuestas;
		this.luegoDeResponder = luegoDeResponder
		this.respuestasBoton = []
		this.etiqueta = document.createElement('div')
		this.etiqueta.className = 'position-fixed justify-content-center align-items-center top-0 start-0 pregunta-caja vw-100 vh-100 d-none'
		this.etiqueta.innerHTML = `<div class="animate__animated col-sm-8 col-md-6 col-lg-4 bg-secondary p-3">
			<h2 class="pregunta text-center w-100 text-white">${pregunta}</h2>
			<div class="respuestas"></div>
		</div>
		`
		game.appendChild(this.etiqueta)
	}
	preguntar(){
		this.etiqueta.classList.remove('d-none')
		this.etiqueta.classList.add('d-flex')
		this.etiqueta.children[0].classList.add('animate__zoomIn');

		this.respuestas.forEach((element, index) => {
			let respuesta = document.createElement('button')
			this.respuestasBoton.push( respuesta )

			respuesta.className = 'btn btn-secondary w-100'
			const isImage = string => {
				if(string.split('.').length == 1) return false
				return ['png','jpg','jpeg','webp'].indexOf(string.split('.').pop()) > -1
			}
			respuesta.innerHTML = isImage(element) ? `<img src="${element}" alt="" style="height:150px;width:auto">` : element 
			respuesta.onclick = event => {
				if(this.correcta !== 'x' ){
					this.respuestasBoton.forEach((element, indexKey ) => {
						if(indexKey == this.correcta) element.classList.add('btn-success')
						else element.classList.add('btn-danger')
					})
				}
				setTimeout(() =>{
					this.etiqueta.children[0].classList.remove('animate__zoomIn')
					this.etiqueta.children[0].classList.add('animate__fadeOutLeft')
					setTimeout(()=> {
						this.etiqueta.classList.remove('d-flex')
						this.etiqueta.classList.add('d-none')
						if(this.correcta !== 'x') this.luegoDeResponder(index == this.correcta)
						else this.luegoDeResponder( event.target.innerText )
					}, 1000)
				}, 1500 )
			}
			this.etiqueta.querySelector('.respuestas').appendChild( respuesta )
		});
	}
}