# Bodega AR — Visor de Realidad Aumentada

Aplicación WebAR para los visitantes de la bodega y almazara Aldonza. Permite ver las máquinas funcionando en tiempo real a través de la cámara del móvil, aunque estén paradas.

## Requisitos previos

- [Node.js](https://nodejs.org/) (v18+)
- [mkcert](https://github.com/FiloSottile/mkcert) (para certificados HTTPS locales)

## Configuración del entorno de desarrollo

### 1. Instalar mkcert

```bash
# Windows (con Chocolatey)
choco install mkcert

# Windows (con Scoop)
scoop bucket add extras
scoop install mkcert
```

### 2. Generar certificados locales

```bash
mkcert -install
mkdir certs
mkcert -cert-file certs/localhost.pem -key-file certs/localhost-key.pem localhost 127.0.0.1 ::1 TU_IP_LOCAL
```

> Sustituye `TU_IP_LOCAL` por la IP de tu PC en la red WiFi (ej: `192.168.1.50`).
> Para obtenerla: `ipconfig` en Windows.

### 3. Levantar el servidor HTTPS

```bash
npx http-server -S -C certs/localhost.pem -K certs/localhost-key.pem -p 3000
```

### 4. Probar desde el móvil

1. Conecta el móvil a la misma red WiFi que el PC
2. Abre `https://TU_IP_LOCAL:3000` en el navegador del móvil
3. Acepta el aviso de certificado autofirmado
4. Concede permiso de cámara
5. Deberías ver el feed de la cámara en pantalla

## Stack tecnológico

- **HTML + JavaScript vanilla** (sin frameworks)
- **A-Frame v1.5.0** (escenas 3D/WebXR) — CDN
- **MindAR v1.2.5** (image tracking AR) — CDN
- **Cloudflare Pages** (hosting producción)

## Estructura del proyecto

```
bodega-ar/
├── index.html              ← Punto de entrada principal (todo inline, módulos 0-3)
├── carteles-ar.html        ← Generador visual de carteles AR (abre en navegador)
├── css/style.css           ← Estilos (se creará en Módulo 4)
├── js/app.js               ← Lógica (se creará en Módulo 4)
├── assets/
│   ├── targets/
│   │   └── targets.mind    ← 15 image targets compilados para MindAR (4.49 MB)
│   ├── videos/
│   │   └── GIRAFA.MP4      ← Vídeo placeholder (sustituir por los 15 reales)
│   ├── posters/            ← 15 carteles PNG (800px wide) para impresión y targets
│   └── img/                ← Logo e imágenes de UI
├── scripts/                ← Herramientas de desarrollo (Node.js)
│   ├── generate-posters.js ← Genera los 15 carteles PNG desde Canvas
│   └── compile-targets.mjs ← Compila PNGs en targets.mind con MindAR OfflineCompiler
├── certs/                  ← Certificados locales (NO subir a git)
├── progress.md             ← Estado del desarrollo (leer al inicio de cada sesión)
├── CLAUDE.md               ← Hoja de ruta completa del proyecto
└── README.md               ← Este archivo
```

## Scripts de desarrollo

```bash
# Instalar dependencias (solo desarrollo, no van a producción)
npm install

# Generar los 15 carteles como PNG (800px wide)
node scripts/generate-posters.js

# Compilar targets.mind desde los PNGs
node scripts/compile-targets.mjs
```

## 15 máquinas configuradas

| # | Máquina | Zona | targetIndex |
|---|---------|------|-------------|
| 01 | Alimentador | Almazara | 0 |
| 02 | Limpiadora | Almazara | 1 |
| 03 | Molturadora | Almazara | 2 |
| 04 | Centrífuga Horizontal | Almazara | 3 |
| 05 | Centrífuga Vertical | Almazara | 4 |
| 06 | Filtradora | Almazara | 5 |
| 07 | Depósito de Decantación | Almazara | 6 |
| 08 | Embotelladora Aceite | Almazara | 7 |
| 09 | Despalilladora | Bodega | 8 |
| 10 | Depósito de Fermentación | Bodega | 9 |
| 11 | Depósito de Mezclas | Bodega | 10 |
| 12 | Depósito de Envejecimiento | Bodega | 11 |
| 13 | Embotelladora Vino | Bodega | 12 |
| 14 | Barricas | Bodega | 13 |
| 15 | Zona Tranquila | Bodega | 14 |
