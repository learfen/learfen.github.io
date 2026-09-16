console.log("## inventario.html importado");
let inventarioSeleccionado = null;
let interacionItems = null;
let precios = {
	piedra: 10,
	madera: 20,
	flor: 8,
};
let inventarios = {};
let dialogInfo = document.getElementById("info");
dialogInfo.abrir = () => {
	dialogInfo.showModal();
	dialogInfo.classList.add("flex");
	dialogInfo.backupEstado = game.estado();
	estado("inventario:info");
};
dialogInfo.cerrar = () => {
	dialogInfo.classList.remove("flex");
	dialogInfo.close();
	estado(dialogInfo.backupEstado);
};
let origenInventarioAbierto = null;
async function usarInventario(user, items) {
	user().inventario = {
		opcionesData: {},
		abrir: (modo) => {
			if (modo) interacionItems = modo;
			// referencia al inventario a la vista
			inventarioSeleccionado = () => user().inventario;
			origenInventarioAbierto = user;
			inventario.estadoPrevio = estado();
			inventario.updateTitle(user().id);
			// actualizamos el estado para que se pausen las cosas
			estado("inventario");
			let primerItem = null;
			// generamos los botones segun el modo
			const mostrarItem = (item, col, row) => {
				let button = document.createElement("button");
				button.classList.add("col-start-" + col, "row-start-" + row);
				button.setAttribute("row", row);
				button.setAttribute("col", col);
				button.objeto = () => item;
				if (!primerItem) primerItem = button;
				let image = document.createElement("img");
				insertarImagenEnNodo(image, item.imagenAlias)
				let text = document.createElement("div");
				text.classList.add("text-xs", "text-center");
				text.innerHTML = item.tipo;
				button.appendChild(image);
				button.appendChild(text);
				//if(modo && modos.hasOwnProperty(modo)) modos[modo](item, button);
				inventario.appendChild(button);
				return button;
			};
			dialogoInventario.style.display = "flex";
			dialogoInventario.classList.add("z-50");
			inventario.innerHTML = "";
			let row = 1;
			let col = 1;
			let cols = inventario.getAttribute("cols");
			for (let item of user().propiedades("items")) {
				if (!item?.uuid) item.uuid = Date.now() + `-${col}x${row}`;
				if (item.eliminado) continue;
				mostrarItem(item, col, row);
				if (col == cols) {
					row += 1;
					col = 1;
				} else {
					col += 1;
				}
			}
			if (inventario.children.length)
				inventario.seleccionar(1, 1, primerItem);

			evento("inventario:abrir", { inventario, ref: user() });
			evento("inventario:abrir:" + user().id, inventario);

			return user();
		},
		agregar(objeto, modoImportar) {
			user().inventario.guardar(objeto, modoImportar);
			return user();
		},
		buscar(selector) {
			// formato id nameId
			// formato tipo @tipos
			let mode = "id";
			if (selector[0] == "@") {
				mode = "tipo";
				selector = selector.replace("@", "");
			}
			let tipos = [];
			for (let item of user().propiedades("items").filter((i) =>
				i.guardado,
			)) {
				if (mode == "id" && item.id == selector) return item;
				if (mode == "tipo" && item.tipo == selector) tipos.push(item);
			}
			if (mode == "tipo" && tipos.length) return tipos;
			return false;
		},
		cerrar() {
			inventario.menu().cerrar();
			dialogoInventario.style.display = "none";
			dialogoInventario.classList.remove("z-50");
			inventario.innerHTML = "";

			evento("inventario:cerrar");

			evento("inventario:cerrar:" + user().id);
			
			estado(inventario.estadoPrevio, 50);
			inventario.menu().opciones = inventario.menu().opcionesDefault;
			return user();
		},
		eliminar(selector) {
			// busca igual que buscar(): "id" o "@tipo"; elimina UN solo item
			let objetivo = null;
			if (typeof selector === "string" && selector[0] === "@") {
				let tipo = selector.replace("@", "");
				for (let i of user().propiedades("items")) {
					if (i.tipo === tipo) { objetivo = i; break; }
				}
			} else {
				let id = typeof selector === "object" ? selector.id : selector;
				objetivo = user().propiedades("items").find((i) => i.id === id);
			}
			if (!objetivo) return user();
			let button = inventario.querySelector(`.focus`);
			if (button) {
				button.remove();
			}
			evento("inventario:eliminar", { objeto: objetivo, ref: user });
			user().propiedades("items", user().propiedades("items").filter((i) => i !== objetivo));
			return user();
		},
		existeTipo(item) {
			return user().propiedades("items").some((i) => i.tipo == item);
		},
		existeId(id) {
			return user().propiedades("items").some((i) => i.id == id);
		},
		guardar(objeto, modoImportar) {
			if (typeof objeto == "string") {
				let id = "";
				if (objeto.search("#") > -1) {
					let aux = objeto.split("#");
					objeto = aux[0];
					id = aux[1];
				}
				// si ya existe el objeto en el destino no lo guardamos
				if (
					id &&
					user().propiedades("items").find((i) => i.id == id) &&
					modoImportar !== true
				)
					return user();

				// guardamos un item por tipo: lo construimos directo, sin pasar por la escena
				// (antes se hacía agregar(1,1,...) y dejaba un objeto fantasma en esa celda)
				let item = {
					id:
						id ||
						objeto +
							`-c-${semilla() ? idFromSeed() : Math.random().toString(36).substr(2, 9)}`,
					tipo: objeto,
					imagenAlias: objeto,
					guardado: true,
					"guardado-en": user().id,
					refInventario: () => user().inventario,
				};
				user().propiedades("items").push(item);
				if (modoImportar !== true)
					evento("inventario:guardar", {
						objeto: item,
						ref: user,
					});
				return user();
			} else {
				// los elementos fantasma (id ya eliminado o guardado en otro
				// inventario) no entran al inventario: solo ensuciarian el cofre
				if (objeto?.eliminado || objeto?.tipo === "fantasma") return user();
				// si ya existe el objeto en el destino no lo guardamos
				if (
					user().propiedades("items").find((i) => i.id == objeto.id) &&
					modoImportar !== true
				)
					return user();

				// items planos (sin metodos, creados con guardar("tipo")):
				// clonamos tal cual, al guardarlos en otro inventario (ej: caja)
				if (typeof objeto.propiedades !== "function") {
					let clon = { ...objeto, "guardado-en": user().id };
					user().propiedades("items").push(clon);
					if (modoImportar !== true)
						evento("inventario:guardar", {
							objeto: clon,
							ref: user,
						});
					return user();
				}
			}

			// para eliminar luego
			let eliminar = () => {
				objeto.eliminar();
			}
			// al importar un item restaurado (ya estaba guardado) NO lo volvemos a sacar del
			// inventario destino: solo se limpia el clon temporal que se creo en la escena.
			// (antes se llamaba a inventario.eliminar y se borraba el item recien guardado)
			if(!modoImportar && objeto.propiedades("guardado")) eliminar = () => {
				user().inventario.eliminar(objeto);
			}
			// marcamos como guardado el objeto
			objeto.guardado(user().id);
			// registramos el id como recogido: al recargar no debe reaparecer en la escena
			// (el id es la identidad del objeto entre escena e inventario)
			if (objeto?.id && datos && !modoImportar) {
				if (!datos.hasOwnProperty("elementos")) datos.elementos = {};
				datos.elementos[objeto.id] = {
					destruido: true,
					escena: escenaActiva().name,
				};
			}
			// clonamos
			let nuevoObjeto = objeto.exportar()

			nuevoObjeto.refInventario = () => user().inventario;
			
			user().propiedades("items").push(nuevoObjeto);

			if (modoImportar !== true)
				evento("inventario:guardar", {
					objeto: nuevoObjeto,
					ref: user,
				});
			
				
			// eliminamos
			eliminar()

			return user();
		},
		importar(objeto) {
			user().inventario.guardar(objeto, true);
			return user();
		},
		items() {
			return user().propiedades("items").filter((i) => i.guardado);
		},
		menu: () => inventario.menu(),
		opciones(selector, opciones) {
			user().inventario.opcionesOriginal = opciones;
			if (selector && opciones === undefined) {
				if (user().inventario.opcionesData[selector] !== undefined)
					return user().inventario.opcionesData[selector];
			}
			if (selector && opciones) {
				if (user().inventario.opcionesData[selector] === undefined) {
					user().inventario.opcionesData[selector] = {};
				}
				for (let key in opciones) {
					if (
						user().inventario.opcionesData[selector][key] ===
						undefined
					) {
						user().inventario.opcionesData[selector][key] = {};
					}
					user().inventario.opcionesData[selector][key] =
						opciones[key];
				}
			}
		},
		usuario(){
			return user();
		}
	};
	try {
		await importarInventario(user, items);
	} catch (error) {}
}
function createDialogInventario(cols, rows) {
	let dialogoInventario = document.createElement("div");
	dialogoInventario.id = "dialog-inventario";

	let openedTitle = document.createElement("div");
	openedTitle.classList.add("my-2");
	dialogoInventario.appendChild(openedTitle);

	let inventario = document.createElement("div");
	inventario.updateTitle = (txt) =>
		(openedTitle.innerHTML = "Inventario de " + txt);
	inventario.setAttribute("cols", cols);
	inventario.setAttribute("rows", rows);
	inventario.classList.add("inventario");
	inventario.id = "inventario";
	dialogoInventario.appendChild(inventario);
	dialogoInventario.abierto = () =>
		dialogoInventario.classList.contains("z-50");
	const menu = {
		nodo: null,
		abierto: false,
		opciones: ["Usar", "Tirar"],
		opcionesDefault: ["Usar", "Tirar"],
		opcionesOriginal: {},
		abrir(opciones) {
			let selected = inventario.querySelector("button.focus");

			menu.abierto = true;

			if (selected) {
				if (!opciones) {
					opciones = menu.opciones;
					const itemOptions =
						player().inventario.opcionesData[
							"@" + selected.objeto().tipo
						];
					if (itemOptions !== undefined) {
						for (let key in itemOptions) {
							opciones.push(key);
						}
					}
				}
				// obtenemos las coordenadas en px
				let x = selected.offsetLeft;
				let y = selected.offsetTop;
				let w = selected.offsetWidth;
				let h = selected.offsetHeight;
				let w2 = w / 2;
				let h2 = h / 2;
				let x2 = x + w2;
				let y2 = y + h2;
				// abrimos un pequeño dialogo con las opciones disponibles
				menu.nodo = document.createElement("div");
				menu.nodo.classList.add(
					"inventario-menu-item"
				);
                
                menu.nodo.style.left = x2 + "px";
                menu.nodo.style.top = y2 + "px";
				let options = [...opciones];
				if (selected.objeto()?.info) options.push("Info");
				let textos = [];
				for (let opcion of options) {
					if (textos.indexOf(opcion) > -1) continue;
					textos.push(opcion);
					let button = document.createElement("button");
					button.innerHTML = opcion;
					menu.nodo.appendChild(button);
				}
				menu.nodo.children[0].classList.add("focus");
				inventario.appendChild(menu.nodo);
				estado("inventario:menu", 500);
                esperarY(0.55, () => 
                    inventarioOpcionSeleccionada = () => menu.nodo.querySelector("button.focus").innerText
                )
			}
		},
		async cerrar() {
			menu.abierto = false;
			if (menu.nodo) {
				menu.nodo.remove();
				menu.nodo = null;
			}
			estado("inventario:menu:cerrar");
			esperar(0.2);
			estado("inventario");
		},
	};
	document.querySelector("#app").appendChild(dialogoInventario);
	// estado
	inventario.filaFocus = 1;
	inventario.columnaFocus = 1;
	inventario.seleccionar = (col, row, selected) => {
		if (!selected) selected = inventario.querySelector("button.focus");
		if (selected) selected.classList.remove("focus");
		let button = inventario.querySelector(`[col="${col}"][row="${row}"]`);
		if (button) {
			button.classList.add("focus");
			button.focus();
			selected = button;
			inventario.filaFocus = row;
			inventario.columnaFocus = col;
		}
		inventarioItemSeleccionado = () => selected.objeto();
	};
	inventario.menu = () => menu;
	return { dialogoInventario, inventario };
}

