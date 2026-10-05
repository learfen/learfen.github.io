// self-check de la regla que decide si un alias esta importado.
// Replica index.html revisionImagenes(). Corre con: node revision-imagenes.test.js
// La regla se extrajo de una regresion: el match exacto del codigo se habia
// perdido, asi que insertar usarImagen() no sacaba el error y el usuario
// veia "la insercion no funciona".

const existeImagen = (key, registro, codigo) =>
  Object.prototype.hasOwnProperty.call(registro, key) ||
  codigo.includes(key) ||
  codigo.some((k) => k.startsWith(key + "-"));

// codigo: lista de aliases importados en el TEXTO del editor
// registro: imagenesImportadas (aliases ya ejecutados en runtime)
const laRevision = (usados, codigo, registro) => {
	const falta = usados.filter((key) => !existeImagen(key, registro, codigo));
	return falta;
};

let ok = 0;
const igual = (got, want, msg) => {
	if (JSON.stringify(got) !== JSON.stringify(want)) {
		console.error("FALLA:", msg, "\n  dio:", got, "\n  esperaba:", want);
		process.exit(1);
	}
	ok++;
};

const REG = { arbol: 1, cofre: 1 };
const COD = ["arbol", "cofre", "pruebaX", "lobo-abajo", "lobo-derecha"];

// 1. la regresion: el import esta en el codigo pero el runtime aun no lo tiene
igual(
	laRevision(["pruebaX"], COD, REG),
	[], // con el match exacto no hay error: el codigo es la fuente de verdad
	"import en codigo, runtime con retraso",
);

// 2. alias sin import en ningun lado -> error
igual(
	laRevision(["piso3"], COD, REG),
	["piso3"],
	"sin import: debe avisar",
);

// 3. solo en el registro runtime -> sin error
igual(laRevision(["cofre"], COD, REG), [], "solo en runtime");

// 4. variante direccional cuenta para el alias base
igual(laRevision(["lobo"], COD, REG), [], "variante direccional");

// 5. el caso real del usuario: se inserta el import y el error debe desaparecer
const antes = laRevision(["piso3"], COD, REG);
const despues = laRevision(["piso3"], [...COD, "piso3"], REG);
igual([antes.length, despues.length], [1, 0], "insertar el import saca el error");

// 6. no inventar: un alias que solo se parece no cuenta
igual(
	laRevision(["piso"], COD, REG), // "piso" es prefijo de "piso3", no alias
	["piso"],
	"prefijo no es alias",
);

console.log(`revisionImagenes: ${ok}/6 OK`);
