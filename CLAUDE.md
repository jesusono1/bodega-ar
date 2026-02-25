# CLAUDE.md — Visor AR para Bodega y Almazara

## Descripción del proyecto

Aplicación web de Realidad Aumentada (WebAR) que permite a los visitantes de una bodega y almazara ver las máquinas funcionando en tiempo real a través de la cámara de su móvil, aunque las máquinas estén paradas.

### Concepto de la experiencia

1. El visitante escanea un QR en la entrada de la bodega
2. Se abre una webapp en el navegador del móvil (sin instalar nada)
3. La webapp activa la cámara del dispositivo
4. Al apuntar a los carteles identificativos de cada máquina, el sistema detecta el cartel y superpone un vídeo de la máquina funcionando
5. El vídeo se ancla al cartel y se reproduce en bucle mientras el visitante apunta a él

### Datos clave del entorno

- **Ubicación**: bodega y almazara (interior, excepto la tolva de recepción de uva que está en exterior)
- **Número de máquinas**: 15
- **Máquinas fijas**: sí, siempre están en el mismo lugar
- **Vídeos**: ya están grabados por el propietario
- **Visitantes**: grupos guiados de ~10 personas simultáneas
- **Requisito crítico**: NO requiere instalación de app. Todo funciona en el navegador.

---

## Stack tecnológico

| Componente | Tecnología | Versión/Notas |
|---|---|---|
| Framework 3D/WebXR | A-Frame | Última versión estable (CDN) |
| Image Tracking AR | MindAR | Última versión estable (CDN) |
| Lenguaje | HTML + JavaScript vanilla | Sin frameworks (no React, no Vue) |
| CSS | Vanilla CSS | Sin preprocesadores |
| Servidor local dev | Node.js o Python | Con HTTPS (obligatorio para cámara) |
| Certificados locales | mkcert | Para desarrollo local |
| Hosting producción | Cloudflare Pages | Gratuito, HTTPS incluido, CDN global |
| Control de versiones | Git + GitHub | Despliegue automático a Cloudflare |

### Dependencias externas (CDN)

```html
<!-- A-Frame -->
<script src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>

<!-- MindAR (image tracking para A-Frame) -->
<script src="https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js"></script>
```

> **IMPORTANTE**: No instalar A-Frame ni MindAR con npm. Usar siempre CDN. Verificar las últimas versiones estables en el momento del desarrollo.

### Lo que NO usar

- NO usar React, Vue, Angular ni ningún framework JS
- NO usar TypeScript
- NO usar bundlers (webpack, vite, etc.)
- NO usar Docker
- NO usar backend/servidor (todo es estático)
- NO usar AR.js (tracking inferior a MindAR para image targets)
- NO usar WebXR API nativa (soporte experimental, no funciona en iOS)

---

## Arquitectura del proyecto

### Estructura de carpetas

```
bodega-ar/
├── CLAUDE.md                    ← Este archivo (hoja de ruta)
├── index.html                   ← Punto de entrada principal
├── css/
│   └── style.css                ← Estilos de la webapp
├── js/
│   └── app.js                   ← Lógica de la aplicación (UI, estados, eventos)
├── assets/
│   ├── targets/
│   │   └── targets.mind         ← Archivo compilado con todos los image targets
│   ├── videos/
│   │   ├── despalilladora.mp4
│   │   ├── prensa.mp4
│   │   ├── deposito-fermentacion.mp4
│   │   └── ... (15 vídeos)
│   ├── posters/                 ← Carteles/placas de cada máquina (diseños originales)
│   │   ├── despalilladora.png
│   │   ├── prensa.png
│   │   └── ...
│   └── img/
│       ├── logo-bodega.png      ← Logo de la bodega para la UI
│       └── ...
├── certs/                       ← Certificados para desarrollo local (NO subir a git)
│   ├── localhost.pem
│   └── localhost-key.pem
├── .gitignore
└── README.md
```

### Decisiones de arquitectura

- **Un solo HTML** (`index.html`): contiene toda la estructura de la app y la escena A-Frame
- **Un solo archivo de targets** (`targets.mind`): MindAR compila múltiples targets en un único archivo binario. Cada target se referencia por su índice (0, 1, 2...)
- **Vídeos como archivos estáticos**: se sirven directamente, sin streaming ni procesamiento de servidor
- **Sin routing**: no hay páginas ni navegación. Es una single-page app mínima con estados (bienvenida → cámara AR → visualización)

---

## Plan de desarrollo modular

