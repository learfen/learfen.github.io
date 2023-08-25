
Vue.component('game-dialog', {
	props:['visible','x','y','arrow'],
	data(){
		return {
			width:0,
			dialog: null
		}
	},
	watch:{
		
	},
	mounted(){
		this.width = this.$refs.box.offsetWidth
	},
	computed:{
		getX(){
			return this.x - ( this.width * .5 )
		},
		getY(){
			return this.y
		},
		getVisible(){
			return this.visible
		}
	},
	template:`
		<div 
			class="dialog position-absolute animate__animated animate__zoomIn" 
			v-bind:class="arrow"
			ref="box"
			v-if="getVisible"
			:style="{top:getY+'px',left:getX+'px'}"
		>
			<slot />
		</div>
	`,
})