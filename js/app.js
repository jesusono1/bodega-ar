// === CONFIGURATION ===
var DEV_MODE = true;

// Machine data — 15 targets matching targets.mind compilation order
var MAQUINAS = [
  { id: 0, nombre: 'Alimentador', descripcion: 'Recepción de la aceituna. La tolva recibe la aceituna recién recolectada e inicia el proceso de extracción del aceite.', paso: 'Paso 1 de 15 · Almazara', video: './assets/videos/GIRAFA.MP4' },
  { id: 1, nombre: 'Limpiadora', descripcion: 'Limpieza y lavado de la aceituna. Elimina hojas, ramas y tierra para garantizar la pureza del aceite.', paso: 'Paso 2 de 15 · Almazara', video: './assets/videos/GIRAFA.MP4' },
  { id: 2, nombre: 'Molturadora', descripcion: 'Trituración de la aceituna. Muele el fruto entero (piel, pulpa y hueso) para formar una pasta homogénea.', paso: 'Paso 3 de 15 · Almazara', video: './assets/videos/GIRAFA.MP4' },
  { id: 3, nombre: 'Centrífuga Horizontal', descripcion: 'Separación de fases. El decánter separa el aceite del agua y los sólidos (orujo) por fuerza centrífuga.', paso: 'Paso 4 de 15 · Almazara', video: './assets/videos/GIRAFA.MP4' },
  { id: 4, nombre: 'Centrífuga Vertical', descripcion: 'Purificación del aceite. Elimina las últimas impurezas y restos de agua para obtener un aceite limpio.', paso: 'Paso 5 de 15 · Almazara', video: './assets/videos/GIRAFA.MP4' },
  { id: 5, nombre: 'Filtradora', descripcion: 'Filtrado final del aceite. Pasa el aceite por placas filtrantes para conseguir la claridad y brillo característicos.', paso: 'Paso 6 de 15 · Almazara', video: './assets/videos/GIRAFA.MP4' },
  { id: 6, nombre: 'Depósito de Decantación', descripcion: 'Reposo y clarificación. El aceite reposa en depósitos de acero inoxidable permitiendo la decantación natural.', paso: 'Paso 7 de 15 · Almazara', video: './assets/videos/GIRAFA.MP4' },
  { id: 7, nombre: 'Embotelladora Aceite', descripcion: 'Envasado del aceite de oliva virgen extra. La línea de embotellado dosifica y sella cada botella.', paso: 'Paso 8 de 15 · Almazara', video: './assets/videos/GIRAFA.MP4' },
  { id: 8, nombre: 'Despalilladora', descripcion: 'Separación del raspón. Separa el grano de uva del escobajo, primer paso de la vinificación.', paso: 'Paso 9 de 15 · Bodega', video: './assets/videos/GIRAFA.MP4' },
  { id: 9, nombre: 'Depósito de Fermentación', descripcion: 'Fermentación alcohólica. Las levaduras transforman los azúcares del mosto en alcohol durante 7-15 días.', paso: 'Paso 10 de 15 · Bodega', video: './assets/videos/GIRAFA.MP4' },
  { id: 10, nombre: 'Depósito de Mezclas', descripcion: 'Coupage y ensamblaje. Se combinan vinos de distintas variedades para crear el blend deseado.', paso: 'Paso 11 de 15 · Bodega', video: './assets/videos/GIRAFA.MP4' },
  { id: 11, nombre: 'Depósito de Envejecimiento', descripcion: 'Crianza en depósito. El vino madura en depósitos de acero inoxidable a temperatura controlada.', paso: 'Paso 12 de 15 · Bodega', video: './assets/videos/GIRAFA.MP4' },
  { id: 12, nombre: 'Embotelladora', descripcion: 'Envasado del vino. La línea de embotellado llena, corcha y etiqueta cada botella.', paso: 'Paso 13 de 15 · Bodega', video: './assets/videos/GIRAFA.MP4' },
  { id: 13, nombre: 'Barricas', descripcion: 'Crianza en roble. El vino reposa en barricas de roble francés y americano adquiriendo complejidad y aromas.', paso: 'Paso 14 de 15 · Bodega', video: './assets/videos/GIRAFA.MP4' },
  { id: 14, nombre: 'Zona Tranquila', descripcion: 'Reposo en botella. El vino finaliza su evolución en la botella, en condiciones de oscuridad y temperatura estable.', paso: 'Paso 15 de 15 · Bodega', video: './assets/videos/GIRAFA.MP4' }
];

