# ⚡ Quick Start - Simular Transmisión en Vivo

La forma más rápida de probar el flujo completo.

## 🚀 En 2 Minutos

### 1. Inicia el servidor

```bash
cd app-music
npm run dev
```

Espera a que veas: `✅ Server running on http://localhost:3000`

### 2. Ejecuta el script de simulación

En otra terminal:

```bash
cd app-music
node scripts/test-live-stream-flow.js
```

**¡Listo!** Verás el flujo completo con todos los pasos.

---

## 📊 Qué Sucede

```
┌─────────────────────────────────────────────────────────┐
│ 1. Creator registra                                     │
│    ↓                                                    │
│ 2. Creator crea transmisión programada                 │
│    ↓                                                    │
│ 3. Subscriber registra                                 │
│    ↓                                                    │
│ 4. Subscriber ve transmisión disponible                │
│    ↓                                                    │
│ 5. Creator genera código de acceso ($9.99)             │
│    ↓                                                    │
│ 6. Subscriber compra acceso (canjea código)            │
│    ↓                                                    │
│ 7. Creator inicia transmisión (LIVE)                   │
│    ↓                                                    │
│ 8. Subscriber se conecta y escucha                     │
│    ↓                                                    │
│ ✅ ¡Transmisión en vivo con acceso pagado!             │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Alternativas

### Opción A: Script Rápido (30 segundos)

```bash
node scripts/quick-stream-test.js
```

Más simple, menos detalles.

### Opción B: Manual con cURL

```bash
# Registrar creator
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "creator@test.com",
    "password": "Test123!",
    "userType": "creator",
    "profile": {"displayName": "DJ Mike"}
  }'

# ... (ver CURL_EXAMPLES.md para todos los comandos)
```

### Opción C: UI del Frontend

1. Abre `http://localhost:3000`
2. Registra como creator
3. Crea transmisión programada
4. Registra como subscriber
5. Compra acceso
6. Ve la transmisión en vivo

---

## 📋 Salida Esperada

```
🎵 Simulador de Transmisión en Vivo

==================================================

📝 PASO 1: Registrando Creator...
✅ Creator registrado: creator-1708123456789@test.com
   ID: abc123def456...

🔐 PASO 2: Login como Creator...
✅ Creator autenticado

📅 PASO 3: Creando transmisión programada...
✅ Transmisión programada: Friday Night Electronic Mix
   ID: stream-123...
   Programada para: 1/17/2026, 3:05:00 PM
   Stream Key: sk_live_abc123...

👤 PASO 4: Registrando Subscriber...
✅ Subscriber registrado: subscriber-1708123456790@test.com
   ID: xyz789...

🔐 PASO 5: Login como Subscriber...
✅ Subscriber autenticado

👀 PASO 6: Subscriber descubre transmisión programada...
✅ Transmisión encontrada en lista de programadas
   Título: Friday Night Electronic Mix
   Creator: DJ Mike

💳 PASO 7: Creator genera código de acceso...
✅ Código de acceso generado: ACC-abc123xyz
   Precio: $9.99
   Duración: 30 días

🛒 PASO 8: Subscriber compra acceso...
✅ Acceso comprado exitosamente
   Grant ID: grant-123...
   Expira: 3/19/2026, 3:30:00 PM

✔️  PASO 9: Validando acceso del subscriber...
✅ Acceso validado: ✅ ACTIVO

⏳ PASO 10: Esperando para iniciar transmisión...
   (En producción, el creator usaría OBS/Streamlabs)
   Simulando inicio de transmisión en 3 segundos...

🔴 PASO 11: Creator inicia transmisión (LIVE)...
✅ Transmisión iniciada
   Estado: LIVE
   Viewers: 0

🎧 PASO 12: Subscriber se conecta a la transmisión...
✅ Subscriber conectado
   Viewer ID: viewer-123...
   Playback URL: http://localhost:8080/live/stream-123.m3u8

📊 PASO 13: Obteniendo estado actual de transmisión...
✅ Estado de transmisión:
   Título: Friday Night Electronic Mix
   Estado: LIVE
   Viewers activos: 1
   Duración: 5s

🔴 PASO 14: Listando transmisiones activas...
✅ Transmisiones activas: 1
   - DJ Mike: Friday Night Electronic Mix (1 viewers)

==================================================
✨ SIMULACIÓN COMPLETADA EXITOSAMENTE

📋 RESUMEN:
   Creator: creator-1708123456789@test.com
   Subscriber: subscriber-1708123456790@test.com
   Transmisión: Friday Night Electronic Mix
   Código de acceso: ACC-abc123xyz
   Acceso: ✅ ACTIVO
   Estado: 🔴 EN VIVO
   Viewers: 1

🎵 ¡El subscriber está escuchando la transmisión!
==================================================
```

