# PostgreSQL con Docker - Setup Guide

## Requisitos

- Docker Desktop instalado y corriendo
- Puerto 5432 disponible (no debe estar ocupado por otra instancia de PostgreSQL)

## Instalación de Docker Desktop

Si no tienes Docker instalado:

**Windows:**

1. Descargar desde: https://www.docker.com/products/docker-desktop/
2. Ejecutar el instalador
3. Reiniciar la computadora si es necesario
4. Abrir Docker Desktop y esperar a que inicie

## Comandos

### 1. Iniciar PostgreSQL

```bash
docker-compose up -d
```

Este comando:

- Descarga la imagen de PostgreSQL 16 (primera vez)
- Crea un contenedor llamado `music-platform-db`
- Inicia PostgreSQL en el puerto 5432
- Crea la base de datos `music_streaming_platform`

### 2. Verificar que está corriendo

```bash
docker-compose ps
```

Deberías ver:

```
NAME                  IMAGE                 STATUS
music-platform-db     postgres:16-alpine    Up
```

### 3. Ver logs de PostgreSQL

```bash
docker-compose logs -f postgres
```

Presiona `Ctrl+C` para salir de los logs.

### 4. Detener PostgreSQL

```bash
docker-compose stop
```

### 5. Iniciar PostgreSQL (si ya está creado)

```bash
docker-compose start
```

### 6. Detener y eliminar todo (incluyendo datos)

```bash
docker-compose down -v
```

⚠️ **CUIDADO**: El flag `-v` elimina los datos. Úsalo solo si quieres empezar de cero.

## Ejecutar Migraciones de Prisma

Una vez que PostgreSQL esté corriendo:

```bash
cd app-music
npm run prisma:migrate
```

Esto creará todas las tablas en la base de datos.

## Verificar la Base de Datos

### Opción 1: Prisma Studio (Recomendado)

```bash
cd app-music
npm run prisma:studio
```

Abre http://localhost:5555 en tu navegador para ver y editar datos.

### Opción 2: Conectar con psql (línea de comandos)

```bash
docker exec -it music-platform-db psql -U postgres -d music_streaming_platform
```

Comandos útiles en psql:

- `\dt` - Listar todas las tablas
- `\d users` - Ver estructura de la tabla users
- `SELECT * FROM users;` - Ver todos los usuarios
- `\q` - Salir

### Opción 3: Herramientas GUI

Puedes conectarte con herramientas como:

- **pgAdmin**: https://www.pgadmin.org/
- **DBeaver**: https://dbeaver.io/
- **TablePlus**: https://tableplus.com/

**Credenciales de conexión:**

- Host: `localhost`
- Port: `5432`
- Database: `music_streaming_platform`
- Username: `postgres`
- Password: `postgres`

## Configuración del Backend

El archivo `app-music/.env` ya está configurado con la URL correcta:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/music_streaming_platform
```

## Troubleshooting

### Error: "port 5432 is already in use"

Tienes otra instancia de PostgreSQL corriendo. Opciones:

1. **Detener PostgreSQL local:**
   - Windows: Services → PostgreSQL → Stop
2. **Cambiar el puerto en docker-compose.yml:**

   ```yaml
   ports:
     - "5433:5432" # Usa puerto 5433 en tu máquina
   ```

   Y actualiza `.env`:

   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5433/music_streaming_platform
   ```

### Error: "Docker daemon is not running"

1. Abre Docker Desktop
2. Espera a que inicie completamente
3. Intenta de nuevo

### Error: "Cannot connect to database"

1. Verifica que el contenedor esté corriendo:

   ```bash
   docker-compose ps
   ```

2. Verifica los logs:

   ```bash
   docker-compose logs postgres
   ```

3. Espera unos segundos y reintenta (PostgreSQL tarda en iniciar)

### Resetear la base de datos

Si quieres empezar de cero:

```bash
# Detener y eliminar todo
docker-compose down -v

# Iniciar de nuevo
docker-compose up -d

# Ejecutar migraciones
cd app-music
npm run prisma:migrate
```

## Datos Persistentes

Los datos de PostgreSQL se guardan en un volumen de Docker llamado `postgres_data`. Esto significa que:

✅ Los datos persisten aunque detengas el contenedor  
✅ Los datos persisten aunque reinicies tu computadora  
❌ Los datos se eliminan si ejecutas `docker-compose down -v`

## Comandos Útiles

```bash
# Ver todos los contenedores
docker ps -a

# Ver todos los volúmenes
docker volume ls

# Ver uso de espacio
docker system df

# Limpiar recursos no usados
docker system prune
```

## Próximos Pasos

1. ✅ Iniciar PostgreSQL con Docker
2. ✅ Ejecutar migraciones de Prisma
3. ⬜ Iniciar el backend: `cd app-music && npm run dev`
4. ⬜ Probar endpoints con Postman o curl
5. ⬜ Desactivar modo dev en frontend: `VITE_DEV_MODE=false`
6. ⬜ Registrar un usuario y probar la aplicación completa
