# Live Streaming Module

Este módulo maneja la funcionalidad de transmisión en vivo para creators.

## Características

- ✅ Crear sesiones de streaming en vivo
- ✅ Gestionar streams programados
- ✅ Tracking de viewers en tiempo real
- ✅ Estadísticas de streaming
- ✅ Control de acceso basado en AccessGrants
- ✅ Webhooks para eventos de streaming
- ✅ Soporte para grabación de streams

## Arquitectura

```
Creator (OBS/ffmpeg) → RTMP Server (AWS IVS) → HLS → Subscribers
                            ↓
                       Webhooks
                            ↓
                    Backend API (este módulo)
```

## Endpoints API

### Creator Endpoints

**Crear Stream**

```http
POST /live/streams
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Mi Set en Vivo",
  "description": "Transmisión especial de viernes",
  "scheduledFor": "2024-03-15T20:00:00Z",
  "recordingEnabled": true
}

Response:
{
  "status": "success",
  "data": {
    "id": "uuid",
    "title": "Mi Set en Vivo",
    "status": "scheduled",
    "streamKey": "sk_abc123...",
    "rtmpUrl": "rtmps://...",
    "playbackUrl": "https://...m3u8",
    ...
  }
}
```

**Obtener Mis Streams**

```http
GET /live/streams/my?status=live
Authorization: Bearer {token}
```

**Actualizar Stream**

```http
PUT /live/streams/:streamId
Authorization: Bearer {token}

{
  "title": "Nuevo título",
  "description": "Nueva descripción"
}
```

**Terminar Stream**

```http
POST /live/streams/:streamId/end
Authorization: Bearer {token}
```

**Eliminar Stream**

```http
DELETE /live/streams/:streamId
Authorization: Bearer {token}
```

### Subscriber Endpoints

**Ver Streams Activos**

```http
GET /live/streams/active
Authorization: Bearer {token}
```

**Obtener Stream**

```http
GET /live/streams/:streamId
Authorization: Bearer {token}
```

**Validar Acceso**

```http
GET /live/streams/:streamId/access
Authorization: Bearer {token}

Response:
{
  "status": "success",
  "data": {
    "hasAccess": true
  }
}
```

**Unirse al Stream**

```http
POST /live/streams/:streamId/join
Authorization: Bearer {token}
```

**Salir del Stream**

```http
POST /live/streams/:streamId/leave
Authorization: Bearer {token}
```

**Ver Estadísticas**

```http
GET /live/streams/:streamId/stats
Authorization: Bearer {token}

Response:
{
  "status": "success",
  "data": {
    "streamId": "uuid",
    "viewerCount": 42,
    "peakViewers": 58,
    "totalViews": 150,
    "averageWatchTime": 1200,
    "startedAt": "2024-03-15T20:00:00Z",
    "endedAt": null
  }
}
```

### Webhook Endpoints

**Stream Started (llamado por servidor RTMP)**

```http
POST /live/webhooks/stream/start

{
  "streamKey": "sk_abc123..."
}
```

## Integración con Servicios Managed

### Opción 1: AWS IVS (Recomendado)

**Ventajas:**

- Baja latencia (2-5 segundos)
- Escalable automáticamente
- Grabación integrada
- $0.015/hora de streaming

**Setup:**

```bash
npm install @aws-sdk/client-ivs

# .env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
IVS_RECORDING_CONFIG_ARN=arn:aws:ivs:...
```

**Código:**

```typescript
import { awsIVSService } from './providers/aws-ivs';

// En live.service.ts, reemplazar:
const channel = await awsIVSService.createChannel(data.title, data.recordingEnabled);

const stream = await prisma.liveStream.create({
  data: {
    ...
    streamKey: channel.streamKey,
    rtmpUrl: channel.ingestEndpoint,
    playbackUrl: channel.playbackUrl,
  },
});
```

### Opción 2: Mux.com

**Ventajas:**

- API muy simple
- Dashboard excelente
- $0.005/minuto de streaming

**Setup:**

```bash
npm install @mux/mux-node

# .env
MUX_TOKEN_ID=your_token_id
MUX_TOKEN_SECRET=your_token_secret
```

### Opción 3: Agora.io

**Ventajas:**

- Muy baja latencia (<1 segundo)
- Ideal para interacción en tiempo real
- $0.99/1000 minutos

### Opción 4: Self-Hosted (Nginx-RTMP)

**Ventajas:**

- Control total
- Sin costos por minuto
- Requiere más setup

**Setup:**

```bash
# Instalar Nginx con módulo RTMP
# Ver: https://github.com/arut/nginx-rtmp-module
```

## Flujo de Trabajo del Creator

### 1. Crear Stream