### Módulo 0 — Entorno de desarrollo local

**Objetivo**: servidor HTTPS local funcionando y accesible desde el móvil.

**Tareas**:

1. Inicializar el proyecto con la estructura de carpetas
2. Instalar `mkcert` y generar certificados locales:
   ```bash
   mkcert -install
   mkcert localhost 127.0.0.1 ::1 <IP-LOCAL-DEL-PC>
   ```
3. Levantar servidor HTTPS local con `http-server` (NO escribir un server.js personalizado):
   ```bash
   npx http-server -S -C certs/localhost.pem -K certs/localhost-key.pem -p 3000
   ```
   > **IMPORTANTE**: No crear un servidor Node.js desde cero. Usar siempre `http-server` o `live-server` por línea de comandos con los certificados de mkcert. Esto evita errores de MIME types y rutas.
4. Crear `index.html` mínimo que solo pida permiso de cámara y muestre el feed de vídeo
5. Crear `.gitignore` (excluir `certs/`, `node_modules/`, `.DS_Store`)

**Criterio de éxito**: desde el móvil (misma WiFi), abrir `https://<IP-LOCAL>:3000`, aceptar el aviso de certificado, conceder permiso de cámara, y ver la imagen de la cámara en pantalla.

**Notas técnicas**:
- HTTPS es **obligatorio** para acceder a `getUserMedia` (cámara) en navegadores móviles
- El certificado autofirmado generará un aviso en el navegador del móvil; hay que aceptarlo manualmente (solo en desarrollo)
- Probar tanto en Android (Chrome) como en iOS (Safari) si es posible
- **Depuración móvil obligatoria**: incluir `eruda.js` vía CDN en todos los módulos de desarrollo (0-5). Esto inyecta un botón flotante en el móvil que abre DevTools (Console, Network, Elements) directamente en la pantalla. Sin esto, depurar errores de vídeo o cámara en Safari es imposible.
  ```html
  <!-- SOLO DESARROLLO — eliminar en producción (Módulo 6) -->
  <script src="https://cdn.jsdelivr.net/npm/eruda"></script>
  <script>eruda.init();</script>
  ```

---

### Módulo 1 — Primer target AR funcional

**Objetivo**: detectar una imagen y mostrar un elemento 3D superpuesto.

**Tareas**:

1. Crear una imagen de prueba como target provisional (alta resolución, buen contraste, muchos detalles — puede ser una foto cualquiera imprimida en A4 para testing)
2. Compilar la imagen como target de MindAR:
   - Opción A (recomendada para empezar): usar la herramienta web de MindAR → `https://hiukim.github.io/mind-ar-js-doc/tools/compile`
   - Opción B: compilar programáticamente con el CLI de MindAR
3. Integrar A-Frame + MindAR en `index.html`:
   ```html
   <!-- Estructura básica de escena MindAR + A-Frame -->
   <a-scene
     mindar-image="imageTargetSrc: ./assets/targets/targets.mind"
     vr-mode-ui="enabled: false"
     device-orientation-permission-ui="enabled: false"
   >
     <a-camera position="0 0 0" look-controls="enabled: false"></a-camera>
     
     <a-entity mindar-image-target="targetIndex: 0">
       <!-- Contenido AR que aparece al detectar el target 0 -->
       <a-box position="0 0 0" scale="0.5 0.5 0.5" color="red"></a-box>
     </a-entity>
   </a-scene>
   ```
4. Probar imprimiendo la imagen target y apuntando con el móvil

**Criterio de éxito**: al apuntar al papel impreso, aparece un cubo rojo flotando sobre él. Al mover el móvil, el cubo se mantiene anclado a la imagen.

**Notas técnicas**:
- MindAR necesita imágenes con muchos "feature points" (esquinas, texturas, detalles). Una imagen plana de un solo color NO funcionará
- El archivo `.mind` se genera offline y se sirve como estático
- `vr-mode-ui="enabled: false"` evita que A-Frame muestre el botón de VR
- `look-controls="enabled: false"` evita conflictos con el tracking de MindAR

---

### Módulo 2 — Vídeo superpuesto sobre target

**Objetivo**: reemplazar el cubo de prueba por un vídeo real.

**Tareas**:

