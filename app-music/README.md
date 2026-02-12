# Music Streaming Platform

Multi-tenant music streaming platform with access code system built with TypeScript and Node.js.

## 📊 Estado del Proyecto

**Progreso:** 40% Completado (3 de 7 módulos principales)  
**Última actualización:** Sesión 1

📄 Ver [PROGRESS.md](./PROGRESS.md) para detalles completos del progreso.

### ✅ Módulos Completados

- ✅ **Authentication** - Registro, login, JWT, autorización por roles
- ✅ **User Management** - Perfiles de creators y subscribers, discovery
- ✅ **Access Control** - Códigos de acceso, webhooks de pagos, validación

### ⏳ Módulos Pendientes

- ⏳ **Content Management** - Upload de audio, playlists, metadata
- ⏳ **Streaming** - HLS, segmentación, sesiones de streaming
- ⏳ **API Integration** - Express app principal, middleware global
- ⏳ **Server** - Entry point, configuración, graceful shutdown

## Features

- 🎵 Multi-tenant architecture for multiple creators
- 🔐 Access code system linked to payments
- 🎧 HLS audio streaming
- 👥 Creator and subscriber management
- 📊 Analytics and reporting
- 🌐 RESTful API for web and mobile clients

## Tech Stack

- **Backend**: Node.js 18+, Express, TypeScript
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Authentication**: JWT + bcrypt
- **Testing**: Jest + fast-check (property-based testing)
- **File Storage**: Local filesystem (MVP) with path to S3/CDN

## Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher
- PostgreSQL 14 or higher

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` file with your database credentials and secrets

5. Run database migrations:

   ```bash
   pnpm prisma:migrate
   ```

6. Generate Prisma client:
   ```bash
   pnpm prisma:generate
   ```

## Development

Start the development server:

```bash
pnpm dev
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## Testing

Run all tests:

```bash
pnpm test
```

Run tests in watch mode:

```bash
pnpm test:watch
```

Run tests with coverage:

```bash
pnpm test:coverage
```

## Project Structure

```
src/
├── modules/          # Feature modules
│   ├── auth/        # Authentication
│   ├── users/       # User management
│   ├── content/     # Content management
│   ├── access/      # Access control
│   └── streaming/   # Audio streaming
├── shared/          # Shared utilities
│   ├── database/    # Database client and schema
│   ├── errors/      # Error handling
│   ├── utils/       # Utility functions
│   └── types/       # Common types
├── api/             # API layer
│   ├── routes/      # Route definitions
│   └── app.ts       # Express app setup
├── config/          # Configuration files
└── server.ts        # Server entry point
```

## API Documentation

API documentation is available at `/api-docs` when running the server.

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## License

MIT
