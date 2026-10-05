var GAS_URL =
	"https://script.google.com/macros/s/AKfycbxK10HxoTZ9ftkAVopuPUJWqediU6tVJ3o6H0xojPBl9yks6ikWjG_7MH0shSfckONyBQ/exec";


var domainMedias = "https://api.github.com/repos/learfen/learfen.github.io/contents/games/images";

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
	if (
		localStorage.getItem("token") != "undefined" &&
		localStorage.getItem("token")
	) {
		action += "&token=" + localStorage.getItem("token");
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
	const url = domainMedias;

	const options = {
		method: "get",
		headers: {
			"User-Agent": "GoogleAppsScript", // GitHub API requiere que se envíe un User-Agent
		},
		muteHttpExceptions: true,
	};

	try {
		let response = await fetch(url, options);
		console.log(response);
		const data = await response.text();
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

			const result = files
				.filter(
					(file) =>
						file.type === "file" &&
						validExtensions.some((ext) =>
							file.name.toLowerCase().endsWith(ext),
						),
				)
				.map((file) => file.name);

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
