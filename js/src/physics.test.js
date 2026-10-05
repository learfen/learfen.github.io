// self-check de moverRequiere. corre con: node physics.test.js
// replica lo que PhysicsEngine.intentarMover usa de la escena y del elemento

class PhysicsEngine {
  haySolapamiento(a, b, tx = a.x, ty = a.y, tz = a.z) {
    return (
      tx < b.x + b.w && tx + a.w > b.x &&
      ty < b.y + b.d && ty + a.d > b.y &&
      tz < b.z + b.h && tz + a.h > b.z
    );
  }

  intentarMover(obj, dx, dy, dz) {
    const scene = globalThis.sceneManager;
    const targetX = dx, targetY = dy, targetZ = dz;

    const requisitos = obj.propiedades("moverRequiere") || [];
    if (requisitos.length > 0) {
      const apoyo = scene.elementos.some((o) => {
        if (o.id === obj.id) return false;
        const matchea = requisitos.some((sel) => {
          if (!sel.startsWith("@")) return o.id === sel;
          const t = sel.slice(1);
          return o.tipo === t || (t === "piso" && o._props?.piso);
        });
        if (!matchea) return false;
        if (!(targetX < o.x + o.w && targetX + obj.w > o.x &&
              targetY < o.y + o.d && targetY + obj.d > o.y)) return false;
        return o.z + o.h === targetZ;
      });
      if (!apoyo) return false;
    }
    obj.x = targetX; obj.y = targetY; obj.z = targetZ;
    return true;
  }
}

const scene = {
  elementos: [
    { id: "suelo", tipo: "piso", x: 0, y: 0, z: 4, w: 5, d: 5, h: 1 },
    { id: "tejado", tipo: "techo", x: 0, y: 0, z: 0, w: 5, d: 5, h: 1 },
  ],
};
globalThis.sceneManager = scene;

const nuevoActor = () => {
  const props = {};
  return {
    id: "actor", tipo: "npc", x: 1, y: 1, z: 5, w: 1, d: 1, h: 1,
    propiedades: (k, v) => (k === undefined ? props : v === undefined ? props[k] : (props[k] = v)),
  };
};

// equivalente a elemento.moverRequiere(sel)
const requiere = (sel) => {
  const a = nuevoActor();
  const vacio = sel === "" || sel === null || sel === false;
  a.propiedades("moverRequiere", vacio ? [] : (Array.isArray(sel) ? sel : [sel]).filter(Boolean));
  return a;
};

const pe = new PhysicsEngine();
const assert = (ok, msg) => { if (!ok) { console.error("FALLA:", msg); process.exit(1); } };

// 1. sin requisito: se mueve a cualquier lado
let a = requiere([]);
assert(pe.intentarMover(a, 4, 4, 5), "sin requisito debe moverse");
assert(a.x === 4 && a.z === 5, "sin requisito: se aplica el destino");

// 2. "@piso": camina sobre el piso (z4 + h1 = 5)
a = requiere("@piso");
assert(pe.intentarMover(a, 2, 2, 5), "sobre @piso debe moverse");
assert(a.x === 2, "sobre @piso: se aplica el destino");

// 3. "@piso": no puede caminar al vacio (fuera de la huella del piso)
a = requiere("@piso");
assert(!pe.intentarMover(a, 9, 9, 5), "fuera del piso no debe moverse");

// 4. "@piso": no puede flotar dos capas arriba del piso
a = requiere("@piso");
assert(!pe.intentarMover(a, 2, 2, 7), "en el aire sin apoyo no debe moverse");

// 5. id en vez de @tipo
a = requiere("suelo");
assert(pe.intentarMover(a, 3, 3, 5), "por id debe moverse");

// 6. array con varios: basta con que uno coincida
a = requiere(["@tejado", "@piso"]);
assert(pe.intentarMover(a, 2, 2, 5), "array con @piso debe permitir");

// 7. array sin ninguno que coincida
a = requiere(["@tejado", "@techo2"]);
assert(!pe.intentarMover(a, 2, 2, 5), "array sin coincidencia no debe moverse");

// 8. vacio / null / false / "" = sin requisito
for (const vacio of [[], null, false, ""]) {
  a = requiere(vacio);
  assert(pe.intentarMover(a, 9, 9, 5), `vacio (${JSON.stringify(vacio)}) debe moverse`);
}

// 9. nunca seteado: se comporta como getter y no exige nada
a = nuevoActor();
assert(a.propiedades("moverRequiere") === undefined, "sin setear debe ser undefined");
assert(pe.intentarMover(a, 9, 9, 5), "sin setear no debe exigir nada");

// 10. settear dos veces no rompe (el valor no pisa el metodo)
a = nuevoActor();
a.propiedades("moverRequiere", ["@piso"]);
a.propiedades("moverRequiere", ["@noexiste"]);
assert(!pe.intentarMover(a, 2, 2, 5), "el ultimo setter debe ganar");
a.propiedades("moverRequiere", []);
assert(pe.intentarMover(a, 9, 9, 5), "volver a vacio debe liberar");

// 11. el suelo puede estar a distinta altura: se pisa si el techo queda
// justo bajo los pies (piso de 2 capas, actor en z6)
scene.elementos.push({ id: "grueso", tipo: "piso", x: 20, y: 0, z: 4, w: 3, d: 3, h: 2 });
a = requiere("@piso");
assert(pe.intentarMover(a, 21, 1, 6), "piso de h=2 sostiene al actor en z=6");
assert(!pe.intentarMover(a, 21, 1, 7), "pero no si flota una capa mas");

// 11. "@piso" tambien matchea lo marcado con .piso(), que conserva su
// alias como tipo ("piso2", "teja"...)
scene.elementos.push({ id: "teja", tipo: "piso2", x: 40, y: 0, z: 4, w: 3, d: 3, h: 1, _props: { piso: true } });
a = requiere("@piso");
assert(pe.intentarMover(a, 41, 1, 5), "suelo con alias propio debe sostenerse con @piso");
assert(!pe.intentarMover(a, 10, 1, 5), "pero no donde no hay suelo");

console.log("moverRequiere: 12/12 OK");
