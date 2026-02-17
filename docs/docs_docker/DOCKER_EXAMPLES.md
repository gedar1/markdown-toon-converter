# 📚 Ejemplos Prácticos - Docker

## Ejemplo 1: Primer Inicio

```bash
# Paso 1: Construir imágenes (primera vez, toma 5-10 min)
docker-compose build

# Output esperado:
# [+] Building 45.3s (15/15) FINISHED
# => [backend internal] load build definition from Dockerfile
# => [backend] exporting to image
# => [frontend internal] load build definition from Dockerfile
# => [frontend] exporting to image

# Paso 2: Iniciar servicios
docker-compose up -d

# Output esperado:
# [+] Running 4/4
#  ✔ Network music-network Created
#  ✔ Container music-db Started
#  ✔ Container music-backend Started
#  ✔ Container music-frontend Started

# Paso 3: Verificar estado
docker-compose ps

# Output esperado:
# NAME              STATUS              PORTS
# music-db          Up 10s (healthy)    5432/tcp
# music-backend     Up 8s (healthy)     0.0.0.0:3000->3000/tcp
# music-frontend    Up 5s               0.0.0.0:3001->80/tcp

# Paso 4: Ejecutar migraciones
docker-compose exec backend npx prisma migrate dev

# Output esperado:
# ✔ Generated Prisma Client
# ✔ Created migration: 20260215_initial_schema
# ✔ Applied migration: 20260215_initial_schema
```

---

## Ejemplo 2: Agregar Nueva Dependencia

### Escenario: Necesitas agregar `axios` al backend

```bash
# Paso 1: Edita app-music/package.json
# Agrega a "dependencies":
# "axios": "^1.6.0"

# Paso 2: Instala en el contenedor
docker-compose exec backend npm install

# Output esperado:
# added 1 package, and audited 45 packages in 2s

# Paso 3: Verifica que funciona
docker-compose exec backend npm run lint

# Output esperado:
# ✔ No linting errors

# Paso 4: Usa en tu código
# app-music/src/api/app.ts
import axios from 'axios';

# Paso 5: Commit
git add app-music/package.json app-music/package-lock.json
git commit -m "Add axios dependency"
```

---

## Ejemplo 3: Crear Nueva Tabla en BD

### Escenario: Agregar tabla de "Comentarios"

```bash
# Paso 1: Edita prisma/schema.prisma
# Agrega:
model Comment {
  id        String   @id @default(cuid())
  content   String
  userId    String
  contentId String
  createdAt DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id])
  content Content @relation(fields: [contentId], references: [id])
}

# Paso 2: Crea migración
docker-compose exec backend npx prisma migrate dev --name add_comments_table

# Output esperado:
# ✔ Generated Prisma Client
# ✔ Created migration: 20260215_add_comments_table
# ✔ Applied migration: 20260215_add_comments_table

# Paso 3: Verifica en Prisma Studio
docker-compose exec backend npx prisma studio

# Se abre http://localhost:5555 en tu navegador
# Puedes ver la nueva tabla y agregar datos

# Paso 4: Usa en tu código
# app-music/src/domain/content/repositories/ICommentRepository.ts
export interface ICommentRepository {
  create(comment: Comment): Promise<Comment>;
  findById(id: string): Promise<Comment | null>;
  findByContentId(contentId: string): Promise<Comment[]>;
}

# Paso 5: Commit
git add prisma/
git commit -m "Add comments table"
```

---

## Ejemplo 4: Debugging de Error

### Escenario: Backend no inicia

```bash
# Paso 1: Ver logs
docker-compose logs backend

# Output (error):
# music-backend | Error: Cannot find module 'express'
# music-backend | at Function.Module._load (internal/modules/esm_loader.js:1234:1)

# Paso 2: Acceder a shell
docker-compose exec backend sh

# Paso 3: Dentro del contenedor, verificar
$ npm list express
# npm ERR! extraneous: express@4.18.2

# Paso 4: Reinstalar dependencias
$ npm install
# added 45 packages

# Paso 5: Salir del shell
$ exit

# Paso 6: Reiniciar
docker-compose restart backend

# Paso 7: Verificar logs
docker-compose logs backend
# Debería estar corriendo sin errores
```

---

## Ejemplo 5: Cambiar Variables de Entorno

### Escenario: Cambiar puerto del backend

```bash
# Paso 1: Edita docker-compose.yml
# Busca:
# ports:
#   - "3000:3000"

# Cambia a:
# ports:
#   - "3001:3000"

# Paso 2: Reinicia
docker-compose down
docker-compose up -d

# Paso 3: Verifica
docker-compose ps
# Backend ahora está en puerto 3001

# Paso 4: Accede
# http://localhost:3001
```

---

## Ejemplo 6: Resetear Base de Datos

### Escenario: Quieres empezar con BD limpia

```bash
# Opción 1: Eliminar volumen (más rápido)
docker volume rm music-postgres_data

# Opción 2: Usar docker-compose
docker-compose down -v

# Paso 2: Reiniciar
docker-compose up -d

# Paso 3: Ejecutar migraciones
docker-compose exec backend npx prisma migrate dev

# Output esperado:
# ✔ Generated Prisma Client
# ✔ Applied migration: 20260215_initial_schema
# ✔ Applied migration: 20260215_add_comments_table

# Paso 4: Verificar en Prisma Studio
docker-compose exec backend npx prisma studio
# Abre http://localhost:5555
# Verás tablas vacías pero con estructura correcta
```

---

## Ejemplo 7: Copiar Archivos

### Escenario: Necesitas un archivo de logs

