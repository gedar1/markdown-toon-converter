# ✅ Checklist Completo: Simular Transmisión en Vivo

Guía rápida con todos los pasos para simular una transmisión en vivo completa.

---

## 🚀 INICIO RÁPIDO (5 minutos)

### Terminal 1: Backend

```bash
cd app-music
npm run dev
# Espera: ✅ Server running on http://localhost:3000
```

### Terminal 2: Frontend

```bash
cd client-web
npm run dev
# Espera: ✅ Local: http://localhost:5173
```

### Terminal 3: Script de Simulación

```bash
cd app-music
node scripts/test-live-stream-flow.js
# Verás el flujo completo automatizado
```

**¡Listo!** La simulación está completa.

---

## 📋 CHECKLIST PASO A PASO

### ✅ PREPARACIÓN

- [ ] Backend corriendo en `http://localhost:3000`
- [ ] Frontend corriendo en `http://localhost:5173`
- [ ] PostgreSQL conectada
- [ ] Migraciones aplicadas (`npx prisma migrate dev`)
- [ ] Archivo de audio preparado (opcional)

### ✅ FASE 1: REGISTRAR USUARIOS

**Creator:**

- [ ] Abre `http://localhost:5173`
- [ ] Haz clic en "Sign Up"
- [ ] Email: `creator@test.com`
- [ ] Password: `Test123!`
- [ ] User Type: **Creator**
- [ ] Display Name: `DJ Mike`
- [ ] Haz clic en "Sign Up"

**Subscriber (en otra ventana/incógnito):**

- [ ] Abre `http://localhost:5173`
- [ ] Haz clic en "Sign Up"
- [ ] Email: `subscriber@test.com`
- [ ] Password: `Test123!`
- [ ] User Type: **Subscriber**
- [ ] Display Name: `Music Lover`
- [ ] Haz clic en "Sign Up"

### ✅ FASE 2: CREAR TRANSMISIÓN

**Creator:**

- [ ] Ve al dashboard
- [ ] Haz clic en "Go Live"
- [ ] Title: `Friday Night Electronic Mix`
- [ ] Description: `Deep house and techno session`
- [ ] Marca "Schedule for later"
- [ ] Selecciona hora en el futuro (5 minutos)
- [ ] Haz clic en "Schedule Stream"
- [ ] Copia el **Stream Key**

### ✅ FASE 3: COMPRAR ACCESO

**Subscriber:**

- [ ] Ve a "Discover"
- [ ] Busca "DJ Mike"
- [ ] Haz clic en la tarjeta
- [ ] Haz clic en "Buy Access - $9.99/month"
- [ ] Serás redirigido a Stripe
- [ ] Tarjeta: `4242 4242 4242 4242`
- [ ] Expiry: `12/25`
- [ ] CVC: `123`
- [ ] Postal: `12345`
- [ ] Haz clic en "Pay"
- [ ] Verifica acceso otorgado

### ✅ FASE 4: INICIAR TRANSMISIÓN

**Creator:**

- [ ] Ve al dashboard
- [ ] Busca la transmisión programada
- [ ] Haz clic en "Start Stream" o "Go Live"
- [ ] Estado cambia a "LIVE"

**Opción A: Subir archivo de audio**

- [ ] Ve a "Content Library"
- [ ] Haz clic en "Upload"
- [ ] Selecciona archivo MP3
- [ ] Completa detalles
- [ ] Haz clic en "Upload"

**Opción B: Usar ffmpeg**

```bash
ffmpeg -re -i test-stream.mp3 \
  -c:a aac -b:a 128k -f flv \
  rtmp://localhost:1935/live/STREAM_KEY
```

### ✅ FASE 5: VER EN VIVO

**Subscriber:**

- [ ] Actualiza la página del creator
- [ ] Verifica badge "🔴 LIVE"
- [ ] Haz clic en "Watch Live →"
- [ ] Se abre el reproductor
- [ ] Haz clic en "Play"
- [ ] ¡Escucha la transmisión!

---

## 🎯 VERIFICACIONES

### Backend

