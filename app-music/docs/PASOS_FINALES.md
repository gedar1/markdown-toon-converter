# ✅ Pasos Finales - Solucionar y Ejecutar

Ya tienes Docker con PostgreSQL. Solo necesitas estos 3 pasos.

---

## 🚀 PASO 1: Aplicar Migraciones (1 minuto)

Abre PowerShell en la carpeta `app-music`:

```powershell
cd app-music
npx prisma migrate dev --name init
```

**Espera a que termine.** Deberías ver:

```
✅ Your database has been successfully migrated
```

---

## 🚀 PASO 2: Inicia el Backend (Terminal 1)

En PowerShell:

```powershell
npm run dev
```

Deberías ver:

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎵 Music Streaming Platform API                        ║
║                                                           ║
║   Environment: development                                ║
║   Port:        3000                                       ║
║   Host:        localhost                                  ║
║                                                           ║
║   Health:      http://localhost:3000/health              ║
║   API Docs:    http://localhost:3000/                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

**✅ Backend corriendo**

---

## 🚀 PASO 3: Inicia el Frontend (Terminal 2)

Abre una nueva PowerShell:

```powershell
cd client-web
npm run dev
```

Deberías ver:

```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**✅ Frontend corriendo**

---

## 🚀 PASO 4: Ejecuta la Simulación (Terminal 3)

Abre una nueva PowerShell:

```powershell
cd app-music
node scripts/test-live-stream-flow.js
```

Deberías ver:

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

... (más pasos)

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
```

**✅ ¡Simulación completada!**

---

## 🎬 O Usa el Frontend Manualmente

Si prefieres simular desde la interfaz web:

1. Abre `http://localhost:5173`
2. Registra como **Creator** (`creator@test.com`)
3. Crea una transmisión programada
4. Abre incógnito y registra como **Subscriber** (`subscriber@test.com`)
5. Compra acceso ($9.99)
6. Creator inicia transmisión
7. Subscriber escucha en vivo

---

## 🐛 Si Algo Falla

### Error: "Can't reach database server"

```powershell
# Verifica que Docker está corriendo
docker ps

# Si no está, inicia el contenedor
docker start <nombre-del-contenedor>

# Intenta de nuevo
npx prisma migrate dev --name init
```

### Error: "Migraciones ya aplicadas"

```powershell
# Está bien, significa que ya están aplicadas
# Solo inicia el servidor
npm run dev
```

### Error: "Port 3000 already in use"

```powershell
# Mata el proceso en el puerto 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# O usa otro puerto
PORT=3001 npm run dev
```

---

## 📊 Estructura Final

```
Terminal 1: Backend (npm run dev)
   ↓
Terminal 2: Frontend (npm run dev)
   ↓
Terminal 3: Script (node scripts/test-live-stream-flow.js)
   ↓
✅ Simulación completa
```

---

## ✅ Checklist Final

- [ ] Docker PostgreSQL corriendo
- [ ] Migraciones aplicadas (`npx prisma migrate dev`)
- [ ] Backend corriendo (`npm run dev`)
- [ ] Frontend corriendo (`npm run dev`)
- [ ] Script ejecutado (`node scripts/test-live-stream-flow.js`)
- [ ] ¡Simulación funcionando!

---

## 🎉 ¡Listo!

Ahora tienes:

✅ Backend corriendo en http://localhost:3000
✅ Frontend corriendo en http://localhost:5173
✅ Base de datos conectada
✅ Simulación completa funcionando

**¡Comienza con PASO 1!** 🚀
