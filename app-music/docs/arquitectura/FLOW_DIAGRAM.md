# 📊 Diagrama de Flujo - Transmisión en Vivo y Compra

## 🎯 Flujo Completo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SIMULACIÓN DE TRANSMISIÓN EN VIVO                        │
└─────────────────────────────────────────────────────────────────────────────┘

FASE 1: REGISTRO Y AUTENTICACIÓN
═════════════════════════════════════════════════════════════════════════════

    Creator                                    Subscriber
       │                                           │
       ├─ POST /auth/register ──────────────────┐  │
       │  (email, password, userType: creator)  │  │
       │                                        │  │
       │  ◄─ Token + User ID ─────────────────┤  │
       │                                        │  │
       │                                        │  ├─ POST /auth/register ──┐
       │                                        │  │ (email, password,      │
       │                                        │  │  userType: subscriber) │
       │                                        │  │                        │
       │                                        │  │ ◄─ Token + User ID ──┤
       │                                        │  │                        │
       └────────────────────────────────────────┘  └────────────────────────┘


FASE 2: CREAR TRANSMISIÓN PROGRAMADA
═════════════════════════════════════════════════════════════════════════════

    Creator
       │
       ├─ POST /live/streams ─────────────────────────────────────┐
       │  {                                                        │
       │    title: "Friday Night Electronic Mix",                 │
       │    description: "Deep house session",                    │
       │    scheduledFor: "2026-02-20T20:00:00Z"                 │
       │  }                                                        │
       │                                                          │
       │  ◄─ Stream ID + Stream Key + RTMP URL ──────────────────┤
       │                                                          │
       └──────────────────────────────────────────────────────────┘


FASE 3: DESCUBRIMIENTO Y COMPRA
═════════════════════════════════════════════════════════════════════════════

    Subscriber                          Creator
       │                                   │
       ├─ GET /live/streams/scheduled ─┐  │
       │  (ve transmisiones programadas)│  │
       │                                │  │
       │  ◄─ Lista de streams ────────┤  │
       │                                │  │
       │                                │  ├─ POST /access/generate ──┐
       │                                │  │ {                        │
       │                                │  │   creatorId,             │
       │                                │  │   paymentId,             │
       │                                │  │   amount: 999,           │
       │                                │  │   currency: "USD",       │
       │                                │  │   durationDays: 30       │
       │                                │  │ }                        │
       │                                │  │                          │
       │                                │  │ ◄─ Access Code ────────┤
       │                                │  │                          │
       │                                │  └──────────────────────────┘
       │                                │
       ├─ POST /access/redeem ─────────┐
       │ {                              │
       │   code: "ACC-abc123xyz"        │
       │ }                              │
       │                                │
       │ ◄─ Access Grant + Expiry ─────┤
       │                                │
       └────────────────────────────────┘


FASE 4: VALIDACIÓN DE ACCESO
═════════════════════════════════════════════════════════════════════════════

    Subscriber
       │
       ├─ GET /access/validate/{creatorId} ──────────────────┐
       │                                                      │
       │  ◄─ { hasAccess: true, expiresAt: "..." } ─────────┤
       │                                                      │
       └──────────────────────────────────────────────────────┘


FASE 5: INICIAR TRANSMISIÓN EN VIVO
═════════════════════════════════════════════════════════════════════════════

    Creator
       │
       ├─ PATCH /live/streams/{streamId} ──────────────────┐
       │ {                                                  │
       │   status: "live"                                   │
       │ }                                                  │
       │                                                    │
       │ ◄─ Stream Status: LIVE ────────────────────────────┤
       │                                                    │
       └────────────────────────────────────────────────────┘


FASE 6: CONEXIÓN DE VIEWERS
═════════════════════════════════════════════════════════════════════════════

    Subscriber
       │
       ├─ POST /live/streams/{streamId}/viewers ──────────┐
       │ {}                                                │
       │                                                   │
       │ ◄─ Viewer ID + Playback URL ──────────────────────┤
       │                                                   │
       └───────────────────────────────────────────────────┘


