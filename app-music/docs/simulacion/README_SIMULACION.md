# 🎵 Simulación de Transmisión en Vivo - Guía Completa

**Simula una transmisión en vivo con compra de suscripción en 5 minutos**

---

## 🚀 Inicio Rápido

### 1. Abre 3 terminales

```bash
# Terminal 1: Backend
cd app-music && npm run dev

# Terminal 2: Frontend
cd client-web && npm run dev

# Terminal 3: Script
cd app-music && node scripts/test-live-stream-flow.js
```

**¡Listo!** La simulación está completa en 30 segundos.

---

## 📱 O Usa el Frontend Manualmente

1. Abre `http://localhost:5173`
2. Registra como **Creator** (`creator@test.com`)
3. Crea una transmisión programada
4. Abre incógnito y registra como **Subscriber** (`subscriber@test.com`)
5. Compra acceso ($9.99)
6. Creator inicia transmisión
7. Subscriber escucha en vivo

**Tiempo total:** 10 minutos

---

## 📚 Documentación

### Elige tu guía:

| Guía                                 | Tiempo | Para                      |
| ------------------------------------ | ------ | ------------------------- |
| **RESUMEN_SIMULACION.md**            | 5 min  | Empezar rápido en español |
| **QUICK_START_SIMULATION.md**        | 5 min  | Inicio automatizado       |
| **FRONTEND_SIMULATION_GUIDE.md**     | 15 min | Usar la interfaz web      |
| **AUDIO_STREAMING_SETUP.md**         | 10 min | Transmitir audio real     |
| **CURL_EXAMPLES.md**                 | 15 min | Pruebas manuales          |
| **COMPLETE_SIMULATION_CHECKLIST.md** | 20 min | Checklist detallado       |
| **FLOW_DIAGRAM.md**                  | 10 min | Entender la arquitectura  |
| **LIVE_STREAM_SIMULATION.md**        | 30 min | Referencia completa       |

---

## 🎯 Lo Que Vas a Lograr

```
Creator transmite → Subscriber compra → Subscriber escucha
     ↓                    ↓                    ↓
  Sube audio         Paga $9.99          Reproduce en vivo
  Inicia stream      Obtiene acceso      Ve contador viewers
  Transmite en vivo  Acceso válido       Controla volumen
```

---

## 🔧 Requisitos

- Node.js 18+
- PostgreSQL
- npm
- (Opcional) ffmpeg para transmisión real

---

## 📊 Flujo Completo

```
1. REGISTRAR
   ├─ Creator: creator@test.com
   └─ Subscriber: subscriber@test.com

2. CREAR TRANSMISIÓN
   ├─ Title: Friday Night Electronic Mix
   ├─ Status: SCHEDULED
   └─ Stream Key: sk_live_abc123xyz

3. COMPRAR ACCESO
   ├─ Subscriber ve en Discover
   ├─ Haz clic en "Buy Access"
   ├─ Paga $9.99 (tarjeta: 4242 4242 4242 4242)
   └─ Acceso otorgado por 30 días

4. INICIAR TRANSMISIÓN
   ├─ Creator hace clic en "Start Stream"
   ├─ Status: LIVE
   └─ Viewers: 0

5. VER EN VIVO
   ├─ Subscriber ve badge "🔴 LIVE"
   ├─ Haz clic en "Watch Live"
   ├─ Se abre reproductor
   └─ Audio se reproduce
```

---

## 💡 3 Formas de Simular

### Opción 1: Script Automatizado ⚡

```bash
node scripts/test-live-stream-flow.js
```

- ✅ Más rápido (30 segundos)
- ✅ Automatizado
- ❌ Menos interactivo

### Opción 2: Frontend Manual 🎬

1. Abre http://localhost:5173
2. Sigue los pasos en la UI

- ✅ Más interactivo
- ✅ Ves todo en tiempo real
- ❌ Más lento (10 minutos)

### Opción 3: cURL 🔧

```bash
# Ver CURL_EXAMPLES.md para todos los comandos
curl -X POST http://localhost:3000/auth/register ...
```

- ✅ Control total
- ✅ Pruebas manuales
- ❌ Más complejo

---

## 🎵 Cómo Transmitir Audio

### Opción A: Subir Archivo (Más Simple)

1. Dashboard → Content Library → Upload
2. Selecciona MP3
3. Haz clic en Upload

### Opción B: ffmpeg (Más Realista)

```bash
ffmpeg -re -i test.mp3 -c:a aac -b:a 128k -f flv \
  rtmp://localhost:1935/live/STREAM_KEY
```

### Opción C: OBS (Más Profesional)

