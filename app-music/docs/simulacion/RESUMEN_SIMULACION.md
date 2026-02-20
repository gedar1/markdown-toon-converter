# 🎵 Resumen: Cómo Simular Transmisión en Vivo con Compra de Suscripción

Guía rápida en español para simular todo desde el frontend.

---

## 🎯 Lo Que Vas a Lograr

```
┌─────────────────────────────────────────────────────────┐
│ 1. Creator sube/transmite audio                         │
│ 2. Subscriber descubre la transmisión                   │
│ 3. Subscriber compra acceso ($9.99)                     │
│ 4. Creator inicia transmisión en vivo                   │
│ 5. Subscriber escucha desde el frontend                 │
│ 6. ¡Transmisión en vivo funcionando!                    │
└─────────────────────────────────────────────────────────┘
```

---

## ⚡ Inicio Rápido (5 minutos)

### 1. Abre 3 terminales

**Terminal 1 - Backend:**

```bash
cd app-music
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd client-web
npm run dev
```

**Terminal 3 - Script:**

```bash
cd app-music
node scripts/test-live-stream-flow.js
```

**¡Listo!** La simulación está completa.

---

## 📱 Opción Manual: Paso a Paso en el Frontend

### PASO 1: Registrar como Creator

1. Abre `http://localhost:5173`
2. Haz clic en **"Sign Up"**
3. Completa:
   - Email: `creator@test.com`
   - Password: `Test123!`
   - User Type: **Creator**
   - Display Name: `DJ Mike`
4. Haz clic en **"Sign Up"**

✅ **Resultado:** Estás en el dashboard del creator

---

### PASO 2: Crear Transmisión Programada

1. Haz clic en **"Go Live"**
2. Completa:
   - Title: `Friday Night Electronic Mix`
   - Description: `Deep house and techno session`
   - Marca: **"Schedule for later"**
   - Hora: Selecciona en 5 minutos
3. Haz clic en **"Schedule Stream"**

✅ **Resultado:** Transmisión creada (estado: SCHEDULED)

---

### PASO 3: Registrar como Subscriber

1. Abre una **nueva ventana incógnito** (Ctrl+Shift+N)
2. Ve a `http://localhost:5173`
3. Haz clic en **"Sign Up"**
4. Completa:
   - Email: `subscriber@test.com`
   - Password: `Test123!`
   - User Type: **Subscriber**
   - Display Name: `Music Lover`
5. Haz clic en **"Sign Up"**

✅ **Resultado:** Estás en la página "Discover"

---

### PASO 4: Subscriber Descubre la Transmisión

1. En "Discover", busca **"DJ Mike"**
2. Deberías ver una tarjeta con:
   - Nombre del creator
   - Información de la transmisión programada
   - Botón **"Buy Access"**

✅ **Resultado:** Ves la transmisión disponible

---

### PASO 5: Subscriber Compra Acceso

1. Haz clic en la tarjeta de **"DJ Mike"**
2. Verás la página del creator con:
   - Sección **"Upcoming Stream"**
   - Botón **"Buy Access - $9.99/month"**
3. Haz clic en **"Buy Access"**

✅ **Resultado:** Serás redirigido a Stripe

---

### PASO 6: Completar el Pago

1. En Stripe, completa:
   - Email: `subscriber@test.com`
   - Tarjeta: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVC: `123`
   - Postal: `12345`
2. Haz clic en **"Pay"**

✅ **Resultado:** Pago procesado, acceso otorgado

---

### PASO 7: Verificar Acceso

1. Vuelve a la página del creator
2. Deberías ver:
   - ✓ You have access to this creator's live streams
   - Sección **"Content Archive"**

✅ **Resultado:** Acceso confirmado

---

### PASO 8: Creator Inicia Transmisión

1. Vuelve a la **ventana del creator**
2. Ve al dashboard
3. Busca la transmisión programada
4. Haz clic en **"Start Stream"** o **"Go Live"**

✅ **Resultado:** Estado cambia a "LIVE"

---

### PASO 9: Subscriber Ve la Transmisión

1. Vuelve a la **ventana del subscriber**
2. Actualiza la página del creator
3. Deberías ver:
   - Badge rojo **"🔴 LIVE"**
   - Botón **"Watch Live →"**
4. Haz clic en **"Watch Live →"**

✅ **Resultado:** Se abre el reproductor

---

### PASO 10: Escuchar la Transmisión

1. En el reproductor, haz clic en **"Play"**
2. ¡El audio se reproduce!
3. Verás:
   - Barra de progreso
   - Contador de viewers (1)
   - Controles de volumen

✅ **Resultado:** ¡Transmisión en vivo funcionando!

---

## 🎵 Cómo Transmitir Audio

### Opción A: Subir Archivo (Más Simple)

1. En el dashboard del creator, ve a **"Content Library"**
2. Haz clic en **"Upload"**
3. Selecciona un archivo MP3
4. Completa detalles y haz clic en **"Upload"**

**Resultado:** El archivo se sube y está disponible

### Opción B: Usar ffmpeg (Más Realista)