// === DOM REFERENCES ===

var overlayVideo = document.getElementById('overlay-video');
var sceneEl = document.querySelector('a-scene');
var videoLoader = document.getElementById('video-loader');

// === STATE ===

var currentTargetIndex = -1;
var isVideoMuted = true;

// === SCREEN MANAGEMENT ===

function showScreen(screenId) {
  document.querySelectorAll('[id^="screen-"]').forEach(function (el) {
    el.classList.add('hidden');
  });
  var target = document.getElementById(screenId);
  if (target) {
    target.classList.remove('hidden');
  }

  // Show/hide controls bar — visible during scanning only
  var controlsBar = document.getElementById('controls-bar');
  if (controlsBar) {
    var showControls = (screenId === 'screen-scanning');
    controlsBar.classList.toggle('hidden', !showControls);
  }
}

// === VIDEO LOADING SPINNER ===

function showVideoLoader() {
  if (videoLoader) videoLoader.classList.remove('hidden');
}

function hideVideoLoader() {
  if (videoLoader) videoLoader.classList.add('hidden');
}

// === VIDEO MANAGEMENT (2D overlay approach) ===

/**
 * Release the video element and free memory.
 */
function releaseVideo() {
  overlayVideo.pause();
  overlayVideo.removeAttribute('src');
  overlayVideo.load();
  hideVideoLoader();
}

/**
 * Target detected — show video as 2D fullscreen overlay.
 * MindAR only triggers this; the video is pure HTML, no 3D rendering.
 */
function onTargetFound(targetIndex) {
  var maquina = MAQUINAS[targetIndex];
  if (!maquina) return;

  // If already showing this target's video, ignore
  if (currentTargetIndex === targetIndex) return;

  // Release previous video if any
  if (currentTargetIndex !== -1) {
    releaseVideo();
  }

  currentTargetIndex = targetIndex;

  // Update info
  document.getElementById('info-name').textContent = maquina.nombre;
  document.getElementById('info-step').textContent = maquina.paso;
  document.getElementById('info-desc').textContent = maquina.descripcion;

  // Show loading spinner
  showVideoLoader();

  // Load and play video
  overlayVideo.src = maquina.video;
  overlayVideo.muted = isVideoMuted;
  overlayVideo.load();

  var playPromise = overlayVideo.play();
  if (playPromise !== undefined) {
    playPromise.then(function () {
      hideVideoLoader();
    }).catch(function () {
      hideVideoLoader();
    });
  }

  // Fallback: hide spinner when video is ready
  overlayVideo.addEventListener('canplay', function onCanPlay() {
    hideVideoLoader();
    overlayVideo.removeEventListener('canplay', onCanPlay);
  });

  // Show video screen (hides camera view, shows fullscreen video)
  showScreen('screen-video');
}

/**
 * Target lost — we do NOTHING.
 * The video keeps playing. User closes it manually with the X button.
 * This is the key difference from the 3D approach.
 */
function onTargetLost(targetIndex) {
  // Intentionally empty — video stays on screen
}

/**
 * Close the video and return to scanning.
 */
function closeVideo() {
  currentTargetIndex = -1;
  releaseVideo();
  showScreen('screen-scanning');
}

// === CONTROLS ===

function updateMuteBtn() {
  var btn = document.getElementById('btn-mute');
  if (!btn) return;
  if (isVideoMuted) {
    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
  } else {
    btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 010 14.14"></path><path d="M15.54 8.46a5 5 0 010 7.07"></path></svg>';
  }
}

