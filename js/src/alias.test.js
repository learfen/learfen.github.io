// self-check del resolutor de alias al hacer click en un recurso.
// replica dev.js:144-163. corre con: node alias.test.js

const resolver = (codigo, url) => {
	const urlEscapada = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const suya = codigo.match(
		new RegExp(
			`usarImagen\\(\\s*"([^"]+)"\\s*,\\s*"\\/games${urlEscapada}"\\s*\\)`,
		),
	);
	if (suya) return { pideAlias: false, alias: suya[1] };
	return { pideAlias: true, alias: null };
};

let ok = 0;
const igual = (got, want, msg) => {
	if (JSON.stringify(got) !== JSON.stringify(want)) {
		console.error("FALLA:", msg, "\n  dio:", got, "\n  esperaba:", want);
		process.exit(1);
	}
	ok++;
};

// una sola importacion
igual(
	resolver(`usarImagen("arbol","/games/images/arbol.png")`, "/images/arbol.png"),
	{ pideAlias: false, alias: "arbol" },
	"una sola importacion",
);

// dos: click en la 2a debe dar SU alias (regresion: daba la 1a)
igual(
	resolver(
		`usarImagen("ceramicas","/games/images/piso1.png")
usarImagen("piso2","/games/images/piso-piedra.jpeg")`,
		"/images/piso-piedra.jpeg",
	),
	{ pideAlias: false, alias: "piso2" },
	"click en la 2a",
);

// codigo real de robertito: click en cada imagen
const nivel = `usarImagen("cielo","/games/images/cielo-1.png")
usarImagen("npc","/games/images/characters-svgrepo-com.png")
usarImagen("ceramicas","/games/images/piso1.png")
usarImagen("arbusto","/games/images/bush.svg")
usarImagen("arbol","/games/images/arbol.png")
usarImagen("llave","/games/images/key-svgrepo-com.svg")`;
for (const [url, alias] of [
	["/images/cielo-1.png", "cielo"],
	["/images/characters-svgrepo-com.png", "npc"],
	["/images/piso1.png", "ceramicas"],
	["/images/bush.svg", "arbusto"],
	["/images/arbol.png", "arbol"],
	["/images/key-svgrepo-com.svg", "llave"],
]) igual(resolver(nivel, url), { pideAlias: false, alias }, `click en ${alias}`);

// sin importacion: pide alias, no revienta
igual(
	resolver(`empezarEn(1,1)`, "/images/nueva.png"),
	{ pideAlias: true, alias: null },
	"sin importar pide alias",
);

// url con espacios/caracteres raros escapados bien
igual(
	resolver(`usarImagen("a b","/games/images/x(1).png")`, "/images/x(1).png"),
	{ pideAlias: false, alias: "a b" },
	"url con parentesis",
);

// espacios alrededor de la coma en el codigo del usuario
igual(
	resolver(`usarImagen("piso2" , "/games/images/piso.png")`, "/images/piso.png"),
	{ pideAlias: false, alias: "piso2" },
	"espacios en la coma",
);

console.log(`alias resolver: ${ok}/11 OK`);
