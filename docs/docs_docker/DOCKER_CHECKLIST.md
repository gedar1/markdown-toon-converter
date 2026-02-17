# ✅ Docker Setup Checklist

## Pre-requisitos

- [ ] Docker Desktop instalado

  ```bash
  docker --version
  # Debería mostrar: Docker version 24.0.0 o superior
  ```

- [ ] Docker Compose instalado

  ```bash
  docker-compose --version
  # Debería mostrar: Docker Compose version 2.20.0 o superior
  ```

- [ ] Git instalado
  ```bash
  git --version
  ```

---

## Archivos Creados

- [ ] `docker-compose.yml` - Orquestación de servicios
- [ ] `app-music/Dockerfile` - Imagen del backend
- [ ] `app-music/.dockerignore` - Archivos a excluir (backend)
- [ ] `client-web/Dockerfile` - Imagen del frontend
- [ ] `client-web/.dockerignore` - Archivos a excluir (frontend)
- [ ] `client-web/nginx.conf` - Configuración de Nginx
- [ ] `.env.docker` - Variables de entorno
- [ ] `QUICK_START.md` - Guía rápida
- [ ] `DOCKER_GUIDE.md` - Guía completa
- [ ] `DOCKER_WORKFLOW.md` - Workflow de desarrollo
- [ ] `DOCKER_EXAMPLES.md` - Ejemplos prácticos
- [ ] `DOCKER_ARCHITECTURE.md` - Arquitectura visual
- [ ] `docker-helper.sh` - Script helper (Linux/Mac)
- [ ] `docker-helper.bat` - Script helper (Windows)

---

## Configuración Inicial

### Backend (app-music)

- [ ] Verificar `package.json` tiene scripts necesarios

  ```bash
  # Debe tener:
  # "dev": "tsx watch ..."
  # "build": "tsc"
  # "start": "node dist/server.js"
  ```

- [ ] Verificar `tsconfig.json` existe

  ```bash
  ls app-music/tsconfig.json
  ```

- [ ] Verificar `prisma/schema.prisma` existe

  ```bash
  ls app-music/prisma/schema.prisma
  ```

- [ ] Verificar `.env.example` existe
  ```bash
  ls app-music/.env.example
  ```

### Frontend (client-web)

- [ ] Verificar `package.json` tiene scripts necesarios

  ```bash
  # Debe tener:
  # "dev": "vite"
  # "build": "tsc -b && vite build"
  ```

- [ ] Verificar `vite.config.ts` existe

  ```bash
  ls client-web/vite.config.ts
  ```

- [ ] Verificar `tsconfig.json` existe
  ```bash
  ls client-web/tsconfig.json
  ```

---

## Primer Inicio

### Paso 1: Construir Imágenes

```bash
docker-compose build
```

- [ ] Backend se construye sin errores
- [ ] Frontend se construye sin errores
- [ ] PostgreSQL se descarga correctamente

**Tiempo esperado:** 5-10 minutos (primera vez)

### Paso 2: Iniciar Servicios

```bash
docker-compose up -d
```

- [ ] Comando ejecuta sin errores
- [ ] Tres contenedores se crean

### Paso 3: Verificar Estado

```bash
docker-compose ps
```

- [ ] `music-db` está `Up` y `(healthy)`
- [ ] `music-backend` está `Up` y `(healthy)`
- [ ] `music-frontend` está `Up`

### Paso 4: Ejecutar Migraciones

```bash
docker-compose exec backend npx prisma migrate dev
```

- [ ] Migraciones se aplican sin errores
- [ ] Base de datos se inicializa

### Paso 5: Acceder a Aplicación

- [ ] Frontend: http://localhost:3001 carga correctamente
- [ ] Backend: http://localhost:3000 responde
- [ ] Puedes ver logs sin errores

```bash
docker-compose logs -f
```

---

## Verificaciones de Funcionalidad

### Backend

- [ ] Servidor inicia sin errores

  ```bash
  docker-compose logs backend | grep "Server running"
  ```

- [ ] Health check pasa

  ```bash
  docker-compose ps
  # Status debe mostrar (healthy)
  ```

- [ ] Puedes ejecutar comandos

  ```bash
  docker-compose exec backend npm run lint
  ```

- [ ] Puedes acceder a shell
  ```bash
  docker-compose exec backend sh
  # Dentro: ls -la
  # Dentro: exit
  ```

### Frontend

- [ ] Nginx inicia sin errores

  ```bash
  docker-compose logs frontend | grep "nginx"
  ```

- [ ] Puedes acceder a http://localhost:3001
- [ ] Puedes ver archivos estáticos
- [ ] Puedes acceder a shell
  ```bash
  docker-compose exec frontend sh
  ```

### Base de Datos

- [ ] PostgreSQL inicia sin errores

  ```bash
  docker-compose logs postgres | grep "ready to accept"
  ```

- [ ] Health check pasa

  ```bash
  docker-compose ps
  # Status debe mostrar (healthy)
  ```

