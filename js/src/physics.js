class PhysicsEngine {
  haySolapamiento(a, b, targetX = a.x, targetY = a.y, targetZ = a.z) {
    return (
      targetX < b.x + b.w && targetX + a.w > b.x &&
      targetY < b.y + b.d && targetY + a.d > b.y &&
      targetZ < b.z + b.h && targetZ + a.h > b.z
    );
  }

  intentarMover(obj, dx, dy, dz, useCoordination, empujar = true) {
    if (estado() === "pausa") {
      return false;
    }
    
		let positionPrev = {x: obj.x, y: obj.y, z: obj.z};
    const scene = window.sceneManager;
    const targetX = useCoordination ? dx : obj.x + dx;
    const targetY = useCoordination ? dy : obj.y + dy;
    const targetZ = useCoordination ? dz : obj.z + dz;

    if (targetX < 0 || targetX + obj.w > 20 || targetY < 0 || targetY + obj.d > 20 || targetZ + obj.h > 10) {
      return false;
    }

    const colisiones = scene.elementos.filter(o => o.id !== obj.id && this.haySolapamiento(obj, o, targetX, targetY, targetZ));

    colisiones.filter(o => !o.propiedades("solido")).forEach(con => {
      evento("colision", { objeto: obj, quien:obj, con });
    });

    const solidos = colisiones.filter(o => o.propiedades("solido"));
    if (solidos.length === 0) {
      obj.x = targetX; obj.y = targetY; obj.z = targetZ;
      scene.actualizarTransformNodo(obj);
      if (obj.esPlayer) scene.actualizarCamara();
      window.neto?.cambiar?.(obj);
      evento("mover", obj)
      evento("mover:"+obj.id, { origen: () => obj, x: obj.x, y: obj.y, z: obj.z});
      return true;
    }

    // Sin la tecla "s" el jugador no empuja ni arrastra: choca y se detiene
    if (!empujar) {
      solidos.forEach(con => {
        evento("colision", { objeto: obj, quien: obj, con })
        evento("colision:@"+con.tipo, { objeto: obj, quien: obj, con })
        evento("colision:"+con.id, { objeto: obj, quien: obj, con })
        // si el obj.tipo === 'player' y con tiene interaccion ejecutaremos la funcion de ayuda que dice que presione a
      });
      return false;
    }

    // Regla de Fuerza vs Peso
    const cadenaSolida = [];
    let actual = solidos[0];

    while (actual && !cadenaSolida.some(e => e.id === actual.id)) {
      // Si la fuerza del objeto que empuja es menor que el peso del objeto objetivo, no se puede empujar
      if (obj.propiedades("fuerza") < actual.propiedades("peso")) {
        solidos.forEach(con => evento("colision", { objeto: obj, quien: obj, con }));
        return false;
      }

      cadenaSolida.push(actual);

      const nX = actual.x + dx;
      const nY = actual.y + dy;
      const nZ = actual.z + dz;

      actual = scene.elementos.find(o =>
        o.id !== actual.id &&
        o.propiedades("solido") &&
        !cadenaSolida.some(e => e.id === o.id) &&
        this.haySolapamiento(cadenaSolida[cadenaSolida.length - 1], o, nX, nY, nZ)
      );
    }

    solidos.forEach(con => {
      evento("colision", { objeto: obj, quien: obj, con })
    });

    for (let i = cadenaSolida.length - 1; i >= 0; i--) {
      const elem = cadenaSolida[i];
      const ex = elem.x + dx;
      const ey = elem.y + dy;
      const ez = elem.z + dz;

      if (ex < 0 || ex + elem.w > 20 || ey < 0 || ey + elem.d > 20 || ez + elem.h > 10) {
        return false;
      }
      elem.x = ex; elem.y = ey; elem.z = ez;
      scene.actualizarTransformNodo(elem);
      window.neto?.cambiar?.(elem);
    }

    obj.x = targetX; obj.y = targetY; obj.z = targetZ;
    scene.actualizarTransformNodo(obj);
    if (obj.esPlayer) scene.actualizarCamara();
    window.neto?.cambiar?.(obj);
    evento("mover", obj)
    evento("mover:"+obj.id, { origen: () => obj, x: obj.x, y: obj.y, z: obj.z});
    return true;
  }

  // Arrastra hacia el jugador los sólidos que quedan detrás del movimiento.
  // Devuelve 1 si arrastró, null si no había nada que arrastrar, 0 si estaba bloqueado.
  tirar(obj, dx, dy, dz) {
    if (estado() === "pausa") return 0;

    const scene = window.sceneManager;
    const tx = obj.x + dx;
    const ty = obj.y + dy;
    const tz = obj.z + dz;

    if (tx < 0 || tx + obj.w > 20 || ty < 0 || ty + obj.d > 20 || tz + obj.h > 10) {
      return 0;
    }

    const objetos = scene.elementos;
    const esSolido = (o) => o.propiedades("solido");

    // Cadena arrastrada: los sólidos que quedan detrás (al moverse +D caen sobre el jugador).
    // Un sólido demasiado pesado corta la cadena y se queda quieto (no bloquea el arrastre).
    const tirando = [];
    let actual = objetos.find(
      (o) => o.id !== obj.id && esSolido(o) && this.haySolapamiento(o, obj, o.x + dx, o.y + dy, o.z + dz),
    );
    const gastados = new Set();
    while (actual && !gastados.has(actual.id)) {
      if (obj.propiedades("fuerza") < actual.propiedades("peso")) break;
      gastados.add(actual.id);
      tirando.push(actual);
      actual = objetos.find(
        (o) =>
          o.id !== actual.id &&
          esSolido(o) &&
          !gastados.has(o.id) &&
          this.haySolapamiento(o, actual, o.x + dx, o.y + dy, o.z + dz),
      );
    }

    // Cadena empujada: los sólidos delante del jugador (hacia donde retrocede), pesado = corte
    const empujando = [];
    actual = objetos.find(
      (o) => o.id !== obj.id && !gastados.has(o.id) && esSolido(o) && this.haySolapamiento(obj, o, tx, ty, tz),
    );
    while (actual && !gastados.has(actual.id)) {
      if (obj.propiedades("fuerza") < actual.propiedades("peso")) break;
      gastados.add(actual.id);
      empujando.push(actual);
      actual = objetos.find(
        (o) =>
          o.id !== actual.id &&
          esSolido(o) &&
          !gastados.has(o.id) &&
          this.haySolapamiento(actual, o, actual.x + dx, actual.y + dy, actual.z + dz),
      );
    }

    if (tirando.length === 0 && empujando.length === 0) return null;

    // Espacio libre para el destino de cada cosa que se mueve (los planos no bloquean)
    const juntos = new Set([obj.id, ...gastados]);
    for (const c of [...tirando, ...empujando, obj]) {
      const nx = c.x + dx;
      const ny = c.y + dy;
      const nz = c.z + dz;
      if (nx < 0 || nx + c.w > 20 || ny < 0 || ny + c.d > 20 || nz + c.h > 10) return 0;
      const bloqueado = objetos.some(
        (o) => o.id !== c.id && !juntos.has(o.id) && esSolido(o) && this.haySolapamiento(c, o, nx, ny, nz),
      );
      if (bloqueado) return 0;
    }

    // Mover primero lo más lejano de cada cadena y por último al jugador
    const retroceder = (cad) => {
      for (let i = cad.length - 1; i >= 0; i--) {
        const c = cad[i];
        c.x += dx; c.y += dy; c.z += dz;
        scene.actualizarTransformNodo(c);
        window.neto?.cambiar?.(c);
      }
    };
    retroceder(empujando);
    retroceder(tirando);
    obj.x = tx; obj.y = ty; obj.z = tz;
    scene.actualizarTransformNodo(obj);
    if (obj.esPlayer) scene.actualizarCamara();
    window.neto?.cambiar?.(obj);
    evento("mover", obj)
    evento("mover:"+obj.id, { origen: () => obj, x: obj.x, y: obj.y, z: obj.z});
    return 1;
  }
}

escuchar("colision", ({ objeto, con }) => {
  console.log(con?.interaccion)
  if (con?.interaccion) {
    ayuda("Presiona A/Usar para interactuar");
  }
}, "play");

window.physicsEngine = new PhysicsEngine();