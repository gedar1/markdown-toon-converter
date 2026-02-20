# Guía: Simular Transmisión en Vivo y Compra de Suscripción

Esta guía te muestra cómo simular el flujo completo de una transmisión en vivo donde un subscriber compra acceso y escucha.

## 📋 Flujo Completo

```
1. Creator registra y crea transmisión programada
   ↓
2. Subscriber descubre la transmisión
   ↓
3. Subscriber compra acceso (genera código)
   ↓
4. Creator inicia transmisión (estado: LIVE)
   ↓
5. Subscriber se conecta y escucha
```

## 🚀 Opción 1: Script Automatizado (Recomendado)

### Paso 1: Asegúrate que el servidor está corriendo

```bash
# En la carpeta app-music
npm run dev
```

El servidor debe estar en `http://localhost:3000`

### Paso 2: Ejecuta el script de simulación

```bash
# En la carpeta app-music
node scripts/test-live-stream-flow.js
```

**Salida esperada:**

```
🎵 Simulador de Transmisión en Vivo

==================================================

📝 PASO 1: Registrando Creator...
✅ Creator registrado: creator-1708123456789@test.com
   ID: abc123...

🔐 PASO 2: Login como Creator...
✅ Creator autenticado

📅 PASO 3: Creando transmisión programada...
✅ Transmisión programada: Friday Night Electronic Mix
   ID: stream-123...
   Programada para: 1/17/2026, 3:05:00 PM
   Stream Key: sk_live_abc123...

... (más pasos)

✨ SIMULACIÓN COMPLETADA EXITOSAMENTE

📋 RESUMEN:
   Creator: creator-1708123456789@test.com
   Subscriber: subscriber-1708123456790@test.com
   Transmisión: Friday Night Electronic Mix
   Código de acceso: ACC-abc123...
   Acceso: ✅ ACTIVO
   Estado: 🔴 EN VIVO
   Viewers: 1

🎵 ¡El subscriber está escuchando la transmisión!
```

## 🎯 Opción 2: Paso a Paso Manual

Si prefieres hacer cada paso manualmente, aquí está el flujo:

### 1. Registrar Creator

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "creator@test.com",
    "password": "Test123!",
    "userType": "creator",
    "profile": {
      "displayName": "DJ Mike",
      "bio": "Electronic music producer"
    }
  }'
```

**Respuesta:**

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "creator-id-123",
      "email": "creator@test.com",
      "userType": "creator",
      "displayName": "DJ Mike"
    },
    "token": "eyJhbGc..."
  }
}
```

Guarda: `creator-id` y `creator-token`

### 2. Login Creator

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "creator@test.com",
    "password": "Test123!"
  }'
```

Guarda el `token` para los siguientes requests.

### 3. Crear Transmisión Programada

```bash
curl -X POST http://localhost:3000/live/streams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CREATOR_TOKEN" \
  -d '{
    "title": "Friday Night Electronic Mix",
    "description": "Deep house and techno session",
    "scheduledFor": "2026-02-17T20:00:00Z"
  }'
```

**Respuesta:**

```json
{
  "status": "success",
  "data": {
    "id": "stream-123",
    "creatorId": "creator-id-123",
    "title": "Friday Night Electronic Mix",
    "status": "scheduled",
    "streamKey": "sk_live_abc123...",
    "rtmpUrl": "rtmp://localhost:1935/live",
    "playbackUrl": "http://localhost:8080/live/stream-123.m3u8"
  }
}
```

Guarda: `stream-id` y `stream-key`

### 4. Registrar Subscriber

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "subscriber@test.com",
    "password": "Test123!",
    "userType": "subscriber",
    "profile": {
      "displayName": "Music Lover"
    }
  }'
```

Guarda: `subscriber-id` y `subscriber-token`

### 5. Subscriber Ve Transmisión Programada

```bash
curl -X GET http://localhost:3000/live/streams/scheduled \
  -H "Authorization: Bearer SUBSCRIBER_TOKEN"
```

**Respuesta:**

```json
{
  "status": "success",
  "data": [
    {
      "id": "stream-123",
      "title": "Friday Night Electronic Mix",
      "creator": {
        "id": "creator-id-123",
        "displayName": "DJ Mike"
      },
      "scheduledFor": "2026-02-17T20:00:00Z",
      "status": "scheduled"
    }
  ]
}
```

### 6. Creator Genera Código de Acceso

```bash
curl -X POST http://localhost:3000/access/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CREATOR_TOKEN" \
  -d '{
    "creatorId": "creator-id-123",
    "paymentId": "payment-123",
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
    "code": "ACC-abc123xyz",
    "creatorId": "creator-id-123",
    "amount": 999,
    "currency": "USD",
    "durationDays": 30
  }
}
```

Guarda: `access-code`

### 7. Subscriber Compra Acceso (Canjea Código)

```bash
curl -X POST http://localhost:3000/access/redeem \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SUBSCRIBER_TOKEN" \
  -d '{
    "code": "ACC-abc123xyz"
  }'
```

**Respuesta:**

```json
{
  "status": "success",
  "data": {
    "accessGrantId": "grant-123",
    "subscriberId": "subscriber-id",
    "creatorId": "creator-id-123",
    "expiresAt": "2026-03-19T15:30:00Z"
  }
}
```

### 8. Validar Acceso

```bash
curl -X GET http://localhost:3000/access/validate/creator-id-123 \
  -H "Authorization: Bearer SUBSCRIBER_TOKEN"
```

**Respuesta:**

```json
{
  "status": "success",
  "data": {
    "hasAccess": true,
    "expiresAt": "2026-03-19T15:30:00Z"
  }
}
```

### 9. Creator Inicia Transmisión (LIVE)

