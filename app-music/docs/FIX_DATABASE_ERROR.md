# 🔧 Solucionar Error de Base de Datos

Tu error: `Can't reach database server at localhost:5432`

Ya tienes PostgreSQL en Docker, así que solo necesitas aplicar las migraciones.

---

## ⚡ Solución Rápida (2 minutos)

### Paso 1: Verifica que Docker está corriendo

```powershell
docker ps
```

Deberías ver tu contenedor de PostgreSQL en la lista.

### Paso 2: Aplica las migraciones

En PowerShell, en la carpeta `app-music`:

```powershell
npx prisma migrate dev --name init
```

**Resultado esperado:**

```
✅ Your database has been successfully migrated
```

### Paso 3: Inicia el servidor

```powershell
npm run dev
```

Deberías ver:

```
✅ Server running on http://localhost:3000
```

### Paso 4: Ejecuta el script

En otra terminal:

```powershell
node scripts/test-live-stream-flow.js
```

**¡Debería funcionar!**

---

## 🐛 Si Aún No Funciona

### Verifica la conexión a Docker

```powershell
# Ver contenedores corriendo
docker ps

# Ver logs del contenedor
docker logs <nombre-del-contenedor>

# Conectar a PostgreSQL desde Docker
docker exec -it <nombre-del-contenedor> psql -U postgres -d music_streaming_platform
```

### Verifica el .env

Abre `app-music/.env` y verifica:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/music_streaming_platform
```

**Importante:** Reemplaza `postgres:postgres` con las credenciales de tu contenedor Docker.

### Reinicia todo

```powershell
# Detén el contenedor
docker stop <nombre-del-contenedor>

# Inicia el contenedor
docker start <nombre-del-contenedor>

# Aplica migraciones
npx prisma migrate dev --name init

# Inicia el servidor
npm run dev
```

---

## 📋 Checklist

- [ ] Docker está corriendo
- [ ] Contenedor PostgreSQL está activo
- [ ] `.env` tiene la URL correcta
- [ ] Migraciones aplicadas (`npx prisma migrate dev`)
- [ ] Servidor inicia sin errores (`npm run dev`)
- [ ] Script ejecuta sin errores (`node scripts/test-live-stream-flow.js`)

---

## 🚀 Próximos Pasos

Una vez que todo funcione:

```powershell
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd ../client-web
npm run dev

# Terminal 3: Script
cd ../app-music
node scripts/test-live-stream-flow.js
```

---

**¡Listo!** 🎵
