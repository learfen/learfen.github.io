

let idsExistsStatePrevious = []

class EventBus {
  constructor() {
    this.oyentes = new Map();
    // Estados válidos: "start", "play", "pausa", "inventario", "inventario:menu", "inventario:cerrar"
    this.estadoActual = "start";
  }

  setEstado(nuevoEstado) {
    idsExistsStatePrevious.push(this.estadoActual)
    this.estadoActual = nuevoEstado;
    const disp = document.getElementById('stateDisplay');
    if (disp) disp.textContent = nuevoEstado;
    this.emitir("estado:cambio", { estado: nuevoEstado });
  }

  // Permite filtro por estado: escuchar("colision:player", callback, "play")
  escuchar(canal, callback, estadoRequerido = null) {
    if (!this.oyentes.has(canal)) {
      this.oyentes.set(canal, []);
    }
    this.oyentes.get(canal).push({ callback, estadoRequerido });
  }
  
  escucharUnaVez(canal, callback, estadoRequerido = null) {
    if (!this.oyentes.has(canal)) {
      this.oyentes.set(canal, []);
    }
    this.oyentes.get(canal).push({ callback, estadoRequerido, once: true });
  }

  emitir(canal, datos) {
    this.ejecutarCanal(canal, datos);

    // Búsqueda para eventos de colisión con aliases por tipo/id/player
    if (canal === "colision" && datos && datos.objeto && datos.con) {
      const { objeto, con } = datos;

      if (con.tipo) this.ejecutarCanal(`colision:@${con.tipo}`, datos);
      if (objeto.tipo) this.ejecutarCanal(`colision:@${objeto.tipo}`, datos);

      if (con.id !== undefined) this.ejecutarCanal(`colision:${con.id}`, datos);
      if (objeto.id !== undefined) this.ejecutarCanal(`colision:${objeto.id}`, datos);

      if (objeto.esPlayer || con.esPlayer) {
        this.ejecutarCanal("colision:player", datos);
      }
    }

    // Eventos de movimiento con alias por tipo (escuchar("mover:@golem", ...))
    // y acceso al elemento en el payload, igual que en colision.
    // physics emite "mover:<id>" con { origen:()=>obj, x, y, z }.
    if (canal.startsWith("mover:") && datos) {
      const obj = (typeof datos.origen === "function" ? datos.origen() : null) || datos.elemento || datos.objeto;
      if (obj && obj.tipo) {
        this.ejecutarCanal(`mover:@${obj.tipo}`, { ...datos, elemento: obj, objeto: obj, elemento: obj });
      }
    }
  }

  ejecutarCanal(canal, datos) {
    if (!this.oyentes.has(canal)) return;

    this.oyentes.get(canal).forEach(({ callback, estadoRequerido }) => {
      // Solo lanza la función si no requiere estado o si coincide con el estado actual
      if (!estadoRequerido || estadoRequerido === this.estadoActual) {
        callback(datos);
      }
    });
  }
}

window.eventBus = new EventBus();
window.evento = (evento , callback ) => {
  window.eventBus.emitir(evento, callback);
}

window.escuchar = (canal, callback, estadoRequerido = null) => {
  if(Array.isArray(canal)) return canal.forEach(c => window.eventBus.escuchar(c, (e)=>{
    callback({...e, evento:c, detener(){
      if(e?.preventDefault) e.preventDefault()
      if(e?.stopPropagation) e.stopPropagation()
    }});
  }, estadoRequerido))
  window.eventBus.escuchar(canal, (e)=>{
    callback({...e, evento:canal, detener(){
      if(e?.preventDefault) e.preventDefault()
      if(e?.stopPropagation) e.stopPropagation()
    }});
  }, estadoRequerido);
}

window.escucharUnaVez = (canal, callback, estadoRequerido = null) => {
  if(Array.isArray(canal)) return canal.forEach(c => window.eventBus.escucharUnaVez(c, (e)=>{
    callback({...e, evento:c, detener(){
      if(e?.preventDefault) e.preventDefault()
      if(e?.stopPropagation) e.stopPropagation()
    }});
  }, estadoRequerido))
  window.eventBus.escucharUnaVez(canal, (e)=>{
    callback({...e, evento:canal, detener(){
      if(e?.preventDefault) e.preventDefault()
      if(e?.stopPropagation) e.stopPropagation()
    }});
  }, estadoRequerido);
}

function estado(v, time){
  const exe = () => {
    if(v === undefined) return window.eventBus.estadoActual
    return window.eventBus.setEstado(v)
  }
  if(time) return setTimeout(() => exe(), time )
  return exe()
}