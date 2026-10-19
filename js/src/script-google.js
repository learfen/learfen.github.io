var GAS_URL =
	"https://script.google.com/macros/s/AKfycbxK10HxoTZ9ftkAVopuPUJWqediU6tVJ3o6H0xojPBl9yks6ikWjG_7MH0shSfckONyBQ/exec";


var domainMedias = "/games/images";
//var domainMedias = "https://api.github.com/repos/learfen/learfen.github.io/contents/games/images";

function tokenActual() {
	const t = localStorage.getItem("token");
	return t && t !== "undefined" ? t : null;
}

async function $fetch(url, options) {
	if (url.search("/api") === -1) {
		return fetch(url, options);
	}
	let aux = url.replace(location.origin, "").split("/api/")[1];
	//console.log({aux})
	let params = aux.split("/");
	//console.log({params})
	let action = "?api=" + params[0];
	let optionsRequest = {
		method: "GET",
		redirect: "follow",
		headers: {
			"Content-Type": "text/plain",
		},
	};
	//console.log({action})
	//console.log({action})

	if (options && options.hasOwnProperty("body")) {
		optionsRequest.method = "POST";
		optionsRequest.body = options.body;
	}

	if (params.length > 1) {
		// eliminamos el primer parametro
		action += "&params=" + params[1];
	}
	
    console.log(action, optionsRequest);
	const token = tokenActual();
	if (token) {
		action += "&token=" + token;
	} else if (!/^(login|register)$/.test(params[0]) && typeof errorRender === "function") {
		// sin token la nube rechaza: avisamos en vez de fallar en silencio
		errorRender("No hay token de sesión: volvé a iniciar sesión");
	}
    
    const urlExec = GAS_URL + action;

    return new Promise(async ( resolve, reject ) => {
        let completed = false;
        setTimeout(() => {
            if (!completed) {
                completed = true;
                errorRender("No se pudo cargar: " + urlExec + " " + JSON.stringify(optionsRequest) )
                console.log(action, optionsRequest);
                reject();
            }
        }, 20*1000)
        let res = await fetch(urlExec, optionsRequest);
        completed = true;
        try {
            resolve( await res.json() );
        } catch (error) {
            try {
                resolve( await res.text() );
            } catch (error) {
                resolve( res );
            }
        }
    })
}

async function getImagesFromGithub() {
	if (typeof localStorage.getItem("images") === "string") {
		return new Promise((resolve) => {
			resolve(JSON.parse(localStorage.getItem("images")));
		});
	}
	let url = domainMedias;

	const options = {
		method: "get",
		headers: {
			"User-Agent": "GoogleAppsScript", // GitHub API requiere que se envíe un User-Agent
		},
		muteHttpExceptions: true,
	};
	console.log("getImagesFromGithub")
	try {

		if(url.search("http") === -1){
			url = domainMedias+"/index.html"
		}
		console.log("medias " , {url})

		let response = await fetch(url+"?d=1", options);
		console.log(response);
		const data = await response.text();
		console.log('images:',data);
		if (response.status === 200) {
			const files = JSON.parse(data);

			// Filtra solo archivos (no carpetas) y opcionalmente por extensiones de imagen
			const validExtensions = [
				".png",
				".jpg",
				".jpeg",
				".gif",
				".webp",
				".svg",
			];

			const result = Array.from( new Set(files
				.filter((file) =>{
					if(typeof file == 'string'){
						return validExtensions.some((ext) =>
							file.toLowerCase().endsWith(ext),
						)
					}else {
						return (file.type === "file" &&
						validExtensions.some((ext) =>
							file.name.toLowerCase().endsWith(ext),
						))
					}
				})
				.map((file) => {
					if(typeof file == 'string') return file
					return file.name
				}).sort() ) );

            // guardamos en localStorage
            localStorage.setItem("images", JSON.stringify(result));

            return result;
		} else {
			console.log("Error al consultar GitHub API: " + data);
			return [];
		}
	} catch (error) {
		console.log("Excepción al consultar GitHub API: " + error.toString());
		return [];
	}
}