1. Descarga OBS
2. Configura Stream Key
3. Haz clic en "Start Streaming"

---

## ✅ Checklist Rápido

- [ ] Backend corriendo
- [ ] Frontend corriendo
- [ ] PostgreSQL conectada
- [ ] Creator registrado
- [ ] Transmisión creada
- [ ] Subscriber registrado
- [ ] Acceso comprado
- [ ] Transmisión iniciada
- [ ] Subscriber conectado
- [ ] Audio reproduciéndose

---

## 🔐 Datos de Prueba

```
Creator:
  Email: creator@test.com
  Password: Test123!

Subscriber:
  Email: subscriber@test.com
  Password: Test123!

Stripe (Desarrollo):
  Tarjeta: 4242 4242 4242 4242
  Expiry: 12/25
  CVC: 123
  Postal: 12345
```

---

## 🐛 Troubleshooting

| Problema             | Solución                              |
| -------------------- | ------------------------------------- |
| "Connection refused" | Verifica que backend está corriendo   |
| "Creator not found"  | Actualiza la página (F5)              |
| "Access denied"      | Verifica que tienes acceso válido     |
| "Stream not found"   | Verifica que la transmisión está LIVE |
| "Audio not playing"  | Abre F12 y busca errores              |

---

## 📱 URLs Importantes

```
Frontend:     http://localhost:5173
Backend:      http://localhost:3000
Discover:     http://localhost:5173/discover
Creator:      http://localhost:5173/creator/{id}
Live Player:  http://localhost:5173/live/{id}
Dashboard:    http://localhost:5173/creator/dashboard
```

---

## 🎯 Casos de Uso

### Caso 1: Transmisión Única

- 1 creator, 1 subscriber, 1 transmisión

### Caso 2: Múltiples Subscribers

- 1 creator, 3+ subscribers, 1 transmisión

### Caso 3: Múltiples Transmisiones

- 1 creator, 1 subscriber, 3+ transmisiones

### Caso 4: Múltiples Creators

- 3+ creators, 1 subscriber, múltiples transmisiones

---

## 🚀 Próximos Pasos

1. **Integra OBS:** Para transmisión profesional
2. **Múltiples usuarios:** Abre varias ventanas
3. **Notificaciones:** Alertas cuando comienza
4. **Chat en vivo:** Mensajes en tiempo real
5. **Grabaciones:** Guardar transmisiones

---

## 📚 Documentación Completa

- **RESUMEN_SIMULACION.md** - Guía rápida en español
- **QUICK_START_SIMULATION.md** - Inicio en 2 minutos
- **FRONTEND_SIMULATION_GUIDE.md** - Guía del frontend
- **AUDIO_STREAMING_SETUP.md** - Cómo transmitir audio
- **CURL_EXAMPLES.md** - Ejemplos de API
- **COMPLETE_SIMULATION_CHECKLIST.md** - Checklist detallado
- **FLOW_DIAGRAM.md** - Diagramas visuales
- **LIVE_STREAM_SIMULATION.md** - Referencia completa
- **SIMULATION_DOCS_INDEX.md** - Índice de documentación

---

## 💡 Tips

- Usa incógnito (Ctrl+Shift+N) para múltiples sesiones
- Abre DevTools (F12) para ver errores
- Revisa logs: `tail -f app-music/logs/combined.log`
- Actualiza (F5) para ver cambios en tiempo real
- Guarda credenciales para no registrarse múltiples veces

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

## 🎓 Niveles

### Principiante (5 min)

→ Lee: RESUMEN_SIMULACION.md
→ Ejecuta: Script automatizado

### Intermedio (30 min)

→ Lee: FRONTEND_SIMULATION_GUIDE.md
→ Usa: Interfaz web

### Avanzado (1 hora)

→ Lee: CURL_EXAMPLES.md
→ Usa: cURL manual

### Experto (2+ horas)

→ Lee: FLOW_DIAGRAM.md + AUDIO_STREAMING_SETUP.md
→ Usa: ffmpeg/OBS

---

## 📞 Soporte

1. Busca en la documentación
2. Revisa los logs: `tail -f app-music/logs/combined.log`
3. Abre DevTools: F12
4. Ejecuta el script: `node scripts/test-live-stream-flow.js`

---

## 🎉 ¡Comienza Ahora!

### Opción 1: Rápido (5 min)

```bash
node scripts/test-live-stream-flow.js
```

### Opción 2: Frontend (10 min)

```
Abre http://localhost:5173
Sigue los pasos
```

### Opción 3: Documentación

```
Lee RESUMEN_SIMULACION.md
```

---

**¡Listo para simular tu primera transmisión en vivo!** 🎵🔴
