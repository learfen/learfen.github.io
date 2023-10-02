class Conversacion {
	constructor( dialogo , mensajes ){
		this.mensajes = mensajes
		this.respuestas = {}
		this.dialogo = dialogo
		this.continuar = null
		this.dialogo.onclick = () => this.hablar()
		
		Movimiento.crear('lanzar-moneda', {
			x: '0px', 
			y: '-300px'
		})
		Movimiento.crear('atrapar-moneda', {
			x: '0px', 
			y: '0px'
		})
	}	
	hablar ( continuar ) {
		if( continuar ) this.continuar = continuar
		if(!this.mensajes[0]) return this.dialogo.remove()
		let message = this.mensajes[0]
		this.mensajes.splice(0 , 1)
		if(typeof message == 'function') 
			message = message()
		this.dialogo.innerText = message
	}
	static lanzarMoneda(){
		moneda.classList.remove('d-none')
		let value = Math.random() < .5
		setTimeout(()=>{
			Movimiento.activar(moneda , 'lanzar-moneda')
			setTimeout(()=>moneda.children[0].classList.add('animado') , 250)
			setTimeout(()=>{
				Movimiento.activar(moneda , 'atrapar-moneda')
				setTimeout(()=> {
					moneda.children[0].classList.add('pausa') 
					if(value){
						moneda.children[0].style = 'transform:rotateX(180deg) !important'
					}else{
						moneda.children[0].style = 'transform:rotateX(0deg) !important'
					}
					setTimeout(() => {
						moneda.classList.add('d-none')
					}, 2000);
				}, 900)

			}, 1000)
		}, 1000)
		return value ? 'cruz' : 'cara'
	}
}