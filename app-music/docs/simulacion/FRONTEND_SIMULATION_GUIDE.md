# 🎬 Guía Completa: Simular Transmisión en Vivo desde el Frontend

Esta guía te muestra cómo simular el flujo completo usando la interfaz web: crear una transmisión, comprar acceso y escuchar en vivo.

## 🚀 Requisitos Previos

1. **Backend corriendo:**

   ```bash
   cd app-music
   npm run dev
   ```

   Debe estar en `http://localhost:3000`

2. **Frontend corriendo:**

   ```bash
   cd client-web
   npm run dev
   ```

   Debe estar en `http://localhost:5173` (o el puerto que uses)

3. **Base de datos conectada:**
   - PostgreSQL debe estar corriendo
   - Migraciones aplicadas: `npx prisma migrate dev`

---

## 📋 Flujo Completo (Paso a Paso)

### PASO 1: Registrar como Creator

1. Abre `http://localhost:5173`
2. Haz clic en **"Sign Up"**
3. Completa el formulario:
   - **Email:** `creator@test.com`
   - **Password:** `Test123!`
   - **User Type:** Selecciona **"Creator"**
   - **Display Name:** `DJ Mike`
   - **Bio:** `Electronic music producer`
4. Haz clic en **"Sign Up"**

**Resultado esperado:**

- Serás redirigido al dashboard del creator
- Verás opciones para subir contenido y crear transmisiones

---

### PASO 2: Crear una Transmisión Programada

1. En el dashboard del creator, busca **"Go Live"** o **"Create Stream"**
2. Completa el formulario:
   - **Title:** `Friday Night Electronic Mix`
   - **Description:** `Deep house and techno session`
   - **Schedule for later:** Marca esta opción
   - **Date & Time:** Selecciona una hora en el futuro (ej: hoy en 5 minutos)
3. Haz clic en **"Schedule Stream"**

**Resultado esperado:**

- La transmisión aparecerá en tu lista de transmisiones programadas
- Verás un estado "SCHEDULED"

---

### PASO 3: Registrar como Subscriber

1. Abre una **nueva ventana de navegador** (o usa incógnito)
2. Ve a `http://localhost:5173`
3. Haz clic en **"Sign Up"**
4. Completa el formulario:
   - **Email:** `subscriber@test.com`
   - **Password:** `Test123!`
   - **User Type:** Selecciona **"Subscriber"**
   - **Display Name:** `Music Lover`
5. Haz clic en **"Sign Up"**

**Resultado esperado:**

- Serás redirigido a la página "Discover"
- Verás creadores disponibles

---

### PASO 4: Subscriber Descubre la Transmisión

1. En la página **"Discover"**, busca **"DJ Mike"**
2. Deberías ver una tarjeta con:
   - Nombre del creator
   - Información de la transmisión programada
   - Botón **"Buy Access"**

**Resultado esperado:**

- La transmisión programada aparece en la tarjeta del creator
- Muestra la hora de inicio

---

### PASO 5: Subscriber Compra Acceso

1. Haz clic en la tarjeta de **"DJ Mike"**
2. Serás redirigido a **"Creator Profile"**
3. Verás una sección **"Upcoming Stream"** con:
   - Título de la transmisión
   - Fecha y hora
   - Botón **"Buy Access - $9.99/month"**
4. Haz clic en **"Buy Access"**

**Resultado esperado:**

- Serás redirigido a **Stripe Checkout**
- Verás el formulario de pago

---

### PASO 6: Completar el Pago

1. En Stripe Checkout, completa el formulario:
   - **Email:** `subscriber@test.com`
   - **Card Number:** `4242 4242 4242 4242` (tarjeta de prueba)
   - **Expiry:** `12/25` (cualquier fecha futura)
   - **CVC:** `123` (cualquier 3 dígitos)
   - **Postal Code:** `12345` (cualquier código)
2. Haz clic en **"Pay"**

**Resultado esperado:**

- Pago procesado exitosamente
- Serás redirigido a la página de éxito
- Acceso otorgado al subscriber

---

### PASO 7: Verificar Acceso

1. Vuelve a la página del creator (**"DJ Mike"**)
2. Deberías ver un mensaje verde:
   - ✓ You have access to this creator's live streams and content

**Resultado esperado:**

- El acceso está activo
- Puedes ver la transmisión programada
- Verás un botón para ver la transmisión en vivo cuando comience

---

### PASO 8: Creator Inicia la Transmisión

1. Vuelve a la **ventana del creator**
2. Ve a tu dashboard
3. Busca la transmisión programada
4. Haz clic en **"Go Live"** o **"Start Stream"**

**Resultado esperado:**

- El estado cambia de "SCHEDULED" a "LIVE"
- Se genera una URL de reproducción (HLS)
- Se genera un Stream Key para OBS/Streamlabs

---

