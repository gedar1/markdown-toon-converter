# Scheduled Streams Feature

## Overview

Sistema de transmisiones programadas que permite a los subscribers ver el calendario de transmisiones futuras y comprar acceso anticipado.

## Features

### 1. Backend - Scheduled Streams API

#### New Endpoint

- **GET /live/streams/scheduled**
  - Retorna todas las transmisiones con status `scheduled`
  - Filtradas por `scheduledFor >= now`
  - Ordenadas por fecha de programación (ascendente)
  - Incluye información del creador

#### Service Method

```typescript
async getScheduledStreams(): Promise<LiveStream[]>
```

### 2. Frontend - Schedule Page

#### Location

`client-web/src/pages/subscriber/Schedule.tsx`

#### Features

- Lista de transmisiones programadas
- Separación entre accesibles y bloqueadas
- Formato de fecha relativo ("In 2 days", "In 3 hours")
- Formato de fecha absoluto (día, hora)
- Botón de compra para streams bloqueados
- Link al perfil del creador
- Auto-refresh cada 30 segundos

#### UI Components

**Accessible Streams Section**

- Badge verde "✓ ACCESS"
- Badge azul con tiempo relativo
- Información completa del stream
- Link al perfil del creador

**Locked Streams Section**

- Badge "🔒 LOCKED"
- Badge azul con tiempo relativo
- Botón "Buy Access - $9.99"
- Link al perfil del creador

### 3. Navigation

#### New Menu Item

- **📅 Schedule** - Entre "Live Streams" y "Discover"
- Solo visible para subscribers
- Route: `/schedule`

## User Flow

### Subscriber sin acceso

1. Ve transmisión programada en Schedule
2. Click "Buy Access - $9.99"
3. Completa pago en Stripe
4. Obtiene acceso inmediato
5. Stream aparece en sección "Your Scheduled Streams"
6. Cuando llegue la hora, puede ver el stream en vivo

### Subscriber con acceso

1. Ve transmisión programada en "Your Scheduled Streams"
2. Puede ver detalles del stream
3. Recibe notificación cuando el stream comienza (futuro)
4. Puede ver el stream en vivo cuando comience

## Database Schema

### LiveStream Model

```prisma
model LiveStream {
  id               String           @id @default(uuid())
  creatorId        String
  title            String
  description      String?
  scheduledFor     DateTime?        // Fecha programada
  status           LiveStreamStatus @default(scheduled)
  // ... otros campos
}

enum LiveStreamStatus {
  scheduled  // Programado para el futuro
  live       // Transmitiendo ahora
  ended      // Finalizado
  cancelled  // Cancelado
}
```

## Date Formatting

### Relative Time

- "In X days" - Más de 24 horas
- "In X hours" - Entre 1-24 horas
- "In X minutes" - Menos de 1 hora
- "Starting soon!" - Menos de 1 minuto

### Absolute Time

- Format: "Mon, Jan 15, 3:00 PM"
- Locale: en-US
- Includes: weekday, month, day, hour, minute

## Integration with Payment System

### Purchase Flow

1. User clicks "Buy Access" en scheduled stream
2. `paymentService.createCheckout()` con creatorId
3. Redirige a Stripe Checkout
4. Después del pago, webhook auto-redime código
5. User obtiene acceso a TODOS los streams del creador
6. Scheduled stream aparece en sección accesible

### Access Validation

- Valida acceso por creatorId (no por streamId)
- Un pago da acceso a todos los streams del creador
- Incluye streams programados y en vivo

## Creator Workflow

### Scheduling a Stream

1. Creator va a "Go Live"
2. Llena formulario con:
   - Title
   - Description
   - Scheduled date/time
   - Recording enabled
3. Stream se crea con status `scheduled`
4. Aparece en Schedule page para subscribers
5. Cuando creator inicia stream, status cambia a `live`

### Managing Scheduled Streams

- Ver lista de streams programados
- Editar título, descripción, fecha
- Cancelar stream (status → `cancelled`)
- Eliminar stream (solo si no está live)

## Future Enhancements

### Phase 2

- [ ] Notificaciones push cuando stream comienza
- [ ] Recordatorios por email (24h, 1h antes)
- [ ] Calendario integrado (Google Calendar, iCal)
- [ ] Filtros por creador, género, fecha
- [ ] Búsqueda de streams programados

### Phase 3

- [ ] Recurring streams (semanal, mensual)
- [ ] Stream series (múltiples episodios)
- [ ] Early bird pricing (descuento por compra anticipada)
- [ ] Waitlist para streams populares
- [ ] Social sharing (compartir en redes)

## Testing

### Manual Testing

1. **Create Scheduled Stream (Creator)**

```bash
POST /live/streams
{
  "title": "Friday Night Live",
  "description": "Deep house music session",
  "scheduledFor": "2024-02-16T20:00:00Z",
  "recordingEnabled": true
}
```

2. **View Scheduled Streams (Subscriber)**

```bash
GET /live/streams/scheduled
```

3. **Buy Access and Verify**

- Go to /schedule
- Click "Buy Access" on locked stream
- Complete payment
- Verify stream appears in accessible section

### Test Scenarios

**Scenario 1: No Access**

- User sees locked stream
- Can buy access
- After payment, stream becomes accessible

**Scenario 2: Has Access**

- User sees stream in "Your Scheduled Streams"
- Can view details
- Can navigate to creator profile

**Scenario 3: Stream Starting Soon**

- Badge shows "Starting soon!"
- User can prepare to watch
- When live, can join stream

**Scenario 4: Multiple Scheduled Streams**

- Streams ordered by date (earliest first)
- Mix of accessible and locked
- Each with correct access status

## API Examples

### Get Scheduled Streams

```typescript
// Request
GET /live/streams/scheduled
Authorization: Bearer <token>

// Response
{
  "status": "success",
  "data": [
    {
      "id": "stream-123",
      "creatorId": "creator-456",
      "title": "Friday Night Live",
      "description": "Deep house session",
      "scheduledFor": "2024-02-16T20:00:00Z",
      "status": "scheduled",
      "viewerCount": 0,
      "creator": {
        "id": "creator-456",
        "displayName": "DJ Mike",
        "avatarUrl": "https://..."
      }
    }
  ]
}
```

### Check Access

```typescript
// Request
GET /access/validate/creator-456
Authorization: Bearer <token>

// Response
{
  "status": "success",
  "data": {
    "hasAccess": true,
    "expiresAt": "2024-03-15T00:00:00Z"
  }
}
```

## Files Modified/Created

### Backend

- ✅ `src/modules/live/live.service.ts` (updated - added getScheduledStreams)
- ✅ `src/modules/live/live.controller.ts` (updated - added getScheduledStreams endpoint)
- ✅ `src/modules/live/live.routes.ts` (updated - added /streams/scheduled route)

### Frontend

- ✅ `src/pages/subscriber/Schedule.tsx` (created)
- ✅ `src/services/liveService.ts` (updated - added getScheduledStreams)
- ✅ `src/App.tsx` (updated - added /schedule route)
- ✅ `src/components/Layout.tsx` (updated - added Schedule nav link)

## Status

✅ **COMPLETED** - Scheduled streams feature fully functional

## Benefits

### For Subscribers

- Plan ahead - see what's coming
- Buy access in advance
- Never miss a favorite creator's stream
- Better discovery of new content

### For Creators

- Build anticipation for streams
- Increase advance sales
- Better planning and scheduling
- Professional presentation

### For Platform

- Increased conversion (advance purchases)
- Better user engagement
- More predictable revenue
- Enhanced user experience