let inventarioItemSeleccionado = null;
let inventarioOpcionSeleccionada = null;
let { dialogoInventario, inventario } = createDialogInventario(4, 4);

let inventarioImportado = false;
function importarInventario(user, items) {
	inventarioImportado = true;
	if (!datos) return {};
	// importacion sincrona: los items guardados ya traen su imagen en data-url,
	// asi el inventario queda listo antes de que el nivel lo consulte
	for (let item of items) {
		if (!item?.tipo) continue;
		// el guardado de esta visita ya lo agrego: no duplicar
		if (user().propiedades("items").some((i) => i.id === item.id)) continue;
		let itemNew = escenaActiva().crearObjeto(0, 0, item.tipo, item.id, { tipo: item.tipo, resucitar: true });
		for (let key in item) {
			if (typeof itemNew[key] == "function") {
				itemNew[key](item[key]);
			} else itemNew[key] = item[key];
		}
		// restauramos las propiedades custom del item guardado (imanes, interacciones, etc.)
		const props = item.props || item.propiedades;
		if (props) {
			for (let key in props) {
				if (["id","x","y","z","tipo","imagenAlias","url","imagen","guardado-en","refInventario","items"].includes(key)) continue;
				if (typeof props[key] === "function") continue;
				if (typeof itemNew.propiedades == "function") {
					itemNew.propiedades(key, props[key]);
				}
			}
		}
		user().inventario.importar(itemNew);
	}
}