```bash
# Crear archivo de prueba
ffmpeg -f lavfi -i sine=f=440:d=300 -q:a 9 -acodec libmp3lame test.mp3

# Transmitir (reemplaza STREAM_KEY con el del creator)
ffmpeg -re -i test.mp3 -c:a aac -b:a 128k -f flv \
  rtmp://localhost:1935/live/STREAM_KEY
```

**Resultado:** Transmisión en vivo real

### Opción C: Usar OBS (Más Profesional)

1. Descarga OBS desde https://obsproject.com/
2. Configura Stream Key del creator
3. Agrega fuente de audio
4. Haz clic en **"Start Streaming"**

**Resultado:** Transmisión profesional

---

## 📊 Flujo Visual

```
CREATOR                          SUBSCRIBER
   │                                │
   ├─ Registra                      │
   │                                │
   ├─ Crea transmisión              │
   │  (SCHEDULED)                   │
   │                                │
   │                                ├─ Registra
   │                                │
   │                                ├─ Ve en Discover
   │                                │
   │                                ├─ Compra acceso
   │                                │  ($9.99)
   │                                │
   ├─ Inicia transmisión            │
   │  (LIVE)                        │
   │                                │
   │                                ├─ Ve badge LIVE
   │                                │
   │                                ├─ Abre reproductor
   │                                │
   │                                ├─ Escucha audio
   │                                │
   │  🎵 Transmitiendo              │  🎧 Escuchando
   │  (5 minutos)                   │  (5 minutos)
   │                                │
   ├─ Finaliza transmisión          │
   │  (ENDED)                       │
   │                                │
   └─ Fin                           └─ Fin
```

---

## ✅ Checklist Rápido

- [ ] Backend corriendo (`npm run dev`)
- [ ] Frontend corriendo (`npm run dev`)
- [ ] PostgreSQL conectada
- [ ] Creator registrado
- [ ] Transmisión creada
- [ ] Subscriber registrado
- [ ] Acceso comprado
- [ ] Transmisión iniciada
- [ ] Subscriber conectado
- [ ] Audio reproduciéndose

---

## 🔧 Troubleshooting

### ❌ "Creator not found" en Discover

→ Actualiza la página (F5)

### ❌ "Access denied" al comprar

→ Verifica que estás logueado como subscriber

### ❌ "Stream not found" al ver en vivo

→ Verifica que el creator inició la transmisión

### ❌ "Audio not playing"

→ Abre la consola (F12) y busca errores

### ❌ "Connection refused"

→ Verifica que el backend está corriendo

---

## 📱 URLs Importantes

| Página            | URL                                     |
| ----------------- | --------------------------------------- |
| Frontend          | http://localhost:5173                   |
| Backend           | http://localhost:3000                   |
| Discover          | http://localhost:5173/discover          |
| Creator Profile   | http://localhost:5173/creator/{id}      |
| Live Player       | http://localhost:5173/live/{id}         |
| Creator Dashboard | http://localhost:5173/creator/dashboard |

---

## 💳 Datos de Prueba

### Usuarios

```
Creator:
  Email: creator@test.com
  Password: Test123!

Subscriber:
  Email: subscriber@test.com
  Password: Test123!
```

### Stripe (Desarrollo)

```
Tarjeta: 4242 4242 4242 4242
Expiry: 12/25
CVC: 123
Postal: 12345
```

---

## 🎯 Casos de Uso

### Caso 1: Transmisión Única

- 1 creator
- 1 subscriber
- 1 transmisión
- ✅ Funciona

### Caso 2: Múltiples Subscribers

- 1 creator
- 3+ subscribers
- 1 transmisión
- ✅ Viewers aumenta

### Caso 3: Múltiples Transmisiones

- 1 creator
- 1 subscriber
- 3+ transmisiones
- ✅ Todas funcionan

---

## 💡 Tips

1. **Usa incógnito:** Ctrl+Shift+N para múltiples sesiones
2. **Abre DevTools:** F12 para ver errores
3. **Revisa logs:** `tail -f app-music/logs/combined.log`
4. **Actualiza:** F5 para ver cambios en tiempo real
5. **Guarda credenciales:** Para no registrarse múltiples veces

---

## 🚀 Próximos Pasos

Después de la simulación:

1. **Integra OBS:** Para transmisión profesional
2. **Prueba con múltiples usuarios:** Abre varias ventanas
3. **Implementa notificaciones:** Alertas cuando comienza
4. **Agrega chat:** Mensajes en tiempo real
5. **Prueba pagos reales:** Stripe en producción

---

## 📚 Documentación Completa

Para más detalles, lee:

- **QUICK_START_SIMULATION.md** - Inicio rápido
- **FRONTEND_SIMULATION_GUIDE.md** - Guía completa del frontend
- **AUDIO_STREAMING_SETUP.md** - Cómo transmitir audio
- **CURL_EXAMPLES.md** - Ejemplos de API
- **FLOW_DIAGRAM.md** - Diagramas visuales

---

## 🎬 Resultado Final

Cuando todo funcione:

```
✅ Creator transmitiendo
✅ Subscriber escuchando
✅ Audio reproduciéndose
✅ Viewers: 1
✅ Duración aumentando
✅ Controles funcionando
✅ ¡Transmisión en vivo!
```

---

**¡Listo para simular tu primera transmisión en vivo!** 🎵🔴