/**
 * Toggle mute — CRITICAL iOS: must run inside direct click handler.
 */
function toggleMute() {
  isVideoMuted = !isVideoMuted;
  overlayVideo.muted = isVideoMuted;
  updateMuteBtn();
}

function showHelp() {
  var modal = document.getElementById('modal-help');
  if (modal) modal.classList.remove('hidden');
}

function hideHelp() {
  var modal = document.getElementById('modal-help');
  if (modal) modal.classList.add('hidden');
}

function goHome() {
  if (currentTargetIndex !== -1) {
    currentTargetIndex = -1;
    releaseVideo();
  }

  // Stop MindAR if running on mobile
  if (!DEV_MODE || isMobileDevice()) {
    try {
      var mindARSystem = getMindARSystem();
      if (mindARSystem) mindARSystem.stop();
    } catch (e) {
      // Could not stop MindAR
    }
  }

  showScreen('screen-welcome');
}

// === A-FRAME SCENE LIFECYCLE ===

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function getMindARSystem() {
  var sys = sceneEl.components && sceneEl.components['mindar-image-system'];
  if (sys) return sys;
  sys = sceneEl.systems && sceneEl.systems['mindar-image-system'];
  if (sys) return sys;
  return null;
}

function startAR() {
  showScreen('screen-scanning');

  if (DEV_MODE && !isMobileDevice()) {
    console.log('[DEV] Desktop — use simulateTargetFound(N)');
    return;
  }

  sceneEl.addEventListener('arReady', function () {});
  sceneEl.addEventListener('arError', function () {
    showScreen('screen-error');
  });

  function tryStartMindAR(attempt) {
    var maxAttempts = 15;
    try {
      var mindARSystem = getMindARSystem();
      if (mindARSystem) {
        mindARSystem.start();
      } else if (attempt < maxAttempts) {
        setTimeout(function () { tryStartMindAR(attempt + 1); }, 2000);
      } else {
        showScreen('screen-error');
      }
    } catch (err) {
      showScreen('screen-error');
    }
  }

  if (sceneEl.hasLoaded) {
    tryStartMindAR(1);
  } else {
    sceneEl.addEventListener('loaded', function () {
      tryStartMindAR(1);
    });
  }
}

function bindTargetEvents() {
  MAQUINAS.forEach(function (maquina) {
    var entity = document.getElementById('target-' + maquina.id);
    if (!entity) return;

    (function (idx) {
      entity.addEventListener('targetFound', function () {
        onTargetFound(idx);
      });
      entity.addEventListener('targetLost', function () {
        onTargetLost(idx);
      });
    })(maquina.id);
  });
}

// === DEV MODE: MOCKING ===

function simulateTargetFound(targetIndex) {
  if (!DEV_MODE) return;
  onTargetFound(targetIndex);
}

function simulateTargetLost(targetIndex) {
  if (!DEV_MODE) return;
  onTargetLost(targetIndex);
}

// === EVENT LISTENERS ===

document.getElementById('btn-start').addEventListener('click', function () {
  startAR();
});

document.getElementById('btn-retry').addEventListener('click', function () {
  startAR();
});

// Controls
document.getElementById('btn-mute').addEventListener('click', function () {
  toggleMute();
});

document.getElementById('btn-help').addEventListener('click', function () {
  showHelp();
});

document.getElementById('btn-home').addEventListener('click', function () {
  goHome();
});

// Close video button (X on video screen)
document.getElementById('btn-close-video').addEventListener('click', function () {
  closeVideo();
});

// Help modal close
document.getElementById('btn-close-help').addEventListener('click', function () {
  hideHelp();
});

// Bind MindAR target events
if (sceneEl.hasLoaded) {
  bindTargetEvents();
} else {
  sceneEl.addEventListener('loaded', function () {
    bindTargetEvents();
  });
}

// === INIT ===
updateMuteBtn();