// si esta abierto el inventario
escuchar("a", () => inventario.menu().abrir(), "inventario");

escuchar(
	"a",
	async () => {
		let objeto = inventarioItemSeleccionado();
        if(typeof inventarioOpcionSeleccionada !== "function") return ;

        const opcion = inventarioOpcionSeleccionada();
        if(!opcion) return ;

		// enviamos al receptor el objeto y que este lo maneje
		let objetoInteraccion = player().mirandoObjeto();
		if(Array.isArray(objetoInteraccion) && objetoInteraccion.length > 0) objetoInteraccion = objetoInteraccion[0];
		console.log({opcionesData:player().inventario?.opcionesData})
		if (
			player().inventario?.opcionesData.hasOwnProperty(
				"@" + objeto.tipo,
			)
		) {
            
            if(typeof player().inventario.opcionesData["@" + objeto.tipo][opcion] === "function"){
                player().inventario.opcionesData["@" + objeto.tipo][opcion](
					objetoInteraccion,
					objeto
                );
            }
        }

    
		if (opcion == "Info") {
			if (objeto?.info) {
				if (!Array.isArray(objeto.info)) objeto.info = [objeto.info];
				let data = "";
				for (let info of objeto.info) {
					if (info.split(" ").length === 1) {
						// revisaremos si no existe una imagen con este alias
                        if(imagenesImportadasData[info]){
                            let img = document.createElement("img");							
							insertarImagenEnNodo(img, info)
                            img.style.display = "block";
                            dialogInfo.children[0].children[0].appendChild(img)
                        }else{
                            let x = setInterval(() => {
                                if(imagenesImportadasData[info]){
                                    data += `<img style="display:block;" src="${imagenesImportadasData[info]}">`;
                                    clearInterval(x);
                                }
                            },10)
                        }
					} else data += `<p>${info}</p>`;
				}
				dialogInfo.children[0].children[0].innerHTML = data;
				return dialogInfo.abrir();
			} else {
				return ayuda("No tiene informacion disponible", 3000);
			}
		}
		if (opcion == "Tirar") {
			console.log('Tirar ejecutando')
			// obtenemos la celda frente al jugador utilizando la funcion mirando para saber hacia donde esta mirando
			let sentido = player().mirando();
			let x = player().x;
			let y = player().y;
			if (sentido === "derecha") x = player().x + 1;
			if (sentido === "izquierda") x = player().x - 1;
			if (sentido === "abajo") y = player().y + 1;
			if (sentido === "arriba") y = player().y - 1;
			// validaremos que sea una celda valida pos > 0 && pos < 19
			if (x < 1 || x > 20 || y < 1 || y > 20) {
				objeto.refInventario().cerrar()
				objeto.refInventario().usuario().decir("No puedes soltarlo aqui", 4);
				return
			}
			
			let celda = escenaActiva().en(x, y, true);
			// validaos que la celda no este ocupada
			if (Array.isArray(celda)) {
				if(celda.length > 0){
					objeto.refInventario().cerrar()
					objeto.refInventario().usuario().decir("Hay un objeto alli, no puedes encimarlos", 4);
					return
				}
			}
			setTimeout(() => {
				//objeto.nodo.style.opacity = "1";
				//objeto.noGuardado();
				
				//objeto["guardado-en"] = null
				//objeto.guardado = false

				//escenaActiva().eliminarObjeto(objeto);
				// al tirar lo materializamos de nuevo en la escena: liberamos el id que quedo marcado como destruido
				if (objeto.id && datos?.elementos && datos.elementos[objeto.id]) {
					delete datos.elementos[objeto.id];
				}
				// el objeto vuelve a poder existir en todos los navegadores
				window.neto?.eliminados?.delete?.(objeto.id);
				window.red?.("ws:restaurar", { id: objeto.id });
				let nuevo = escenaActiva().agregar(x, y, objeto.imagenAlias , objeto);
				nuevo.guardado(false)
				setTimeout(() => {
					// eliminamos el item del inventario
					objeto.refInventario().eliminar(objeto);
					evento("inventario:tirar", {
						objeto: () => nuevo,
						ref: origenInventarioAbierto,
					});
				}, 250)
				
				// falta corregir que se apliquen las funciones como la escala
				guardarEstadoElemento(nuevo);

			}, 400);
			objeto.refInventario().cerrar();
			return objeto;
		}

		if (objetoInteraccion) {
			let option = opcion.toLowerCase();
			if (inventarioSeleccionado()?.opcionesOriginal?.hasOwnProperty("option")) {
				inventarioSeleccionado().opcionesOriginal[option](
					objetoInteraccion,
					objeto,
				);
				return inventarioSeleccionado().menu().cerrar();
			}

			if (inventarioSeleccionado()?.opcionesOriginal?.hasOwnProperty(opcion)) {
				inventarioSeleccionado().opcionesOriginal[opcion](
					objetoInteraccion,
					objeto,
				);
				return inventarioSeleccionado().menu().cerrar();
			}
			if (typeof objetoInteraccion[option] === "function") {
				objetoInteraccion[option](objeto);
				return inventarioSeleccionado().menu().cerrar();
			}
			const opciones = player().inventario.opciones(
				"@" + objetoInteraccion.tipo,
			);
			if (opciones !== undefined) {
				if (typeof opciones[opcion] === "function") {
					opciones[opcion](objetoInteraccion);
					return inventarioSeleccionado().menu().cerrar();
				}

				if (typeof opciones[option] === "function") {
					opciones[option](objetoInteraccion);
					return inventarioSeleccionado().menu().cerrar();
				}
			}
		} else {
            
            inventarioSeleccionado().menu().cerrar();
            
        }
		/*
        if(interacionItems?.origen && interacionItems.origen()[inventarioOpcionSeleccionada().toLowerCase()]){
            interacionItems.origen()[inventarioOpcionSeleccionada().toLowerCase()](objeto, interacionItems.origen())
            if(interacionItems.origen().inventario)
                interacionItems.origen().inventario.menu().cerrar()
        }
        */
	},
	"inventario:menu",
);

