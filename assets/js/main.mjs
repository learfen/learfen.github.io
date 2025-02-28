const tabButtons = document.querySelectorAll("[data-tab]");
const tabContents = document.querySelectorAll(".tab-content");
const inicio = document.querySelector("#inicio");
const buttons = document.querySelector("#buttons");
const titleButtonTab = document.querySelector("#title-button-tab");
// /?post=uuid | /index.html?post=uuid
const indexView = window.location.search.split("=").length === 1;
const year = new Date().getFullYear();
let tabIdOpened = null;
let dataPostsCache = {};
if (indexView) {
	let tabOpened = null;
	document.querySelector("#viewIndex").classList.remove("hidden");
	document.querySelector("#terciario-menu").classList.add("hidden");
	const renderizeForOpen = (event, button) => {
		// Quitar el estado activo si hay alguno activado
		event.target.parentNode.parentNode.querySelector(".bg-transparent")?.classList.remove("bg-transparent");
		// Agregar estado activo
		if (event.target) event.target.classList.add("bg-transparent");
		// ocultar el inicio
		inicio.classList.add("hidden");
		// mostrar los botones generales de todos los niveles [horario,contacto,etc]
		const title = button.innerText.trim();
		if (buttons.classList.contains("hidden") && title != "TERCIARIO") buttons.classList.remove("hidden");
		if (title == "TERCIARIO") {
			buttons.classList.add("hidden");
			document.querySelector("#terciario-menu").classList.remove("hidden");
		}
		// cambiar el titulo de la seccion abierta
		titleButtonTab.innerHTML = `<div class="py-4">${title}</div>`;
		// Activar el botón clickeado y mostrar su contenido
		button.classList.add("bg-red-500", "text-white");
	};
	const renderizeForClose = (event, button) => {
		inicio.classList.remove("hidden");
		buttons.classList.add("hidden");
		tabOpened = null;
		titleButtonTab.innerHTML = "";
		event.target.classList.remove("bg-transparent");
	};
	const buttonTab = (event, button) => {
		// Quitar el estado activo de todos los botones
		tabButtons.forEach((btn) => btn.classList.remove("bg-red-500", "text-white"));
		// Ocultar todo el contenido de los tabs
		tabContents.forEach((content) => content.classList.add("hidden"));
		// si tocamos el tab abierto, abrimos el inicio
		if (tabOpened == button) {
			renderizeForClose(event, button);
			openTab("inicio");
			return;
		}
		const tabId = button.getAttribute("data-tab");
		renderizeForOpen(event, button);
		openTab(tabId);
		document.getElementById(event.target.parentNode.parentNode.id == "terciario-menu" ? "terciario" : tabId).classList.remove("hidden");
		tabOpened = button;
	};
	tabButtons.forEach((button) => {
		button.children[0].addEventListener("click", (event) => buttonTab(event, button));
		button.children[0].addEventListener("touch", (event) => buttonTab(event, button));
	});
	//tabButtons[0].click();

	window.onload = () => {
		openTab("inicio");
	};
} else {
	const queries = window.location.search.split("?")[1];
	queries.split("&").forEach((query) => {
		const [key, value] = query.split("=");
		if (key == "post") openPost(value);
	});
}

function formatearFecha(fechaString) {
	let d = fechaString.split(" ")[0].split("/").reverse().join("-");
	const fecha = new Date(d);
	const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
	const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

	const diaSemana = diasSemana[fecha.getDay()];
	const dia = fecha.getDate();
	const mes = meses[fecha.getMonth()];

	return `${diaSemana} ${dia} de ${mes}`;
}