---

## 🔧 Troubleshooting

### ❌ "Connection refused"

El servidor no está corriendo.

```bash
# Terminal 1
cd app-music
npm run dev
```

### ❌ "Cannot find module"

Faltan dependencias.

```bash
cd app-music
npm install
```

### ❌ "Database connection failed"

PostgreSQL no está corriendo o la URL es incorrecta.

```bash
# Verifica .env
cat app-music/.env | grep DATABASE_URL

# Ejecuta migraciones
npx prisma migrate dev
```

### ❌ "Invalid token"

El token expiró o es incorrecto. Ejecuta el script nuevamente.

---

## 📚 Documentación Completa

- **LIVE_STREAM_SIMULATION.md** - Guía detallada paso a paso
- **CURL_EXAMPLES.md** - Todos los endpoints con ejemplos
- **SCHEDULED_STREAMS_V2.md** - Cómo funcionan las transmisiones programadas

---

## 🎬 Próximos Pasos

Después de probar la simulación:

1. **Prueba en la UI:**
   - Abre http://localhost:3000
   - Registra como creator y subscriber
   - Crea una transmisión real

2. **Integra OBS/Streamlabs:**
   - Usa el Stream Key del script
   - Configura RTMP URL: `rtmp://localhost:1935/live`

3. **Implementa notificaciones:**
   - Notificar cuando una transmisión comienza
   - Recordatorios de transmisiones programadas

4. **Agrega chat en vivo:**
   - WebSocket para mensajes en tiempo real
   - Moderación de chat

---

## 💡 Tips

- **Reutiliza usuarios:** Puedes crear múltiples transmisiones con el mismo creator
- **Múltiples viewers:** Ejecuta el script varias veces para simular múltiples subscribers
- **Datos persistentes:** Los datos se guardan en la BD, puedes consultarlos después
- **Logs:** Revisa `app-music/logs/` para ver detalles de las operaciones

---

## 🎯 Casos de Uso

### Caso 1: Transmisión Única

```bash
node scripts/quick-stream-test.js
```

### Caso 2: Múltiples Transmisiones

```bash
# Ejecuta el script varias veces
node scripts/test-live-stream-flow.js
node scripts/test-live-stream-flow.js
node scripts/test-live-stream-flow.js
```

### Caso 3: Múltiples Subscribers

```bash
# Ejecuta el script en paralelo
node scripts/test-live-stream-flow.js &
node scripts/test-live-stream-flow.js &
node scripts/test-live-stream-flow.js &
```

### Caso 4: Prueba Manual

```bash
# Usa los comandos de CURL_EXAMPLES.md
# Personaliza cada paso según necesites
```

---

## 📞 Soporte

Si tienes problemas:

1. Verifica que el servidor está corriendo: `npm run dev`
2. Verifica que PostgreSQL está corriendo
3. Revisa los logs: `tail -f app-music/logs/combined.log`
4. Ejecuta migraciones: `npx prisma migrate dev`

---

**¡Listo para simular tu primera transmisión en vivo!** 🎵🔴
