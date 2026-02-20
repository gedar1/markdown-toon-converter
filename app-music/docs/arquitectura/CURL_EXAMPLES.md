# Ejemplos de cURL - Transmisión en Vivo y Compra de Suscripción

Guía rápida con ejemplos de cURL para probar todos los endpoints.

## 🔐 Autenticación

### Registrar Creator

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "creator@example.com",
    "password": "SecurePass123!",
    "userType": "creator",
    "profile": {
      "displayName": "DJ Mike",
      "bio": "Electronic music producer",
      "avatarUrl": null
    }
  }'
```

**Respuesta:**

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid-creator-123",
      "email": "creator@example.com",
      "userType": "creator",
      "displayName": "DJ Mike"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Registrar Subscriber

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "subscriber@example.com",
    "password": "SecurePass123!",
    "userType": "subscriber",
    "profile": {
      "displayName": "Music Lover",
      "bio": null,
      "avatarUrl": null
    }
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "creator@example.com",
    "password": "SecurePass123!"
  }'
```

**Guarda el token para los siguientes requests:**

```bash
export CREATOR_TOKEN="eyJhbGciOiJIUzI1NiIs..."
export SUBSCRIBER_TOKEN="eyJhbGciOiJIUzI1NiIs..."
export CREATOR_ID="uuid-creator-123"
export SUBSCRIBER_ID="uuid-subscriber-456"
```

## 🎬 Transmisiones en Vivo

### Crear Transmisión Programada

```bash
curl -X POST http://localhost:3000/live/streams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CREATOR_TOKEN" \
  -d '{
    "title": "Friday Night Electronic Mix",
    "description": "Deep house and techno session with special guests",
    "scheduledFor": "2026-02-20T20:00:00Z"
  }'
```

**Respuesta:**

```json
{
  "status": "success",
  "data": {
    "id": "stream-uuid-123",
    "creatorId": "creator-uuid-123",
    "title": "Friday Night Electronic Mix",
    "description": "Deep house and techno session with special guests",
    "status": "scheduled",
    "scheduledFor": "2026-02-20T20:00:00Z",
    "streamKey": "sk_live_abc123xyz789",
    "rtmpUrl": "rtmp://localhost:1935/live",
    "playbackUrl": "http://localhost:8080/live/stream-uuid-123.m3u8",
    "viewerCount": 0,
    "createdAt": "2026-02-17T15:30:00Z"
  }
}
```

**Guarda el stream ID:**

```bash
export STREAM_ID="stream-uuid-123"
```

### Obtener Detalles de Transmisión

```bash
curl -X GET http://localhost:3000/live/streams/$STREAM_ID \
  -H "Authorization: Bearer $SUBSCRIBER_TOKEN"
```

### Listar Transmisiones Programadas

```bash
curl -X GET http://localhost:3000/live/streams/scheduled \
  -H "Authorization: Bearer $SUBSCRIBER_TOKEN"
```

**Respuesta:**

```json
{
  "status": "success",
  "data": [
    {
      "id": "stream-uuid-123",
      "title": "Friday Night Electronic Mix",
      "creator": {
        "id": "creator-uuid-123",
        "displayName": "DJ Mike",
        "avatarUrl": null
      },
      "scheduledFor": "2026-02-20T20:00:00Z",
      "status": "scheduled"
    }
  ]
}
```

### Listar Transmisiones Activas (LIVE)

```bash
curl -X GET http://localhost:3000/live/streams/active \
  -H "Authorization: Bearer $SUBSCRIBER_TOKEN"
```

### Iniciar Transmisión (Cambiar a LIVE)

```bash
curl -X PATCH http://localhost:3000/live/streams/$STREAM_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CREATOR_TOKEN" \
  -d '{
    "status": "live"
  }'
```

**Respuesta:**

```json
{
  "status": "success",
  "data": {
    "id": "stream-uuid-123",
    "status": "live",
    "startedAt": "2026-02-20T20:00:30Z",
    "viewerCount": 0,
    "playbackUrl": "http://localhost:8080/live/stream-uuid-123.m3u8"
  }
}
```

### Finalizar Transmisión

```bash
curl -X PATCH http://localhost:3000/live/streams/$STREAM_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CREATOR_TOKEN" \
  -d '{
    "status": "ended"
  }'
```

## 👥 Viewers (Espectadores)

### Conectar como Viewer

```bash
curl -X POST http://localhost:3000/live/streams/$STREAM_ID/viewers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUBSCRIBER_TOKEN" \
  -d '{}'
```

