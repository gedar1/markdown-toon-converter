# Payment Implementation - Stripe Integration

## Overview

Sistema de pagos implementado con Stripe Checkout para compra directa de acceso a transmisiones en vivo de creadores.

## Architecture

### Backend (app-music/)

#### Payment Module

- **Location**: `src/modules/payments/`
- **Files**:
  - `payment.service.ts` - Lógica de negocio de pagos
  - `payment.controller.ts` - Endpoints HTTP
  - `payment.routes.ts` - Rutas Express
  - `payment.types.ts` - Tipos TypeScript

#### Database

- **Model**: `SubscriptionPlan` en `prisma/schema.prisma`
- **Migration**: `20260215032626_add_subscription_plans`

#### Endpoints

1. **POST /payments/checkout**
   - Crea sesión de Stripe Checkout
   - Requiere autenticación (subscriber)
   - Body: `{ creatorId, customAmount?, durationDays? }`
   - Response: `{ sessionId, url, expiresAt }`

2. **POST /payments/webhook**
   - Webhook de Stripe (público, verificado por firma)
   - Procesa eventos: `checkout.session.completed`, `payment_intent.succeeded`, etc.
   - Auto-redime código de acceso después de pago exitoso

3. **GET /payments/session/:sessionId**
   - Obtiene detalles de sesión de checkout
   - Requiere autenticación

4. **POST /payments/plans**
   - Crea plan de suscripción (creator only)
   - Body: `{ name, description, amount, durationDays }`

5. **GET /payments/plans/:creatorId**
   - Lista planes de un creador (público)

### Frontend (client-web/)

#### Payment Service

- **Location**: `src/services/paymentService.ts`
- **Methods**:
  - `createCheckout()` - Inicia proceso de pago
  - `getSession()` - Obtiene detalles de sesión
  - `getCreatorPlans()` - Lista planes de creador
  - `createPlan()` - Crea plan (creator)

#### Pages

1. **PaymentSuccess** (`src/pages/PaymentSuccess.tsx`)
   - Página de confirmación post-pago
   - Verifica sesión de Stripe
   - Redirige automáticamente a `/live` después de 5 segundos
   - Route: `/payment/success?session_id={CHECKOUT_SESSION_ID}`

2. **CreatorProfile** (actualizado)
   - Botón "Buy Access - $9.99/month"
   - Alerta LIVE prominente cuando el creador está transmitiendo
   - Opción alternativa: "Have a code?" para canjear código manual

3. **Discover** (actualizado)
   - Botón de compra en cada tarjeta de creador
   - Badge LIVE para creadores transmitiendo
   - Compra directa sin salir de la página de descubrimiento

4. **LiveStreams** (actualizado)
   - Sección "Your Live Streams" (con acceso)
   - Sección "Get Access to Watch" (bloqueados)
   - Botón de compra en streams bloqueados
   - Link al perfil del creador

## Payment Flow

### 1. Subscriber ve creador transmitiendo en vivo

```
Discover/LiveStreams → Ve badge "LIVE" → Click "Buy Access"
```

### 2. Proceso de pago

```
Frontend: paymentService.createCheckout()
    ↓
Backend: POST /payments/checkout
    ↓
Stripe: Crea Checkout Session
    ↓
Frontend: Redirige a Stripe Checkout (session.url)
    ↓
Usuario: Completa pago en Stripe
    ↓
Stripe: Redirige a /payment/success?session_id=xxx
```

### 3. Post-pago (automático)

```
Stripe: Envía webhook checkout.session.completed
    ↓
Backend: POST /payments/webhook
    ↓
PaymentService.handleCheckoutCompleted()
    ↓
1. Genera código de acceso (AccessService.generateAccessCode)
2. Auto-canjea código (AccessService.redeemAccessCode)
3. Subscriber obtiene acceso inmediato
    ↓
Frontend: PaymentSuccess muestra confirmación
    ↓
Redirige a /live (puede ver transmisión)
```

## Configuration

### Environment Variables

#### Backend (.env)

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL (para redirect)
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
```

### Stripe Setup

1. **Crear cuenta en Stripe**: https://dashboard.stripe.com/register
2. **Obtener API keys**: Dashboard → Developers → API keys
3. **Configurar webhook**:
   - URL: `http://localhost:3000/payments/webhook` (desarrollo)
   - Events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copiar webhook secret

