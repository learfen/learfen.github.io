function crearPuerta(x, y, z, key, config) {
	let imagenAlias = config?.imagen || "puerta";
	let vertical = config?.vertical || false;
	if (!z) z = 0;
	let puerta = escenaActiva().agregar(x, y, imagenAlias, undefined, {
		...config,
		z,
		w: 1,
		h: vertical ? 3 : 2,
		d: 1,
		solido: true,
		tipo: "puerta",
		cubo: false,
		repetir:false,
		pausado:true
	}).solido().animar().escala(1.1)
	//puerta.pintar(imagenAlias);
	let gif = puerta.media.objeto.tagName !== "IMG" ;
	//bloque.interactuar(() => {
	puerta.animationOpen = false;
	puerta.vertical = !!vertical;
	puerta.propiedades("abierta", true);
	if (!!key) {
		let keyId = key
		if(typeof key === 'object') keyId = key.id
		puerta.propiedades("abierta", false);
		puerta.propiedades("llave", keyId);
	}
	//puerta.media.objeto.style.marginTop = "0px"
	if(!gif){
		puerta.media.objeto.style.translate = "5px -20px";
		puerta.media.objeto.parentNode.style.transition =
			"transform 0.5s ease-in-out";
		puerta.media.objeto.parentNode.style.transformOrigin = "left";
		puerta.media.objeto.parentNode.style.transform = vertical
			? "translate(-50%, -60%) rotateY(90deg) translateZ(calc(var(--w) * 32px / 2))"
			: "translate(-50%, -60%) rotateX(-90deg) translateZ(calc(var(--d) * 32px / 2))";
	}

	if(vertical){
		let face = puerta.nodo.querySelector('.face-up')
		face.style.background = 'url('+domainMedias+'/textura-madera.jpg)'
		face.style.width = '10px'
		face.style.marginTop = '17px'
		face.style.marginLeft = '-12px'
	}else{
		puerta.media.objeto.parentNode.style.marginLeft = '16px'
	}
	// podemos personalizar el texto que aparece
	puerta.abrir = (info) => {
		if (info.objeto.id == puerta.propiedades("llave"))
			window.neto?.estado
				? window.neto.estado(puerta, { abierta: true })
				: puerta.propiedades("abierta", true);
	};
	puerta.usar = async () => {
		if (
			puerta.propiedades("abierta") === false
		) {
			if(puerta.propiedades("llave")){
				if (
					player().propiedades("items").find(
						(item) => item.id == puerta.propiedades("llave"),
					)
				) {
					if (window.neto?.estado) window.neto.estado(puerta, { abierta: true });
					else puerta.propiedades("abierta", true);
					player().decir("Creo que tengo la llave", 2);
					await esperar(1)
				} else {
					return player().decir("Necesitas una llave", 3);
				}
			} else {
				return player().decir("Puerta bloqueada, no se abrira nunca", 3);
			}
		}

		puerta.animationOpen = !puerta.animationOpen;
		
		if (puerta.animationOpen) {
			try {
				if(hidden) hidden.nodo.remove();
				if(techo) techo.nodo.classList.toggle("occluding-force");
			} catch (error) {
				
			}
			// efecto de abrir puerta
			if(gif)
				puerta.animacion.play(.5)
			else {
				setTransform(puerta.media.objeto.parentNode, "rotateY", "184deg");
			}
			puerta.noSolido();
			if(!vertical){
				puerta.nodo.style.marginLeft = '-18px'
			}
		} else {
			try{
				if(techo) techo.nodo.classList.toggle("occluding-force");
			} catch (error) {
				
			}
			if(gif)
				puerta.animacion.playReverso(.5)
			else 
				setTransform(puerta.media.objeto.parentNode, "rotateY", vertical ? "90deg" : "0deg");
			puerta.solido();
			if(!vertical){
				puerta.nodo.style.marginLeft = '0px'
			}
		}
		// abrir/cerrar de puerta visible para ambos jugadores (neto)
		evento(puerta.animationOpen ? "puerta:abrir" : "puerta:cerrar", {
			id: puerta.id,
			x: puerta.x,
			y: puerta.y,
			z: puerta.z || 0,
			abierta: puerta.animationOpen,
			desbloqueada: puerta.propiedades("abierta"),
		});
		// estado completo de la puerta por el canal generico (neto)
		window.neto?.cambiar?.(puerta);
	};
    puerta.interactuar((info) => info.elemento.usar())
	return puerta;
}
// .capa(n) de un grupo: pone la BASE del grupo en la capa n y conserva los
// offsets internos, para que el techo siga encima de las paredes y no al mismo
// nivel. off = z del elemento menos el z de la base del grupo.
// ponytail: el orden no importa; .capa(3).puerta(...) y .puerta(...).capa(3)
// dejan puerta y muro en la misma capa.
function capaGrupo(grupo, n) {
	for (const { el, off } of grupo) el.capa(n + off);
}