- [ ] Puedes conectar
  ```bash
  docker-compose exec postgres psql -U music_user -d music_streaming_platform
  # Dentro: \dt
  # Dentro: \q
  ```

---

## Desarrollo

### Hot Reload Backend

- [ ] Edita `app-music/src/api/app.ts`
- [ ] Guarda el archivo
- [ ] Ver logs: `docker-compose logs -f backend`
- [ ] Debería mostrar recompilación automática
- [ ] Cambios se reflejan sin reiniciar

### Hot Reload Frontend

- [ ] Edita `client-web/src/App.tsx`
- [ ] Guarda el archivo
- [ ] Navegador se actualiza automáticamente
- [ ] Cambios se reflejan sin reiniciar

### Agregar Dependencia

- [ ] Edita `app-music/package.json`
- [ ] Ejecuta: `docker-compose exec backend npm install`
- [ ] Verifica que se instala correctamente
- [ ] Puedes usar la nueva dependencia

---

## Migraciones de BD

- [ ] Edita `app-music/prisma/schema.prisma`
- [ ] Ejecuta: `docker-compose exec backend npx prisma migrate dev --name test`
- [ ] Migración se crea correctamente
- [ ] Puedes ver cambios en Prisma Studio
  ```bash
  docker-compose exec backend npx prisma studio
  ```

---

## Debugging

### Ver Logs

- [ ] `docker-compose logs` muestra todos los logs
- [ ] `docker-compose logs -f` muestra logs en tiempo real
- [ ] `docker-compose logs backend` muestra solo backend
- [ ] Puedes ver errores claramente

### Acceder a Contenedores

- [ ] `docker-compose exec backend sh` abre shell
- [ ] Puedes ejecutar comandos dentro
- [ ] `exit` sale del shell

### Monitoreo

- [ ] `docker stats` muestra recursos
- [ ] Puedes ver CPU, memoria, red
- [ ] Ctrl+C detiene monitoreo

---

## Limpieza y Mantenimiento

### Detener Servicios

- [ ] `docker-compose stop` detiene sin eliminar
- [ ] `docker-compose ps` muestra contenedores detenidos
- [ ] `docker-compose start` reinicia

### Eliminar Contenedores

- [ ] `docker-compose down` elimina contenedores
- [ ] Volúmenes persisten (datos no se pierden)
- [ ] Imágenes persisten

### Limpiar Todo

- [ ] `docker-compose down -v` elimina contenedores y volúmenes
- [ ] ⚠️ BORRA TODOS LOS DATOS
- [ ] Puedes reconstruir desde cero

---

## Troubleshooting

### Si algo no funciona

- [ ] Ver logs: `docker-compose logs`
- [ ] Reiniciar: `docker-compose restart`
- [ ] Reconstruir: `docker-compose build --no-cache`
- [ ] Limpiar: `docker-compose down -v && docker-compose up -d`

### Si puerto está en uso

- [ ] Cambiar puerto en `docker-compose.yml`
- [ ] De: `"3000:3000"`
- [ ] A: `"3001:3000"`
- [ ] Reiniciar: `docker-compose restart`

### Si BD no conecta

- [ ] Verificar postgres está healthy: `docker-compose ps`
- [ ] Ver logs: `docker-compose logs postgres`
- [ ] Reiniciar: `docker-compose restart postgres`

---

## Documentación Leída

- [ ] `QUICK_START.md` - Guía rápida
- [ ] `DOCKER_GUIDE.md` - Conceptos principales
- [ ] `DOCKER_WORKFLOW.md` - Cómo trabajar día a día
- [ ] `DOCKER_EXAMPLES.md` - Ejemplos prácticos
- [ ] `DOCKER_ARCHITECTURE.md` - Entender la arquitectura

---

## Próximos Pasos

- [ ] Practicar comandos básicos
- [ ] Hacer cambios en código y ver hot reload
- [ ] Crear una migración de BD
- [ ] Agregar una dependencia
- [ ] Explorar logs y debugging
- [ ] Leer documentación completa

---

## Notas Personales

```
Fecha de setup: _______________
Problemas encontrados: _______________
Soluciones aplicadas: _______________
Observaciones: _______________
```

---

## Comandos Rápidos de Referencia

```bash
# Iniciar
docker-compose up -d

# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Ejecutar comando
docker-compose exec backend npm run lint

# Acceder a shell
docker-compose exec backend sh

# Migraciones
docker-compose exec backend npx prisma migrate dev

# Prisma Studio
docker-compose exec backend npx prisma studio

# Detener
docker-compose stop

# Eliminar
docker-compose down

# Limpiar todo
docker-compose down -v
```

---

## ¡Felicidades! 🎉

Si completaste todos los checkboxes, tu setup Docker está listo para desarrollo.

**Próximo paso:** Lee `DOCKER_WORKFLOW.md` para aprender cómo trabajar día a día.
