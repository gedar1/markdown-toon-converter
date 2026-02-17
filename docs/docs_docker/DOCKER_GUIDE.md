# Guía Completa: Desarrollo con Docker

## 📋 Requisitos Previos

1. **Docker Desktop** instalado (incluye Docker Engine y Docker Compose)
   - Windows: https://www.docker.com/products/docker-desktop
   - Mac: https://www.docker.com/products/docker-desktop
   - Linux: `sudo apt-get install docker.io docker-compose`

2. **Verificar instalación:**
   ```bash
   docker --version
   docker-compose --version
   ```

---

## 🚀 Primeros Pasos

### 1. Preparar el entorno

```bash
# Copiar archivo de variables de entorno
cp .env.docker .env

# O crear uno personalizado en app-music/.env
cp app-music/.env.example app-music/.env
```

### 2. Construir las imágenes

```bash
# Construir todas las imágenes (backend, frontend, postgres)
docker-compose build

# Construir solo una imagen específica
docker-compose build backend
docker-compose build frontend
```

**¿Qué pasa aquí?**

- Lee los Dockerfiles
- Descarga imágenes base (node:18-alpine, postgres:16-alpine, nginx:alpine)
- Ejecuta cada instrucción del Dockerfile
- Crea capas de imagen (cada RUN, COPY, etc. es una capa)

### 3. Iniciar los servicios

```bash
# Iniciar todos los servicios en background
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

**¿Qué pasa aquí?**

- Crea y inicia contenedores
- Crea la red `music-network` para que se comuniquen
- Crea volúmenes persistentes
- Ejecuta health checks

### 4. Verificar que todo funciona

```bash
# Ver estado de los contenedores
docker-compose ps

# Acceder a la aplicación
# Frontend: http://localhost:3001
# Backend: http://localhost:3000
# Base de datos: localhost:5432
```

---

## 🔧 Comandos Esenciales

### Ver y Gestionar Contenedores

```bash
# Listar contenedores en ejecución
docker-compose ps

# Listar todos los contenedores (incluyendo detenidos)
docker-compose ps -a

# Ver detalles de un contenedor
docker inspect music-backend

# Ver recursos usados
docker stats
```

### Ejecutar Comandos Dentro de Contenedores

```bash
# Ejecutar comando en el backend
docker-compose exec backend npm run lint

# Ejecutar comando en la BD
docker-compose exec postgres psql -U music_user -d music_streaming_platform

# Acceder a shell interactivo del backend
docker-compose exec backend sh

# Acceder a shell interactivo del frontend
docker-compose exec frontend sh
```

### Migraciones de Base de Datos

```bash
# Ejecutar migraciones de Prisma
docker-compose exec backend npx prisma migrate dev

# Ver estado de migraciones
docker-compose exec backend npx prisma migrate status

# Abrir Prisma Studio (interfaz gráfica de BD)
docker-compose exec backend npx prisma studio
```

### Logs y Debugging

```bash
# Ver últimas 100 líneas de logs
docker-compose logs --tail=100

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend

# Guardar logs en archivo
docker-compose logs > logs.txt
```

### Detener y Limpiar

```bash
# Detener todos los servicios (sin eliminar)
docker-compose stop

# Detener un servicio específico
docker-compose stop backend

# Reiniciar servicios
docker-compose restart

# Detener y eliminar contenedores
docker-compose down

# Eliminar todo incluyendo volúmenes (⚠️ BORRA DATOS)
docker-compose down -v

# Eliminar imágenes también
docker-compose down -v --rmi all
```

---

## 💾 Volúmenes: Persistencia de Datos

Los volúmenes permiten que los datos persistan incluso si eliminas contenedores.

### Volúmenes en tu setup:

```yaml
postgres_data: # Base de datos
backend_uploads: # Archivos subidos
backend_logs: # Logs de la aplicación
```

### Gestionar volúmenes:

```bash
# Listar volúmenes
docker volume ls

# Ver detalles de un volumen
docker volume inspect music-postgres_data

# Eliminar volumen (⚠️ BORRA DATOS)
docker volume rm music-postgres_data

