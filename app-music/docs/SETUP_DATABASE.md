# 🗄️ Configurar PostgreSQL - Guía Rápida

El error `Can't reach database server at localhost:5432` significa que PostgreSQL no está corriendo.

---

## 🚀 Solución Rápida

### Opción 1: Usar Docker (Recomendado)

Si tienes Docker instalado, es la forma más fácil:

```bash
# Inicia PostgreSQL en Docker
docker run --name music-db \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=music_streaming_platform \
  -p 5432:5432 \
  -d postgres:15
```

**Resultado esperado:**

```
✅ PostgreSQL corriendo en localhost:5432
✅ Usuario: user
✅ Contraseña: password
✅ Base de datos: music_streaming_platform
```

---

### Opción 2: Instalar PostgreSQL Localmente

#### Windows

1. **Descarga PostgreSQL:**
   - Ve a https://www.postgresql.org/download/windows/
   - Descarga la versión 15 o superior

2. **Instala:**
   - Ejecuta el instalador
   - Anota la contraseña del usuario `postgres`
   - Puerto: 5432 (por defecto)

3. **Verifica la instalación:**
   ```bash
   psql --version
   ```

#### macOS

```bash
# Usando Homebrew
brew install postgresql@15

# Inicia PostgreSQL
brew services start postgresql@15

# Verifica
psql --version
```

#### Linux (Ubuntu/Debian)

```bash
# Instala PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Inicia el servicio
sudo systemctl start postgresql

# Verifica
psql --version
```

---

## 🔧 Configurar la Base de Datos

### Paso 1: Crear Usuario y Base de Datos

```bash
# Conecta a PostgreSQL
psql -U postgres

# En la consola de PostgreSQL, ejecuta:
CREATE USER user WITH PASSWORD 'password';
CREATE DATABASE music_streaming_platform OWNER user;
GRANT ALL PRIVILEGES ON DATABASE music_streaming_platform TO user;
\q
```

### Paso 2: Verificar Conexión

```bash
# Conecta con el nuevo usuario
psql -U user -d music_streaming_platform -h localhost
```

Si ves el prompt `music_streaming_platform=>`, ¡está funcionando!

---

## 📝 Configurar .env

### Paso 1: Copiar .env.example

```bash
cd app-music
cp .env.example .env
```

### Paso 2: Editar .env

Abre `app-music/.env` y verifica:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/music_streaming_platform

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Stripe (opcional para desarrollo)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

---

## 🔄 Aplicar Migraciones

Una vez que PostgreSQL está corriendo:

```bash
cd app-music

# Instala dependencias
npm install

# Aplica migraciones
npx prisma migrate dev

# Genera cliente Prisma
npx prisma generate
```

**Resultado esperado:**

```
✅ Migraciones aplicadas
✅ Base de datos creada
✅ Tablas creadas
```

---

## ✅ Verificar Todo

### 1. Verifica que PostgreSQL está corriendo

```bash
# Windows
netstat -ano | findstr :5432

# macOS/Linux
lsof -i :5432
```

Deberías ver algo como:

```
postgres ... 5432
```

### 2. Verifica la conexión

```bash
psql -U user -d music_streaming_platform -h localhost
```

### 3. Verifica las tablas

```bash
# En la consola de PostgreSQL
\dt

# Deberías ver:
#  public | users
#  public | live_streams
#  public | access_codes
#  etc.
```

### 4. Inicia el servidor

```bash
cd app-music
npm run dev
```

Deberías ver:

```
✅ Server running on http://localhost:3000
✅ Database connected
```

---

## 🐛 Troubleshooting

### ❌ "Connection refused"

**Problema:** PostgreSQL no está corriendo

**Solución:**

```bash
# Windows
# Abre Services (services.msc) y busca "PostgreSQL"
# Haz clic derecho → Start

# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql
```

### ❌ "FATAL: password authentication failed"

**Problema:** Contraseña incorrecta

**Solución:**

1. Verifica la contraseña en `.env`
2. Verifica que el usuario existe:
   ```bash
   psql -U postgres
   \du
   ```

### ❌ "database does not exist"

**Problema:** Base de datos no creada

**Solución:**

```bash
psql -U postgres
CREATE DATABASE music_streaming_platform;
```

### ❌ "Migraciones no aplicadas"

**Problema:** Las tablas no existen

**Solución:**

```bash
cd app-music
npx prisma migrate dev
```

---

## 🐳 Usar Docker Compose (Alternativa)

Si tienes `docker-compose.yml`, puedes usar:

```bash
# Inicia PostgreSQL con Docker Compose
docker-compose up -d postgres

# Verifica que está corriendo
docker-compose ps
```

---

## 📊 Verificar Base de Datos

### Ver todas las bases de datos

```bash
psql -U postgres -l
```

### Ver todas las tablas

```bash
psql -U user -d music_streaming_platform
\dt
```

### Ver estructura de una tabla

```bash
\d users
```

### Ver datos en una tabla

```bash
SELECT * FROM users;
```

---

## 🔐 Credenciales por Defecto

```
Usuario: user
Contraseña: password
Host: localhost
Puerto: 5432
Base de datos: music_streaming_platform
```

---

## 🚀 Próximos Pasos

Una vez que PostgreSQL está corriendo:

1. **Aplica migraciones:**

   ```bash
   npx prisma migrate dev
   ```

2. **Inicia el servidor:**

   ```bash
   npm run dev
   ```

3. **Ejecuta el script de simulación:**
   ```bash
   node scripts/test-live-stream-flow.js
   ```

---

## 📝 Resumen Rápido

### Windows

1. Descarga PostgreSQL desde postgresql.org
2. Instala con contraseña `password`
3. Copia `.env.example` a `.env`
4. Ejecuta `npx prisma migrate dev`
5. Ejecuta `npm run dev`

### macOS

```bash
brew install postgresql@15
brew services start postgresql@15
cp .env.example .env
npx prisma migrate dev
npm run dev
```

### Linux

```bash
sudo apt-get install postgresql
sudo systemctl start postgresql
cp .env.example .env
npx prisma migrate dev
npm run dev
```

### Docker

```bash
docker run --name music-db -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=music_streaming_platform -p 5432:5432 -d postgres:15
cp .env.example .env
npx prisma migrate dev
npm run dev
```

---

**¡Listo! PostgreSQL está configurado.** 🗄️