1. Preparar un vídeo de prueba:
   - Formato: MP4, codec H.264
   - Resolución: 720p máximo (1280x720)
   - Bitrate: 2-4 Mbps
   - **Aspect ratio: TODOS los vídeos deben ser 16:9** (horizontal). Si algún vídeo fue grabado en vertical (9:16), forzar 16:9 con ffmpeg añadiendo bandas negras o recortando.
   - Duración: recortar a la sección más representativa (15-30 segundos ideal para el loop)
   - Herramienta recomendada: ffmpeg
   ```bash
   # Forzar 16:9 horizontal, 720p, sin audio
   ffmpeg -i original.mp4 -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -b:v 3M -an output.mp4
   ```
   > Nota: `-an` elimina el audio. Si queremos audio, usar `-c:a aac -b:a 128k` en su lugar.
   > **IMPORTANTE**: Verificar que TODOS los vídeos tienen el mismo aspect ratio antes de avanzar al Módulo 3. Un solo vídeo con ratio diferente causará deformación visual.

2. Integrar el vídeo en A-Frame:
   ```html
   <a-assets>
     <video id="video-prensa" src="./assets/videos/prensa.mp4"
            playsinline webkit-playsinline
            muted loop crossorigin="anonymous"
            preload="auto">
     </video>
   </a-assets>
   
   <a-entity mindar-image-target="targetIndex: 0">
     <a-plane
       position="0 0 0"
       width="1"
       height="0.5625"
       rotation="0 0 0"
       material="src: #video-prensa; transparent: false"
     ></a-plane>
   </a-entity>
   ```

3. Gestionar autoplay:
   - Los navegadores móviles **requieren interacción del usuario** para reproducir vídeo
   - Solución: el botón "Comenzar visita" de la pantalla de bienvenida sirve como interacción del usuario
   - El vídeo debe ser `muted` para autoplay en iOS Safari (política de Apple)
   - Configurar que el vídeo se reproduzca al detectar el target y se pause al perderlo

   > **NOTA PARA MÓDULOS POSTERIORES**: Este módulo usa 1 solo `<video>` en `<a-assets>` como prueba de concepto. En el Módulo 3 se implementará la estrategia de lazy loading real. NO extrapolar este patrón a 15 vídeos.

4. Ajustar dimensiones del plano de vídeo:
   - El `width` y `height` del `<a-plane>` deben respetar el aspect ratio del vídeo
   - Para vídeo 16:9: width=1, height=0.5625
   - Ajustar `position` para que el vídeo aparezca centrado o ligeramente por encima del cartel

**Criterio de éxito**: al apuntar al target impreso, el vídeo de la máquina se reproduce en bucle, superpuesto y anclado a la imagen. Al dejar de apuntar, el vídeo se pausa.

**Notas técnicas**:
- `playsinline` y `webkit-playsinline` son obligatorios para iOS (sin ellos, Safari abre el vídeo en pantalla completa)
- `muted` es obligatorio para autoplay en móvil
- Si se quiere audio, se puede añadir un botón de "activar sonido" que el usuario toque manualmente
   - **CRÍTICO iOS audio**: en iOS, `video.muted = false` SOLO funciona si se ejecuta **directamente dentro del callback de un evento `click` del usuario** (no diferido, no en un setTimeout, no delegado). La arquitectura del botón de unmute debe ser:
     ```javascript
     // ✅ CORRECTO — dentro del handler directo del click
     btnUnmute.addEventListener('click', () => {
       videoEl.muted = false; // Funciona en iOS
     });
     
     // ❌ INCORRECTO — diferido o fuera del handler
     btnUnmute.addEventListener('click', () => {
       setTimeout(() => { videoEl.muted = false; }, 100); // FALLA en iOS
     });
     ```
- `preload="auto"` puede causar problemas con 15 vídeos. Ver Módulo 3 para lazy loading

---

### Módulo 3 — Multi-target (3-4 máquinas)

**Objetivo**: escalar a varias máquinas con targets independientes.

**Tareas**:

1. Diseñar 3-4 carteles de prueba (ver sección "Diseño de carteles AR" más abajo)
2. Compilar todos los targets en un solo archivo `.mind`:
   - Pasar todas las imágenes a la vez al compilador de MindAR
   - El orden de las imágenes determina el `targetIndex` (0, 1, 2, 3...)
   - **Documentar qué índice corresponde a qué máquina**
3. Configurar múltiples targets en la escena:
   ```html
   <a-entity mindar-image-target="targetIndex: 0">
     <a-plane material="src: #video-maquina-0" ...></a-plane>
   </a-entity>
   
   <a-entity mindar-image-target="targetIndex: 1">
     <a-plane material="src: #video-maquina-1" ...></a-plane>
   </a-entity>
   
   <!-- etc. -->
   ```