### PASO 9: Subscriber Ve la Transmisión en Vivo

1. Vuelve a la **ventana del subscriber**
2. Actualiza la página del creator
3. Deberías ver:
   - Badge rojo **"🔴 LIVE"** en la tarjeta del creator
   - Sección **"LIVE Stream"** con botón **"Watch Live →"**
4. Haz clic en **"Watch Live →"**

**Resultado esperado:**

- Serás redirigido a la página de reproducción en vivo
- Verás el reproductor de audio/video
- El contador de viewers aumentará a 1

---

### PASO 10: Simular Transmisión (Sin OBS)

Para simular una transmisión sin usar OBS/Streamlabs:

#### Opción A: Usar un archivo de audio local

1. En el dashboard del creator, ve a **"Content Library"**
2. Haz clic en **"Upload Content"**
3. Sube un archivo de audio (MP3, WAV, etc.)
4. Completa los detalles:
   - **Title:** `Test Audio`
   - **Genre:** `Electronic`
5. Haz clic en **"Upload"**

**Resultado esperado:**

- El archivo se sube al servidor
- Se genera una URL de reproducción HLS
- El subscriber puede reproducirlo

#### Opción B: Usar un stream de prueba

Si tienes ffmpeg instalado, puedes simular un stream:

```bash
# Crear un archivo de audio de prueba
ffmpeg -f lavfi -i sine=f=440:d=60 -f lavfi -i sine=f=880:d=60 test-audio.wav

# Transmitir a RTMP (requiere servidor RTMP configurado)
ffmpeg -re -i test-audio.wav -c:a aac -b:a 128k -f flv rtmp://localhost:1935/live/STREAM_KEY
```

---

## 🎯 Flujo Alternativo: Usar Código de Acceso

Si prefieres no usar Stripe, puedes usar códigos de acceso:

### 1. Creator Genera Código

1. En el dashboard del creator, ve a **"Access Codes"** o **"Generate Code"**
2. Haz clic en **"Generate Access Code"**
3. Completa:
   - **Amount:** `999` (en centavos = $9.99)
   - **Duration:** `30` días
4. Haz clic en **"Generate"**

**Resultado esperado:**

- Se genera un código (ej: `ACC-ABC123XYZ`)
- Cópialo

### 2. Subscriber Canjea Código

1. En la página del creator, haz clic en **"Have a code?"**
2. Pega el código: `ACC-ABC123XYZ`
3. Haz clic en **"Redeem Code"**

**Resultado esperado:**

- Acceso otorgado inmediatamente
- No requiere pago

---

## 📊 Estructura de Pantallas

