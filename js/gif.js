// gif-player.js
// Depende de que window.Gifuct esté disponible (carga previa de gifuct-lib.js)

function createGifPlayer(options) {
  // opciones: { container, url, autoplay, loop }
  const container = options.container;        // elemento DOM (canvas o contenedor)
  const initialUrl = options.url || '';
  const autoplay = options.autoplay || false;
  const loop = options.loop !== false;        // por defecto true

  let canvas, ctx;
  // Si el contenedor es un canvas, lo usamos; si no, creamos uno dentro
  if (container.tagName === 'CANVAS') {
    canvas = container;
    ctx = canvas.getContext('2d');
  } else {
    canvas = document.createElement('canvas');
    container.appendChild(canvas);
    ctx = canvas.getContext('2d');
  }

  let frames = [];
  let currentIndex = 0;
  let timerId = null;
  let isPlaying = false;
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

  // ---------- métodos públicos ----------
  function load(url) {
    // Detener reproducción actual
    pause();
    return fetch(url)
      .then(response => {
        if (!response.ok) throw new Error('Error al cargar el GIF');
        return response.arrayBuffer();
      })
      .then(buffer => {
        const gif = window.Gifuct.parseGIF(buffer);
        frames = window.Gifuct.decompressFrames(gif, true);
        gifWidth = gif.lsd.width;
        gifHeight = gif.lsd.height;
        canvas.width = gifWidth;
        canvas.height = gifHeight;
        currentIndex = 0;
        renderFrame(0);
        if (autoplay) play();
        return { totalFrames: frames.length, width: gifWidth, height: gifHeight };
      });
  }

  function play() {
    if (isPlaying || !frames.length) return;
    isPlaying = true;
    // Si estamos al final y no hay loop, empezamos de nuevo
    if (currentIndex === frames.length - 1 && !loop) {
      renderFrame(0);
    }
    playLoop();
  }

  function pause() {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
    isPlaying = false;
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

  function info() {
    return {
      currentFrame: currentIndex + 1,
      totalFrames: frames.length,
      width: gifWidth,
      height: gifHeight,
      isPlaying: isPlaying
    };
  }

  // ---------- inicialización ----------
  if (initialUrl) {
    load(initialUrl);
  }

  // Retornar la API pública
  return {
    load,
    play,
    pause,
    next,
    prev,
    info
  };
}