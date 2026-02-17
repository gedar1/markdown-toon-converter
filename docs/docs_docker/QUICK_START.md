# 🚀 Quick Start - Docker Setup

## Instalación Inicial (Primera vez)

```bash
# 1. Asegúrate de tener Docker Desktop instalado
docker --version

# 2. Clona o descarga el proyecto
cd tu-proyecto

# 3. Construye las imágenes (esto toma 5-10 minutos la primera vez)
docker-compose build

# 4. Inicia los servicios
docker-compose up -d

# 5. Ejecuta migraciones de BD
docker-compose exec backend npx prisma migrate dev

# 6. Accede a la aplicación
# Frontend: http://localhost:3001
# Backend: http://localhost:3000
```

---

## Comandos Diarios

```bash
# Iniciar todo
docker-compose up -d

# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Detener todo
docker-compose down

# Reiniciar un servicio
docker-compose restart backend
```

---

## Desarrollo

### Cambios en Backend

- Edita archivos en `app-music/src/`
- Los cambios se reflejan automáticamente (hot reload)
- Si cambias dependencias: `docker-compose exec backend npm install`

### Cambios en Frontend

- Edita archivos en `client-web/src/`
- Los cambios se reflejan automáticamente
- Si cambias dependencias: `docker-compose exec frontend npm install`

### Cambios en BD (Prisma)

```bash
# Crear nueva migración
docker-compose exec backend npx prisma migrate dev --name nombre_migracion

# Ver BD gráficamente
docker-compose exec backend npx prisma studio
```

---

## Problemas Comunes

### "Port 3000 already in use"

```bash
# Cambiar puerto en docker-compose.yml
# Línea: ports: - "3001:3000"  (cambiar 3001 a otro puerto)
docker-compose up -d
```

### "Cannot connect to database"

```bash
# Verificar que postgres está corriendo
docker-compose ps

# Ver logs de postgres
docker-compose logs postgres

# Reiniciar postgres
docker-compose restart postgres
```

### "Changes not showing up"

```bash
# Reconstruir sin cache
docker-compose build --no-cache

# Reiniciar
docker-compose restart
```

### "Eliminar todo y empezar de cero"

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
docker-compose exec backend npx prisma migrate dev
```

---

## Acceso a Servicios

| Servicio      | URL                                             | Usuario    | Contraseña     |
| ------------- | ----------------------------------------------- | ---------- | -------------- |
| Frontend      | http://localhost:3001                           | -          | -              |
| Backend       | http://localhost:3000                           | -          | -              |
| PostgreSQL    | localhost:5432                                  | music_user | music_password |
| Prisma Studio | `docker-compose exec backend npx prisma studio` | -          | -              |

---

## Próximas Lecturas

- Lee `DOCKER_GUIDE.md` para entender conceptos profundos
- Explora `docker-compose.yml` para ver cómo se configura todo
- Revisa los `Dockerfile` para entender cómo se construyen las imágenes
