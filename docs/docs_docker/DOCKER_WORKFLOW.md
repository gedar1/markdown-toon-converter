# 🔄 Workflow de Desarrollo con Docker

## Flujo Típico de Desarrollo

### Mañana: Empezar a trabajar

```bash
# 1. Asegúrate de estar en la carpeta del proyecto
cd tu-proyecto

# 2. Inicia los servicios
docker-compose up -d

# 3. Verifica que todo está corriendo
docker-compose ps

# 4. Abre tu editor (VS Code, etc.)
code .
```

### Durante el día: Hacer cambios

#### Cambios en Backend (TypeScript)

```bash
# Edita archivos en app-music/src/
# Los cambios se reflejan automáticamente gracias a:
# - tsx watch (en desarrollo)
# - Volumen montado: ./app-music/src:/app/src

# Si cambias package.json (dependencias):
docker-compose exec backend npm install

# Si cambias Dockerfile:
docker-compose build backend
docker-compose restart backend
```

#### Cambios en Frontend (React)

```bash
# Edita archivos en client-web/src/
# Los cambios se reflejan automáticamente gracias a:
# - Vite HMR (Hot Module Replacement)
# - Volumen montado: ./client-web/src:/app/src

# Si cambias package.json:
docker-compose exec frontend npm install

# Si cambias Dockerfile:
docker-compose build frontend
docker-compose restart frontend
```

#### Cambios en Base de Datos (Prisma)

```bash
# 1. Edita prisma/schema.prisma
# 2. Crea una migración
docker-compose exec backend npx prisma migrate dev --name nombre_descriptivo

# 3. Verifica los cambios en Prisma Studio
docker-compose exec backend npx prisma studio
# Abre http://localhost:5555 en tu navegador

# 4. Los cambios se aplican automáticamente a la BD
```

### Tarde: Debugging

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Acceder a shell del contenedor para debugging
docker-compose exec backend sh
# Dentro del contenedor:
# ls -la
# cat logs/error.log
# npm run lint

# Ejecutar comando específico
docker-compose exec backend npm run lint
docker-compose exec backend npm test
```

### Noche: Terminar el día

```bash
# Opción 1: Detener servicios (datos persisten)
docker-compose stop

# Opción 2: Detener y eliminar contenedores (datos persisten en volúmenes)
docker-compose down

# Opción 3: Limpiar todo (⚠️ BORRA DATOS)
docker-compose down -v
```

---

## Escenarios Comunes

### Escenario 1: Agregar nueva dependencia al Backend

```bash
# 1. Edita app-music/package.json
# 2. Instala en el contenedor
docker-compose exec backend npm install

# 3. Verifica que funciona
docker-compose exec backend npm run lint

# 4. Commit a git
git add app-music/package.json app-music/package-lock.json
git commit -m "Add new dependency"
```

### Escenario 2: Crear nueva tabla en BD

```bash
# 1. Edita prisma/schema.prisma
# 2. Crea migración
docker-compose exec backend npx prisma migrate dev --name add_new_table

# 3. Verifica en Prisma Studio
docker-compose exec backend npx prisma studio

# 4. Commit
git add prisma/
git commit -m "Add new table"
```

### Escenario 3: Cambiar variables de entorno

```bash
# 1. Edita .env o .env.docker
# 2. Reinicia los servicios
docker-compose restart

# O reconstruye si es necesario
docker-compose down
docker-compose up -d
```

### Escenario 4: Resetear BD (empezar de cero)

```bash
# ⚠️ ESTO BORRA TODOS LOS DATOS

# Opción 1: Eliminar volumen
docker volume rm music-postgres_data

# Opción 2: Usar docker-compose
docker-compose down -v

# Reiniciar
docker-compose up -d

# Ejecutar migraciones nuevamente
docker-compose exec backend npx prisma migrate dev
```

### Escenario 5: Colaborar con otros desarrolladores

```bash
# Tu compañero hace cambios en el código
# Tú haces pull del repositorio
git pull origin main

# Reconstruye imágenes (por si cambió Dockerfile)
docker-compose build