// si esta abierto el menu de un item
escuchar(
	"s",
	(ev) => {
		inventarioSeleccionado().cerrar();
		inventarioSeleccionado = null;
		ev.detener();
	},
	"inventario",
);

escuchar(
	"s",
	(ev) => {
		inventario.menu().cerrar();
		ev.detener();
	},
	"inventario:menu",
);

escuchar(
	"s",
	(ev) => {
		dialogInfo.cerrar();
		ev.detener();
	},
	"inventario:info",
);

escuchar(
	["abajo", "arriba"],
	(evento) => {
		let button = inventario.querySelector(
			".inventario-menu-item button.focus",
		);
		if (button) {
			button.classList.remove("focus");
			let select;
			if (evento.evento == "abajo") {
				if (button.nextElementSibling)
					select = button.nextElementSibling;
				else select = button.parentNode.children[0];
			} else {
				if (button.previousElementSibling)
					select = button.previousElementSibling;
				else
					select =
						button.parentNode.children[
							button.parentNode.children.length - 1
						];
			}
			select.classList.add("focus");
			inventarioOpcionSeleccionada = () => select.innerText;
		}
	},
	"inventario:menu",
);

escuchar(
	["arriba", "abajo", "izquierda", "derecha"],
	(evento) => {
		const cols = +inventario.getAttribute("cols");
		const rows = +inventario.getAttribute("rows");
		let selected = inventario.querySelector("button.focus");

		if (!selected) {
			let button = inventario.querySelector("button");
			if (!button) return;
			let row = button.getAttribute("row");
			let col = button.getAttribute("col");
			inventario.seleccionar(col, row, button);
			return;
		}

		let row = +selected.getAttribute("row");
		let col = +selected.getAttribute("col");
		if (evento.evento == "arriba") {
			if (row === 1) row = rows;
			else row -= 1;
		} else if (evento.evento == "abajo") {
			row += 1;
			if (row > rows) row = 1;
		} else if (evento.evento == "izquierda") {
			if (col === 1) col = cols;
			else col -= 1;
		} else if (evento.evento == "derecha") {
			if (col > cols) col = 1;
			else col += 1;
		}
		inventario.seleccionar(col, row, selected);
	},
	"inventario",
);

