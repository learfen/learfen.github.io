
Vue.component('game-sprite', {
	props:['src','countFrame','countRows'],
	data(){
		return {
			interval:null,
			position:0,
			section:0,
			row:0
		}
	},
	computed:{
		backgroundPosition(){
			return `-${this.position * this.section}px ${ 100 * (this.row * (1.75 / this.countRows))}%`
		}
	},
	mounted() {
		this.$refs.image.style.background = 'url(./recursos/image/'+this.src+')'
		setTimeout(()=> this.animateScript() , 300)
	},
	methods:{
		stopAnimate() {
			clearInterval(this.interval);
		},
		animateScript() {
			const intervalTime = 50; 
			const countRows = this.countRows || 1
			const width = this.$refs.image.style.width.replace('px','')
			this.section = width;
			this.$refs.image.style.backgroundSize = `${this.countFrame}00%`
			this.interval = ''
			const nextFrame = () => {
				this.position++
				if ( this.position >= this.countFrame ) {
					this.row++
					if(this.row >= countRows){
						this.row = 0
					}
					this.position = 0 
				}
			};
			this.interval = setInterval( () => nextFrame() , 50 )
		} 
	},
	template: `
		<div ref="image" class="sprite" style="animation:none;transition:none;height:85px;width:70px;background:'';backgroundPosition:0px 0px" :style="'background-position:'+backgroundPosition"></div>
	`
})