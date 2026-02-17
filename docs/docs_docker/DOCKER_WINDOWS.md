# 🪟 Docker en Windows - Guía Específica

## Instalación en Windows

### Requisitos del Sistema

- Windows 10 Pro, Enterprise, o Education (versión 2004 o superior)
- O Windows 11 (cualquier versión)
- Mínimo 4GB RAM (recomendado 8GB)
- Virtualization habilitada en BIOS

### Pasos de Instalación

1. **Descargar Docker Desktop**
   - Ve a: https://www.docker.com/products/docker-desktop
   - Descarga "Docker Desktop for Windows"

2. **Instalar**
   - Ejecuta el instalador
   - Sigue los pasos
   - Reinicia tu máquina

3. **Verificar Instalación**
   ```powershell
   docker --version
   docker-compose --version
   ```

### Habilitar WSL2 (si es necesario)

Si ves error "WSL 2 installation is incomplete":

```powershell
# Ejecutar como Administrador
wsl --install
wsl --set-default-version 2
```

---

## Usar Docker en Windows

### PowerShell vs CMD

Docker funciona mejor con **PowerShell**. Recomendamos usarlo.

```powershell
# Abrir PowerShell
# Presiona: Win + X, luego A
```

### Comandos en PowerShell

Los comandos son iguales a Linux/Mac:

```powershell
# Iniciar
docker-compose up -d

# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

### Diferencias Importantes

#### 1. Rutas de Archivos

**Linux/Mac:**

```bash
./app-music/src
```

**Windows (PowerShell):**

```powershell
.\app-music\src
```

#### 2. Copiar Archivos

**Linux/Mac:**

```bash
docker cp music-backend:/app/logs/error.log ./
```

**Windows (PowerShell):**

```powershell
docker cp music-backend:/app/logs/error.log .
```

#### 3. Variables de Entorno

**Linux/Mac:**

```bash
export NODE_ENV=development
docker-compose up -d
```

**Windows (PowerShell):**

```powershell
$env:NODE_ENV = "development"
docker-compose up -d
```

---

## Script Helper para Windows

Hemos creado `docker-helper.bat` para facilitar comandos comunes.

### Usar el Script

```powershell
# Ejecutar script
.\docker-helper.bat

# O desde CMD
docker-helper.bat
```

### Menú Interactivo

```
===== Docker Helper =====
1. Iniciar servicios (up -d)
2. Detener servicios (down)
3. Ver estado (ps)
4. Ver logs (logs -f)
5. Reconstruir imágenes (build)
6. Ejecutar migraciones de BD
7. Abrir Prisma Studio
8. Acceder a shell del backend
9. Acceder a shell del frontend
10. Acceder a PostgreSQL
11. Limpiar todo (down -v)
12. Salir

Selecciona una opción:
```

---

## Problemas Comunes en Windows

### Problema 1: "Docker daemon is not running"

**Solución:**

1. Abre Docker Desktop (busca en Inicio)
2. Espera a que inicie (verás ícono en bandeja)
3. Intenta nuevamente

### Problema 2: "Port 3000 already in use"

**Solución 1: Cambiar puerto**

```powershell
# Edita docker-compose.yml
# Busca: ports: - "3000:3000"
# Cambia a: ports: - "3001:3000"

docker-compose restart
```

**Solución 2: Encontrar qué usa el puerto**

```powershell
# Ejecutar como Administrador
netstat -ano | findstr :3000

# Resultado: TCP    127.0.0.1:3000    0.0.0.0:0    LISTENING    12345
# El número 12345 es el PID

# Terminar proceso
taskkill /PID 12345 /F
```

### Problema 3: "Cannot connect to Docker daemon"

**Solución:**

1. Abre Docker Desktop
2. Espera a que inicie completamente
3. Verifica en Settings → Resources que tiene suficiente RAM

### Problema 4: "WSL 2 installation is incomplete"

**Solución:**

```powershell
# Ejecutar como Administrador
wsl --install
wsl --set-default-version 2

# Reinicia tu máquina
```

### Problema 5: "Disk space is running out"

**Solución:**

```powershell
# Ver uso de Docker
docker system df

# Limpiar imágenes no usadas
docker image prune -a

# Limpiar volúmenes no usados
docker volume prune

# Limpiar todo
docker system prune -a
```

### Problema 6: "Cannot find module 'express'"

**Solución:**

```powershell
# Reinstalar dependencias
docker-compose exec backend npm install