## Testing

### Test Flow Manual

1. **Iniciar servicios**:

```bash
# Backend
cd app-music
npm run dev

# Frontend
cd client-web
npm run dev
```

2. **Registrar subscriber**:
   - Ir a http://localhost:5173/register
   - Tipo: Subscriber

3. **Buscar creador**:
   - Ir a /discover
   - Ver lista de creadores

4. **Comprar acceso**:
   - Click "Buy Access - $9.99"
   - Usar tarjeta de prueba Stripe: `4242 4242 4242 4242`
   - Fecha: cualquier fecha futura
   - CVC: cualquier 3 dígitos

5. **Verificar acceso**:
   - Redirige a /payment/success
   - Luego a /live
   - Ver transmisiones disponibles

### Stripe Test Cards

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

## Security

### Webhook Verification

- Todas las webhooks verifican firma de Stripe
- Usa `STRIPE_WEBHOOK_SECRET` para validar
- Rechaza requests sin firma válida

### Authentication

- Checkout requiere autenticación (subscriber)
- Solo subscribers pueden comprar acceso
- Tokens JWT verificados en cada request

### Payment Data

- No almacenamos datos de tarjetas
- Stripe maneja toda la información sensible
- Solo guardamos: paymentId, amount, currency

## Business Logic

### Pricing

- **Default**: $9.99 USD (999 cents)
- **Duration**: 30 días por defecto
- **Customizable**: Creadores pueden crear planes personalizados

### Access Grant

- Se crea automáticamente después del pago
- Duración: 30 días desde la compra
- Renovable: Usuario puede comprar nuevamente cuando expire

### Revenue Tracking

- `paymentId` vincula AccessCode con transacción Stripe
- `amount` y `currency` guardados en AccessCode
- Futuro: Dashboard de ingresos para creadores

## Future Enhancements

### Phase 2

- [ ] Suscripciones recurrentes (Stripe Subscriptions)
- [ ] Múltiples planes por creador (Basic, Premium, VIP)
- [ ] Descuentos y cupones
- [ ] Dashboard de ingresos para creadores
- [ ] Notificaciones por email (confirmación, expiración)

### Phase 3

- [ ] Pagos internacionales (múltiples monedas)
- [ ] Split payments (plataforma toma comisión)
- [ ] Refunds y cancelaciones
- [ ] Analytics de conversión

## Troubleshooting

### Error: "Payment system is not configured"

- Verificar `STRIPE_SECRET_KEY` en .env
- Reiniciar servidor backend

### Error: "Invalid webhook signature"

- Verificar `STRIPE_WEBHOOK_SECRET` en .env
- Usar Stripe CLI para testing local: `stripe listen --forward-to localhost:3000/payments/webhook`

### Webhook no se ejecuta

- En desarrollo, usar Stripe CLI
- En producción, verificar URL pública en Stripe Dashboard
- Verificar logs: `app-music/logs/combined.log`

### Acceso no se otorga después del pago

- Verificar logs del webhook
- Verificar que AccessService esté funcionando
- Revisar tabla `access_codes` y `access_grants` en DB

## Files Modified/Created

### Backend

- ✅ `src/modules/payments/payment.service.ts` (created)
- ✅ `src/modules/payments/payment.controller.ts` (created)
- ✅ `src/modules/payments/payment.routes.ts` (created)
- ✅ `src/modules/payments/payment.types.ts` (created)
- ✅ `src/modules/payments/index.ts` (created)
- ✅ `prisma/schema.prisma` (updated - added SubscriptionPlan)
- ✅ `src/api/app.ts` (updated - added payment routes)
- ✅ `package.json` (updated - added stripe)
- ✅ `.env.example` (updated - added Stripe vars)

### Frontend

- ✅ `src/services/paymentService.ts` (created)
- ✅ `src/pages/PaymentSuccess.tsx` (created)
- ✅ `src/pages/subscriber/CreatorProfile.tsx` (updated - buy button)
- ✅ `src/pages/subscriber/Discover.tsx` (updated - buy buttons)
- ✅ `src/pages/subscriber/LiveStreams.tsx` (updated - buy buttons)
- ✅ `src/App.tsx` (updated - payment success route)

## Status

✅ **COMPLETED** - Sistema de pagos completamente funcional