```bash
curl -X PATCH http://localhost:3000/live/streams/stream-123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CREATOR_TOKEN" \
  -d '{
    "status": "live"
  }'
```

**Respuesta:**

```json
{
  "status": "success",
  "data": {
    "id": "stream-123",
    "status": "live",
    "startedAt": "2026-02-17T20:00:00Z",
    "viewerCount": 0,
    "playbackUrl": "http://localhost:8080/live/stream-123.m3u8"
  }
}
```

### 10. Subscriber Se Conecta

```bash
curl -X POST http://localhost:3000/live/streams/stream-123/viewers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SUBSCRIBER_TOKEN" \
  -d '{}'
```

**Respuesta:**

```json
{
  "status": "success",
  "data": {
    "viewerId": "viewer-123",
    "streamId": "stream-123",
    "subscriberId": "subscriber-id",
    "joinedAt": "2026-02-17T20:00:30Z"
  }
}
```

### 11. Obtener Estado de Transmisión

```bash
curl -X GET http://localhost:3000/live/streams/stream-123 \
  -H "Authorization: Bearer SUBSCRIBER_TOKEN"
```

**Respuesta:**

```json
{
  "status": "success",
  "data": {
    "id": "stream-123",
    "title": "Friday Night Electronic Mix",
    "status": "live",
    "viewerCount": 1,
    "playbackUrl": "http://localhost:8080/live/stream-123.m3u8",
    "creator": {
      "id": "creator-id-123",
      "displayName": "DJ Mike"
    }
  }
}
```

### 12. Obtener Transmisiones Activas

```bash
curl -X GET http://localhost:3000/live/streams/active \
  -H "Authorization: Bearer SUBSCRIBER_TOKEN"
```

**Respuesta:**

```json
{
  "status": "success",
  "data": [
    {
      "id": "stream-123",
      "title": "Friday Night Electronic Mix",
      "creator": {
        "displayName": "DJ Mike"
      },
      "viewerCount": 1,
      "status": "live"
    }
  ]
}
```

## 🎬 Simular en la UI (Frontend)

### 1. Acceder como Subscriber

1. Abre `http://localhost:3000` (o tu puerto del frontend)
2. Haz login con el subscriber
3. Ve a "Discover" - deberías ver la transmisión programada

### 2. Comprar Acceso

1. Haz clic en la tarjeta del creator
2. Verás la transmisión programada
3. Haz clic en "Buy Access"
4. Completa el pago (en desarrollo, usa datos de prueba de Stripe)

### 3. Ver Transmisión en Vivo

1. Cuando el creator inicia la transmisión, verás el badge 🔴 LIVE
2. Haz clic para ver la transmisión
3. Deberías ver el reproductor con la URL de reproducción

## 🔧 Endpoints Disponibles

### Transmisiones en Vivo

| Método | Endpoint                              | Descripción                      |
| ------ | ------------------------------------- | -------------------------------- |
| POST   | `/live/streams`                       | Crear transmisión (creator)      |
| GET    | `/live/streams/:id`                   | Obtener detalles de transmisión  |
| PATCH  | `/live/streams/:id`                   | Actualizar estado (creator)      |
| GET    | `/live/streams/active`                | Listar transmisiones activas     |
| GET    | `/live/streams/scheduled`             | Listar transmisiones programadas |
| POST   | `/live/streams/:id/viewers`           | Conectar como viewer             |
| DELETE | `/live/streams/:id/viewers/:viewerId` | Desconectar viewer               |

### Acceso

| Método | Endpoint                      | Descripción                 |
| ------ | ----------------------------- | --------------------------- |
| POST   | `/access/generate`            | Generar código (creator)    |
| POST   | `/access/redeem`              | Canjear código (subscriber) |
| GET    | `/access/validate/:creatorId` | Validar acceso              |
| GET    | `/access/my-grants`           | Obtener mis grants          |
| POST   | `/access/revoke/:grantId`     | Revocar acceso (creator)    |

## 📊 Datos de Prueba

### Stripe (Desarrollo)

Para completar pagos en desarrollo, usa:

- **Tarjeta válida:** `4242 4242 4242 4242`
- **Fecha:** Cualquier fecha futura (ej: 12/25)
- **CVC:** Cualquier 3 dígitos (ej: 123)
- **Código postal:** Cualquier código (ej: 12345)

### Usuarios de Prueba

```
Creator:
  Email: creator@test.com
  Password: Test123!
  Type: creator

Subscriber:
  Email: subscriber@test.com
  Password: Test123!
  Type: subscriber
```

## 🐛 Troubleshooting

### Error: "Cannot find module"

```bash
# Asegúrate de instalar dependencias
npm install
```

### Error: "Connection refused"

```bash
# Verifica que el servidor está corriendo
npm run dev

# Verifica el puerto
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

### Error: "Database connection failed"

```bash
# Verifica que PostgreSQL está corriendo
# Verifica DATABASE_URL en .env

# Ejecuta migraciones
npx prisma migrate dev
```

### Error: "Invalid token"

- Asegúrate de copiar el token completo
- Verifica que el token no ha expirado
- Usa `Bearer TOKEN` en el header Authorization

## 📝 Notas

- Los códigos de acceso son de un solo uso
- El acceso expira después de `durationDays`
- Las transmisiones programadas se muestran en Discover
- Solo subscribers con acceso pueden ver transmisiones en vivo
- Los viewers se registran automáticamente cuando se conectan

## 🎯 Próximos Pasos

1. **Notificaciones:** Agregar notificaciones cuando una transmisión comienza
2. **Chat en vivo:** Implementar chat durante la transmisión
3. **Grabaciones:** Guardar y reproducir transmisiones grabadas
4. **Estadísticas:** Mostrar métricas de viewers y engagement
5. **Suscripciones recurrentes:** Implementar suscripciones mensuales automáticas
