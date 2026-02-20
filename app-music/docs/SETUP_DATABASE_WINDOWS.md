# 🪟 PostgreSQL en Windows - Guía Paso a Paso

Solución rápida para configurar PostgreSQL en Windows.

---

## ⚡ Opción 1: Docker (Más Fácil)

Si tienes Docker Desktop instalado:

```bash
docker run --name music-db ^
  -e POSTGRES_USER=user ^
  -e POSTGRES_PASSWORD=password ^
  -e POSTGRES_DB=music_streaming_platform ^
  -p 5432:5432 ^
  -d postgres:15
```

**¡Listo!** PostgreSQL está corriendo.

Salta a la sección "Aplicar Migraciones".

---

## 📥 Opción 2: Instalar PostgreSQL Localmente

### Paso 1: Descargar PostgreSQL

1. Ve a https://www.postgresql.org/download/windows/
2. Haz clic en **"Download the installer"**
3. Descarga la versión **15** o superior

### Paso 2: Instalar

1. Ejecuta el instalador descargado
2. Haz clic en **"Next"**
3. Selecciona la carpeta de instalación (por defecto está bien)
4. Haz clic en **"Next"**
5. En "Stack Builder", desmarca todo
6. Haz clic en **"Next"**
7. **IMPORTANTE:** Anota la contraseña que ingreses para el usuario `postgres`
   - Recomendado: `password`
8. Puerto: **5432** (por defecto)
9. Locale: **[Default locale]**
10. Haz clic en **"Next"**
11. Haz clic en **"Install"**
12. Espera a que termine
13. Haz clic en **"Finish"**

### Paso 3: Verificar Instalación

Abre PowerShell y ejecuta:

```powershell
psql --version
```

Deberías ver algo como:

```
psql (PostgreSQL) 15.x
```

---

## 🔧 Configurar Base de Datos

### Paso 1: Abrir pgAdmin (Interfaz Gráfica)

1. Abre el menú Inicio
2. Busca **"pgAdmin 4"**
3. Haz clic para abrir
4. Se abrirá en el navegador

### Paso 2: Conectar a PostgreSQL

1. En pgAdmin, expande **"Servers"**
2. Haz clic derecho en **"PostgreSQL 15"**
3. Haz clic en **"Connect Server"**
4. Ingresa la contraseña que anotaste (ej: `password`)
5. Haz clic en **"OK"**

### Paso 3: Crear Usuario

1. Expande **"PostgreSQL 15"**
2. Haz clic derecho en **"Login/Group Roles"**
3. Haz clic en **"Create"** → **"Login/Group Role"**
4. En la pestaña **"General"**:
   - Name: `user`
5. En la pestaña **"Definition"**:
   - Password: `password`
   - Confirm password: `password`
6. En la pestaña **"Privileges"**:
   - Marca: **"Can login"**
   - Marca: **"Can create databases"**
7. Haz clic en **"Save"**

### Paso 4: Crear Base de Datos

1. Haz clic derecho en **"Databases"**
2. Haz clic en **"Create"** → **"Database"**
3. En la pestaña **"General"**:
   - Database name: `music_streaming_platform`
   - Owner: `user`
4. Haz clic en **"Save"**

**¡Listo!** Base de datos creada.

---

## 📝 Configurar .env

### Paso 1: Copiar archivo

Abre PowerShell en la carpeta `app-music`:

```powershell
cd app-music
Copy-Item .env.example .env
```

### Paso 2: Editar .env

Abre `app-music\.env` con tu editor favorito (VS Code, Notepad, etc.)

Verifica que tenga:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/music_streaming_platform
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

Guarda el archivo.

---

## 🔄 Aplicar Migraciones

En PowerShell, en la carpeta `app-music`:

```powershell
# Instala dependencias
npm install

# Aplica migraciones
npx prisma migrate dev

# Genera cliente Prisma
npx prisma generate
```

Deberías ver:

