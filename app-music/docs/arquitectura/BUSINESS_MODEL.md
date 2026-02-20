# Modelo de Negocio: Plataforma de Streaming en Vivo

## 🎯 Concepto Principal

**Los subscribers pagan por acceso a transmisiones EN VIVO de creators, no por contenido grabado.**

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE NEGOCIO                          │
└─────────────────────────────────────────────────────────────┘

Creator                          Subscriber
   │                                 │
   │ 1. Crea cuenta                  │ 1. Crea cuenta
   │ 2. Configura perfil             │ 2. Descubre creators
   │ 3. Genera códigos de acceso     │ 3. Compra código (externo)
   │    (después de recibir pago)    │ 4. Canjea código
   │                                 │ 5. Obtiene acceso
   │ 4. Programa transmisión         │
   │ 5. Inicia stream desde PC/OBS   │ 6. Ve transmisiones EN VIVO
   │    (RTMP → Servidor)            │    del creator
   │                                 │
   └─────────────────────────────────┘
```

## 📺 Transmisiones en Vivo

### Para Creators:

1. **Configurar Stream**
   - Crear sesión de transmisión
   - Obtener URL RTMP y Stream Key
   - Configurar OBS/software de streaming

2. **Transmitir**
   - Conectar OBS al servidor RTMP
   - Transmitir música/contenido en vivo
   - Los subscribers con acceso pueden ver

3. **Finalizar**
   - Terminar transmisión
   - Ver estadísticas (viewers, duración, etc.)

### Para Subscribers:

1. **Obtener Acceso**
   - Descubrir creator
   - Comprar código de acceso (pago externo)
   - Canjear código en la plataforma

2. **Ver Transmisiones**
   - Ver lista de creators con acceso
   - Ver transmisiones EN VIVO
   - Recibir notificaciones cuando creator va en vivo

3. **Acceso Temporal**
   - El acceso expira después de X días (ej: 30 días)
   - Puede renovar comprando nuevo código

## 📚 Contenido Grabado (Opcional)

El contenido que los creators suben NO es el producto principal, sino:

- **Biblioteca personal** del creator
- **Material de archivo** para subscribers
- **Contenido para usar en transmisiones** (playlists, tracks)

Los subscribers con acceso activo pueden:

- Ver contenido grabado del creator
- Reproducir audio bajo demanda
- Acceder a playlists

## 🔐 Sistema de Acceso

### Códigos de Acceso

```typescript
AccessCode {
  code: "ABC123"           // Código único
  creatorId: "uuid"        // Creator que lo genera
  paymentId: "payment-123" // Referencia de pago externo
  amount: 999              // Precio en centavos
  currency: "USD"
  durationDays: 30         // Duración del acceso
  isRedeemed: false        // Si ya fue canjeado
  isValid: true            // Si es válido
}
```

### Access Grants

```typescript
AccessGrant {
  id: "uuid"
  subscriberId: "uuid"     // Subscriber que tiene acceso
  creatorId: "uuid"        // Creator al que tiene acceso
  accessCode: "ABC123"     // Código usado
  grantedAt: Date          // Cuándo se otorgó
  expiresAt: Date          // Cuándo expira
  isActive: true           // Si está activo
}
```

### Validación de Acceso

Antes de permitir ver una transmisión:

```typescript
// 1. Verificar que el subscriber tenga AccessGrant activo
const hasAccess = await validateStreamAccess(streamId, subscriberId);

// 2. Verificar que no haya expirado
if (grant.expiresAt < new Date()) {
  return false;
}

// 3. Permitir acceso
if (hasAccess) {
  await joinStream(streamId, subscriberId);
}
```

## 🎵 Flujo Técnico de Streaming

### 1. Creator Configura Transmisión

```bash
POST /live/streams
Authorization: Bearer <creator-token>
{
  "title": "Friday Night Mix",
  "description": "House music session",
  "scheduledFor": "2024-02-15T20:00:00Z",
  "recordingEnabled": true
}