```
┌─────────────────────────────────────────────────────────┐
│                    CREATOR DASHBOARD                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Go Live]  [Upload Content]  [My Streams]             │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Scheduled Streams                               │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ Friday Night Electronic Mix                     │   │
│  │ Scheduled for: Feb 17, 8:00 PM                 │   │
│  │ [Start Stream]  [Edit]  [Delete]               │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Content Library                                 │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ Test Audio (Electronic)                         │   │
│  │ [Edit]  [Delete]  [Share]                       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   DISCOVER PAGE                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ DJ Mike      │  │ DJ Sarah     │  │ DJ John      │  │
│  │ Electronic   │  │ House        │  │ Techno       │  │
│  │              │  │              │  │              │  │
│  │ 📅 Friday    │  │ 🔴 LIVE      │  │              │  │
│  │ 8:00 PM      │  │ Now Playing  │  │              │  │
│  │              │  │              │  │              │  │
│  │ [Buy Access] │  │ [Watch Live] │  │ [Buy Access] │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              CREATOR PROFILE (SUBSCRIBER)               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  DJ Mike - Electronic Music Producer                   │
│  42 subscribers • 15 streams                           │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🔴 LIVE - Friday Night Electronic Mix           │   │
│  │ 5 watching now                                  │   │
│  │                                                 │   │
│  │ [Watch Live →]                                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ✓ You have access to this creator's streams          │
│                                                         │
│  Content Archive                                       │
│  ├─ Test Audio (Electronic) [Play]                    │
│  └─ Another Track (House) [Play]                      │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              LIVE STREAM PLAYER                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Friday Night Electronic Mix                           │
│  DJ Mike • 5 viewers                                   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │          [Audio Player]                         │   │
│  │                                                 │   │
│  │  ▶ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │   │
│  │  0:00                                    5:30   │   │
│  │                                                 │   │
│  │  [Play/Pause]  [Volume] [Fullscreen]           │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Stream Info:                                          │
│  • Status: LIVE                                        │
│  • Viewers: 5                                          │
│  • Duration: 5m 30s                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### ❌ "Creator not found" en Discover

**Problema:** El creator no aparece en la lista

**Solución:**

1. Verifica que el creator está registrado
2. Actualiza la página (F5)
3. Verifica que el backend está corriendo

### ❌ "Access denied" al intentar comprar

**Problema:** No puedes comprar acceso

**Solución:**

1. Verifica que estás logueado como subscriber
2. Verifica que el creator existe
3. Revisa los logs del backend

### ❌ "Stream not found" al intentar ver en vivo

**Problema:** No puedes ver la transmisión en vivo

**Solución:**

1. Verifica que el creator inició la transmisión
2. Verifica que tienes acceso válido
3. Actualiza la página

### ❌ "Payment failed" en Stripe

**Problema:** El pago no se procesa

**Solución:**

1. Usa la tarjeta de prueba: `4242 4242 4242 4242`
2. Verifica que la fecha es futura
3. Verifica que el CVC tiene 3 dígitos
4. Revisa los logs de Stripe en el backend

### ❌ "Audio not playing"

**Problema:** El reproductor no reproduce audio

**Solución:**

1. Verifica que el archivo se subió correctamente
2. Verifica que el navegador soporta HLS
3. Abre la consola (F12) para ver errores
4. Verifica que el servidor de streaming está corriendo

---

## 📱 Pantallas Clave

### 1. Página de Registro

```
┌─────────────────────────────────────────┐
│         Sign Up                         │
├─────────────────────────────────────────┤
│                                         │
│ Email: [________________]               │
│                                         │
│ Password: [________________]            │
│                                         │
│ User Type:                              │
│ ○ Creator                               │
│ ○ Subscriber                            │
│                                         │
│ Display Name: [________________]        │
│                                         │
│ Bio: [________________]                 │
│                                         │
│ [Sign Up]                               │
│                                         │
│ Already have an account? [Login]        │
│                                         │
└─────────────────────────────────────────┘
```

### 2. Página Discover

```
┌─────────────────────────────────────────┐
│ Discover                                │
├─────────────────────────────────────────┤
│                                         │
│ [Search creators...]                    │
│                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ Creator1 │ │ Creator2 │ │ Creator3 │ │
│ │ Genre    │ │ Genre    │ │ Genre    │ │
│ │          │ │          │ │          │ │
│ │ 📅 Info  │ │ 🔴 LIVE  │ │          │ │
│ │          │ │          │ │          │ │
│ │ [Buy]    │ │ [Watch]  │ │ [Buy]    │ │
│ └──────────┘ └──────────┘ └──────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### 3. Página Creator Profile

```
┌─────────────────────────────────────────┐
│ DJ Mike                                 │
│ Electronic • 42 subscribers             │
├─────────────────────────────────────────┤
│                                         │
│ 🔴 LIVE - Friday Night Mix              │
│ 5 watching now                          │
│ [Watch Live →]                          │
│                                         │
│ ✓ You have access                       │
│                                         │
│ Content Archive                         │
│ ├─ Track 1 [Play]                       │
│ ├─ Track 2 [Play]                       │
│ └─ Track 3 [Play]                       │
│                                         │
│ [← Back to Discover]                    │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎬 Casos de Uso

### Caso 1: Transmisión Única

```
1. Creator registra
2. Creator crea transmisión programada
3. Subscriber registra
4. Subscriber compra acceso
5. Creator inicia transmisión
6. Subscriber ve en vivo
```

### Caso 2: Múltiples Subscribers

```
1. Creator crea transmisión
2. Subscriber 1 compra acceso
3. Subscriber 2 compra acceso
4. Subscriber 3 compra acceso
5. Creator inicia transmisión
6. Todos ven en vivo (viewers: 3)
```

### Caso 3: Múltiples Transmisiones

```
1. Creator crea transmisión 1
2. Creator crea transmisión 2
3. Subscriber compra acceso general
4. Subscriber ve transmisión 1
5. Creator inicia transmisión 2
6. Subscriber ve transmisión 2
```

---

## 💡 Tips

- **Usa incógnito:** Para tener múltiples sesiones simultáneamente
- **Abre DevTools:** F12 para ver errores y logs
- **Actualiza frecuentemente:** Los datos se actualizan en tiempo real
- **Guarda credenciales:** Para no tener que registrarse múltiples veces
- **Prueba en móvil:** Abre en tu teléfono para probar responsividad

---

## 🎯 Próximos Pasos

Después de probar la simulación:

1. **Integra OBS/Streamlabs:**
   - Usa el Stream Key del creator
   - Configura RTMP URL
   - Transmite contenido real

2. **Prueba con múltiples usuarios:**
   - Abre varias ventanas/navegadores
   - Simula múltiples subscribers

3. **Prueba pagos reales:**
   - Configura Stripe en producción
   - Prueba con tarjetas reales (en sandbox)

4. **Implementa notificaciones:**
   - Notificar cuando una transmisión comienza
   - Recordatorios de transmisiones programadas

---

**¡Listo para simular tu primera transmisión en vivo desde el frontend!** 🎵🔴
