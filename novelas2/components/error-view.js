Vue.component('error-view' , {
	props:['error-view'],
	data(){
		return {
		errorText:''
			}
	},
	watch:{
		errorView(v){
			this.errorText = this.parseError(v)
		}
	},
	mounted(){
		const self = this
		document.addEventListener('error' , e => {
			console.log('listen error' , e , self.parseError(e.detail))
			self.errorText = self.parseError(e.detail)
		})
	},
	methods:{
		parseError( error ){
			try {
				if(!error) return ''
				if(error?.error) error = error.error 
				if(error['response']){
					if(error['response'].data['error']) return error['response'].data['error']
					return error['response'].data
				}
				return error.message
			} catch (error) {
				return ''
			}
		}
	},
	template:`
		<div  v-if="errorText" class="position-fixed left-0 top-0 w-100 h-100" style="z-index: 9999;background-color: rgba(0,0,0,0.5);">
			<div class="col-md-6 mx-auto position-absolute bg-danger top-50 start-50 translate-middle rounded-2 p-2 d-flex">
				<div class="w-100 bg-danger text-white">
					<h3 class="py-2">Error</h3>
					<div>{{errorText}}</div>
				</div>
				<button type="button" class="d-block btn btn-close btn-danger" @click="$emit('close');errorText=''"></button>
			</div>
		</div>
	`
})