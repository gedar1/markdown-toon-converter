# Database Setup Guide

## Prerequisites

Before running migrations, you need:

- PostgreSQL 14+ installed and running
- Database created (e.g., `music_streaming_platform`)
- DATABASE_URL configured in `.env` file

## Configuration

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Update the `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/music_streaming_platform"
   ```

## Running Migrations

### First Time Setup

1. Generate Prisma Client (can be done without database):

   ```bash
   npm run prisma:generate
   ```

2. Create and apply initial migration (requires PostgreSQL):

   ```bash
   npm run prisma:migrate
   ```

   This will:
   - Create a new migration in `prisma/migrations/`
   - Apply the migration to your database
   - Generate the Prisma Client with updated types

### Subsequent Migrations

After making changes to `schema.prisma`:

```bash
npm run prisma:migrate
```

### Reset Database (Development Only)

To reset your database and reapply all migrations:

```bash
npx prisma migrate reset
```

⚠️ **Warning**: This will delete all data in your database!

## Prisma Studio

To explore your database with a GUI:

```bash
npm run prisma:studio
```

This opens Prisma Studio at `http://localhost:5555`

## Schema Overview

The database schema includes:

### Users Domain

- `users` - User accounts (creators and subscribers)
- `creator_profiles` - Creator-specific data
- `subscriber_profiles` - Subscriber-specific data

### Content Domain

- `content` - Audio content uploaded by creators
- `playlists` - Playlists created by creators
- `playlist_content` - Junction table for playlist-content relationships

### Access Control Domain

- `access_codes` - Access codes linked to payments
- `access_grants` - Active access grants for subscribers

### Streaming Domain

- `stream_sessions` - Streaming session analytics

## Troubleshooting

### "Can't reach database server"

Make sure PostgreSQL is running:

```bash
# Windows
pg_ctl status

# Linux/Mac
sudo systemctl status postgresql
```

### "Database does not exist"

Create the database:

```sql
CREATE DATABASE music_streaming_platform;
```

### Migration conflicts

If you have migration conflicts, you can:

1. Reset the database (development only): `npx prisma migrate reset`
2. Or resolve conflicts manually in the migration files

## Notes

- The Prisma Client can be generated without a database connection
- Migrations require an active PostgreSQL connection
- Always backup your database before running migrations in production