4. Implementar **lazy loading de vídeos** (CRÍTICO para iOS):
   - **NO crear 15 etiquetas `<video>` en el HTML**. iOS Safari colapsará por falta de memoria RAM si se hace esto.
   - Mantener solo **1 o 2 elementos `<video>`** en el DOM como contenedores reutilizables
   - Usar JavaScript para **cambiar dinámicamente el atributo `src`** dependiendo de qué `targetIndex` detecte MindAR en ese momento
   - **Destruir o vaciar el `src`** (`videoElement.src = ''` + `videoElement.load()`) cuando se pierda el target, para liberar memoria
   - Escuchar los eventos de MindAR `targetFound` y `targetLost` para gestionar el ciclo de vida del vídeo:
     ```javascript
     // Pseudocódigo del patrón de lazy loading
     targetEntity.addEventListener('targetFound', () => {
       videoEl.src = MAQUINAS[targetIndex].video;
       videoEl.play();
     });
     targetEntity.addEventListener('targetLost', () => {
       videoEl.pause();
       videoEl.removeAttribute('src');
       videoEl.load(); // Libera memoria del buffer
     });
     ```

5. Configurar **`maxTrack: 1`** en la escena MindAR:
   ```html
   <a-scene
     mindar-image="imageTargetSrc: ./assets/targets/targets.mind; maxTrack: 1"
     ...
   >
   ```
   > **Justificación**: los visitantes van en grupo guiado y miran una máquina a la vez. No tiene sentido que el móvil busque 15 targets simultáneamente. `maxTrack: 1` ahorra drásticamente batería y CPU.

6. Probar con los 3-4 carteles impresos en ubicaciones separadas

**Criterio de éxito**: se puede apuntar a cualquiera de los carteles y cada uno muestra su vídeo correcto. Los vídeos cargan bajo demanda sin retardo perceptible excesivo.

**Notas técnicas**:
- Con `maxTrack: 1` y la estrategia de lazy loading (1-2 `<video>` reutilizables), el rendimiento debería ser bueno incluso en dispositivos de gama baja
- Si aun así el rendimiento es malo con 15 targets en un solo `.mind`, considerar dividir en zonas (un `.mind` por sala) con un selector en la UI
- Los eventos `targetFound` y `targetLost` de MindAR son los puntos de enganche para toda la lógica de carga/descarga de vídeo

---

### Módulo 4 — UX de la visita

**Objetivo**: experiencia de usuario completa y pulida.

**Tareas**:

1. **Pantalla de bienvenida**:
   - Logo de la bodega
   - Nombre de la experiencia
   - Breve instrucción ("Apunta tu cámara a los carteles de las máquinas")
   - Botón "Comenzar visita" (este botón es CRÍTICO: activa los permisos de cámara y habilita el autoplay de vídeos)
   - Diseño atractivo y acorde con la marca de la bodega

2. **Gestión de estados de UI** (IMPORTANTE — mantener simple):
   - La gestión de las pantallas (Bienvenida, Escáner AR, Info de máquina, Error) se hará **exclusivamente añadiendo y quitando una clase CSS `.hidden { display: none; }`** a contenedores `<div>` fijos superpuestos al canvas de A-Frame
   - NO implementar un sistema de routing, state management, o renderizado dinámico
   - **Control de z-index y pointer-events** (CRÍTICO — sin esto los botones no responden):
     ```css
     /* La escena A-Frame SIEMPRE debajo */
     a-scene {
       position: fixed;
       z-index: 0;
     }
     
     /* Todas las capas de UI SIEMPRE encima con eventos activos */
     [id^="screen-"] {
       position: fixed;
       top: 0; left: 0; right: 0; bottom: 0;
       z-index: 9999;
       pointer-events: auto;
     }
     
     /* Cuando una pantalla está oculta, desactivar sus eventos */
     .hidden {
       display: none;
       pointer-events: none;
     }
     ```
   - Sin esta configuración, el canvas de A-Frame se "tragará" los clics y los botones HTML no responderán
   - Estructura HTML:
     ```html
     <div id="screen-welcome">...</div>          <!-- Visible al inicio -->
     <div id="screen-scanning" class="hidden">...</div>  <!-- "Busca un cartel" -->
     <div id="screen-info" class="hidden">...</div>       <!-- Info de la máquina -->
     <div id="screen-error" class="hidden">...</div>      <!-- Error de cámara -->
     
     <!-- La escena A-Frame está siempre debajo -->
     <a-scene ...>...</a-scene>
     ```
   - Cambiar entre pantallas:
     ```javascript
     function showScreen(screenId) {
       document.querySelectorAll('[id^="screen-"]').forEach(el => el.classList.add('hidden'));
       document.getElementById(screenId).classList.remove('hidden');
     }
     ```