escuchar("w", async () => {
	if (estado() === "play" || estado() === "inventario") {
		if (!dialogoInventario.abierto()) player().inventario.abrir();
		else player().inventario.cerrar();
	}
});

const actualizarEstadoInventario = (ev) => {
	try {
		guardarEstadoElemento(ev.ref());
	} catch (error) {
		console.log("error al actualizar inventario ", error);
	}
	escribirMemoria();
	return;
	if (ev.ref().id == "player") {
		datos[ev.ref().id].inventario = player()
			.inventario.items()
			.map((i) => ({
				tipo: i.tipo,
				id: i.id,
				url: i.url,
			}));
	} else {
		try {
			datos[ev.ref().id].inventario = ev
				.ref()
				.inventario.items()
				.map((i) => ({
					tipo: i.tipo,
					id: i.id,
					url: i.url,
				}));
		} catch (error) {}
	}
};

escuchar("inventario:guardar", actualizarEstadoInventario);
escuchar("inventario:eliminar", actualizarEstadoInventario);

function convertirEnAlmacen(box, items) {
	if (typeof box !== "function")
		throw new Error(
			"Usa una funcion para convertir en almacen, convertirEnAlmacen(() => elemento)",
		);
	usarInventario(box, items);
	box().almacenar = (item) => {
		box().inventario.guardar(item);
	};
	box().recuperar = (item) => {
		player().inventario.guardar(item);
	};
	try {
		box().interactuar(async () => {
			if (box().hasOwnProperty("abrir")) {
				box().abrir();
				box().abierto = true;
			}

			escucharUnaVez("menu-info:cerrar", () => {
				if (box().hasOwnProperty("cerrar")) {
					esperarY(1, () => {
						box().cerrar();
						box().abierto = false;
					});
				}
			});
			box().info(
				{
					guardar: "Guardar",
					recuperar: "Recuperar",
				},
				"options",
				{
					guardar() {
						player().inventario.menu().opciones = ["guardar"];
						player().inventario.abrir();
					},
					recuperar() {
						box().inventario.menu().opciones = ["recuperar"];
						box().inventario.abrir();
					},
				},
			);
			box().guardar = (item) => {
				box().inventario.guardar(item);
				player().inventario.eliminar(item);
			};
			box().recuperar = (item) => {
				player().inventario.guardar(item);
				box().inventario.eliminar(item);
			};
		}, "play");
	} catch (error) {
		console.log("Error interaccion box");
		console.log(error);
	}
}
