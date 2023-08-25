Vue.component('info', {
	props:['position','text'],
	computed:{
		getPosition(){
			return this.position || 'right'
		}
	},
	template:`
	<div v-if="text" class="vanilla-tooltip top show" v-bind:class="getPosition">
		<span class="vanilla-tooltiptext" v-html="text"></span>
	</div>
	`
})