```typescript
const stream = await fetch('/live/streams', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Mi Set en Vivo',
    recordingEnabled: true,
  }),
});
```

### 2. Configurar OBS Studio

1. Abrir OBS Studio
2. Settings → Stream
3. Service: Custom
4. Server: `{stream.rtmpUrl}`
5. Stream Key: `{stream.streamKey}`
6. Click "Start Streaming"

### 3. Alternativa: ffmpeg

```bash
ffmpeg -f alsa -i hw:1,0 \
  -c:a aac -b:a 128k \
  -f flv {rtmpUrl}/{streamKey}
```

### 4. Alternativa: Navegador (WebRTC)

```typescript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    deviceId: audioDeviceId,
    sampleRate: 48000,
    channelCount: 2,
  },
});

// Enviar a servidor WebRTC
```

## Flujo de Trabajo del Subscriber

### 1. Ver Streams Activos

```typescript
const streams = await fetch('/live/streams/active', {
  headers: { Authorization: `Bearer ${token}` },
});
```

### 2. Validar Acceso

```typescript
const access = await fetch(`/live/streams/${streamId}/access`, {
  headers: { Authorization: `Bearer ${token}` },
});

if (!access.data.hasAccess) {
  // Mostrar mensaje: "Necesitas canjear un código de acceso"
}
```

### 3. Unirse al Stream

```typescript
await fetch(`/live/streams/${streamId}/join`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
});
```

### 4. Reproducir con HLS.js

```typescript
import Hls from 'hls.js';

const video = document.getElementById('video');
const hls = new Hls();

hls.loadSource(stream.playbackUrl);
hls.attachMedia(video);
```

### 5. Salir del Stream

```typescript
await fetch(`/live/streams/${streamId}/leave`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
});
```

## Modelos de Base de Datos

### LiveStream

```prisma
model LiveStream {
  id               String
  creatorId        String
  title            String
  description      String?
  scheduledFor     DateTime?
  status           LiveStreamStatus  // scheduled, live, ended, cancelled
  streamKey        String  @unique
  rtmpUrl          String
  playbackUrl      String
  viewerCount      Int
  maxViewers       Int
  startedAt        DateTime?
  endedAt          DateTime?
  duration         Int
  recordingEnabled Boolean
  recordingUrl     String?
  createdAt        DateTime
  updatedAt        DateTime
}
```

### StreamViewer

```prisma
model StreamViewer {
  id           String
  streamId     String
  subscriberId String
  joinedAt     DateTime
  leftAt       DateTime?
  watchTime    Int
}
```

## Webhooks

Los webhooks permiten que el servidor de streaming notifique eventos:

### Stream Started

```http
POST /live/webhooks/stream/start
Content-Type: application/json

{
  "streamKey": "sk_abc123..."
}
```

Este webhook:

1. Actualiza el status a 'live'
2. Registra startedAt
3. Notifica a subscribers (opcional)

## Costos Estimados

### AWS IVS

- Streaming: $0.015/hora
- Viewers: $0.015/GB transferido
- Grabación: $0.029/hora
- Almacenamiento: $0.023/GB/mes

**Ejemplo:** 1 hora de stream con 50 viewers

- Streaming: $0.015
- Viewers (50 x 500MB): $0.375
- Total: ~$0.40/hora

### Mux.com

- Streaming: $0.005/minuto = $0.30/hora
- Viewers: $0.01/GB
- Grabación: incluida

**Ejemplo:** 1 hora con 50 viewers

- Streaming: $0.30
- Viewers: $0.25
- Total: ~$0.55/hora

## Próximos Pasos

1. **Instalar AWS SDK** o servicio elegido
2. **Configurar credenciales** en .env
3. **Actualizar live.service.ts** para usar el provider real
4. **Configurar webhooks** en el servicio de streaming
5. **Implementar notificaciones** cuando un stream inicia
6. **Agregar chat en vivo** (opcional, con WebSocket)
7. **Implementar DVR** (rewind en vivo)

## Testing

```bash
# Crear un stream de prueba
curl -X POST http://localhost:3000/live/streams \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Stream"}'

# Simular inicio de stream
curl -X POST http://localhost:3000/live/webhooks/stream/start \
  -H "Content-Type: application/json" \
  -d '{"streamKey":"sk_abc123..."}'
```

## Troubleshooting

**Error: "Stream key not found"**

- Verificar que el streamKey es correcto
- Verificar que el stream existe en la base de datos

**Error: "Access denied"**

- Verificar que el subscriber tiene un AccessGrant activo
- Verificar que el AccessGrant no ha expirado

**Stream no inicia**

- Verificar configuración de OBS
- Verificar que el RTMP URL es correcto
- Verificar logs del servidor de streaming
