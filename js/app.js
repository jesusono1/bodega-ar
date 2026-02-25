// === CONFIGURATION ===
var DEV_MODE = true;

// Machine data — 15 targets matching targets.mind compilation order
// IMPORTANT: targetIndex matches the order images were compiled in targets.mind
// (cartel_01_... = index 0, cartel_02_... = index 1, etc.)
var MAQUINAS = [
  {
    id: 0,
    nombre: 'Alimentador',
    descripcion: 'Recepción de la aceituna. La tolva recibe la aceituna recién recolectada e inicia el proceso de extracción del aceite.',
    paso: 'Paso 1 de 15 · Almazara',
    video: './assets/videos/GIRAFA.MP4'
  },
  {
    id: 1,
    nombre: 'Limpiadora',
    descripcion: 'Limpieza y lavado de la aceituna. Elimina hojas, ramas y tierra para garantizar la pureza del aceite.',
    paso: 'Paso 2 de 15 · Almazara',
    video: './assets/videos/GIRAFA.MP4'
  },
  {
    id: 2,
    nombre: 'Molturadora',
    descripcion: 'Trituración de la aceituna. Muele el fruto entero (piel, pulpa y hueso) para formar una pasta homogénea.',
    paso: 'Paso 3 de 15 · Almazara',
    video: './assets/videos/GIRAFA.MP4'
  },
  {
    id: 3,
    nombre: 'Centrífuga Horizontal',
    descripcion: 'Separación de fases. El decánter separa el aceite del agua y los sólidos (orujo) por fuerza centrífuga.',
    paso: 'Paso 4 de 15 · Almazara',
    video: './assets/videos/GIRAFA.MP4'
  },
  {
    id: 4,
    nombre: 'Centrífuga Vertical',
    descripcion: 'Purificación del aceite. Elimina las últimas impurezas y restos de agua para obtener un aceite limpio.',
    paso: 'Paso 5 de 15 · Almazara',
    video: './assets/videos/GIRAFA.MP4'
  },
  {
    id: 5,
    nombre: 'Filtradora',
    descripcion: 'Filtrado final del aceite. Pasa el aceite por placas filtrantes para conseguir la claridad y brillo característicos.',
    paso: 'Paso 6 de 15 · Almazara',
    video: './assets/videos/GIRAFA.MP4'
  },
  {
    id: 6,
    nombre: 'Depósito de Decantación',
    descripcion: 'Reposo y clarificación. El aceite reposa en depósitos de acero inoxidable permitiendo la decantación natural.',
    paso: 'Paso 7 de 15 · Almazara',
    video: './assets/videos/GIRAFA.MP4'
  },
  {
    id: 7,
    nombre: 'Embotelladora Aceite',
    descripcion: 'Envasado del aceite de oliva virgen extra. La línea de embotellado dosifica y sella cada botella.',
    paso: 'Paso 8 de 15 · Almazara',
    video: './assets/videos/GIRAFA.MP4'
  },
  {
    id: 8,
    nombre: 'Despalilladora',
    descripcion: 'Separación del raspón. Separa el grano de uva del escobajo, primer paso de la vinificación.',
    paso: 'Paso 9 de 15 · Bodega',
    video: './assets/videos/GIRAFA.MP4'
  },
  {
    id: 9,
    nombre: 'Depósito de Fermentación',
    descripcion: 'Fermentación alcohólica. Las levaduras transforman los azúcares del mosto en alcohol durante 7-15 días.',
    paso: 'Paso 10 de 15 · Bodega',
    video: './assets/videos/GIRAFA.MP4'
  },
  {
    id: 10,
    nombre: 'Depósito de Mezclas',
    descripcion: 'Coupage y ensamblaje. Se combinan vinos de distintas variedades para crear el blend deseado.',
    paso: 'Paso 11 de 15 · Bodega',
    video: './assets/videos/GIRAFA.MP4'
  },
  {
    id: 11,
    nombre: 'Depósito de Envejecimiento',
    descripcion: 'Crianza en depósito. El vino madura en depósitos de acero inoxidable a temperatura controlada.',
    paso: 'Paso 12 de 15 · Bodega',
    video: './assets/videos/GIRAFA.MP4'
  },
  {
    id: 12,
    nombre: 'Embotelladora',
    descripcion: 'Envasado del vino. La línea de embotellado llena, corcha y etiqueta cada botella.',
    paso: 'Paso 13 de 15 · Bodega',
    video: './assets/videos/GIRAFA.MP4'
  },
  {
    id: 13,
    nombre: 'Barricas',
    descripcion: 'Crianza en roble. El vino reposa en barricas de roble francés y americano adquiriendo complejidad y aromas.',
    paso: 'Paso 14 de 15 · Bodega',
    video: './assets/videos/GIRAFA.MP4'
  },
  {
    id: 14,
    nombre: 'Zona Tranquila',
    descripcion: 'Reposo en botella. El vino finaliza su evolución en la botella, en condiciones de oscuridad y temperatura estable.',
    paso: 'Paso 15 de 15 · Bodega',
    video: './assets/videos/GIRAFA.MP4'
  }
];