```
✅ Your database has been successfully migrated
```

---

## ✅ Verificar Todo

### Paso 1: Verifica que PostgreSQL está corriendo

Abre PowerShell:

```powershell
netstat -ano | findstr :5432
```

Deberías ver algo como:

```
TCP    127.0.0.1:5432    0.0.0.0:0    LISTENING    1234
```

### Paso 2: Verifica la conexión

```powershell
psql -U user -d music_streaming_platform -h localhost
```

Si ves el prompt `music_streaming_platform=>`, ¡está funcionando!

Escribe `\q` para salir.

### Paso 3: Inicia el servidor

```powershell
cd app-music
npm run dev
```

Deberías ver:

```
✅ Server running on http://localhost:3000
✅ Database connected
```

---

## 🚀 Ahora Ejecuta la Simulación

En una nueva terminal PowerShell:

```powershell
cd app-music
node scripts/test-live-stream-flow.js
```

¡Debería funcionar sin errores!

---

## 🐛 Troubleshooting

### ❌ "Can't reach database server"

**Problema:** PostgreSQL no está corriendo

**Solución:**

1. Abre **Services** (presiona `Win+R`, escribe `services.msc`)
2. Busca **"postgresql-x64-15"** (o similar)
3. Haz clic derecho → **"Start"**

### ❌ "FATAL: password authentication failed"

**Problema:** Contraseña incorrecta

**Solución:**

1. Abre pgAdmin
2. Haz clic derecho en el usuario `user`
3. Haz clic en **"Properties"**
4. Pestaña **"Definition"**
5. Cambia la contraseña a `password`
6. Haz clic en **"Save"**

### ❌ "database does not exist"

**Problema:** Base de datos no creada

**Solución:**

1. Abre pgAdmin
2. Haz clic derecho en **"Databases"**
3. Haz clic en **"Create"** → **"Database"**
4. Name: `music_streaming_platform`
5. Owner: `user`
6. Haz clic en **"Save"**

### ❌ "psql: command not found"

**Problema:** PostgreSQL no está en el PATH

**Solución:**

1. Abre **Environment Variables** (presiona `Win+R`, escribe `sysdm.cpl`)
2. Haz clic en **"Environment Variables"**
3. En **"System variables"**, busca **"Path"**
4. Haz clic en **"Edit"**
5. Haz clic en **"New"**
6. Agrega: `C:\Program Files\PostgreSQL\15\bin`
7. Haz clic en **"OK"**
8. Reinicia PowerShell

---

## 📊 Verificar Base de Datos

### Ver todas las bases de datos

```powershell
psql -U user -l
```

### Ver todas las tablas

```powershell
psql -U user -d music_streaming_platform
\dt
```

### Ver datos en una tabla

```powershell
SELECT * FROM users;
```

Escribe `\q` para salir.

---

## 🔐 Credenciales

```
Usuario: user
Contraseña: password
Host: localhost
Puerto: 5432
Base de datos: music_streaming_platform
```

---

## 📋 Checklist Rápido

- [ ] PostgreSQL instalado
- [ ] Usuario `user` creado
- [ ] Base de datos `music_streaming_platform` creada
- [ ] `.env` configurado
- [ ] Migraciones aplicadas (`npx prisma migrate dev`)
- [ ] Servidor corriendo (`npm run dev`)
- [ ] Script ejecutado (`node scripts/test-live-stream-flow.js`)

---

## 🎯 Próximos Pasos

Una vez que todo esté configurado:

1. **Abre 3 terminales PowerShell**

Terminal 1 - Backend:

```powershell
cd app-music
npm run dev
```

Terminal 2 - Frontend:

```powershell
cd client-web
npm run dev
```

Terminal 3 - Script:

```powershell
cd app-music
node scripts/test-live-stream-flow.js
```

**¡Listo!** La simulación está completa.

---

**¡PostgreSQL está configurado en Windows!** 🗄️
