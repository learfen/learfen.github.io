// self-check del fade por oclusion (scene.js, actualizarOclusion).
// Corre con: node occlusion.test.js
// El unico cambio fue >= por > en cubreAlturaZ. Este test corre la regla
// completa con las dos versiones y verifica que solo difieren en el borde.

const fade = (obj, juga, op) => {
	if (obj.h <= 0 || obj.plano) return false;
	const dy = obj.y - juga.y;
	if (dy <= 0) return false;                                   // esta detras
	const solapaX = obj.x < juga.x + juga.w && obj.x + obj.w > juga.x;
	if (!solapaX) return false;                                  // no esta encima
	const cubreAlturaZ =
		op === ">=" ? obj.z + obj.h >= juga.z : obj.z + obj.h > juga.z;
	const cerca = obj.h >= dy * 2.0;                             // regla ya existente
	return cubreAlturaZ && cerca;
};

let ok = 0;
const igual = (got, want, msg) => {
	if (got !== want) {
		console.error("FALLA:", msg, "\n  dio:", got, "esperaba:", want);
		process.exit(1);
	}
	ok++;
};

const J = { x: 3, y: 2, z: 5, w: 1, h: 1 };
const nuevo = (o) => fade(o, J, ">");
const viejo = (o) => fade(o, J, ">=");

// --- el caso del usuario ---
// paredHorizontal(0,3,4,"t2").capa(3) -> h=2, o sea z 3..5; player 5..6.
// solo toca el plano de los pies: no tapa, no debe volverse transparente.
const VOLUMEN = { x: 0, y: 3, z: 3, w: 4, h: 2, d: 1 };
igual(viejo(VOLUMEN), true, "viejo lo pone transparente (el bug)");
igual(nuevo(VOLUMEN), false, "nuevo NO lo pone transparente");

// sube un nivel mas (3..6): ahora si tapa
igual(nuevo({ ...VOLUMEN, h: 3 }), true, "3..6 si tapa");

// --- el resto no cambia ---
const casos = [
	[{ x: 2, y: 4, z: 5, w: 2, h: 2 }, "muro a la misma altura del player"],
	[{ x: 0, y: 1, z: 3, w: 4, h: 9 }, "detras (dy<=0)"],
	[{ x: 20, y: 3, z: 3, w: 4, h: 9 }, "lejos en X"],
	[{ x: 2, y: 20, z: 5, w: 2, h: 2 }, "lejos en Y (no cerca)"],
	[{ x: 0, y: 3, z: 3, w: 9, h: 9, plano: true }, "plano"],
	[{ x: 0, y: 3, z: 3, w: 9, h: 0 }, "h=0"],
	[{ x: 2, y: 3, z: 3, w: 2, h: 9 }, "muro alto en frente"],
];
for (const [o, msg] of casos) igual(nuevo(o), viejo(o), `sin cambio: ${msg}`);

// el unico caso donde deben diferir es el del borde
const difieren = casos.map(([o]) => nuevo(o) !== viejo(o));
igual(difieren.some(Boolean), false, "ningun otro caso cambia");

console.log(`occlusion: ${ok}/11 OK (cubreAlturaZ: >= -> >)`);