// === DOM REFERENCES ===

var arVideo = document.getElementById('ar-video');
var sceneEl = document.querySelector('a-scene');
var videoLoader = document.getElementById('video-loader');

// === STATE ===

var currentTargetIndex = -1;
var isVideoMuted = true;
var isVideoPaused = false;

// === SCREEN MANAGEMENT ===

/**
 * Show a single screen by ID, hiding all others.
 * Controls bar visibility is managed separately.
 */
function showScreen(screenId) {
  document.querySelectorAll('[id^="screen-"]').forEach(function (el) {
    el.classList.add('hidden');
  });
  var target = document.getElementById(screenId);
  if (target) {
    target.classList.remove('hidden');
  }

  // Show/hide controls bar — only visible during scanning/info
  var controlsBar = document.getElementById('controls-bar');
  if (controlsBar) {
    var showControls = (screenId === 'screen-scanning' || screenId === 'screen-info');
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

// === AR VIDEO MANAGEMENT ===

/**
 * Release the shared video element and free memory.
 */
function releaseVideo() {
  arVideo.pause();
  arVideo.removeAttribute('src');
  arVideo.load(); // Flushes buffer — critical for iOS memory management
  isVideoPaused = false;
  hideVideoLoader();
}

/**
 * Load and play a machine video when its target is found.
 */
function onTargetFound(targetIndex) {
  var maquina = MAQUINAS[targetIndex];
  if (!maquina) {
    console.warn('[AR] No machine data for targetIndex:', targetIndex);
    return;
  }

  // Release any previously loaded video before loading the new one
  if (currentTargetIndex !== -1 && currentTargetIndex !== targetIndex) {
    console.log('[AR] Releasing previous video for target:', currentTargetIndex);
    releaseVideo();
  }

  currentTargetIndex = targetIndex;

  // Update info panel
  document.getElementById('info-name').textContent = maquina.nombre;
  document.getElementById('info-step').textContent = maquina.paso;
  document.getElementById('info-desc').textContent = maquina.descripcion;

  // Show loading spinner
  showVideoLoader();

  // Lazy-load video
  arVideo.src = maquina.video;
  arVideo.load();

  var playPromise = arVideo.play();
  if (playPromise !== undefined) {
    playPromise.then(function () {
      hideVideoLoader();
      isVideoPaused = false;
      updatePlayPauseBtn();
    }).catch(function (err) {
      console.warn('[AR] Video autoplay blocked:', err.message);
      hideVideoLoader();
    });
  }

  // Hide spinner when video data is ready (fallback for slow loads)
  arVideo.addEventListener('canplay', function onCanPlay() {
    hideVideoLoader();
    arVideo.removeEventListener('canplay', onCanPlay);
  });

  // Switch to info screen
  showScreen('screen-info');
  console.log('[AR] Target found:', maquina.nombre, '(index ' + targetIndex + ')');
}

/**
 * Pause and unload the video when the target is lost.
 */
function onTargetLost(targetIndex) {
  // Guard: ignore stale lost events if another target is already active
  if (currentTargetIndex !== targetIndex) {
    console.log('[AR] Ignoring stale targetLost for index:', targetIndex, '(current:', currentTargetIndex + ')');
    return;
  }

  console.log('[AR] Target lost, index:', targetIndex);
  currentTargetIndex = -1;

  releaseVideo();

  // Back to scanning screen
  showScreen('screen-scanning');
}

// === CONTROLS ===

/**
 * Update the play/pause button icon.
 */
function updatePlayPauseBtn() {
  var btn = document.getElementById('btn-playpause');
  if (!btn) return;
  // Swap SVG icon
  if (isVideoPaused) {
    btn.innerHTML = '<svg viewBox="0 0 24 24"><polygon points="6,4 20,12 6,20"></polygon></svg>';
  } else {
    btn.innerHTML = '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
  }
}

/**
 * Update the mute/unmute button icon.
 */
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
 * Toggle play/pause on the video.
 */
function togglePlayPause() {
  if (currentTargetIndex === -1) return;
  if (isVideoPaused) {
    arVideo.play();
    isVideoPaused = false;
  } else {
    arVideo.pause();
    isVideoPaused = true;
  }
  updatePlayPauseBtn();
}

/**
 * Toggle mute on the video.
 * CRITICAL iOS: muted=false MUST run inside a direct user click handler.
 */
function toggleMute() {
  isVideoMuted = !isVideoMuted;
  arVideo.muted = isVideoMuted;
  updateMuteBtn();
}

/**
 * Show the help modal.
 */
function showHelp() {
  var modal = document.getElementById('modal-help');
  if (modal) modal.classList.remove('hidden');
}

/**
 * Hide the help modal.
 */
function hideHelp() {
  var modal = document.getElementById('modal-help');
  if (modal) modal.classList.add('hidden');
}

/**
 * Return to the welcome screen, stopping AR.
 */
function goHome() {
  // Release current video
  if (currentTargetIndex !== -1) {
    currentTargetIndex = -1;
    releaseVideo();
  }

  // Stop MindAR if running on mobile
  if (!DEV_MODE || isMobileDevice()) {
    try {
      var mindARSystem = sceneEl.components['mindar-image-system'];
      if (mindARSystem) mindARSystem.stop();
    } catch (e) {
      console.warn('[AR] Could not stop MindAR:', e);
    }
  }

  showScreen('screen-welcome');
}

// === A-FRAME SCENE LIFECYCLE ===

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * Start the AR experience.
 */
function startAR() {
  showScreen('screen-scanning');

  // On desktop in DEV_MODE, skip MindAR
  if (DEV_MODE && !isMobileDevice()) {
    console.log('[DEV] Desktop detected — skipping MindAR. Use simulateTargetFound(0) to test.');
    return;
  }

  sceneEl.addEventListener('arReady', function () {
    console.log('[AR] MindAR ready — tracking active');
  });

  sceneEl.addEventListener('arError', function () {
    console.error('[AR] MindAR error — camera or tracking failed');
    showScreen('screen-error');
  });

  try {
    var mindARSystem = sceneEl.components['mindar-image-system'];
    if (mindARSystem) {
      mindARSystem.start();
    } else {
      console.warn('[AR] MindAR system not ready, retrying in 1s...');
      setTimeout(function () {
        try {
          sceneEl.components['mindar-image-system'].start();
        } catch (retryErr) {
          console.error('[AR] Retry failed:', retryErr);
          showScreen('screen-error');
        }
      }, 1000);
    }
  } catch (err) {
    console.error('[AR] Failed to start MindAR:', err);
    showScreen('screen-error');
  }
}

/**
 * Bind targetFound/targetLost events on each <a-entity> target.
 */
function bindTargetEvents() {
  MAQUINAS.forEach(function (maquina) {
    var entity = document.getElementById('target-' + maquina.id);
    if (!entity) {
      console.warn('[AR] Entity not found for target-' + maquina.id);
      return;
    }

    (function (idx) {
      entity.addEventListener('targetFound', function () {
        onTargetFound(idx);
      });
      entity.addEventListener('targetLost', function () {
        onTargetLost(idx);
      });
    })(maquina.id);

    console.log('[AR] Events bound for target-' + maquina.id + ' (' + maquina.nombre + ')');
  });
}

// === DEV MODE: MOCKING FUNCTIONS ===

function simulateTargetFound(targetIndex) {
  if (!DEV_MODE) {
    console.warn('[DEV] Mocking disabled — DEV_MODE is false');
    return;
  }
  console.log('[DEV] Simulating targetFound for index:', targetIndex);
  onTargetFound(targetIndex);
}

function simulateTargetLost(targetIndex) {
  if (!DEV_MODE) {
    console.warn('[DEV] Mocking disabled — DEV_MODE is false');
    return;
  }
  console.log('[DEV] Simulating targetLost for index:', targetIndex);
  onTargetLost(targetIndex);
}

// === EVENT LISTENERS ===

// Start button
document.getElementById('btn-start').addEventListener('click', function () {
  startAR();
});

// Retry button (error screen)
document.getElementById('btn-retry').addEventListener('click', function () {
  startAR();
});

// Controls — direct click handlers (CRITICAL for iOS audio)
document.getElementById('btn-mute').addEventListener('click', function () {
  toggleMute();
});

document.getElementById('btn-playpause').addEventListener('click', function () {
  togglePlayPause();
});

document.getElementById('btn-help').addEventListener('click', function () {
  showHelp();
});

document.getElementById('btn-home').addEventListener('click', function () {
  goHome();
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

// Set initial button states
updateMuteBtn();
updatePlayPauseBtn();

console.log('[App] Bodega AR — 15 targets configured');
if (DEV_MODE) {
  console.log('[DEV] Dev mode ON.');
  MAQUINAS.forEach(function (m) {
    console.log('[DEV]   simulateTargetFound(' + m.id + ')  →  ' + m.nombre);
  });
  console.log('[DEV]   simulateTargetLost(N)  →  libera el target N');
}