```bash
# Verificar que está corriendo
curl http://localhost:3000/health

# Ver logs
tail -f app-music/logs/combined.log
```

### Base de Datos

```bash
# Conectar a PostgreSQL
psql -U postgres -d app_music

# Ver usuarios
SELECT id, email, "userType" FROM users;

# Ver transmisiones
SELECT id, title, status FROM "LiveStream";

# Ver accesos
SELECT id, "subscriberId", "creatorId", "isActive" FROM "AccessGrant";
```

### Frontend

```bash
# Abrir consola (F12)
# Buscar errores en la pestaña "Console"
# Buscar requests en la pestaña "Network"
```

---

## 📊 ESTADOS ESPERADOS

### Creator Dashboard

```
✅ Transmisión creada
✅ Estado: SCHEDULED
✅ Stream Key visible
✅ RTMP URL visible
```

### Discover Page

```
✅ Creator aparece en lista
✅ Transmisión programada visible
✅ Botón "Buy Access" visible
```

### Creator Profile (Sin Acceso)

```
✅ Sección "Upcoming Stream" visible
✅ Botón "Buy Access" visible
✅ Botón "Have a code?" visible
```

### Creator Profile (Con Acceso)

```
✅ Mensaje "You have access" visible
✅ Sección "Content Archive" visible
✅ Botón "Watch Live" visible (cuando está LIVE)
```

### Live Stream Player

```
✅ Reproductor de audio visible
✅ Botón Play/Pause funciona
✅ Barra de progreso funciona
✅ Control de volumen funciona
✅ Contador de viewers visible
```

---

## 🔄 FLUJO VISUAL

```
┌─────────────────────────────────────────────────────────┐
│ PASO 1: REGISTRAR                                       │
├─────────────────────────────────────────────────────────┤
│ Creator: creator@test.com                               │
│ Subscriber: subscriber@test.com                         │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ PASO 2: CREAR TRANSMISIÓN                               │
├─────────────────────────────────────────────────────────┤
│ Creator crea: "Friday Night Electronic Mix"             │
│ Status: SCHEDULED                                       │
│ Stream Key: sk_live_abc123xyz                           │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ PASO 3: COMPRAR ACCESO                                  │
├─────────────────────────────────────────────────────────┤
│ Subscriber ve transmisión en Discover                   │
│ Subscriber compra acceso ($9.99)                        │
│ Acceso otorgado por 30 días                             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ PASO 4: INICIAR TRANSMISIÓN                             │
├─────────────────────────────────────────────────────────┤
│ Creator hace clic en "Start Stream"                     │
│ Status: LIVE                                            │
│ Viewers: 0                                              │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ PASO 5: VER EN VIVO                                     │
├─────────────────────────────────────────────────────────┤
│ Subscriber ve badge "🔴 LIVE"                           │
│ Subscriber hace clic en "Watch Live"                    │
│ Reproductor se abre                                     │
│ Audio se reproduce                                      │
│ Viewers: 1                                              │
└─────────────────────────────────────────────────────────┘
```

---

## 🎬 CASOS DE PRUEBA

### Caso 1: Flujo Básico

- [ ] Creator registra
- [ ] Subscriber registra
- [ ] Creator crea transmisión
- [ ] Subscriber compra acceso
- [ ] Creator inicia transmisión
- [ ] Subscriber ve en vivo

### Caso 2: Múltiples Subscribers

- [ ] Subscriber 1 compra acceso
- [ ] Subscriber 2 compra acceso
- [ ] Subscriber 3 compra acceso
- [ ] Creator inicia transmisión
- [ ] Todos ven en vivo (viewers: 3)

### Caso 3: Código de Acceso

- [ ] Creator genera código
- [ ] Subscriber canjea código
- [ ] Acceso otorgado sin pago
- [ ] Subscriber ve en vivo

### Caso 4: Acceso Expirado

- [ ] Subscriber compra acceso (1 día)
- [ ] Espera a que expire
- [ ] Subscriber no puede ver
- [ ] Subscriber compra acceso nuevamente

### Caso 5: Múltiples Transmisiones