# O reconstruir
docker-compose build --no-cache backend
docker-compose restart backend
```

---

## Optimizaciones para Windows

### 1. Aumentar Recursos

Docker Desktop usa recursos limitados por defecto.

**Aumentar RAM:**

1. Abre Docker Desktop
2. Settings → Resources
3. Aumenta Memory a 4GB o más
4. Aplica y reinicia

**Aumentar CPU:**

1. Abre Docker Desktop
2. Settings → Resources
3. Aumenta CPUs a 4 o más
4. Aplica y reinicia

### 2. Excluir Carpetas de Antivirus

Si Docker es lento, excluye carpetas del antivirus:

1. Abre Windows Defender
2. Virus & threat protection
3. Manage settings
4. Add exclusions
5. Agrega: `C:\Users\[tu-usuario]\AppData\Local\Docker`

### 3. Usar WSL2 Backend

Docker Desktop en Windows usa WSL2 por defecto (mejor rendimiento).

**Verificar:**

1. Docker Desktop → Settings
2. General
3. Verifica "Use the WSL 2 based engine"

---

## Acceso a Archivos en Windows

### Copiar Archivos desde Contenedor

```powershell
# Copiar archivo
docker cp music-backend:/app/logs/error.log .

# Copiar carpeta
docker cp music-backend:/app/uploads . -r
```

### Copiar Archivos a Contenedor

```powershell
# Copiar archivo
docker cp archivo.mp3 music-backend:/app/uploads/

# Copiar carpeta
docker cp .\uploads music-backend:/app/ -r
```

### Acceder a Volúmenes

Los volúmenes de Docker en Windows se almacenan en:

```
C:\Users\[tu-usuario]\AppData\Local\Docker\volumes\
```

Pero es mejor usar comandos Docker:

```powershell
# Listar volúmenes
docker volume ls

# Ver detalles
docker volume inspect music-postgres_data

# Acceder a archivos
docker run --rm -v music-backend_uploads:/data alpine ls -la /data
```

---

## Desarrollo en Windows

### Hot Reload Backend

1. Edita `app-music\src\api\app.ts`
2. Guarda el archivo
3. Ver logs: `docker-compose logs -f backend`
4. Debería mostrar recompilación automática

### Hot Reload Frontend

1. Edita `client-web\src\App.tsx`
2. Guarda el archivo
3. Navegador se actualiza automáticamente

### Agregar Dependencia

```powershell
# Edita app-music\package.json
# Luego:
docker-compose exec backend npm install

# O para frontend:
docker-compose exec frontend npm install
```

---

## Usar Docker en VS Code

### Extensión Docker

1. Abre VS Code
2. Extensions (Ctrl+Shift+X)
3. Busca "Docker"
4. Instala "Docker" de Microsoft

### Comandos en VS Code

Con la extensión instalada:

1. Abre Command Palette (Ctrl+Shift+P)
2. Escribe "Docker"
3. Verás opciones como:
   - Docker: Show Logs
   - Docker: Compose Up
   - Docker: Compose Down

### Terminal Integrada

Usa la terminal integrada de VS Code:

```powershell
# Ctrl+` para abrir terminal
docker-compose ps
docker-compose logs -f
```

---

## Debugging en Windows

### Ver Logs en Tiempo Real

```powershell
# Todos los logs
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Últimas 100 líneas
docker-compose logs --tail=100
```

### Acceder a Shell del Contenedor

```powershell
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh

# PostgreSQL
docker-compose exec postgres psql -U music_user -d music_streaming_platform
```

### Ver Recursos en Tiempo Real

```powershell
docker stats

# Presiona Ctrl+C para salir
```

---

## Producción en Windows

Para desplegar en producción desde Windows:

1. Usa un servidor Linux (AWS, Azure, DigitalOcean, etc.)
2. Sube tu código a GitHub
3. En el servidor Linux:
   ```bash
   git clone tu-repo
   cd tu-proyecto
   docker-compose up -d
   ```

Docker es multiplataforma, así que funciona igual en Linux.

---

## Comandos Útiles para Windows

```powershell
# Información del sistema
docker info

# Versión
docker --version
docker-compose --version

# Listar imágenes
docker images

# Listar contenedores
docker ps -a

# Listar volúmenes
docker volume ls

# Listar redes
docker network ls

# Limpiar todo
docker system prune -a

# Ver eventos
docker events
```

---

## Atajos de Teclado en PowerShell

```
Ctrl+C          Cancelar comando
Ctrl+L          Limpiar pantalla
Ctrl+A          Seleccionar todo
Ctrl+V          Pegar
Ctrl+Shift+V    Pegar (alternativo)
Tab             Autocompletar
```

---

## Recursos Adicionales

- [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
- [WSL 2 Installation](https://docs.microsoft.com/en-us/windows/wsl/install)
- [Docker on Windows Best Practices](https://docs.docker.com/desktop/windows/)

---

## Resumen

En Windows:

✅ Usa PowerShell (mejor que CMD)
✅ Instala Docker Desktop
✅ Usa `.\` en lugar de `./` para rutas
✅ Usa `docker-helper.bat` para menú interactivo
✅ Aumenta recursos en Docker Desktop si es lento
✅ Excluye carpetas del antivirus si es muy lento
✅ Usa WSL2 backend (por defecto)

¡Ahora estás listo para usar Docker en Windows!