3. **Estados de la UI durante la visita**:
   - **Sin target detectado**: overlay semitransparente con texto "Busca un cartel de máquina" y un icono animado (un móvil moviéndose, un visor, etc.)
   - **Cargando vídeo**: spinner o barra de progreso sobre el target detectado
   - **Vídeo reproduciéndose**: panel inferior o lateral con información de la máquina (nombre, descripción breve, función en el proceso)
   - **Error de cámara**: mensaje explicativo ("No se pudo acceder a la cámara. Verifica los permisos en ajustes del navegador")

3. **Panel de información de la máquina**:
   - Nombre de la máquina
   - Descripción breve de su función (1-2 líneas)
   - Posición en el proceso productivo ("Paso 3 de 8: Fermentación")
   - Botón opcional de audio narrado (mejora futura)

4. **Controles**:
   - Botón mute/unmute si los vídeos tienen audio
   - Botón de pausa/play
   - Botón "?" de ayuda rápida
   - Botón para volver a la pantalla de bienvenida

5. **Responsive**: la webapp debe funcionar en cualquier tamaño de pantalla móvil (no necesita funcionar en desktop)

6. **Test de usabilidad**: pedir a alguien que no conozca el sistema que haga la visita sin instrucciones verbales. Si no puede, la UX necesita mejoras.

**Criterio de éxito**: un visitante puede completar la experiencia sin ayuda verbal del guía.

**Notas técnicas**:
- Los overlays y paneles de UI deben estar **encima** del canvas de A-Frame, usando CSS `position: fixed` y `z-index` alto
- No mezclar la UI de la webapp con entidades 3D de A-Frame para la interfaz de usuario
- El diseño visual debe seguir la identidad corporativa de la bodega

---

### Módulo 5 — Escalar a 15 máquinas

**Objetivo**: sistema completo con todas las máquinas operativas.

**Tareas**:

1. Diseñar los 15 carteles definitivos (ver sección "Diseño de carteles AR")
2. Optimizar los 15 vídeos con ffmpeg
3. Compilar los 15 targets en el archivo `.mind`
4. Configurar la escena A-Frame con los 15 targets
5. Configurar los datos de cada máquina (nombre, descripción, índice):
   ```javascript
   // Estructura de datos de máquinas (en app.js o como JSON)
   const MAQUINAS = [
     {
       id: 0,
       nombre: "Tolva de recepción",
       descripcion: "Recibe la uva recién vendimiada",
       paso: "1 de 15",
       video: "tolva.mp4",
       exterior: true  // esta máquina está en exterior
     },
     {
       id: 1,
       nombre: "Despalilladora",
       descripcion: "Separa el grano del raspón",
       paso: "2 de 15",
       video: "despalilladora.mp4",
       exterior: false
     },
     // ... 15 máquinas
   ];
   ```
6. **Test de rendimiento**:
   - Probar en un móvil de gama media (no solo en tu teléfono bueno)
   - Medir tiempos de carga de vídeo
   - Verificar que el tracking no se degrada con 15 targets
   - Probar con 10 personas simultáneas en la misma WiFi

**Criterio de éxito**: las 15 máquinas funcionan correctamente sin caídas de rendimiento en dispositivos de gama media.

---

### Módulo 6 — Despliegue en Cloudflare Pages

**Objetivo**: la webapp accesible desde internet con URL pública.

**Tareas**:

1. Crear repositorio en GitHub (si no existe)
2. Limpiar el proyecto para producción:
   - Eliminar carpeta `certs/`
   - **Eliminar `eruda.js`** (las dos líneas de script de depuración móvil)
   - **Eliminar o desactivar funciones de mocking** (`simulateTargetFound`, `simulateTargetLost`, `DEV_MODE`)
   - Verificar `.gitignore`
   - Verificar que todos los vídeos están optimizados
3. Crear cuenta en Cloudflare Pages (gratis)
4. Conectar el repositorio de GitHub con Cloudflare Pages:
   - Framework preset: "None"
   - Build command: (vacío, no hay build)
   - Build output directory: `/` (raíz del proyecto)