**Respuesta:**

```json
{
  "status": "success",
  "data": {
    "viewerId": "viewer-uuid-789",
    "streamId": "stream-uuid-123",
    "subscriberId": "subscriber-uuid-456",
    "joinedAt": "2026-02-20T20:00:45Z"
  }
}
```

**Guarda el viewer ID:**

```bash
export VIEWER_ID="viewer-uuid-789"
```

### Desconectar Viewer

```bash
curl -X DELETE http://localhost:3000/live/streams/$STREAM_ID/viewers/$VIEWER_ID \
  -H "Authorization: Bearer $SUBSCRIBER_TOKEN"
```

## 💳 Acceso y Pagos

### Generar Código de Acceso

```bash
curl -X POST http://localhost:3000/access/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CREATOR_TOKEN" \
  -d '{
    "creatorId": "'$CREATOR_ID'",
    "paymentId": "payment-'$(date +%s)'",
    "amount": 999,
    "currency": "USD",
    "durationDays": 30
  }'
```

**Respuesta:**

```json
{
  "status": "success",
  "data": {
    "code": "ACC-abc123xyz789",
    "creatorId": "creator-uuid-123",
    "paymentId": "payment-1708123456",
    "amount": 999,
    "currency": "USD",
    "durationDays": 30,
    "expiresAt": null,
    "isRedeemed": false,
    "createdAt": "2026-02-17T15:30:00Z"
  }
}
```

**Guarda el código:**

```bash
export ACCESS_CODE="ACC-abc123xyz789"
```

### Canjear Código de Acceso (Comprar)

```bash
curl -X POST http://localhost:3000/access/redeem \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUBSCRIBER_TOKEN" \
  -d '{
    "code": "'$ACCESS_CODE'"
  }'
```

**Respuesta:**

```json
{
  "status": "success",
  "data": {
    "accessGrantId": "grant-uuid-456",
    "subscriberId": "subscriber-uuid-456",
    "creatorId": "creator-uuid-123",
    "accessCode": "ACC-abc123xyz789",
    "grantedAt": "2026-02-17T15:31:00Z",
    "expiresAt": "2026-03-19T15:31:00Z",
    "isActive": true
  }
}
```

### Validar Acceso

```bash
curl -X GET http://localhost:3000/access/validate/$CREATOR_ID \
  -H "Authorization: Bearer $SUBSCRIBER_TOKEN"
```

**Respuesta:**

```json
{
  "status": "success",
  "data": {
    "hasAccess": true,
    "expiresAt": "2026-03-19T15:31:00Z",
    "isActive": true
  }
}
```

### Obtener Mis Grants (Subscriber)

```bash
curl -X GET http://localhost:3000/access/my-grants \
  -H "Authorization: Bearer $SUBSCRIBER_TOKEN"
```

**Respuesta:**

```json
{
  "status": "success",
  "data": [
    {
      "id": "grant-uuid-456",
      "subscriberId": "subscriber-uuid-456",
      "creatorId": "creator-uuid-123",
      "grantedAt": "2026-02-17T15:31:00Z",
      "expiresAt": "2026-03-19T15:31:00Z",
      "isActive": true,
      "creator": {
        "id": "creator-uuid-123",
        "displayName": "DJ Mike"
      }
    }
  ]
}
```

### Revocar Acceso (Creator)

```bash
curl -X POST http://localhost:3000/access/revoke/grant-uuid-456 \
  -H "Authorization: Bearer $CREATOR_TOKEN"
```

## 💰 Pagos (Stripe)

### Crear Sesión de Checkout

```bash
curl -X POST http://localhost:3000/payments/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUBSCRIBER_TOKEN" \
  -d '{
    "creatorId": "'$CREATOR_ID'",
    "amount": 999,
    "currency": "USD",
    "durationDays": 30,
    "successUrl": "http://localhost:3000/success",
    "cancelUrl": "http://localhost:3000/cancel"
  }'
```

**Respuesta:**

```json
{
  "status": "success",
  "data": {
    "sessionId": "cs_test_abc123xyz789",
    "url": "https://checkout.stripe.com/pay/cs_test_abc123xyz789"
  }
}
```

### Obtener Sesión de Checkout

```bash
curl -X GET http://localhost:3000/payments/checkout/cs_test_abc123xyz789 \
  -H "Authorization: Bearer $SUBSCRIBER_TOKEN"
```

