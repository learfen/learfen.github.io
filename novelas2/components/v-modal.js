$component('v-modal' , {
	props: ['text-button'],
	data() {
		return {
			id: uuidv4()
		}
	},	
	mounted(){
		setTimeout(()=> new bootstrap.Modal( document.getElementById( this.id ) ) , 1000)
	},
	template:`
	<div>
		<button type="button" class="btn btn-primary btn-sm" data-bs-toggle="modal" :data-bs-target="'#'+id">
			{{ textButton }}
		</button>

		<div tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" class="modal fade " :id="id">
			<div class="modal-dialog modal-lg modal-fullscreen-xl-down" >
				<div class="modal-header">
					<button type="button" class="bg-white btn-close me-4" data-bs-dismiss="modal" aria-label="Cerrar">
					</button>
				</div>
				<div class="modal-body bg-white">
					<div class="modal-content p-2 px-3"> <slot /> </div>
				</div>
				
			</div>
		</div>
	</div>
	`
	, css: `
	@media screen and (max-width: 768px) {
		.modal-fullscreen-xl-down .modal-content{
			min-height: 100vh
		}
	}
	`
})