5. Configurar dominio:
   - Opción A: usar el subdominio gratuito `proyecto.pages.dev`
   - Opción B: conectar dominio propio si lo tiene
6. Verificar HTTPS (automático en Cloudflare)
7. **Test de producción**:
   - Probar desde un móvil con datos móviles (no WiFi)
   - Verificar tiempos de carga
   - Probar en Android Chrome y iOS Safari
8. Generar QR que apunte a la URL de producción
9. Diseñar e imprimir el QR para la entrada de la bodega

**Criterio de éxito**: un visitante escanea el QR, se abre la webapp, y puede ver todas las máquinas en AR.

**Notas técnicas**:
- Cloudflare Pages tiene límite de 25 MB por archivo. Los vídeos deben estar por debajo
- Si algún vídeo supera 25 MB, reducir bitrate o duración con ffmpeg
- El ancho de banda gratuito de Cloudflare Pages es generoso para este volumen de tráfico

---

### Módulo 7 (opcional) — Mejoras futuras

Ideas priorizadas por impacto:

1. **Audio narrado por máquina**: el guía no siempre puede explicar todo. Un botón de audio por máquina complementa la visita
2. **Multi-idioma**: selector de idioma (español, inglés, francés) para visitantes internacionales
3. **Mapa de la bodega**: pantalla con plano interactivo que muestra dónde está cada máquina
4. **Analytics**: Google Analytics o similar para saber cuántos visitantes usan el AR y qué máquinas ven más
5. **Modo offline**: Service Workers para cachear la webapp y los vídeos en la primera visita (útil si la cobertura WiFi es irregular)
6. **Contenido estacional**: vídeos diferentes según la época del año (vendimia activa vs. reposo)

---

## Regla fundamental de trabajo con Claude Code

> **IMPORTANTE: Trabajaremos estrictamente módulo por módulo. No avances al siguiente módulo ni escribas código futuro hasta que yo te confirme que el módulo actual funciona perfectamente en el móvil. Cuando completes un módulo, pregúntame si quiero pasar al siguiente.**

---

## Guía de diseño visual (basada en www.aldonzagourmet.com)

La webapp AR debe seguir la identidad visual de la marca Aldonza. Estos son los parámetros de diseño extraídos de la web corporativa.

### Paleta de colores

| Nombre | Hex | Uso |
|---|---|---|
| Burdeos principal | `#4D161F` | Fondos principales, botones, headers |
| Marrón oscuro | `#230909` | Fondos alternativos, secciones oscuras |
| Blanco | `#FFFFFF` | Texto sobre fondo oscuro, bordes |
| Negro | `#000000` | Texto sobre fondo claro, detalles |
| Blanco semitransparente | `rgba(255,255,255,0.5)` | Placeholders, textos secundarios |
| Burdeos semitransparente | `rgba(77,22,31,0.7)` | Overlays sobre imágenes |

### Tipografías

```css
/* Tipografía principal — todo el cuerpo de texto */
font-family: 'Montserrat', sans-serif;

/* Tipografía de títulos y encabezados */
font-family: 'Yeseva One', cursive;

/* Importar desde Google Fonts */
@import url('https://fonts.googleapis.com/css?family=Montserrat:300,400,500,700,800|Yeseva+One');
```

- **Cuerpo de texto**: Montserrat, peso 300 (light) por defecto, 16px
- **Títulos**: Yeseva One, con `letter-spacing: 5px`
- **Botones y labels**: Montserrat, peso 300, `text-transform: uppercase`, `letter-spacing: 5px`, 14px

### Estilo de botones

```css
.btn {
  height: 48px;
  line-height: 48px;
  border-radius: 24px;         /* Píldora redondeada */
  border: 1px solid #fff;
  padding: 0 25px;
  min-width: 130px;
  font-size: 14px;
  text-transform: uppercase;
  font-weight: 300;
  letter-spacing: 5px;
  color: #fff;
  text-align: center;
  background: transparent;
  transition: 0.3s;
}
```

### Principios generales de diseño

- **Estilo**: elegante, minimalista, premium. Nada de colores brillantes, gradientes llamativos ni esquinas cuadradas agresivas
- **Fondos**: oscuros (burdeos `#4D161F` o marrón `#230909`)
- **Texto**: siempre blanco sobre fondo oscuro, con pesos ligeros (300)
- **Bordes**: 1px solid, blancos o semitransparentes
- **Transiciones**: suaves, 0.3s-0.5s, ease
- **Espaciado**: generoso, mucho aire entre elementos
- **Líneas decorativas**: línea blanca de 45px bajo títulos (`width: 45px; height: 1px; background: #fff`)