# Reinicia servicios
docker-compose restart

# Ejecuta migraciones nuevas (si las hay)
docker-compose exec backend npx prisma migrate deploy
```

---

## Monitoreo y Debugging

### Ver recursos en tiempo real

```bash
docker stats

# Output:
# CONTAINER ID   NAME              CPU %     MEM USAGE / LIMIT
# abc123...      music-backend     0.5%      150MiB / 2GiB
# def456...      music-frontend    0.1%      80MiB / 2GiB
# ghi789...      music-db          1.2%      200MiB / 2GiB
```

### Inspeccionar contenedor

```bash
# Ver detalles completos
docker inspect music-backend

# Ver solo variables de entorno
docker inspect -f '{{json .Config.Env}}' music-backend | jq

# Ver volúmenes montados
docker inspect -f '{{json .Mounts}}' music-backend | jq
```

### Ver eventos en tiempo real

```bash
docker events --filter type=container
```

### Acceder a archivos en volúmenes

```bash
# Copiar archivo desde contenedor
docker cp music-backend:/app/logs/error.log ./

# Copiar archivo a contenedor
docker cp ./archivo.mp3 music-backend:/app/uploads/

# Listar archivos en volumen
docker run --rm -v music-backend_uploads:/data alpine ls -la /data
```

---

## Optimizaciones para Desarrollo

### 1. Usar .dockerignore

Ya está configurado para excluir:

- node_modules
- .git
- logs
- uploads

Esto hace que las builds sean más rápidas.

### 2. Cachear capas de Docker

El Dockerfile está optimizado con multi-stage:

- Stage 1: Build (instala devDependencies)
- Stage 2: Runtime (solo dependencias de producción)

Esto reduce el tamaño de la imagen final.

### 3. Volúmenes para desarrollo

```yaml
volumes:
  - ./app-music/src:/app/src # Hot reload
  - backend_uploads:/app/uploads # Persistencia
```

### 4. Health checks

Los servicios tienen health checks para verificar que están listos:

```bash
docker-compose ps
# STATUS: Up 2 minutes (healthy)
```

---

## Troubleshooting Avanzado

### Problema: Contenedor se reinicia constantemente

```bash
# Ver logs
docker-compose logs backend

# Acceder a shell para debugging
docker-compose exec backend sh

# Dentro del contenedor:
npm run build  # Verificar que compila
npm start      # Verificar que inicia
```

### Problema: Cambios no se reflejan

```bash
# Verificar que volumen está montado
docker inspect music-backend | grep -A 10 Mounts

# Reconstruir sin cache
docker-compose build --no-cache backend

# Reiniciar
docker-compose restart backend
```

### Problema: BD corrupta

```bash
# Eliminar volumen
docker volume rm music-postgres_data

# Reiniciar
docker-compose up -d

# Ejecutar migraciones
docker-compose exec backend npx prisma migrate dev
```

### Problema: Memoria insuficiente

```bash
# Ver uso de recursos
docker stats

# Aumentar límite en docker-compose.yml:
# services:
#   backend:
#     deploy:
#       resources:
#         limits:
#           memory: 1G

# Limpiar imágenes no usadas
docker image prune -a

# Limpiar volúmenes no usados
docker volume prune
```

---

## Mejores Prácticas

### ✅ Hacer

- Usar volúmenes para datos persistentes
- Usar health checks
- Documentar variables de entorno
- Usar .dockerignore
- Separar desarrollo de producción
- Usar nombres descriptivos para contenedores

### ❌ No hacer

- Guardar datos en contenedores (se pierden al eliminar)
- Usar `latest` como tag de imagen en producción
- Ejecutar como root en contenedores
- Montar volúmenes innecesarios
- Ignorar logs de error

---

## Próximos Pasos

1. **Practica**: Ejecuta `docker-compose up -d` y explora
2. **Experimenta**: Haz cambios en el código y ve cómo se reflejan
3. **Aprende**: Lee los Dockerfiles y entiende cada línea
4. **Domina**: Usa los comandos hasta que sean naturales

¡Ahora eres un desarrollador con Docker!
