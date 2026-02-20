# 🎬 Guía de Pruebas de Streaming en Desarrollo

Esta guía explica 3 métodos para probar el sistema de streaming en vivo durante desarrollo, desde el más simple hasta el más completo.

---

## Método 1: Script de Simulación (Recomendado para empezar)

**Complejidad**: 🟢 Baja  
**Qué prueba**: Flujo API completo + notificaciones Socket.IO  
**No necesita**: Video real, RTMP, OBS

### Requisitos previos

1. Backend corriendo (`cd app-music && npm run dev`)
2. Frontend corriendo (`cd client-web && npm run dev`)
3. Base de datos con al menos 1 creator y 1 subscriber
4. Un AccessGrant activo entre ellos

### Ejecutar

```bash
cd app-music

# Con variables de entorno por defecto
npx tsx scripts/dev-stream-test.ts

# Con credenciales personalizadas
CREATOR_EMAIL=mi-creator@test.com \
CREATOR_PASSWORD=mipass123 \
SUBSCRIBER_EMAIL=mi-sub@test.com \
SUBSCRIBER_PASSWORD=mipass123 \
npx tsx scripts/dev-stream-test.ts
```

### Qué verificar

1. ✅ Abrir el frontend como **subscriber** en el navegador
2. ✅ Ejecutar el script en otra terminal
3. ✅ Ver que aparece un **toast de notificación** "EN VIVO" (esquina superior derecha)
4. ✅ Verificar en **DevTools → Network → WS** que la conexión WebSocket está activa
5. ✅ Verificar en **Console** los logs `[Notifications] Stream started:`
6. ✅ Al final, ver el toast "Finalizó" cuando el stream termina

---

## Método 2: RTMP Local con Docker (Streaming de video real)

**Complejidad**: 🟡 Media  
**Qué prueba**: Streaming de video/audio real local  
**Necesita**: Docker, ffmpeg

### Paso 1: Levantar servidor RTMP local

```bash
docker run -d -p 1935:1935 -p 8080:8080 --name rtmp-server \
  alfg/nginx-rtmp
```

### Paso 2: Crear un stream en la API

```bash
# Login como creator
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"creator@test.com","password":"password123"}' \
  | jq -r '.data.token')

# Crear stream
STREAM=$(curl -s -X POST http://localhost:3000/live/streams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Test RTMP Local","description":"Testing with real RTMP"}')

echo $STREAM | jq '.data.streamKey'
```

### Paso 3: Enviar stream con ffmpeg

```bash
# Generar un video/audio de prueba y enviarlo al RTMP
ffmpeg -re -f lavfi -i testsrc2=size=640x360:rate=30 \
  -f lavfi -i sine=frequency=440:sample_rate=44100 \
  -c:v libx264 -preset ultrafast -tune zerolatency \
  -c:a aac -b:a 128k \
  -f flv rtmp://localhost:1935/live/TU_STREAM_KEY
```

### Paso 4: Simular webhook de start

```bash
curl -X POST http://localhost:3000/live/webhooks/stream/start \
  -H "Content-Type: application/json" \
  -d '{"streamKey":"TU_STREAM_KEY"}'
```

### Paso 5: Ver el stream

- Abrir en VLC: `rtmp://localhost:1935/live/TU_STREAM_KEY`
- O en el navegador (si configuras HLS): `http://localhost:8080/live/TU_STREAM_KEY/index.m3u8`

---

## Método 3: OBS Studio + RTMP Server

**Complejidad**: 🟡 Media  
**Qué prueba**: El flujo completo como lo haría un creator real  
**Necesita**: OBS Studio, servidor RTMP (Docker o remoto)

### Paso 1: Instalar OBS Studio

Descargar de [obsproject.com](https://obsproject.com)

### Paso 2: Levantar servidor RTMP

Mismo paso del Método 2.

### Paso 3: Configurar OBS

1. Abrir OBS → **Settings → Stream**
2. Service: **Custom**
3. Server: `rtmp://localhost:1935/live`
4. Stream Key: el que obtuviste de la API (`streamKey`)
5. **Settings → Output**:
   - Output Mode: Simple
   - Audio Bitrate: 128 kbps
   - Video Bitrate: 2500 kbps (o menos para pruebas)

### Paso 4: Empezar a transmitir

1. Agregar una fuente de audio/video en OBS (captura de pantalla, micrófono, etc.)
2. Click en **Start Streaming**
3. Simular el webhook de start (mismo curl del Método 2, Paso 4)

### Paso 5: Verificar

- El stream debería ser visible en el frontend
- Las notificaciones deberían aparecer para subscribers

---

## 📊 Comparación de Métodos

| Característica | Script | RTMP Docker | OBS |
|---|:---:|:---:|:---:|
| Facilidad de setup | ✅ | ⚠️ | ⚠️ |
| Prueba notificaciones | ✅ | ✅ | ✅ |
| Video/audio real | ❌ | ✅ | ✅ |
| Prueba el player HLS | ❌ | ✅ | ✅ |
| Simula experiencia real | ❌ | ⚠️ | ✅ |
| Sin dependencias extra | ✅ | ❌ | ❌ |

---

## 🔧 Troubleshooting

### ❓ No aparecen notificaciones

1. Verificar que el WebSocket está conectado: **DevTools → Network → WS**
2. Verificar en Console que aparece `[Notifications] Connected to Socket.IO`
3. Verificar que el subscriber tiene un `AccessGrant` activo con el creator

### ❓ El stream no inicia

1. Verificar que el `streamKey` es correcto
2. Verificar que el stream está en estado `scheduled` (no `ended` o `cancelled`)
3. Revisar logs del backend para errores

### ❓ El player no reproduce

1. Verificar que `playbackUrl` es una URL válida de HLS
2. Para desarrollo local, es normal que el player no funcione sin un servidor RTMP real
3. Usar el Método 2 o 3 para probar reproducción real de video
