# 🏗️ Arquitectura Docker - Visualización

## Estructura General

```
┌─────────────────────────────────────────────────────────────┐
│                    Tu Máquina (Host)                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Docker Engine                           │  │
│  │                                                      │  │
│  │  ┌────────────────────────────────────────────────┐ │  │
│  │  │         music-network (Bridge)                │ │  │
│  │  │                                                │ │  │
│  │  │  ┌──────────────┐  ┌──────────────┐          │ │  │
│  │  │  │   Backend    │  │   Frontend   │          │ │  │
│  │  │  │ (Node.js)    │  │ (React/Vite) │          │ │  │
│  │  │  │ :3000        │  │ :80 (nginx)  │          │ │  │
│  │  │  └──────────────┘  └──────────────┘          │ │  │
│  │  │         ▲                  ▲                  │ │  │
│  │  │         │                  │                  │ │  │
│  │  │         └──────────────────┘                  │ │  │
│  │  │              (API calls)                      │ │  │
│  │  │                                                │ │  │
│  │  │  ┌──────────────────────────────────────────┐ │ │  │
│  │  │  │      PostgreSQL (Database)               │ │ │  │
│  │  │  │      :5432                               │ │ │  │
│  │  │  └──────────────────────────────────────────┘ │ │  │
│  │  │                                                │ │  │
│  │  └────────────────────────────────────────────────┘ │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Puertos Expuestos:                                        │
│  - 3000 → Backend                                         │
│  - 3001 → Frontend                                        │
│  - 5432 → PostgreSQL                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Flujo de Datos

```
Usuario en Navegador
        │
        ▼
┌──────────────────────┐
│  http://localhost:3001
│  (Frontend - Nginx)
└──────────────────────┘
        │
        ├─ Sirve HTML/CSS/JS
        │
        └─ Hace peticiones API
                │
                ▼
        ┌──────────────────────┐
        │ http://localhost:3000
        │ (Backend - Express)
        └──────────────────────┘
                │
                ├─ Procesa lógica
                │
                └─ Consulta BD
                        │
                        ▼
                ┌──────────────────────┐
                │ PostgreSQL:5432
                │ (Base de Datos)
                └──────────────────────┘
```

---

## Volúmenes: Persistencia de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    Tu Máquina (Host)                        │
│                                                             │
│  Carpetas del Proyecto:                                    │
│  ├── app-music/src/          ◄─────┐                       │
│  ├── client-web/src/         ◄─────┤ Volúmenes Montados   │
│  └── prisma/                 ◄─────┤ (Hot Reload)         │
│                                    │                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Docker Volumes                         │  │
│  │                                                      │  │
│  │  postgres_data/          ◄─ BD Persistente         │  │
│  │  backend_uploads/        ◄─ Archivos Subidos      │  │
│  │  backend_logs/           ◄─ Logs de Aplicación    │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Cuando eliminas un contenedor:
- Los volúmenes persisten ✅
- Los datos no se pierden ✅

Cuando eliminas un volumen:
- Los datos se pierden ❌
```

---

## Ciclo de Vida de un Contenedor

```
┌─────────────────────────────────────────────────────────────┐
│                  Ciclo de Vida                              │
│                                                             │
│  1. BUILD (docker-compose build)                           │
│     ├─ Lee Dockerfile                                      │
│     ├─ Descarga imagen base                                │
│     ├─ Ejecuta instrucciones                               │
│     └─ Crea imagen                                         │
│                                                             │
│  2. CREATE (docker-compose up)                             │
│     ├─ Crea contenedor desde imagen                        │
│     ├─ Monta volúmenes                                     │
│     ├─ Configura red                                       │
│     └─ Asigna puertos                                      │
│                                                             │
│  3. START                                                   │
│     ├─ Ejecuta CMD del Dockerfile                          │
│     ├─ Inicia aplicación                                   │
│     └─ Contenedor corriendo                                │
│                                                             │
│  4. RUNNING                                                 │
│     ├─ Aplicación activa                                   │
│     ├─ Acepta conexiones                                   │
│     └─ Genera logs                                         │
│                                                             │
│  5. STOP (docker-compose stop)                             │
│     ├─ Envía SIGTERM                                       │
│     ├─ Aplicación se detiene                               │
│     └─ Contenedor detenido (datos persisten)               │
│                                                             │
│  6. REMOVE (docker-compose down)                           │
│     ├─ Elimina contenedor                                  │
│     ├─ Volúmenes persisten                                 │
│     └─ Imagen sigue disponible                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Capas de Imagen (Multi-stage Build)

```
Backend Dockerfile:

┌─────────────────────────────────────────────────────────────┐
│ Stage 1: BUILDER (Temporal)                                │
│                                                             │
│ FROM node:18-alpine                                        │
│ WORKDIR /app                                               │
│ COPY package*.json ./                                      │
│ RUN npm ci                          ◄─ Instala todo       │
│ COPY . .                                                   │
│ RUN npm run build                   ◄─ Compila TypeScript │
│                                                             │
│ Resultado: Imagen grande (~500MB)                          │
│ Contiene: node_modules + devDependencies + código compilado
│                                                             │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Stage 2: RUNTIME (Final)                                   │
│                                                             │
│ FROM node:18-alpine                                        │
│ WORKDIR /app                                               │
│ COPY package*.json ./                                      │
│ RUN npm ci --only=production        ◄─ Solo dependencias  │
│ COPY --from=builder /app/dist ./dist ◄─ Copia compilado  │
│ CMD ["node", "dist/server.js"]                             │
│                                                             │
│ Resultado: Imagen pequeña (~150MB)                         │
│ Contiene: Solo lo necesario para ejecutar                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Ventaja: Imagen final 3x más pequeña
```

---

## Comunicación entre Servicios

```
┌─────────────────────────────────────────────────────────────┐
│              Docker Network: music-network                  │
│                                                             │
│  Dentro de la red, los servicios se comunican por nombre:  │
│                                                             │
│  Backend → PostgreSQL                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ const db = new PrismaClient({                        │  │
│  │   datasources: {                                     │  │
│  │     db: {                                            │  │
│  │       url: "postgresql://user:pass@postgres:5432/db"│  │
│  │       ▲                                              │  │
│  │       └─ Nombre del servicio en docker-compose.yml  │  │
│  │     }                                                │  │
│  │   }                                                  │  │
│  │ })                                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Frontend → Backend                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ const api = axios.create({                           │  │
│  │   baseURL: "http://backend:3000"                     │  │
│  │            ▲                                         │  │
│  │            └─ Nombre del servicio en docker-compose │  │
│  │ })                                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Nginx → Backend                                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ location /api/ {                                     │  │
│  │   proxy_pass http://backend:3000;                    │  │
│  │              ▲                                       │  │
│  │              └─ Nombre del servicio                  │  │
│  │ }                                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  DNS Automático:                                           │
│  - Docker resuelve "backend" → IP del contenedor backend   │
│  - Docker resuelve "postgres" → IP del contenedor postgres │
│  - No necesitas saber las IPs                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Desarrollo vs Producción