function rotarBase64(base64Original, grados, callback) {
  const img = new Image();
  img.src = base64Original;

  img.onload = function () {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Convertir grados a radianes
    const radianes = (grados * Math.PI) / 180;

    // Calcular las nuevas dimensiones del canvas (intercambia ancho por alto en giros de 90 o 270)
    if (grados === 90 || grados === 270 || grados === -90) {
      canvas.width = img.height;
      canvas.height = img.width;
    } else {
      canvas.width = img.width;
      canvas.height = img.height;
    }

    // Mover el origen del canvas al centro para poder rotar desde ahí
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(radianes);

    // Dibujar la imagen centrada en el nuevo origen
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    // Exportar la nueva imagen rotada a Base64
    const base64Rotada = canvas.toDataURL("image/png");
    
    // Devolver el resultado mediante el callback
    callback(base64Rotada);
  };
}


const soloFrenteMuro = (muros, puerta, vertical, imagen) => {
	// la textura va en la cara lateral del muro: face-south en las paredes
	// horizontales (mira al jugador) y face-east en las verticales (el lateral
	// largo del bloque)
	const caras = vertical ? ["face-west"] : ["face-south"];
	for(let muro of muros){
		muro.nodo.querySelectorAll('.face').forEach((f) => {
			if(!caras.some((c) => f.classList.contains(c))) f.style.backgroundImage = 'none'
			else{
				if(vertical && imagen){
					rotarBase64(imagenesImportadasData[imagen], 90, function(nuevaImagenBase64) {
						f.style.backgroundImage = `url(${nuevaImagenBase64})`;
						f.style.backgroundRepeat = "repeat-y";
						f.style.marginLeft = '10px'
					});	
				}
			}
		})
	}
	// sin .puerta() no hay sprite que ajustar: la pared se usa sola
	if(puerta){
		puerta.media.objeto.style.translate = String(puerta.media.objeto.style.translate).replace('-20px', '-10px')
	}
}

const noBordesMuro = (muros) => {
	for(let muro of muros){
		muro.nodo.classList.add('cubo-style-no-shadow')
	}
}

function paredHorizontal(x, y, w, imagen, z) {
	z = z || 0;
	w = w || 3;
	let imageMuro = imagen || "muro";
	if (
		imageMuro == "muro" &&
		imagenesImportadas.hasOwnProperty("muro") == false
	) {
		usarImagen("muro", "/games/images/muro.png");
	}
	if (x === undefined) x = x || Math.floor(Math.random() * 14);
	if (y === undefined) y = y || Math.floor(Math.random() * 14);
	let muro = escenaActiva()
		.agregar(x, y, imageMuro, {
			z,
			w,
			h: 2,
			d: 1,
			solido: true,
			peso: 10,
			tipo: "ParedHorizontal",
			cubo: true,
		})
		.imagen("repetir", "repetirX").imagen("tamano", "60px 40px");

	let puerta;
	// todo lo que crea este helper, para moverlo de capa en bloque
	const grupo = [{ el: muro, off: 0 }];
	let muros = [muro]
	let manager = {
		soloFrente(){
			soloFrenteMuro(muros, puerta, false, imagen)
			return manager
		},
		noBordes(){
			noBordesMuro(muros)
			return manager
		},

		puerta(x, key, config) {
			try {			
				puerta = crearPuerta(muro.x + x, y, z, key, config);
			} catch (error) {
				errorRender("Error al crear puerta:"+error.message)
				return manager
			}
			grupo.push({ el: puerta, off: 0 });
			if (muro.x < puerta.x) {
				muro.ancho(puerta.x - muro.x);

				const resto = escenaActiva()
					.agregar(muro.x + x + 1, y, imageMuro, {
						z,
						w: w - x - 1,
						h: 2,
						d: 1,
						solido: true,
						peso: 10,
						tipo: "ParedHorizontal",
						cubo: true,
					})
					.imagen("repetir", "repetirX").imagen("tamano", "60px 40px");
				grupo.push({ el: resto, off: 0 });
				muros.push(resto)
			}
			esperarY(1, () => {
				//muro.margenY(-40)
				puerta.nodo.style.marginTop = "0px";
			});
			return manager;
		},
		puertaTexto(texto) {
			puerta.interactuarTexto = texto
		},
		llave(llaveId) {
			puerta.propiedades("abierta", false);
			puerta.propiedades("llave", llaveId);
			return manager;
		},
		pared(){
			return muro
		},
		capa(zNuevo) {
			// z se actualiza para que una .puerta() posterior nazca en la capa nueva
			z = zNuevo;
			capaGrupo(grupo, zNuevo);
			return manager;
		},
		interactuar(fn) {
			puerta.interactuar(fn);
			return manager;
		},
	};
	return manager;
}