- [ ] Creator crea transmisión 1
- [ ] Creator crea transmisión 2
- [ ] Subscriber compra acceso general
- [ ] Creator inicia transmisión 1
- [ ] Subscriber ve transmisión 1
- [ ] Creator inicia transmisión 2
- [ ] Subscriber ve transmisión 2

---

## 🐛 DEBUGGING

### Ver logs en tiempo real

```bash
tail -f app-music/logs/combined.log
```

### Ver errores en consola del frontend

```
F12 → Console → Buscar errores rojos
```

### Ver requests de API

```
F12 → Network → Filtrar por XHR
```

### Verificar base de datos

```bash
# Conectar a PostgreSQL
psql -U postgres -d app_music

# Ver todas las tablas
\dt

# Ver usuarios
SELECT * FROM users;

# Ver transmisiones
SELECT * FROM "LiveStream";

# Ver accesos
SELECT * FROM "AccessGrant";
```

---

## 📱 PANTALLAS CLAVE

### 1. Discover Page

```
URL: http://localhost:5173/discover
Elementos:
- Lista de creators
- Tarjetas con información
- Botón "Buy Access"
- Badge "🔴 LIVE" (si está en vivo)
```

### 2. Creator Profile

```
URL: http://localhost:5173/creator/{creatorId}
Elementos:
- Información del creator
- Sección "Upcoming Stream"
- Botón "Buy Access"
- Sección "Content Archive"
```

### 3. Live Stream Player

```
URL: http://localhost:5173/live/{streamId}
Elementos:
- Reproductor de audio
- Información de la transmisión
- Contador de viewers
- Controles de reproducción
```

### 4. Creator Dashboard

```
URL: http://localhost:5173/creator/dashboard
Elementos:
- Botón "Go Live"
- Lista de transmisiones
- Botón "Upload Content"
- Estadísticas
```

---

## 💾 DATOS DE PRUEBA

### Usuarios

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

### Stripe (Desarrollo)

```
Tarjeta: 4242 4242 4242 4242
Expiry: 12/25
CVC: 123
Postal: 12345
```

### Transmisión

```
Title: Friday Night Electronic Mix
Description: Deep house and techno session
Genre: Electronic
Duration: 5 minutos (si usas ffmpeg)
```

---

## ✨ RESULTADO FINAL

Cuando todo esté funcionando correctamente:

```
✅ Creator registrado
✅ Subscriber registrado
✅ Transmisión creada (SCHEDULED)
✅ Acceso comprado
✅ Transmisión iniciada (LIVE)
✅ Subscriber conectado (viewers: 1)
✅ Audio reproduciéndose
✅ Duración aumentando
✅ Controles funcionando
```

---

## 🎯 Próximos Pasos

Después de completar la simulación:

1. **Prueba con OBS:**
   - Descarga OBS
   - Configura Stream Key
   - Transmite contenido real

2. **Prueba con múltiples usuarios:**
   - Abre varias ventanas
   - Simula múltiples subscribers
   - Verifica contador de viewers

3. **Prueba pagos reales:**
   - Configura Stripe en producción
   - Prueba con tarjetas reales (en sandbox)

4. **Implementa notificaciones:**
   - Notificar cuando una transmisión comienza
   - Recordatorios de transmisiones programadas

5. **Agrega chat en vivo:**
   - Implementar WebSocket
   - Mensajes en tiempo real
   - Moderación

---

## 📞 Soporte

Si tienes problemas:

1. **Verifica que todo está corriendo:**

   ```bash
   curl http://localhost:3000/health
   curl http://localhost:5173
   ```

2. **Revisa los logs:**

   ```bash
   tail -f app-music/logs/combined.log
   ```

3. **Abre la consola del navegador:**

   ```
   F12 → Console → Busca errores
   ```

4. **Reinicia todo:**

   ```bash
   # Terminal 1
   npm run dev

   # Terminal 2
   npm run dev

   # Terminal 3
   node scripts/test-live-stream-flow.js
   ```

---

**¡Listo para simular tu primera transmisión en vivo!** 🎵🔴
