# 🐳 Docker Setup - Documentación Completa

## 📚 Índice de Documentación

Este proyecto ahora tiene un setup Docker completo. Aquí está la documentación organizada por nivel:

### 🚀 Empezar Rápido (5 minutos)

1. **[QUICK_START.md](./QUICK_START.md)** - Comandos esenciales para empezar
   - Instalación inicial
   - Comandos diarios
   - Problemas comunes

### 📖 Aprender Docker (30 minutos)

2. **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** - Guía completa y educativa
   - Conceptos clave (Imagen, Contenedor, Volumen, Red)
   - Comandos esenciales explicados
   - Troubleshooting detallado
   - Mejores prácticas

### 🔄 Workflow de Desarrollo (20 minutos)

3. **[DOCKER_WORKFLOW.md](./DOCKER_WORKFLOW.md)** - Cómo trabajar día a día
   - Flujo típico de desarrollo
   - Escenarios comunes
   - Debugging y monitoreo
   - Optimizaciones

### 💡 Ejemplos Prácticos (15 minutos)

4. **[DOCKER_EXAMPLES.md](./DOCKER_EXAMPLES.md)** - 15 ejemplos reales
   - Primer inicio paso a paso
   - Agregar dependencias
   - Crear tablas en BD
   - Debugging de errores
   - Y más...

### 🏗️ Arquitectura Visual (10 minutos)

5. **[DOCKER_ARCHITECTURE.md](./DOCKER_ARCHITECTURE.md)** - Entender la estructura
   - Diagramas visuales
   - Flujo de datos
   - Ciclo de vida
   - Comparación con/sin Docker

### ✅ Verificación

6. **[DOCKER_CHECKLIST.md](./DOCKER_CHECKLIST.md)** - Checklist de setup
   - Verificar instalación
   - Primer inicio
   - Verificaciones de funcionalidad
   - Troubleshooting

---

## 🎯 Ruta de Aprendizaje Recomendada

### Día 1: Empezar

1. Instala Docker Desktop
2. Lee `QUICK_START.md`
3. Ejecuta `docker-compose up -d`
4. Accede a http://localhost:3001

### Día 2: Entender

1. Lee `DOCKER_GUIDE.md` (conceptos)
2. Experimenta con comandos
3. Explora logs y contenedores
4. Lee `DOCKER_ARCHITECTURE.md`

### Día 3: Practicar

1. Lee `DOCKER_EXAMPLES.md`
2. Sigue los 15 ejemplos
3. Haz cambios en código
4. Observa hot reload

### Día 4+: Dominar

1. Lee `DOCKER_WORKFLOW.md`
2. Trabaja normalmente
3. Usa Docker en tu flujo diario
4. Ayuda a otros con Docker

---

## 📁 Archivos Creados

### Configuración Docker

```
├── docker-compose.yml          # Orquestación de servicios
├── .env.docker                 # Variables de entorno
├── app-music/
│   ├── Dockerfile              # Imagen del backend
│   └── .dockerignore           # Archivos a excluir
├── client-web/
│   ├── Dockerfile              # Imagen del frontend
│   ├── nginx.conf              # Configuración de Nginx
│   └── .dockerignore           # Archivos a excluir
```

### Scripts Helper

```
├── docker-helper.sh            # Script para Linux/Mac
└── docker-helper.bat           # Script para Windows
```

### Documentación

```
├── DOCKER_README.md            # Este archivo
├── QUICK_START.md              # Guía rápida
├── DOCKER_GUIDE.md             # Guía completa
├── DOCKER_WORKFLOW.md          # Workflow de desarrollo
├── DOCKER_EXAMPLES.md          # 15 ejemplos prácticos
├── DOCKER_ARCHITECTURE.md      # Arquitectura visual
└── DOCKER_CHECKLIST.md         # Checklist de verificación
```

---

## 🚀 Primeros Pasos

### 1. Verificar Instalación

```bash
docker --version
docker-compose --version
```

### 2. Construir Imágenes

```bash
docker-compose build
```

### 3. Iniciar Servicios

```bash
docker-compose up -d
```

### 4. Verificar Estado

```bash
docker-compose ps
```

### 5. Acceder a Aplicación

- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- Prisma Studio: `docker-compose exec backend npx prisma studio`

---

## 📊 Servicios Disponibles

| Servicio      | Puerto | URL                   | Descripción            |
| ------------- | ------ | --------------------- | ---------------------- |
| Frontend      | 3001   | http://localhost:3001 | React/Vite con Nginx   |
| Backend       | 3000   | http://localhost:3000 | Node.js/Express API    |
| PostgreSQL    | 5432   | localhost:5432        | Base de datos          |
| Prisma Studio | 5555   | http://localhost:5555 | Interfaz gráfica de BD |