function paredVertical(x, y, d, imagen, z) {
	z = z || 0;
	d = d || 3;
	let imageMuro = imagen || "muro";
	if (
		imageMuro == "muro" &&
		imagenesImportadas.hasOwnProperty("muro") == false
	) {
		usarImagen("muro", "/games/images/muro.png");
	}
	if (x === undefined) x = x || Math.floor(Math.random() * 14);
	if (y === undefined) y = y || Math.floor(Math.random() * 14);

	let muro = escenaActiva().agregar(
		x ,
		y ,
		imageMuro,
		{
			z,
			w: 1,
			h: 2,
			d: d || 3,
			solido: true,
			peso: 10,
			tipo: "ParedVertical",
			cubo: true,
		},
	).imagen("repetir", "repetirX").imagen("tamano", "40px 60px");
	let puerta;
	const grupo = [{ el: muro, off: 0 }];
	let muros = [muro]
	let manager = {
		soloFrente(){
			soloFrenteMuro(muros, puerta, true, imagen)
			return manager
		},
		noBordes(){
			noBordesMuro(muros)
			return manager
		},
		puerta(posicion, key, config) {
			if(!posicion) return puerta;
			puerta = crearPuerta(x, muro.y + posicion, z, key, {...config , vertical:true});
			grupo.push({ el: puerta, off: 0 });
			const finMuro = y + d;
			if (finMuro > puerta.y) {
				muro.largo(posicion);
				const inicio = puerta.y + 1;
				if (inicio < finMuro) {
					const resto = escenaActiva()
						.agregar(x, inicio, imageMuro, {
							z,
							w: 1,
							h: 2,
							d: finMuro - inicio,
							solido: true,
							peso: 10,
							tipo: "ParedVertical",
							cubo: true,
						})
						.imagen("repetir", "repetirX").imagen("tamano", "40px 60px");
					muros.push(resto)
					grupo.push({ el: resto, off: 0 });
				}
			}
			esperarY(0.5, () => {
				//muro.margenY(-40)
				puerta.nodo.style.marginTop = "30px";
			});
			return manager;
		},
		puertaTexto(texto) {
			puerta.interactuarTexto = texto
		},
		pared(){
			return muro
		},
		capa(zNuevo) {
			// z se actualiza para que una .puerta() posterior nazca en la capa nueva
			z = zNuevo;
			capaGrupo(grupo, zNuevo);
			return manager;
		},
		llave(llaveId) {
			puerta.propiedades("abierta", false);
			puerta.propiedades("llave", llaveId);
			return manager;
		},
		imagenPuerta(imagenAlias) {
			puerta.pintar(imagenAlias);
			return manager;
		},
		interactuar(fn) {
			puerta.interactuar(fn);
			return manager;
		},
	};
	return manager;
}

function habitacion(x,y,w,h,key,imagen){
	return habitacionOculta(x,y,w,h,key,imagen)
}

