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

// Delay before unloading video on targetLost (ms).
// Prevents flickering when tracking briefly loses and regains the target.
var TARGET_LOST_DELAY = 3000;
var lostTimer = null;

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
 * Cancel any pending targetLost timer.
 */
function cancelLostTimer() {
  if (lostTimer !== null) {
    clearTimeout(lostTimer);
    lostTimer = null;
  }
}

/**
 * Force a target entity's video plane to stay visible.
 * MindAR toggles object3D.visible every frame based on tracking confidence,
 * which causes flickering. We override this by forcing visible = true
 * on every render tick while the target is active.
 */
var visibilityOverride = null;

function startVisibilityOverride(targetIndex) {
  stopVisibilityOverride();
  var entity = document.getElementById('target-' + targetIndex);
  if (!entity) return;

  visibilityOverride = function () {
    if (entity.object3D) {
      entity.object3D.visible = true;
    }
  };
  sceneEl.addEventListener('renderstart', visibilityOverride);
  // A-Frame uses 'beforerender' or we can use the tick via a component,
  // but the simplest approach is to override on each animation frame
  visibilityOverride._raf = function loop() {
    if (!visibilityOverride) return;
    if (entity.object3D) entity.object3D.visible = true;
    visibilityOverride._rafId = requestAnimationFrame(loop);
  };
  visibilityOverride._rafId = requestAnimationFrame(visibilityOverride._raf);
}

function stopVisibilityOverride() {
  if (visibilityOverride) {
    if (visibilityOverride._rafId) {
      cancelAnimationFrame(visibilityOverride._rafId);
    }
    sceneEl.removeEventListener('renderstart', visibilityOverride);
    visibilityOverride = null;
  }
}

/**
 * Load and play a machine video when its target is found.
 */
function onTargetFound(targetIndex) {
  var maquina = MAQUINAS[targetIndex];
  if (!maquina) {
    return;
  }

  // If the same target re-appeared, cancel the pending lost timer
  if (currentTargetIndex === targetIndex) {
    cancelLostTimer();
    // Video is already loaded — just make sure it's playing
    if (arVideo.paused && !isVideoPaused) {
      arVideo.play();
    }
    showScreen('screen-info');
    return;
  }

  // Different target — release previous video
  cancelLostTimer();
  stopVisibilityOverride();
  if (currentTargetIndex !== -1) {
    releaseVideo();
  }

  currentTargetIndex = targetIndex;

  // Force the target entity to stay visible (prevents MindAR flickering)
  startVisibilityOverride(targetIndex);

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
    }).catch(function () {
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
}

/**
 * Handle target lost with a delay to avoid flickering.
 * If the same target reappears within TARGET_LOST_DELAY ms,
 * the timer is cancelled and the video keeps playing.
 */
function onTargetLost(targetIndex) {
  if (currentTargetIndex !== targetIndex) {
    return;
  }

  cancelLostTimer();
  lostTimer = setTimeout(function () {
    lostTimer = null;
    // Only release if this target is still the active one
    if (currentTargetIndex === targetIndex) {
      currentTargetIndex = -1;
      stopVisibilityOverride();
      releaseVideo();
      showScreen('screen-scanning');
    }
  }, TARGET_LOST_DELAY);
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
  // Cancel any pending lost timer and release video
  cancelLostTimer();
  stopVisibilityOverride();
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
      // Could not stop MindAR
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

  // On desktop in DEV_MODE, skip MindAR (can't open camera on PC)
  if (DEV_MODE && !isMobileDevice()) {
    console.log('[DEV] Desktop detected — skipping MindAR. Use simulateTargetFound(0) to test.');
    return;
  }

  sceneEl.addEventListener('arReady', function () {});

  sceneEl.addEventListener('arError', function () {
    showScreen('screen-error');
  });

  // Try to find and start MindAR system
  function getMindARSystem() {
    // Method 1: via components (older A-Frame / MindAR pattern)
    var sys = sceneEl.components && sceneEl.components['mindar-image-system'];
    if (sys) return sys;
    // Method 2: via systems (A-Frame systems registry)
    sys = sceneEl.systems && sceneEl.systems['mindar-image-system'];
    if (sys) return sys;
    return null;
  }

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
      console.error('[AR] Failed to start MindAR:', err);
      showScreen('screen-error');
    }
  }

  // Wait for scene to be fully loaded before starting
  if (sceneEl.hasLoaded) {
    tryStartMindAR(1);
  } else {
    sceneEl.addEventListener('loaded', function () {
      tryStartMindAR(1);
    });
  }
}

/**
 * Bind targetFound/targetLost events on each <a-entity> target.
 */
function bindTargetEvents() {
  MAQUINAS.forEach(function (maquina) {
    var entity = document.getElementById('target-' + maquina.id);
    if (!entity) {
      // Entity not found for this target
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

    // Events bound for this target
  });
}

// === DEV MODE: MOCKING FUNCTIONS ===

function simulateTargetFound(targetIndex) {
  if (!DEV_MODE) return;
  onTargetFound(targetIndex);
}

function simulateTargetLost(targetIndex) {
  if (!DEV_MODE) return;
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

// App ready
