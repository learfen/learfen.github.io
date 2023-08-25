
let styles = document.querySelector('styles')
window.$component = ( name , data ) => {
	if(!styles){
		styles = document.createElement('style')
		styles.innerHTML = data['css']
		document.body.appendChild(styles)
	}
	if(data['css']){
		styles.innerHTML += data['css']
	}
	return Vue.component( name , data )
}
window.emitError = detail => {
	document.dispatchEvent( new CustomEvent("error", { detail }) )
}
window.uuidv4 = function() {
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
		(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	);
}