function habitacionOculta(x, y, w, h, key, imagen) {
	// sizeY opcional: sin el, la habitacion es cuadrada (w x w)
	if (h === undefined || h === null) h = w;
	if (w < 2 || h < 2)
		return alert("La habitacion debe ser de al menos 2x2 por las paredes");

	if (imagenesImportadas.hasOwnProperty("puerta") == false) {
		usarImagen("puerta", "games/images/door-svgrepo-com.svg");
	}

	// todo lo de la habitacion, con su offset sobre las paredes (base = 0)
	const grupo = [
		{ el: paredHorizontal(x, y, w + 1, imagen).pared(), off: 0 },
		{ el: paredHorizontal(x + 2, y + h + 1, w - 1, imagen).pared(), off: 0 },
		{ el: paredVertical(x, y + 1, h + 1, imagen).pared(), off: 0 },
		{ el: paredVertical(x + w, y + 1, h, imagen).pared(), off: 0 },
	];

	// crearemos un bloque para la puerta
	// ponytail: sin id fijo; crearObjeto deduplica por id y todas las
	// habitaciones se fusionaban con la primera puerta (solo salia una)
	let puerta = escenaActiva().agregar(x + 1, y + h + 1, "puerta", {
		z: 0,
		w: 1,
		h: 2,
		d: 1,
		solido: true,
		tipo: "puerta",
		cubo: false,
	});

	puerta.pintar("puerta").margenY(-4).margenX(4);
	grupo.push({ el: puerta, off: 0 });
	//bloque.interactuar(() => {
	puerta.animationOpen = false;
	puerta.cerrada = !!key;
	puerta.media.objeto.parentNode.style.transition =
		"transform 0.5s ease-in-out";
	puerta.media.objeto.parentNode.style.transformOrigin = "left";
	puerta.media.objeto.parentNode.style.transform =
		"translate(-50%, -60%) rotateX(-90deg) translateZ(calc(var(--d) * 32px / 2))";
	// podemos personalizar el texto que aparece
	puerta.interactuar(async () => {
		if (puerta.cerrada) {
			// player().items no existe (array vacio); el inventario real vive en
			// player().propiedades("items") como usa crearPuerta. Y al encontrar
			// la llave hay que desbloquear: antes solo se hablaba y nunca abria.
			if (player().propiedades("items").find((item) => item.id == key)) {
				puerta.cerrada = false;
				decir("Creo que tengo la llave",3);
				await esperar(1);
			} else {
				return decir("Necesitas una llave",3);
			}
		}

		puerta.animationOpen = !puerta.animationOpen;
		if (puerta.animationOpen) {
			hidden.nodo.remove();
			techo.nodo.classList.toggle("occluding-force");
			// efecto de abrir puerta
			setTransform(puerta.media.objeto.parentNode, "rotateY", "184deg");
			puerta.noSolido();
		} else {
			techo.nodo.classList.toggle("occluding-force");
			setTransform(puerta.media.objeto.parentNode, "rotateY", "0deg");
			puerta.solido();
		}
	});

	// agregaremos un techo con un z mayor a las paredes
	let techo = escenaActiva()
		.agregar(x, y + 1, "madera", {
			z: 2,
			w: w + 1,
			h: 0,
			d: h + 1,
			solido: true,
			tipo: "Techo",
			cubo: true,
		})
		.plano();
	techo.nodo.style.translate = "0px -29px -20px";
	techo.nodo.style.filter = "brightness(.85) hue-rotate(180deg)"

	let hidden = escenaActiva().agregar(x, y + 1, "vacio", {
		z: 1,
		w: w,
		h: 2,
		d: h - 3,
		solido: false,
		tipo: "Oscuridad",
		cubo: true,
	});
	hidden.nodo.style = "opacity:1 !important;";
	grupo.push({ el: techo, off: 2 });
	grupo.push({ el: hidden, off: 1 });
	return {
		puertaTexto(texto) {
			puerta.interactuarTexto = texto
		},
		capa(zNuevo) {
			// la habitacion sube completa: paredes en zNuevo, oscuridad zNuevo+1,
			// techo zNuevo+2, para no perder la habitacion por dentro
			capaGrupo(grupo, zNuevo);
			return this;
		},
		paredes() {
			return grupo.filter((g) => g.off === 0).map((g) => g.el);
		},
		techo() {
			return techo;
		},
		puerta() {
			return puerta;
		},
		llave(llaveId) {
			puerta.llave(llaveId);
		}
	}
}
