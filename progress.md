# Bodega AR — Progress Tracker

> Este fichero se actualiza al final de cada sesión de desarrollo.
> Léelo al inicio de cada nuevo chat para saber por dónde vamos.

---

## Estado actual

**Sesión activa**: 4 de 5 (pendiente de implementación)
**Módulo activo**: 4 — UX completa
**Fecha última actualización**: 2026-02-25

## Sesiones completadas

### ✅ Sesión 1 — Scaffolding + Cámara (Módulo 0) — Completada 2026-02-23

- [x] Estructura de carpetas: `assets/targets/`, `assets/videos/`, `assets/posters/`, `assets/img/`, `css/`, `js/`
- [x] `.gitignore` (excluye `certs/`, `node_modules/`, `scripts/`, `package.json`, `package-lock.json`)
- [x] `README.md` con instrucciones de mkcert + http-server
- [x] `index.html` — Aldonza design system, getUserMedia, pantallas welcome/scanning/error, Eruda
- [x] `progress.md` (este fichero)
- [x] mkcert instalado (Chocolatey), certificados generados para `192.168.21.145`
- [x] Servidor HTTPS local verificado en PC (Chrome `https://localhost:3000`)
- [x] **VERIFICADO**: pantalla de bienvenida carga correctamente, cámara funciona, overlays visibles
- [ ] Prueba en iPhone pendiente — se hará en producción (Cloudflare Pages) para evitar problemas de certificados autofirmados en iOS Safari

### ✅ Sesión 2 — AR funcional con vídeo (Módulos 1 + 2) — Completada 2026-02-23

- [x] Añadir A-Frame v1.5.0 + MindAR v1.2.5 vía CDN
- [x] Reemplazar `getUserMedia` manual por escena A-Frame + MindAR (`autoStart: false`)
- [x] Crear escena AR con 1 `<a-entity mindar-image-target>` → `<a-plane>` con material de vídeo
- [x] Lazy loading de vídeo: 1 `<video>` reutilizable, src dinámico
- [x] Autoplay: muted, playsinline, webkit-playsinline, loop
- [x] Play en `targetFound`, pause + release en `targetLost`
- [x] Panel de info de máquina (nombre, paso, descripción) con diseño Aldonza
- [x] Funciones de mocking (`simulateTargetFound(0)` / `simulateTargetLost(0)`)
- [x] Variable `DEV_MODE` + banner visual "DEV MODE"
- [x] Estructura de datos `MAQUINAS[]` (1 entrada de prueba: Prensa neumática)
- [x] `assets/targets/targets.mind` compilado y en su carpeta
- [x] Vídeo de prueba `GIRAFA.MP4` en `assets/videos/`
- [x] Servidor HTTPS verificado → `npx http-server -S -C certs/localhost.pem -K certs/localhost-key.pem -p 3000`
- [x] **VERIFICADO**: `simulateTargetFound(0)` muestra panel, carga y reproduce vídeo
- [x] **VERIFICADO**: `simulateTargetLost(0)` oculta panel y libera memoria de vídeo
- [ ] Prueba con target impreso en A4 — pendiente (se hará en móvil en producción)

### ✅ Sesión 3 — Multi-target + Lazy Loading (Módulo 3) — Completada 2026-02-24

- [x] Añadir 4 `<a-entity mindar-image-target>` + `<a-plane>` en la escena A-Frame (target-0 a target-3)
- [x] Actualizar `MAQUINAS[]` con 4 entradas iniciales
- [x] Añadir `maxTrack: 1` al atributo `mindar-image` de `<a-scene>`
- [x] Función `releaseVideo()` reutilizable — libera buffer/memoria en iOS correctamente
- [x] Guard en `onTargetFound` para liberar vídeo anterior si hay cambio de target
- [x] Guard en `onTargetLost` para ignorar eventos stale de targets ya abandonados
- [x] IIFE en `bindTargetEvents` para cierre correcto de closures en forEach
- [x] Log mejorado: lista todos los `simulateTargetFound(N)` disponibles en consola

### ✅ Sesión 3.5 — Carteles + 15 targets (Módulo 5 parcial) — Completada 2026-02-25