# Limpiar volúmenes no usados
docker volume prune
```

### Acceder a archivos en volúmenes:

```bash
# Copiar archivo desde contenedor
docker cp music-backend:/app/uploads/archivo.mp3 ./

# Copiar archivo a contenedor
docker cp ./archivo.mp3 music-backend:/app/uploads/
```

---

## 🔄 Desarrollo en Vivo (Hot Reload)

### Backend (Node.js con tsx watch)

El Dockerfile ya incluye volumen para desarrollo:

```yaml
volumes:
  - ./app-music/src:/app/src
```

Cuando cambias archivos en `app-music/src`, se actualizan en el contenedor automáticamente.

**Para activar hot reload:**

1. Modifica `app-music/package.json` para usar `tsx watch` en Docker
2. Los cambios se reflejan sin reiniciar

### Frontend (Vite con HMR)

Similar al backend, los cambios en `client-web/src` se reflejan automáticamente.

---

## 🌐 Redes: Cómo se Comunican los Servicios

Docker Compose crea una red `music-network` donde:

- **Backend** accede a PostgreSQL como: `postgresql://user:pass@postgres:5432/db`
- **Frontend** accede a Backend como: `http://backend:3000`
- **Nginx** accede a Backend como: `http://backend:3000`

Los nombres de servicio en `docker-compose.yml` se resuelven automáticamente.

---

## 🐛 Troubleshooting

### El backend no se conecta a la BD

```bash
# Verificar que postgres está healthy
docker-compose ps

# Ver logs de postgres
docker-compose logs postgres

# Verificar conectividad desde backend
docker-compose exec backend ping postgres
```

### Puerto ya en uso

```bash
# Cambiar puerto en docker-compose.yml
# De: "3000:3000"
# A:  "3001:3000"

# O encontrar qué usa el puerto
netstat -ano | findstr :3000  # Windows
lsof -i :3000                  # Mac/Linux
```

### Cambios no se reflejan

```bash
# Reconstruir imágenes
docker-compose build --no-cache

# Reiniciar servicios
docker-compose restart

# O eliminar y recrear todo
docker-compose down -v
docker-compose up -d
```

### Base de datos corrupta

```bash
# Eliminar volumen de datos
docker volume rm music-postgres_data

# Reiniciar
docker-compose up -d

# Ejecutar migraciones nuevamente
docker-compose exec backend npx prisma migrate dev
```

---

## 📊 Monitoreo

### Ver recursos en tiempo real

```bash
docker stats
```

### Ver eventos de Docker

```bash
docker events
```

### Inspeccionar contenedor

```bash
docker inspect music-backend
```

---

## 🚢 Producción vs Desarrollo

### Desarrollo (actual)

- Volúmenes montados para hot reload
- Logs en consola
- Base de datos local

### Producción (cambios necesarios)

```yaml
# Comentar volúmenes de desarrollo
# volumes:
#   - ./app-music/src:/app/src

# Usar variables de entorno seguras
# Usar base de datos remota
# Configurar HTTPS
# Usar reverse proxy (Nginx)
```

---

## 📚 Conceptos Clave

### Imagen vs Contenedor

- **Imagen**: Plantilla (como un .exe)
- **Contenedor**: Instancia en ejecución (como un proceso)

### Dockerfile

- Instrucciones para construir una imagen
- Cada línea crea una capa

### docker-compose.yml

- Define múltiples servicios
- Orquesta redes, volúmenes, variables de entorno

### Volúmenes

- Almacenamiento persistente
- Compartir archivos entre host y contenedor

### Redes

- Permiten comunicación entre contenedores
- Nombres de servicio se resuelven automáticamente

---

## 🎯 Próximos Pasos

1. **Ejecuta**: `docker-compose up -d`
2. **Verifica**: `docker-compose ps`
3. **Accede**: http://localhost:3001
4. **Experimenta**: Modifica código y ve cambios en vivo
5. **Aprende**: Explora logs y comandos

¡Ahora estás listo para desarrollar con Docker!