---

## 🔧 Comandos Esenciales

```bash
# Iniciar todo
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

# Detener
docker-compose stop

# Eliminar
docker-compose down

# Limpiar todo
docker-compose down -v
```

---

## 💡 Características Principales

### ✅ Multi-stage Build

- Imagen final 3x más pequeña
- Solo dependencias de producción en runtime

### ✅ Hot Reload

- Cambios en código se reflejan automáticamente
- Backend: tsx watch
- Frontend: Vite HMR

### ✅ Volúmenes Persistentes

- Datos de BD persisten
- Archivos subidos persisten
- Logs persisten

### ✅ Health Checks

- Servicios verifican que están listos
- Reintentos automáticos

### ✅ Red Compartida

- Servicios se comunican por nombre
- DNS automático

### ✅ Desarrollo y Producción

- Mismo setup para ambos
- Fácil de adaptar

---

## 🎓 Conceptos Clave

### Imagen

Plantilla para crear contenedores. Se construye una sola vez.

```bash
docker-compose build
```

### Contenedor

Instancia en ejecución de una imagen. Puede haber múltiples.

```bash
docker-compose up -d
```

### Volumen

Almacenamiento persistente. Los datos persisten incluso si eliminas contenedores.

```bash
docker volume ls
```

### Red

Permite comunicación entre contenedores. Los servicios se resuelven por nombre.

```bash
docker network ls
```

### Dockerfile

Instrucciones para construir una imagen. Cada línea crea una capa.

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
```

### docker-compose.yml

Define múltiples servicios y cómo se relacionan.

```yaml
services:
  backend:
    build: ./app-music
    ports:
      - "3000:3000"
```

---

## 🐛 Troubleshooting Rápido

### "Port already in use"

```bash
# Cambiar puerto en docker-compose.yml
# De: "3000:3000"
# A:  "3001:3000"
```

### "Cannot connect to database"

```bash
docker-compose logs postgres
docker-compose restart postgres
```

### "Changes not showing up"

```bash
docker-compose build --no-cache
docker-compose restart
```

### "Everything is broken"

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
docker-compose exec backend npx prisma migrate dev
```

---

## 📚 Recursos Adicionales

### Documentación Oficial

- [Docker Docs](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)

### Tutoriales

- [Docker for Beginners](https://docker-curriculum.com/)
- [Play with Docker](https://www.docker.com/play-with-docker)

### Herramientas

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Docker Hub](https://hub.docker.com/)

---

## 🎯 Próximos Pasos

1. **Hoy**: Lee `QUICK_START.md` y ejecuta `docker-compose up -d`
2. **Mañana**: Lee `DOCKER_GUIDE.md` y experimenta con comandos
3. **Pasado**: Lee `DOCKER_EXAMPLES.md` y sigue los ejemplos
4. **Semana**: Lee `DOCKER_WORKFLOW.md` y trabaja normalmente

---

## 💬 Preguntas Frecuentes

### ¿Necesito instalar Node.js localmente?

No, todo corre en Docker. Pero puedes tenerlo para usar herramientas locales.

### ¿Puedo usar Docker en Windows?

Sí, con Docker Desktop. Incluye WSL2 automáticamente.

### ¿Qué pasa si elimino un contenedor?

Los volúmenes persisten. Los datos no se pierden.

### ¿Qué pasa si elimino un volumen?

Los datos se pierden. Usa `docker volume rm` con cuidado.

### ¿Cómo escalo a producción?

Lee `DOCKER_GUIDE.md` sección "Producción vs Desarrollo".

### ¿Puedo usar Docker Compose en producción?

Sí, pero es mejor usar Kubernetes o Docker Swarm para aplicaciones grandes.

---

## 📝 Notas Importantes

- **Desarrollo**: Volúmenes montados para hot reload
- **Producción**: Sin volúmenes de desarrollo, variables de entorno seguras
- **BD**: Usa volúmenes para persistencia
- **Logs**: Monta volumen para persistencia
- **Uploads**: Monta volumen para persistencia

---

## 🎉 ¡Estás Listo!

Tu proyecto ahora tiene un setup Docker profesional y educativo.

**Próximo paso:** Abre `QUICK_START.md` y comienza.

---

## 📞 Soporte

Si tienes problemas:

1. Consulta `DOCKER_CHECKLIST.md`
2. Lee `DOCKER_GUIDE.md` sección Troubleshooting
3. Revisa `DOCKER_EXAMPLES.md` para casos similares
4. Consulta logs: `docker-compose logs`

---

**Última actualización:** Febrero 2026
**Versión:** 1.0.0