- [x] Generador de carteles `carteles-ar.html` — 15 carteles vintage con ilustraciones Canvas únicas por máquina
- [x] Script Node.js `scripts/generate-posters.js` — genera los 15 carteles como PNG a 800px de ancho
- [x] 15 PNGs en `assets/posters/` (cartel_01_alimentador_almazara.png ... cartel_15_zona_tranquila.png)
- [x] Script Node.js `scripts/compile-targets.mjs` — compila PNGs a `.mind` usando MindAR OfflineCompiler
- [x] `assets/targets/targets.mind` recompilado con los 15 targets (4.49 MB)
- [x] `index.html` actualizado: 15 `<a-entity>` targets (target-0 a target-14) en la escena A-Frame
- [x] `MAQUINAS[]` actualizado con 15 entradas (8 almazara + 7 bodega) con nombres, descripciones y pasos
- [x] Dependencias de desarrollo: `canvas@3.1.0`, `mind-ar` (--ignore-scripts) + TF.js, msgpack, etc.
- [ ] **PENDIENTE**: sustituir `GIRAFA.MP4` por 15 vídeos reales (cliente tiene vídeos en SharePoint)
- [ ] **PENDIENTE**: imprimir carteles en A3/A4 mate y probar detección real con MindAR

**Mapping de targets (targetIndex → cartel → máquina):**

| Index | Cartel PNG | Máquina | Zona |
|-------|-----------|---------|------|
| 0 | cartel_01_alimentador_almazara.png | Alimentador | Almazara |
| 1 | cartel_02_limpiadora.png | Limpiadora | Almazara |
| 2 | cartel_03_molturadora.png | Molturadora | Almazara |
| 3 | cartel_04_centrifuga_horizontal.png | Centrífuga Horizontal | Almazara |
| 4 | cartel_05_centrifuga_vertical.png | Centrífuga Vertical | Almazara |
| 5 | cartel_06_filtradora.png | Filtradora | Almazara |
| 6 | cartel_07_deposito_de_decantacion.png | Depósito de Decantación | Almazara |
| 7 | cartel_08_embotelladora_aceite.png | Embotelladora Aceite | Almazara |
| 8 | cartel_09_despalilladora.png | Despalilladora | Bodega |
| 9 | cartel_10_deposito_de_fermentacion.png | Depósito de Fermentación | Bodega |
| 10 | cartel_11_deposito_de_mezclas.png | Depósito de Mezclas | Bodega |
| 11 | cartel_12_deposito_de_envejecimiento.png | Depósito de Envejecimiento | Bodega |
| 12 | cartel_13_embotelladora.png | Embotelladora Vino | Bodega |
| 13 | cartel_14_barricas.png | Barricas | Bodega |
| 14 | cartel_15_zona_tranquila.png | Zona Tranquila | Bodega |

## Próxima sesión — Sesión 4: UX completa (Módulo 4)

- [ ] Extraer CSS → `css/style.css`, JS → `js/app.js`
- [ ] Pantalla de bienvenida pulida (logo Aldonza si disponible)
- [ ] Pantalla de escaneo con animación/icono de "busca un cartel"
- [ ] Panel de info de máquina mejorado
- [ ] Pantalla de error de cámara
- [ ] Controles: botón mute/unmute, pause/play, ayuda (?), volver a bienvenida
- [ ] Spinner/loading al cargar vídeo
- [ ] z-index + pointer-events correctos
- [ ] Test de usabilidad

## Sesión 5 — Producción (Módulo 6)

- [ ] Añadir 15 vídeos reales optimizados con ffmpeg (720p, 16:9, H.264, 2-4 Mbps, sin audio)
- [ ] Limpiar código: eliminar Eruda, mocking, DEV_MODE
- [ ] Desplegar a Cloudflare Pages
- [ ] Generar QR de acceso
- [ ] Test en Android Chrome + iOS Safari

## Assets pendientes del cliente

- [ ] 15 vídeos MP4 de las máquinas (el cliente tiene vídeos en SharePoint corporativo)
- [ ] Logo de la bodega (logo-bodega.png) para pantalla de bienvenida

## Scripts de desarrollo disponibles

```bash
# Regenerar los 15 carteles PNG (800px wide) en assets/posters/
node scripts/generate-posters.js

# Recompilar targets.mind desde los PNGs de assets/posters/
node scripts/compile-targets.mjs
```

**Requisitos**: `npm install` en la raíz del proyecto (instala canvas, mind-ar, etc.)
**Nota**: En Windows, si `mind-ar` falla al instalar, usar `npm install mind-ar --ignore-scripts` y luego borrar `node_modules/mind-ar/node_modules/canvas` para que use el `canvas` de la raíz.