```bash
# Copiar archivo desde contenedor a tu máquina
docker cp music-backend:/app/logs/error.log ./error.log

# Verificar que se copió
ls -la error.log

# Leer contenido
cat error.log

# Copiar archivo a contenedor
docker cp ./archivo.mp3 music-backend:/app/uploads/

# Verificar
docker-compose exec backend ls -la /app/uploads/
```

---

## Ejemplo 8: Ejecutar Tests

### Escenario: Ejecutar suite de tests

```bash
# Ejecutar tests una sola vez
docker-compose exec backend npm test -- --run

# Output esperado:
# PASS  src/domain/auth/use-cases/LoginUser.test.ts
# PASS  src/domain/content/use-cases/UploadContent.test.ts
# Test Suites: 2 passed, 2 total
# Tests:       15 passed, 15 total

# Ejecutar tests con coverage
docker-compose exec backend npm run test:coverage

# Output esperado:
# =============================== Coverage summary ===============================
# Statements   : 85.5% ( 45/52 )
# Branches     : 78.2% ( 32/41 )
# Functions    : 90.0% ( 18/20 )
# Lines        : 86.3% ( 44/51 )
```

---

## Ejemplo 9: Linting y Formatting

### Escenario: Verificar y arreglar código

```bash
# Verificar linting
docker-compose exec backend npm run lint

# Output (si hay errores):
# src/api/app.ts
#   5:1  error  Unexpected var, use let or const instead  no-var

# Arreglar automáticamente
docker-compose exec backend npm run lint:fix

# Formatear código
docker-compose exec backend npm run format

# Verificar nuevamente
docker-compose exec backend npm run lint
# ✔ No linting errors
```

---

## Ejemplo 10: Monitoreo en Tiempo Real

### Escenario: Ver qué está pasando en los contenedores

```bash
# Terminal 1: Ver logs en tiempo real
docker-compose logs -f

# Terminal 2: Ver recursos
docker stats

# Output:
# CONTAINER ID   NAME              CPU %     MEM USAGE / LIMIT
# abc123...      music-backend     0.5%      150MiB / 2GiB
# def456...      music-frontend    0.1%      80MiB / 2GiB
# ghi789...      music-db          1.2%      200MiB / 2GiB

# Terminal 3: Hacer cambios en el código
# Edita app-music/src/api/app.ts

# Observa en Terminal 1 cómo se recompila automáticamente
# music-backend | [tsx] reloading src/api/app.ts
# music-backend | Server running on port 3000
```

---

## Ejemplo 11: Acceder a PostgreSQL

### Escenario: Ejecutar queries SQL directamente

```bash
# Conectar a PostgreSQL
docker-compose exec postgres psql -U music_user -d music_streaming_platform

# Dentro de psql:
# Ver tablas
\dt

# Output:
#              List of relations
# Schema |      Name      | Type  | Owner
# --------+----------------+-------+------------
# public | User           | table | music_user
# public | Content        | table | music_user
# public | Playlist       | table | music_user
# public | Comment        | table | music_user

# Ver estructura de tabla
\d "User"

# Ejecutar query
SELECT * FROM "User" LIMIT 5;

# Salir
\q
```

---

## Ejemplo 12: Colaboración en Equipo

### Escenario: Tu compañero hace cambios

```bash
# Tu compañero hace push
git push origin feature/new-feature

# Tú haces pull
git pull origin main

# Reconstruir (por si cambió Dockerfile)
docker-compose build

# Reiniciar servicios
docker-compose restart

# Ejecutar migraciones nuevas
docker-compose exec backend npx prisma migrate deploy

# Verificar que todo funciona
docker-compose ps
docker-compose logs -f
```

---

## Ejemplo 13: Limpiar Espacio

### Escenario: Liberar espacio en disco

```bash
# Ver uso de Docker
docker system df

# Output:
# TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
# Images          5         3         2.1GB     1.2GB
# Containers      8         3         500MB     450MB
# Volumes         3         3         1.5GB     0B
# Build cache     0         0         0B        0B

# Limpiar imágenes no usadas
docker image prune -a

# Limpiar volúmenes no usados
docker volume prune

# Limpiar todo (⚠️ CUIDADO)
docker system prune -a

# Ver espacio liberado
docker system df
```

---

## Ejemplo 14: Producción vs Desarrollo

### Cambios para producción

```bash
# docker-compose.yml (comentar volúmenes de desarrollo)
services:
  backend:
    # volumes:
    #   - ./app-music/src:/app/src  # ❌ Comentar en producción
    #   - backend_logs:/app/logs     # ❌ Comentar en producción
    environment:
      NODE_ENV: production  # ✅ Cambiar a production
      # Usar variables de entorno seguras
      DATABASE_URL: ${DATABASE_URL}  # Desde secrets
      JWT_SECRET: ${JWT_SECRET}      # Desde secrets

# Dockerfile (cambios opcionales)
# - Usar imagen base más pequeña
# - Remover devDependencies
# - Agregar security scanning
```

---

## Ejemplo 15: Troubleshooting Completo

### Escenario: Todo está roto

```bash
# Paso 1: Ver estado
docker-compose ps

# Paso 2: Ver logs de todos
docker-compose logs

# Paso 3: Reiniciar todo
docker-compose restart

# Paso 4: Si sigue fallando, reconstruir
docker-compose build --no-cache

# Paso 5: Si sigue fallando, limpiar todo
docker-compose down -v

# Paso 6: Empezar de cero
docker-compose build
docker-compose up -d
docker-compose exec backend npx prisma migrate dev

# Paso 7: Verificar
docker-compose ps
docker-compose logs
```

---

## Resumen de Comandos Más Usados

```bash
# Iniciar
docker-compose up -d

# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Ejecutar comando
docker-compose exec backend npm run lint

# Detener
docker-compose down

# Limpiar
docker-compose down -v
```

¡Ahora tienes ejemplos prácticos para casi cualquier situación!
