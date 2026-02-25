# Bodega AR — Progress Tracker

> Este fichero se actualiza al final de cada sesión de desarrollo.
> Léelo al inicio de cada nuevo chat para saber por dónde vamos.

---

## Estado actual

**Última sesión completada**: 4 — UX completa + Despliegue
**Fecha última actualización**: 2026-02-25
**URL producción**: https://bodega-ar.pages.dev
**Repo GitHub**: https://github.com/jesusono1/bodega-ar

## Sesiones completadas

### ✅ Sesión 1 — Scaffolding + Cámara (Módulo 0) — Completada 2026-02-23

- [x] Estructura de carpetas: `assets/targets/`, `assets/videos/`, `assets/posters/`, `assets/img/`, `css/`, `js/`
- [x] `.gitignore` (excluye `certs/`, `node_modules/`, `scripts/`, `package.json`, `package-lock.json`, `.claude/`)
- [x] `README.md` con instrucciones de mkcert + http-server
- [x] `index.html` — Aldonza design system, getUserMedia, pantallas welcome/scanning/error, Eruda
- [x] `progress.md` (este fichero)
- [x] mkcert instalado (Chocolatey), certificados generados para `192.168.21.145`
- [x] Servidor HTTPS local verificado en PC (Chrome `https://localhost:3000`)

### ✅ Sesión 2 — AR funcional con vídeo (Módulos 1 + 2) — Completada 2026-02-23

- [x] A-Frame v1.5.0 + MindAR v1.2.5 vía CDN
- [x] Escena A-Frame + MindAR (`autoStart: false`)
- [x] Lazy loading de vídeo, autoplay muted+playsinline+loop
- [x] Panel de info de máquina, funciones de mocking, DEV_MODE
- [x] `targets.mind` compilado, vídeo de prueba `GIRAFA.MP4`

### ✅ Sesión 3 — Multi-target + Lazy Loading (Módulo 3) — Completada 2026-02-24

- [x] 4 targets con `maxTrack: 1`
- [x] `releaseVideo()` reutilizable con liberación de memoria iOS
- [x] Guards para eventos stale, IIFE en closures

### ✅ Sesión 3.5 — Carteles + 15 targets (Módulo 5 parcial) — Completada 2026-02-25

- [x] Generador de carteles `carteles-ar.html` + `scripts/generate-posters.js`
- [x] 15 PNGs en `assets/posters/`, compilados en `targets.mind` (4.49 MB)
- [x] `MAQUINAS[]` con 15 entradas (8 almazara + 7 bodega)

### ✅ Sesión 4 — UX completa + Despliegue (Módulos 4 + 6) — Completada 2026-02-25

- [x] Separar CSS → `css/style.css`, JS → `js/app.js`
- [x] Pantalla de bienvenida mejorada (logo placeholder, subtítulo Aldonza Gourmet)
- [x] Pantalla de escaneo con animación de móvil buscando
- [x] Controles: mute/unmute, ayuda (?), volver a bienvenida
- [x] Spinner de carga de vídeo
- [x] Pantalla de error de cámara con icono
- [x] Modal de ayuda con 4 pasos
- [x] **CAMBIO ARQUITECTURAL**: vídeo como overlay HTML 2D (no 3D en A-Frame)
  - MindAR solo detecta el target → abre vídeo a pantalla completa
  - El usuario cierra con botón X para volver a escanear
  - Elimina completamente el parpadeo del tracking 3D
- [x] Fix MindAR init: buscar en `systems` además de `components` (necesario en iOS)
- [x] GitHub CLI (`gh`) instalado, repo creado: `jesusono1/bodega-ar`
- [x] Cloudflare Pages desplegado: https://bodega-ar.pages.dev
- [x] Auto-deploy desde GitHub (cada push actualiza producción)
- [x] **VERIFICADO en móvil**: Safari iOS ✅, Chrome iOS ✅, Chrome Android ✅
- [x] **VERIFICADO**: detección de cartel impreso funciona, vídeo se reproduce sin parpadeo

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

## Próxima sesión — Sesión 5: Vídeos reales + Limpieza producción

- [ ] Recibir 15 vídeos MP4 del cliente
- [ ] Optimizar con ffmpeg (720p, 16:9, H.264, 2-4 Mbps, sin audio o con audio según prefiera)
- [ ] Sustituir GIRAFA.MP4 por los 15 vídeos reales en `MAQUINAS[]`
- [ ] Limpiar código: eliminar Eruda, mocking, DEV_MODE, dev-banner
- [ ] Logo de la bodega en pantalla de bienvenida (si disponible)
- [ ] Generar QR de acceso (opcional, puede ir en los carteles)
- [ ] Test final en Android Chrome + iOS Safari con todos los carteles
- [ ] Imprimir 15 carteles en A3/A4 papel mate

## Assets pendientes del cliente

- [ ] 15 vídeos MP4 de las máquinas funcionando
- [ ] Logo de la bodega (logo-bodega.png) para pantalla de bienvenida

## Notas técnicas importantes

- **MindAR en iOS**: el sistema se registra en `sceneEl.systems` (no en `components`). El código busca en ambos.
- **Vídeo 2D overlay**: el vídeo NO se renderiza en 3D. MindAR solo detecta → se abre `<video>` HTML nativo a pantalla completa. Esto elimina el parpadeo del tracking.
- **Cloudflare Pages**: límite 25 MB por archivo. Vídeos deben estar por debajo.
- **No necesita WiFi**: funciona con 5G/4G, la webapp está en internet público.

## Scripts de desarrollo disponibles

```bash
# Regenerar los 15 carteles PNG (800px wide) en assets/posters/
node scripts/generate-posters.js

# Recompilar targets.mind desde los PNGs de assets/posters/
node scripts/compile-targets.mjs

# Servidor HTTPS local
cd "C:\Users\jmurcia\OneDrive - CORPORACION HMS\access\IA_AR_Bodega y almazara"
npx http-server -S -C certs/localhost.pem -K certs/localhost-key.pem -p 3000
```

**Requisitos**: `npm install` en la raíz del proyecto (instala canvas, mind-ar, etc.)
**Nota Windows**: `npm install mind-ar --ignore-scripts`, luego borrar `node_modules/mind-ar/node_modules/canvas`.
