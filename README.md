# Music Streaming Platform

Plataforma de streaming de música con transmisiones en vivo para DJs y creators.

## 🎯 Características

### Para Creators

- 📤 Subir contenido de audio (MP3, WAV, FLAC)
- 🔴 Transmisiones en vivo con OBS Studio
- 📊 Dashboard con estadísticas
- 👥 Gestión de subscribers
- 💰 Sistema de códigos de acceso

### Para Subscribers

- 🔍 Descubrir creators
- 🎵 Reproducir contenido con HLS
- 🔴 Ver transmisiones en vivo
- 🎫 Canjear códigos de acceso
- 📱 Interfaz responsive

## 🏗️ Arquitectura

```
music-streaming-platform/
├── app-music/          # Backend (Node.js + Express + Prisma)
├── client-web/         # Frontend (React + TypeScript + Vite)
├── docker-compose.yml  # PostgreSQL con Docker
└── README.md
```

## 🚀 Quick Start

### Requisitos

- Node.js 18+ y npm
- Docker Desktop (para PostgreSQL)
- Git

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd music-streaming-platform
```

### 2. Instalar dependencias

```bash
# Backend
cd app-music
npm install

# Frontend
cd ../client-web
npm install
```

### 3. Configurar PostgreSQL con Docker

**Opción A: Script automático (Windows)**

```bash
# Desde la raíz del proyecto
setup-db.bat
```

**Opción B: Manual**

```bash
# Iniciar PostgreSQL
docker-compose up -d

# Esperar 5 segundos

# Ejecutar migraciones
cd app-music
npm run prisma:migrate
```

Ver [DOCKER_SETUP.md](./DOCKER_SETUP.md) para más detalles.

### 4. Iniciar la aplicación

**Terminal 1 - Backend:**

```bash
cd app-music
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd client-web
npm run dev
```

### 5. Abrir en el navegador

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Prisma Studio: http://localhost:5555 (ejecutar `npm run prisma:studio`)

## 🔧 Configuración

### Variables de Entorno

**Backend (`app-music/.env`):**

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/music_streaming_platform
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

**Frontend (`client-web/.env`):**

```env
VITE_API_URL=http://localhost:3000
VITE_DEV_MODE=false
```

## 🧪 Modo Desarrollo (Frontend sin Backend)

Para probar la UI sin necesidad de backend:

```env
# client-web/.env
VITE_DEV_MODE=true
VITE_DEV_USER_TYPE=creator  # o subscriber
```

Ver [client-web/DEV_MODE.md](./client-web/DEV_MODE.md) para más detalles.

## 📚 Documentación

- [Docker Setup](./DOCKER_SETUP.md) - Configuración de PostgreSQL
- [Backend README](./app-music/README.md) - Documentación del backend
- [Frontend README](./client-web/README.md) - Documentación del frontend
- [Live Streaming](./client-web/LIVE_STREAMING.md) - Módulo de transmisiones en vivo
- [Dev Mode](./client-web/DEV_MODE.md) - Modo desarrollo sin backend
- [Mock Data](./client-web/MOCK_DATA_SUMMARY.md) - Datos de prueba

## 🗄️ Base de Datos

### Modelos Principales

- **User** - Usuarios (creators y subscribers)
- **CreatorProfile** - Perfil de creator
- **SubscriberProfile** - Perfil de subscriber
- **Content** - Contenido de audio
- **Playlist** - Listas de reproducción
- **AccessCode** - Códigos de acceso
- **AccessGrant** - Permisos de acceso
- **StreamSession** - Sesiones de streaming
- **LiveStream** - Transmisiones en vivo
- **StreamViewer** - Viewers de transmisiones

### Gestión de Base de Datos

```bash
# Ver datos en Prisma Studio
cd app-music
npm run prisma:studio

# Crear nueva migración
npm run prisma:migrate

# Generar cliente de Prisma
npm run prisma:generate

# Resetear base de datos
docker-compose down -v
docker-compose up -d
npm run prisma:migrate
```

## 🔴 Live Streaming

### Para Creators

1. Ir a `/creator/live`
2. Crear una nueva transmisión
3. Copiar RTMP URL y Stream Key
4. Configurar OBS Studio:
   - Settings → Stream
   - Service: Custom
   - Server: [RTMP URL]
   - Stream Key: [Stream Key]
5. Click "Start Streaming" en OBS

### Para Subscribers

1. Ir a `/live`
2. Ver transmisiones activas
3. Click en una transmisión para verla
4. Requiere código de acceso válido

Ver [app-music/src/modules/live/README.md](./app-music/src/modules/live/README.md) para más detalles.

## 🧪 Testing

```bash
# Backend tests
cd app-music
npm test

# Frontend tests (cuando estén implementados)
cd client-web
npm test
```

## 📦 Build para Producción

### Backend

```bash
cd app-music
npm run build
npm start
```

### Frontend

```bash
cd client-web
npm run build
npm run preview
```

## 🛠️ Scripts Útiles

### Backend

```bash
npm run dev          # Desarrollo con hot-reload
npm run build        # Compilar TypeScript
npm start            # Producción
npm test             # Tests
npm run lint         # Linter
npm run prisma:studio # Abrir Prisma Studio
```

### Frontend

```bash
npm run dev          # Desarrollo con hot-reload
npm run build        # Build para producción
npm run preview      # Preview del build
npm run lint         # Linter
```

## 🐛 Troubleshooting

### PostgreSQL no inicia

```bash
# Ver logs
docker-compose logs postgres

# Reiniciar
docker-compose restart

# Recrear desde cero
docker-compose down -v
docker-compose up -d
```

### Puerto 5432 ocupado

Cambiar puerto en `docker-compose.yml`:

```yaml
ports:
  - "5433:5432"
```

Y actualizar `DATABASE_URL` en `.env`.

### Error de migraciones

```bash
# Resetear y volver a migrar
cd app-music
npx prisma migrate reset
npm run prisma:migrate
```

### Frontend no conecta con backend

1. Verificar que el backend esté corriendo en puerto 3000
2. Verificar `VITE_API_URL` en `client-web/.env`
3. Verificar CORS en `app-music/.env`

## 📝 Próximas Características

- [ ] Chat en vivo para transmisiones
- [ ] Notificaciones push cuando un creator inicia stream
- [ ] Sistema de pagos integrado
- [ ] Grabaciones de transmisiones
- [ ] DVR (rewind en vivo)
- [ ] Aplicación móvil (React Native)
- [ ] Tests end-to-end
- [ ] CI/CD pipeline

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abrir un Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- Tu Nombre - Desarrollo inicial

## 🙏 Agradecimientos

- Prisma por el excelente ORM
- React y Vite por el desarrollo rápido
- HLS.js por el reproductor de video
- Tailwind CSS por los estilos