function openTab(tabName) {
	tabIdOpened = tabName;
	const urls = {
		inicio: { route: "/posts/index.json", nodeRender: "#inicio" },
		"nivel-inicial": { route: "/posts/Nivel inicial/" + year + ".json", nodeRender: "#nivel-inicial" },
		primaria: { route: "/posts/Primaria/" + year + ".json", nodeRender: "#primaria" },
		secundaria: { route: "/posts/Secundaria/" + year + ".json", nodeRender: "#secundaria" },
		terciario: { route: "/posts/Terciario/" + year + ".json", nodeRender: "#terciario" },
		profInformatica: { route: "/posts/Terciario/" + year + ".json", filterByGrade:true, nodeRender: "#terciario" },
		profBiologia: { route: "/posts/Terciario/" + year + ".json", filterByGrade:true, nodeRender: "#terciario" },
		profEducFisica: { route: "/posts/Terciario/" + year + ".json", filterByGrade:true, nodeRender: "#terciario" },
		enfermeria: { route: "/posts/Terciario/" + year + ".json", filterByGrade:true, nodeRender: "#terciario" },
		obstetricia: { route: "/posts/Terciario/" + year + ".json", filterByGrade:true, nodeRender: "#terciario" },
	};
	document.querySelector(urls[tabIdOpened].nodeRender).classList.remove("hidden");
	const setDataPosts = async (data) => {
		if (!tabIdOpened) {
			document.querySelector(urls[tabIdOpened].nodeRender).children[0].innerHTML = "";
		}

		document.querySelector(urls[tabName].nodeRender).children[0].innerHTML = "";

		let answers = (Array.isArray(data) ? data : Object.values(data)).map((answerUser) => {
			let answerItem = {
				Creado: formatearFecha(answerUser.created),
			};
			for (let key in answerUser) {
				answerItem[key] = answerUser[key];
			}
			return answerItem;
		});

		if(urls[tabName].filterByGrade) answers = answers.filter((item) => item.grade == tabName);
		postRender(urls[tabName].nodeRender, answers);
	};
	if (dataPostsCache[urls[tabName].route]) setDataPosts(dataPostsCache[urls[tabName].route]);
	else {
		fetch(urls[tabName].route)
			.then(async (res) => {
				const data = await res.json();
				// guardamos esta peticion para no repetirla
				dataPostsCache[urls[tabName].route] = data;
				setDataPosts(data);
			})
			.catch((err) => {
				console.log(err);
				alert("No fue posible recuperar los datos intentelo más tarde");
			});
	}
}

function postRender(nodeRenderSelector, items) {
	const nodeRender = document.querySelector(nodeRenderSelector);
	for (let item of items) {
		item.medias = ""
		// template de post
		let t = document.querySelector("#post-template");
		const template = document.querySelector("#post-template").children[0].cloneNode(true);
		template.id = "";
		let imgs = item.files.filter( i => i.split('.').pop() != 'mp4')
		let videos = item.files.filter( i => i.split('.').pop() == 'mp4')
		if(imgs.length || videos.length)
			item.medias = `${imgs.length ? `${imgs.length} imagenes` : ""} ${videos.length ? `${videos.length} videos` : ""}`;
		template.querySelector("[name=title]").innerHTML = item["title"];
		template.querySelector("[name=text]").innerHTML = item["text"].split('.')[0].length > 120 ?  item["text"].slice(0, 120) : item["text"].split('.')[0] + "...";
		const link = template.querySelector("[name=link]");
		link.href = "/?post=" + item.level + "/" + item.uuid;
		let mediaType = item["cover"].split(".")[1] == "mp4" ? "video" : "image";
		if (mediaType == "image")
			template.querySelector(
				"[name=portada]"
			).innerHTML = `<img loading="lazy" class="h-auto w-full relative md:absolute start-50 end-50 top-50 bottom-50 block mx-auto md:max-h-none max-w-full md:max-w-none md:w-full md:h-auto md:min-w-full md:min-h-full rounded-t-lg bg-black" src="/posts/${item.level}/${item.uuid}/${item.cover}" alt="${item["Titulo"]}" />`;
		else
			template.querySelector(
				"[name=portada]"
			).innerHTML = `<video loading="lazy" class=" absolute start-50 end-50 top-50 bottom-50 block mx-auto h-[240px] w-auto rounded-t-lg bg-black" src="/posts/${item.level}/${item.uuid}/${item.cover}" controls></video>`;
		// template de tag
		const tagTemplate = template.querySelector("[name=tag]").cloneNode(true);

		// borramos los tags de ejemplo
		const tags = template.querySelector("[name=tags]");
		tags.innerHTML = "";

		// insertamos los tags
		const getTag = (str) => {
			const itemTemplate = tagTemplate.cloneNode();
			itemTemplate.innerHTML = str;
			return itemTemplate;
		};
		for (let tag of ["created", "type", "level","medias"]) {
			if(!item[tag]) continue
			if (item[tag].search(",") > -1) {
				item[tag].split(",").map((s) => tags.appendChild(getTag(s.trim())));
			} else {
				tags.appendChild(getTag(item[tag] || item[tag][0]?.fileId));
			}
		}
		// insertamos el post
		nodeRender.children[0].appendChild(template);
	}
}

function parseBody(string) {
	let newString = string.split("\\n\\n\\n\\n").join("\\n").split("\\n").join("<br>").split("\\t").join("    ").split("\\x3C").join("<");
	return newString;
}

