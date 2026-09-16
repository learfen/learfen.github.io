// gif-player.js
// Depende de: window.Gifuct (cargado previamente con gifuct-lib.js)

function createGifPlayer(options) {
  const container = options.container;
  const initialUrl = options.url || "";
  const autoplay = options.autoplay || false;
  let loop = options.loop !== false;

  let canvas, ctx;
  if(options.hasOwnProperty("container"))
    canvas = options.container.querySelector("#" + options.id);
  if(options.hasOwnProperty("canvas"))
    canvas = options.canvas;
  ctx = canvas.getContext("2d");

  let frames = [];
  let currentIndex = 0;
  let timerId = null;
  let isPlaying = false;
  let isReversing = false;   // <-- NUEVO: estado para reproducción inversa
  let gifWidth = 0, gifHeight = 0;

  // ---------- funciones internas ----------
  function renderFrame(index) {
    if (!frames.length || index >= frames.length) return;
    const frame = frames[index];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const imageData = new ImageData(frame.patch, frame.dims.width, frame.dims.height);
    ctx.putImageData(imageData, frame.dims.left, frame.dims.top);
    currentIndex = index;
  }

  function nextFrame() {
    if (!frames.length) return;
    const next = (currentIndex + 1) % frames.length;
    renderFrame(next);
    return next;
  }

  function prevFrame() {   // <-- NUEVO: retroceder un frame
    if (!frames.length) return;
    const prev = (currentIndex - 1 + frames.length) % frames.length;
    renderFrame(prev);
    return prev;
  }

  function playLoop() {
    if (!isPlaying) return;
    const next = nextFrame();
    if (next === 0 && !loop) {
      pause();
      return;
    }
    const delay = frames[next]?.delay || 100;
    timerId = setTimeout(playLoop, delay);
  }

  function playReverseloop() {   // <-- NUEVO: bucle inverso
    if (!isReversing) return;
    const prev = prevFrame();
    if (prev === frames.length - 1 && !loop) {
      // Si llegamos al primer frame (índice 0) y no hay loop, nos detenemos
      // Pero prevFrame devuelve el índice del frame mostrado.
      // Cuando estamos en el primer frame y llamamos a prevFrame, irá al último.
      // Así que detectamos si estábamos en 0 y no hay loop.
      if (currentIndex === 0) {
        pause();
        return;
      }
    }
    // Si loop es true, nunca se detiene (el % ya hace que vuelva al último)
    const delay = frames[currentIndex]?.delay || 100;
    timerId = setTimeout(playReverseloop, delay);
  }

  // ---------- getFrame (extrae un frame como data URL) ----------
  function getFrame(index) {
    if (!frames.length) return null;
    if (index === -1) index = frames.length - 1;
    if (index < 0 || index >= frames.length) return null;

    const frame = frames[index];
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = frame.dims.width;
    tempCanvas.height = frame.dims.height;
    const tempCtx = tempCanvas.getContext("2d");
    const imageData = new ImageData(frame.patch, frame.dims.width, frame.dims.height);
    tempCtx.putImageData(imageData, 0, 0);
    return tempCanvas.toDataURL("image/png");
  }

  // ---------- métodos públicos ----------
  function load(url) {
    pause();
    return fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error("Error al cargar el GIF");
        return response.arrayBuffer();
      })
      .then((buffer) => {
        const gif = window.Gifuct.parseGIF(buffer);
        frames = window.Gifuct.decompressFrames(gif, true);
        gifWidth = gif.lsd.width;
        gifHeight = gif.lsd.height;
        canvas.width = gifWidth;
        canvas.height = gifHeight;
        currentIndex = 0;
        renderFrame(0);
        if (autoplay) play();
        return {
          totalFrames: frames.length,
          width: gifWidth,
          height: gifHeight,
        };
      });
  }

  function play() {
    if (isPlaying || !frames.length) return;
    // Si está reproduciendo en reverso, detenerlo
    if (isReversing) pause();
    isPlaying = true;
    isReversing = false;
    if (currentIndex === frames.length - 1 && !loop) {
      renderFrame(0);
    }
    playLoop();
    return manager
  }

  function playReverso() {   // <-- NUEVO: iniciar reproducción inversa
    if (isReversing || !frames.length) return;
    // Si está reproduciendo normal, detenerlo
    if (isPlaying) pause();
    isReversing = true;
    isPlaying = false;
    // Si estamos en el primer frame y no hay loop, empezamos desde el último
    if (currentIndex === 0 && !loop) {
      renderFrame(frames.length - 1);
    }
    playReverseloop();
    return manager
  }

  function pause() {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
    isPlaying = false;
    isReversing = false;
  }

  function next() {
    pause();
    if (frames.length) {
      const nextIdx = (currentIndex + 1) % frames.length;
      renderFrame(nextIdx);
    }
  }

  function prev() {
    pause();
    if (frames.length) {
      const prevIdx = (currentIndex - 1 + frames.length) % frames.length;
      renderFrame(prevIdx);
    }
  }

  function useLoop(use){
    // activa la repeticion
    loop = use
    if(use){
      pause()
      if(isPlaying){
        playLoop()
      }else if(isReversing){
        playReverseloop()
      }
    }
    return manager
  }

  function reset(){
    pause();
    currentIndex = 0;
    renderFrame(0);
    return manager
  }

  function info() {
    return {
      currentFrame: currentIndex + 1,
      totalFrames: frames.length,
      width: gifWidth,
      height: gifHeight,
      isPlaying: isPlaying,
      isReversing: isReversing,   // <-- NUEVO: para saber si está en reverso
    };
  }

  // ---------- inicialización ----------
  let loadPromise = null;
  if (initialUrl) {
    loadPromise = load(initialUrl);
  }

  const manager = {
    canvas,
    load,
    play,
    playReverso,   // <-- NUEVO
    pause,
    reset,
    next,
    prev,
    info,
    getFrame,
    playLoop,
    playReverseloop,
    useLoop,
    cuandoListo: loadPromise
  };
  return manager
}