## 📊 Flujo Completo en Bash

Aquí está el flujo completo en un script bash:

```bash
#!/bin/bash

API="http://localhost:3000"

# 1. Registrar creator
echo "1. Registrando creator..."
CREATOR=$(curl -s -X POST $API/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "creator-'$(date +%s)'@test.com",
    "password": "Test123!",
    "userType": "creator",
    "profile": {"displayName": "DJ Test"}
  }')

CREATOR_ID=$(echo $CREATOR | jq -r '.data.user.id')
CREATOR_TOKEN=$(echo $CREATOR | jq -r '.data.token')
echo "✅ Creator: $CREATOR_ID"

# 2. Registrar subscriber
echo "2. Registrando subscriber..."
SUBSCRIBER=$(curl -s -X POST $API/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "subscriber-'$(date +%s)'@test.com",
    "password": "Test123!",
    "userType": "subscriber",
    "profile": {"displayName": "Listener"}
  }')

SUBSCRIBER_ID=$(echo $SUBSCRIBER | jq -r '.data.user.id')
SUBSCRIBER_TOKEN=$(echo $SUBSCRIBER | jq -r '.data.token')
echo "✅ Subscriber: $SUBSCRIBER_ID"

# 3. Crear transmisión
echo "3. Creando transmisión..."
STREAM=$(curl -s -X POST $API/live/streams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CREATOR_TOKEN" \
  -d '{
    "title": "Test Stream",
    "description": "Quick test",
    "scheduledFor": "'$(date -u -d '+1 hour' +%Y-%m-%dT%H:%M:%SZ)'"
  }')

STREAM_ID=$(echo $STREAM | jq -r '.data.id')
echo "✅ Stream: $STREAM_ID"

# 4. Generar código
echo "4. Generando código de acceso..."
CODE=$(curl -s -X POST $API/access/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CREATOR_TOKEN" \
  -d '{
    "creatorId": "'$CREATOR_ID'",
    "paymentId": "pay-'$(date +%s)'",
    "amount": 999,
    "currency": "USD",
    "durationDays": 30
  }')

ACCESS_CODE=$(echo $CODE | jq -r '.data.code')
echo "✅ Código: $ACCESS_CODE"

# 5. Comprar acceso
echo "5. Subscriber compra acceso..."
curl -s -X POST $API/access/redeem \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUBSCRIBER_TOKEN" \
  -d '{"code": "'$ACCESS_CODE'"}' > /dev/null
echo "✅ Acceso comprado"

# 6. Iniciar transmisión
echo "6. Iniciando transmisión..."
curl -s -X PATCH $API/live/streams/$STREAM_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $CREATOR_TOKEN" \
  -d '{"status": "live"}' > /dev/null
echo "✅ Transmisión iniciada"

# 7. Conectar viewer
echo "7. Subscriber se conecta..."
VIEWER=$(curl -s -X POST $API/live/streams/$STREAM_ID/viewers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUBSCRIBER_TOKEN" \
  -d '{}')

VIEWER_ID=$(echo $VIEWER | jq -r '.data.viewerId')
echo "✅ Viewer: $VIEWER_ID"

# 8. Obtener estado
echo "8. Estado actual:"
curl -s -X GET $API/live/streams/$STREAM_ID \
  -H "Authorization: Bearer $SUBSCRIBER_TOKEN" | jq '.data | {title, status, viewerCount}'

echo ""
echo "✨ ¡Flujo completado!"
```

## 🧪 Datos de Prueba

### Tarjetas Stripe (Desarrollo)

| Caso      | Tarjeta             | Resultado              |
| --------- | ------------------- | ---------------------- |
| Éxito     | 4242 4242 4242 4242 | Pago exitoso           |
| Rechazada | 4000 0000 0000 0002 | Pago rechazado         |
| Expirada  | 4000 0000 0000 0069 | Tarjeta expirada       |
| 3D Secure | 4000 0025 0000 3155 | Requiere autenticación |

**Otros campos:**

- Fecha: Cualquier fecha futura (ej: 12/25)
- CVC: Cualquier 3 dígitos (ej: 123)
- Código postal: Cualquier código (ej: 12345)

## 📝 Notas

- Reemplaza `localhost:3000` con tu URL de servidor
- Los tokens expiran después de cierto tiempo
- Los códigos de acceso son de un solo uso
- El acceso expira después de `durationDays`
- Usa `jq` para parsear JSON en bash (instala con `brew install jq` o `apt-get install jq`)