```
┌─────────────────────────────────────────────────────────────┐
│                    DESARROLLO                              │
│                                                             │
│  docker-compose.yml:                                       │
│  ├─ Volúmenes montados (hot reload)                        │
│  ├─ NODE_ENV=development                                   │
│  ├─ Logs en consola                                        │
│  ├─ BD local                                               │
│  └─ Puertos expuestos para debugging                       │
│                                                             │
│  Ventajas:                                                 │
│  ✅ Cambios se reflejan automáticamente                    │
│  ✅ Fácil debugging                                        │
│  ✅ Rápido de iterar                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    PRODUCCIÓN                              │
│                                                             │
│  docker-compose.yml (modificado):                          │
│  ├─ Sin volúmenes de desarrollo                            │
│  ├─ NODE_ENV=production                                    │
│  ├─ Logs a archivo                                         │
│  ├─ BD remota (RDS, etc.)                                  │
│  ├─ Reverse proxy (Nginx)                                  │
│  ├─ HTTPS/SSL                                              │
│  └─ Límites de recursos                                    │
│                                                             │
│  Ventajas:                                                 │
│  ✅ Seguro                                                 │
│  ✅ Escalable                                              │
│  ✅ Optimizado                                             │
│  ✅ Monitoreable                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Flujo de Desarrollo Típico

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  1. Mañana: Iniciar                                        │
│     docker-compose up -d                                   │
│                                                             │
│  2. Editar código                                          │
│     app-music/src/api/app.ts                               │
│                                                             │
│  3. Hot reload automático                                  │
│     tsx watch detecta cambios                              │
│     Recompila automáticamente                              │
│                                                             │
│  4. Verificar en navegador                                 │
│     http://localhost:3001                                  │
│                                                             │
│  5. Ver logs                                               │
│     docker-compose logs -f backend                         │
│                                                             │
│  6. Debugging si es necesario                              │
│     docker-compose exec backend sh                         │
│                                                             │
│  7. Commit cambios                                         │
│     git add .                                              │
│     git commit -m "Feature X"                              │
│                                                             │
│  8. Noche: Detener                                         │
│     docker-compose down                                    │
│     (datos persisten en volúmenes)                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Comparación: Con Docker vs Sin Docker

```
┌──────────────────────────────────────────────────────────────┐
│                    SIN DOCKER                               │
│                                                              │
│  Instalación:                                               │
│  ├─ Node.js 18+                                             │
│  ├─ PostgreSQL 16                                           │
│  ├─ npm packages                                            │
│  └─ Configurar todo manualmente                             │
│                                                              │
│  Problemas:                                                 │
│  ❌ "Funciona en mi máquina"                                │
│  ❌ Versiones diferentes entre devs                         │
│  ❌ Difícil de reproducir errores                           │
│  ❌ Lento de configurar                                     │
│  ❌ Conflictos de puertos                                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    CON DOCKER                               │
│                                                              │
│  Instalación:                                               │
│  ├─ Docker Desktop                                          │
│  ├─ docker-compose up -d                                    │
│  └─ ¡Listo!                                                 │
│                                                              │
│  Ventajas:                                                  │
│  ✅ Mismo entorno para todos                                │
│  ✅ Versiones consistentes                                  │
│  ✅ Fácil reproducir errores                                │
│  ✅ Rápido de configurar                                    │
│  ✅ Sin conflictos de puertos                               │
│  ✅ Fácil de escalar                                        │
│  ✅ Listo para producción                                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Resumen Visual

```
Tu Proyecto
│
├─ docker-compose.yml      ◄─ Orquesta todo
│
├─ app-music/
│  ├─ Dockerfile           ◄─ Cómo construir imagen backend
│  ├─ .dockerignore        ◄─ Qué no incluir
│  └─ src/                 ◄─ Código fuente
│
├─ client-web/
│  ├─ Dockerfile           ◄─ Cómo construir imagen frontend
│  ├─ nginx.conf           ◄─ Configuración de servidor web
│  ├─ .dockerignore        ◄─ Qué no incluir
│  └─ src/                 ◄─ Código fuente
│
└─ Documentación
   ├─ QUICK_START.md       ◄─ Empezar rápido
   ├─ DOCKER_GUIDE.md      ◄─ Guía completa
   ├─ DOCKER_WORKFLOW.md   ◄─ Cómo trabajar
   ├─ DOCKER_EXAMPLES.md   ◄─ Ejemplos prácticos
   └─ DOCKER_ARCHITECTURE.md ◄─ Este archivo
```

¡Ahora entiendes la arquitectura completa!