Response:
{
  "streamKey": "sk_abc123xyz",
  "rtmpUrl": "rtmp://stream.platform.com/live",
  "playbackUrl": "https://cdn.platform.com/live/abc123/index.m3u8"
}
```

### 2. Creator Transmite desde OBS

```
OBS Settings:
- Server: rtmp://stream.platform.com/live
- Stream Key: sk_abc123xyz
- Bitrate: 128kbps (audio)
- Format: AAC
```

### 3. Subscriber Ve Transmisión

```bash
# Obtener streams activos (solo de creators con acceso)
GET /live/streams/active
Authorization: Bearer <subscriber-token>

# Unirse a stream
POST /live/streams/:streamId/join
Authorization: Bearer <subscriber-token>

# Obtener URL de reproducción
Response:
{
  "playbackUrl": "https://cdn.platform.com/live/abc123/index.m3u8",
  "hasAccess": true
}
```

### 4. Reproducción en el Cliente

```typescript
// Usar HLS.js para reproducir
const hls = new Hls();
hls.loadSource(playbackUrl);
hls.attachMedia(audioElement);
```

## 💰 Modelo de Monetización

### Flujo de Pago (Externo)

```
1. Subscriber → Pasarela de Pago (Stripe/PayPal)
2. Pago exitoso → Webhook a plataforma
3. Plataforma → Genera AccessCode
4. Creator → Comparte código con subscriber
5. Subscriber → Canjea código
6. Sistema → Crea AccessGrant
```

### Webhook de Pago

```typescript
POST /webhooks/payment
{
  "event": "payment.success",
  "paymentId": "pay_123",
  "creatorId": "creator-uuid",
  "amount": 999,
  "currency": "USD",
  "durationDays": 30,
  "idempotencyKey": "unique-key"
}

// Sistema automáticamente:
// 1. Genera AccessCode
// 2. Envía código al creator
// 3. Creator comparte con subscriber
```

## 📱 Interfaces de Usuario

### Creator Dashboard

- **Go Live**: Crear y configurar transmisión
- **My Streams**: Ver historial de transmisiones
- **Analytics**: Estadísticas de viewers
- **Access Codes**: Generar y gestionar códigos
- **Subscribers**: Ver lista de subscribers activos

### Subscriber Interface

- **Discover**: Buscar creators
- **Live Now**: Ver transmisiones activas (solo con acceso)
- **My Access**: Ver creators con acceso activo
- **Notifications**: Alertas cuando creator va en vivo

## 🔄 Ciclo de Vida del Acceso

```
1. Subscriber compra código → AccessCode creado
2. Subscriber canjea código → AccessGrant creado
3. Subscriber ve transmisiones → Durante período activo
4. Acceso expira → AccessGrant.isActive = false
5. Subscriber renueva → Compra nuevo código
```

## 🎯 Diferencias Clave

### ❌ NO es:

- Plataforma de música bajo demanda (como Spotify)
- Biblioteca de contenido grabado
- Streaming de archivos MP3

### ✅ SÍ es:

- Plataforma de transmisiones EN VIVO
- Acceso temporal a creators específicos
- Streaming en tiempo real (como Twitch para música)

## 🚀 Próximos Pasos

1. **Integrar servidor RTMP** (Nginx-RTMP, AWS IVS, etc.)
2. **Implementar notificaciones** cuando creator va en vivo
3. **Agregar chat en vivo** durante transmisiones
4. **Sistema de grabaciones** (opcional)
5. **Analytics avanzados** para creators

## 📊 Métricas Importantes

### Para Creators:

- Viewers concurrentes
- Viewers pico
- Duración promedio de visualización
- Subscribers activos
- Ingresos por período

### Para Subscribers:

- Tiempo total viendo streams
- Creators favoritos
- Próximas transmisiones programadas