### Ejemplo de overlay para la pantalla de bienvenida

```css
/* Fondo oscuro con texto centrado, estilo Aldonza */
#screen-welcome {
  background: #230909;
  color: #fff;
  font-family: 'Montserrat', sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

#screen-welcome h1 {
  font-family: 'Yeseva One', cursive;
  font-size: 36px;
  letter-spacing: 5px;
}
```

---

## Estrategia de desarrollo y separación de archivos

### Módulos 0-3: Todo inline en un solo HTML

Durante el prototipado rápido (Módulos 0 a 3), **meter todo el CSS y JS inline en `index.html`**. Esto facilita la iteración rápida sin perder el rastro de la lógica.

```html
<!-- Módulos 0-3: todo en un solo archivo -->
<html>
<head>
  <style>
    /* Todo el CSS aquí */
  </style>
</head>
<body>
  <!-- HTML de la app + escena A-Frame -->
  
  <script>
    // Todo el JS aquí
  </script>
</body>
</html>
```

### Módulo 4 en adelante: Separar en archivos

Cuando la UI crezca (Módulo 4), **separar CSS y JS en sus archivos** (`css/style.css` y `js/app.js`). En este punto, la cantidad de código justifica la separación para mantener el orden.

---

## Estrategia de mocking para desarrollo rápido

Para evitar tener que coger el móvil y apuntar a un cartel impreso en cada iteración de código (especialmente en el Módulo 4 cuando se trabaja en la UI), crear una **función de simulación temporal**:

```javascript
// === MODO DESARROLLO (eliminar antes de producción) ===
// Simula la detección de un target sin necesidad de cámara
function simulateTargetFound(targetIndex) {
  const event = new CustomEvent('targetFound');
  const targetEntity = document.querySelector(
    `[mindar-image-target="targetIndex: ${targetIndex}"]`
  );
  if (targetEntity) targetEntity.dispatchEvent(event);
  console.log(`[DEV] Simulado targetFound para índice ${targetIndex}`);
}

function simulateTargetLost(targetIndex) {
  const event = new CustomEvent('targetLost');
  const targetEntity = document.querySelector(
    `[mindar-image-target="targetIndex: ${targetIndex}"]`
  );
  if (targetEntity) targetEntity.dispatchEvent(event);
  console.log(`[DEV] Simulado targetLost para índice ${targetIndex}`);
}

// Uso desde la consola del navegador de escritorio:
// simulateTargetFound(0)  → simula detectar la máquina 0
// simulateTargetLost(0)   → simula perder la máquina 0
```

> **NOTA**: Estas funciones son solo para desarrollo. Deben eliminarse o desactivarse antes del despliegue a producción (Módulo 6). Se puede usar una variable `const DEV_MODE = true;` para condicionar su existencia.

Los carteles junto a cada máquina son el elemento más crítico del sistema. Un mal target = detección fallida.

### Reglas obligatorias

1. **Alto contraste**: mezcla de zonas claras y oscuras, evitar fondos uniformes
2. **Mucho detalle/textura**: cuantos más "puntos de interés" tenga la imagen, mejor la detecta MindAR
3. **Asimétrico**: el diseño NO debe ser simétrico (MindAR puede confundir la orientación)
4. **Sin repeticiones**: evitar patrones repetitivos (rayas, cuadros, polka dots)
5. **Único**: cada cartel debe ser visualmente distinto de los demás (MindAR los diferencia por sus features)
6. **Tamaño mínimo**: imprimir en A4 como mínimo. A3 es mejor para detección a más distancia
7. **Material mate**: evitar superficies brillantes o laminadas (generan reflejos que confunden al tracker)
8. **Bien iluminado**: el cartel debe estar en una zona con iluminación suficiente y estable

### Qué funciona bien como target

- Fotografías con mucho detalle
- Ilustraciones complejas con muchos colores y formas
- Texto combinado con gráficos e imágenes
- Mapas, diagramas técnicos, infografías

### Qué NO funciona como target

- Texto solo sobre fondo blanco
- Logotipos simples
- Imágenes con grandes zonas de un solo color
- Diseños geométricos simétricos
- Superficies brillantes o reflectantes

### Estructura sugerida para los carteles

