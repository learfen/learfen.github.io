var GAS_URL =
	"https://script.google.com/macros/s/AKfycbzP926MGiMocu2TI7efLjmPvWpjBaOCrOEi3Oq4gZrhMsg4FZ_NrqkOIY1JF4YzvRmA-w/exec";

async function $fetch(url, options) {
	console.log({ url, options });
	if (url.search("/api") === -1) {
		return fetch(url, options);
	}
	let aux = url.replace(location.origin, "").split("/api/")[1];
	console.log({ aux });
	//console.log({aux})
	let params = aux.split("/");
	console.log({ params });
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
	if (
		localStorage.getItem("token") != "undefined" &&
		localStorage.getItem("token")
	) {
		action += "&token=" + localStorage.getItem("token");
	}
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
	let res = await fetch(GAS_URL + action, optionsRequest);
	try {
		return await res.json();
	} catch (error) {
		try {
			return await res.text();
		} catch (error) {
			return res;
		}
	}
}

async function getImagesFromGithub() {
	if (typeof localStorage.getItem("images") === "string") {
		return new Promise((resolve) => {
			resolve(JSON.parse(localStorage.getItem("images")));
		});
	}
	const url =
		"https://api.github.com/repos/learfen/learfen.github.io/contents/games/images";

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