function openPost(uuid) {
	document.querySelector("#viewIndex").classList.add("hidden");
	document.querySelector("#viewPost").classList.remove("hidden");
	// archivo con meta data
	fetch(`/posts/${uuid}/index.html`).then(async (res) => {
		const data = await res.text();
		let title = data.split('title" content="')[1].split('"')[0];
		let text = data.split('description" content="')[1].split('"')[0];
		let sources = ""
		if(data.split('sources" content="').length > 1)
			sources = data.split('sources" content="')[1].split('"')[0];
		document.querySelector("#post-title").innerHTML = title;
		document.querySelector("#post-text").innerHTML = text;
		if(sources)
			document.querySelector("#post-sources").innerHTML = sources.split(',').map((item) => {
				if(item.split('.').pop() == 'mp4')	return `<video class="md:h-[240px] w-full h-auto block" controls src="/posts/${uuid}/${item}">${item}</video>`
				return `<img class="md:h-[240px] w-full h-auto block" src="/posts/${uuid}/${item}">`
			}).join('');	
	});
	// archivo con el cuerpo
	fetch(`/posts/${uuid}/body.html`).then(async (res) => {
		const data = await res.text();
		if (data.search("File not found") > -1) return;
		document.querySelector("#post-body").innerHTML = parseBody(data);
		let tables = document.querySelectorAll("#post-body table");
		console.log(data)
		for (let table of tables) {
			const div = document.createElement("div");
			div.classList.add("overflow-x-auto");
			div.innerHTML = table.outerHTML;
			table.outerHTML = div.outerHTML;

			document.querySelectorAll("#post-body h1,#post-body h2,#post-body h3").forEach((head) => {
				head.innerText = head.innerText;
			});
			document.querySelectorAll("#post-body td").forEach((td) => {
				td.classList.add("min-w-[30ch]");
				td.classList.add("md:min-w-0");
			});
			document.querySelector("#post-body").addEventListener("click", (event) => {
				if (event.target.tagName == "TD") {
					let select = document.querySelector("#post-body tr.selected");
					if (select) {
						select.classList.remove("bg-gray-100");
						select.classList.remove("selected");
					}
					event.target.parentNode.classList.toggle("bg-gray-100");
					event.target.parentNode.classList.toggle("selected");
				}
			});
		}
	});
}

function slider() {
	const slider = document.querySelector(".slider");
	const images = slider.querySelectorAll("img");
	let currentIndex = 1;

	// Función para cambiar de imagen
	function showNextImage() {
		// Ocultar la imagen actual con una animación de salida
		if (!images[currentIndex]) {
			// mostramos el primero
			images[0].classList.remove("hidden");
			// ocultamos el ultimo que es igual que el primero

			for (let index in Object.keys(images)) {
				if (index == 0) continue;
				console.log({ index });
				images[index].classList.add("hidden");
				images[index].classList.remove("animate__fadeInRight");
			}

			currentIndex = 1;
			return;
		}
		const currentImage = images[currentIndex];
		currentImage.classList.remove("hidden");
		currentImage.classList.add("animate__fadeInRight");
		currentIndex++;
	}

	// Cambiar de imagen cada 4 segundos
	setInterval(showNextImage, 4000);
	showNextImage();
}
slider();

document.querySelector('dialog').addEventListener("click", (e) => {
	if (e.target.tagName == "DIALOG") {
		e.target.classList.add("animate__fadeOut");
		let iframe = e.target.querySelector("iframe");
		if (iframe && !iframe.src && iframe.getAttribute("href")) iframe.src = iframe.getAttribute("href");

		setTimeout(() => {
			e.target.classList.remove("animate__fadeOut");
			e.target.close("animalNotChosen");
		}, 500);
	}
});


const dialogHTML = document.querySelector("#dialogGlobal")
function dialog(keyData, next){
	if(!keyData) return dialogHTML
	let data = document.querySelector('#'+keyData);
	dialogHTML.children[1].innerHTML = data.innerHTML
	setTimeout(() => {
		next( dialogHTML );
	}, 750)
}

document.addEventListener('click', (event) => {
	if(event.target.href){
		if(event.target.hash.search('dialog') > -1){
			dialog().showModal();
			dialog(event.target.getAttribute('dialog'), (node) => {
				let frame = node.querySelector('iframe[href]')
				if(frame) frame.src = frame.getAttribute('href');
			})
		}
	}
})



function main() {
	let background = document.querySelector("#background")
	const closeBackgrond = (e) => {
		if(background){
			background.classList.add("animate__fadeOut")
			setTimeout(() => background.remove() , 600)
		}
	}
	
	document.querySelector('.fireplace').addEventListener("click", closeBackgrond);
	background.addEventListener("click", closeBackgrond);
	setTimeout(() => { closeBackgrond() }, 1500);
}
window.addEventListener("load", () => {
	main();
});