FASE 7: TRANSMISIÓN EN VIVO
═════════════════════════════════════════════════════════════════════════════

    Creator                    Subscriber
       │                           │
       │  🎵 Transmitiendo         │
       │  (OBS/Streamlabs)         │
       │                           │
       │  ◄─────────────────────────┤ 🎧 Escuchando
       │  (RTMP Stream)             │ (HLS Playback)
       │                           │
       │  Viewers: 1               │
       │  Duration: 5m 30s         │
       │                           │
       └───────────────────────────┘


FASE 8: FINALIZAR TRANSMISIÓN
═════════════════════════════════════════════════════════════════════════════

    Creator
       │
       ├─ PATCH /live/streams/{streamId} ──────────────────┐
       │ {                                                  │
       │   status: "ended"                                  │
       │ }                                                  │
       │                                                    │
       │ ◄─ Stream Status: ENDED ───────────────────────────┤
       │                                                    │
       └────────────────────────────────────────────────────┘
```

---

## 🔄 Ciclo de Vida de una Transmisión

```
┌──────────────┐
│  SCHEDULED   │  ← Transmisión programada
└──────┬───────┘
       │
       │ Creator inicia transmisión
       ↓
┌──────────────┐
│    LIVE      │  ← Transmisión en vivo
└──────┬───────┘   (Subscribers pueden conectarse)
       │
       │ Creator finaliza transmisión
       ↓
┌──────────────┐
│    ENDED     │  ← Transmisión finalizada
└──────────────┘   (Puede grabarse para reproducción)
```

---

## 💳 Ciclo de Vida del Acceso

```
┌─────────────────────────────────────────────────────────────┐
│                    ACCESO A TRANSMISIÓN                     │
└─────────────────────────────────────────────────────────────┘

1. CÓDIGO GENERADO
   ┌──────────────────────────────────────┐
   │ Code: ACC-abc123xyz                  │
   │ Amount: $9.99                        │
   │ Duration: 30 days                    │
   │ Status: NOT_REDEEMED                 │
   └──────────────────────────────────────┘
           │
           │ Subscriber canjea código
           ↓

2. ACCESO OTORGADO
   ┌──────────────────────────────────────┐
   │ Grant ID: grant-123                  │
   │ Subscriber: subscriber-id            │
   │ Creator: creator-id                  │
   │ Granted At: 2026-02-17T15:31:00Z    │
   │ Expires At: 2026-03-19T15:31:00Z    │
   │ Status: ACTIVE                       │
   └──────────────────────────────────────┘
           │
           │ Acceso válido por 30 días
           ↓

3. ACCESO EXPIRADO
   ┌──────────────────────────────────────┐
   │ Status: EXPIRED                      │
   │ Subscriber necesita renovar acceso   │
   └──────────────────────────────────────┘
```

---

## 📊 Estructura de Datos

### LiveStream

```
{
  id: "stream-123",
  creatorId: "creator-id",
  title: "Friday Night Electronic Mix",
  description: "Deep house session",
  status: "live" | "scheduled" | "ended",
  scheduledFor: "2026-02-20T20:00:00Z",
  streamKey: "sk_live_abc123",
  rtmpUrl: "rtmp://localhost:1935/live",
  playbackUrl: "http://localhost:8080/live/stream-123.m3u8",
  viewerCount: 1,
  startedAt: "2026-02-20T20:00:30Z",
  endedAt: null,
  duration: 30,
  recordingUrl: null
}
```

### AccessCode

```
{
  code: "ACC-abc123xyz",
  creatorId: "creator-id",
  paymentId: "payment-123",
  amount: 999,
  currency: "USD",
  durationDays: 30,
  isRedeemed: true,
  redeemedBy: "subscriber-id",
  redeemedAt: "2026-02-17T15:31:00Z"
}
```

### AccessGrant

```
{
  id: "grant-123",
  subscriberId: "subscriber-id",
  creatorId: "creator-id",
  accessCode: "ACC-abc123xyz",
  grantedAt: "2026-02-17T15:31:00Z",
  expiresAt: "2026-03-19T15:31:00Z",
  isActive: true
}
```

### StreamViewer

```
{
  id: "viewer-123",
  streamId: "stream-123",
  subscriberId: "subscriber-id",
  joinedAt: "2026-02-20T20:00:45Z",
  leftAt: null,
  watchTime: 30
}
```

---

## 🔐 Validaciones

```
┌─────────────────────────────────────────────────────────┐
│              VALIDACIÓN DE ACCESO                       │
└─────────────────────────────────────────────────────────┘