```
┌────────────────────────────────┐
│  [Logo bodega]  NOMBRE MÁQUINA │
│                                │
│   ┌──────────────────────┐     │
│   │                      │     │
│   │  Ilustración/foto    │     │
│   │  detallada de la     │     │
│   │  máquina o proceso   │     │
│   │                      │     │
│   └──────────────────────┘     │
│                                │
│  Descripción breve de la       │
│  función de esta máquina       │
│  en el proceso productivo.     │
│                                │
│  Año: XXXX  │  Paso X de 15   │
│  ─── Apunta tu cámara aquí ───│
└────────────────────────────────┘
```

### Validación de targets

Antes de imprimir los 15 carteles definitivos, **siempre compilar el target y probar** con MindAR. La herramienta de compilación muestra una visualización de los feature points detectados. Si hay pocos puntos (menos de ~30-40), el diseño necesita más detalle.

### Optimización del archivo `.mind`

- **Redimensionar TODAS las imágenes de los carteles a máximo 800px de ancho** antes de pasarlas por el compilador de MindAR. No usar las imágenes a resolución de impresión (300dpi, 3000px+).
- Objetivo: que el archivo `.mind` final con los 15 targets **no supere los 10-15 MB**. Si lo supera, reducir las imágenes a 600px.
- Un `.mind` de 20+ MB causará tiempos de carga inaceptables en conexiones 3G/4G.
- Comando para redimensionar con ffmpeg/ImageMagick:
  ```bash
  # Redimensionar todos los carteles a max 800px de ancho
  mogrify -resize 800x -path ./assets/targets/optimized/ ./assets/posters/*.png
  ```
- Compilar los targets desde las imágenes optimizadas, nunca desde los originales.

---

## Compatibilidad de navegadores

### Soporte confirmado

- **Android**: Chrome (principal), Samsung Internet, Firefox
- **iOS**: Safari (obligatorio, es el único con acceso completo a cámara en iOS)

### Problemas conocidos

- **iOS Safari**: requiere `playsinline` en los vídeos, tiene políticas más estrictas de autoplay
- **Firefox móvil**: puede tener menor rendimiento en el tracking
- **iOS Chrome/Firefox**: en iOS, todos los navegadores usan WebKit internamente, así que el comportamiento es similar a Safari

### Testeo mínimo obligatorio

Cada módulo debe probarse al menos en:
1. Chrome en Android (dispositivo gama media)
2. Safari en iOS (iPhone de los últimos 3-4 años)

---

## Convenciones de código

- **Idioma del código**: inglés para variables, funciones y comentarios técnicos
- **Idioma del contenido**: español para textos visibles al usuario
- **Indentación**: 2 espacios
- **Comillas**: simples en JS (`'`), dobles en HTML (`"`)
- **Comentarios**: explicar el "por qué", no el "qué"
- **Sin minificación**: el proyecto es suficientemente pequeño para no necesitarla
- **Sin dependencias npm en producción**: todo vía CDN (A-Frame, MindAR)
- **Nombrado de archivos de vídeo**: kebab-case, nombre descriptivo de la máquina (`prensa-neumatica.mp4`, `deposito-fermentacion.mp4`)

---

## Troubleshooting común

| Problema | Causa probable | Solución |
|---|---|---|
| Cámara no se activa | No HTTPS | Verificar que se usa HTTPS (incluso en local) |
| Target no se detecta | Imagen con poco detalle | Rediseñar cartel con más contraste y textura |
| Vídeo no se reproduce | Falta interacción de usuario | Asegurar que hay botón "Comenzar" antes del AR |
| Vídeo no reproduce en iOS | Falta `playsinline` | Añadir atributo `playsinline webkit-playsinline` |
| Rendimiento bajo | Demasiados vídeos precargados | Implementar lazy loading (Módulo 3) |
| Target se confunde con otro | Carteles demasiado similares | Diferenciar más los diseños |
| Tracking inestable | Poca luz o reflejos | Mejorar iluminación o usar material mate en carteles |

---

## Referencias y documentación

- **MindAR docs**: https://hiukim.github.io/mind-ar-js-doc/
- **MindAR GitHub**: https://github.com/hiukim/mind-ar-js
- **MindAR compilador de targets**: https://hiukim.github.io/mind-ar-js-doc/tools/compile
- **A-Frame docs**: https://aframe.io/docs/
- **A-Frame ejemplos**: https://aframe.io/examples/
- **Cloudflare Pages docs**: https://developers.cloudflare.com/pages/
- **mkcert (certificados locales)**: https://github.com/FiloSottile/mkcert
- **ffmpeg (optimización vídeos)**: https://ffmpeg.org/documentation.html