Subscriber intenta ver transmisión
         │
         ├─ ¿Tiene acceso válido?
         │
         ├─ SÍ ──→ ✅ Permitir acceso
         │         └─ Conectar como viewer
         │
         └─ NO ──→ ❌ Denegar acceso
                   └─ Mostrar opción de compra
```

---

## 🎬 Secuencia de Eventos

```
TIMELINE
════════════════════════════════════════════════════════════════

T+0s    Creator registra
        └─ POST /auth/register

T+1s    Creator crea transmisión programada
        └─ POST /live/streams
        └─ Status: SCHEDULED

T+2s    Subscriber registra
        └─ POST /auth/register

T+3s    Subscriber ve transmisión disponible
        └─ GET /live/streams/scheduled

T+4s    Creator genera código de acceso
        └─ POST /access/generate

T+5s    Subscriber compra acceso
        └─ POST /access/redeem
        └─ AccessGrant creado

T+6s    Creator inicia transmisión
        └─ PATCH /live/streams/{id}
        └─ Status: LIVE

T+7s    Subscriber se conecta
        └─ POST /live/streams/{id}/viewers
        └─ StreamViewer creado

T+8s    Transmisión en vivo
        └─ Subscriber escucha
        └─ Viewer count: 1

T+30s   Creator finaliza transmisión
        └─ PATCH /live/streams/{id}
        └─ Status: ENDED
```

---

## 🌐 Endpoints Utilizados

```
AUTENTICACIÓN
├─ POST /auth/register
└─ POST /auth/login

TRANSMISIONES EN VIVO
├─ POST /live/streams
├─ GET /live/streams/:id
├─ PATCH /live/streams/:id
├─ GET /live/streams/active
├─ GET /live/streams/scheduled
├─ POST /live/streams/:id/viewers
└─ DELETE /live/streams/:id/viewers/:viewerId

ACCESO
├─ POST /access/generate
├─ POST /access/redeem
├─ GET /access/validate/:creatorId
├─ GET /access/my-grants
└─ POST /access/revoke/:grantId

PAGOS
├─ POST /payments/checkout
└─ GET /payments/checkout/:sessionId
```

---

## 🎯 Casos de Uso

### Caso 1: Transmisión Única

```
Creator → Transmisión → Subscriber compra → Escucha
```

### Caso 2: Múltiples Subscribers

```
Creator → Transmisión → Subscriber 1 compra → Escucha
                     → Subscriber 2 compra → Escucha
                     → Subscriber 3 compra → Escucha
```

### Caso 3: Múltiples Transmisiones

```
Creator → Transmisión 1 → Subscriber compra acceso general
       → Transmisión 2 → Acceso válido para ambas
       → Transmisión 3 → Subscriber escucha todas
```

---

## 📈 Métricas

```
POR TRANSMISIÓN
├─ Viewer Count (actual)
├─ Max Viewers (histórico)
├─ Duration (segundos)
├─ Recording URL (si está grabada)
└─ Status (scheduled/live/ended)

POR CREATOR
├─ Total Streams
├─ Subscriber Count
├─ Total Revenue
└─ Active Streams

POR SUBSCRIBER
├─ Active Access Count
├─ Total Streams Watched
└─ Access Grants
```

---

## 🔄 Flujo de Dinero

```
Subscriber paga $9.99
         │
         ├─ Stripe procesa pago
         │
         ├─ Código de acceso generado
         │
         ├─ Subscriber canjea código
         │
         ├─ AccessGrant creado
         │
         ├─ Subscriber obtiene acceso
         │
         └─ Creator recibe pago (menos comisión)
```

---

**Diagrama actualizado: 2026-02-17**
