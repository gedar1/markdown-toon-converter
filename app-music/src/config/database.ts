import dotenv from 'dotenv';

dotenv.config();

export const databaseConfig = {
  url:
    process.env.DATABASE_URL ||
    'postgresql://user:password@localhost:5432/music_streaming_platform',

  // Connection pool settings
  connectionLimit: Number.parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),

  // Retry settings
  maxRetries: Number.parseInt(process.env.DB_MAX_RETRIES || '3', 10),
  retryDelay: Number.parseInt(process.env.DB_RETRY_DELAY || '1000', 10),
};

export function validateDatabaseConfig() {
  if (!process.env.DATABASE_URL) {
    console.warn(
      '⚠️  DATABASE_URL not set in environment variables. Using default connection string.'
    );
    console.warn('⚠️  Please set DATABASE_URL in your .env file before running migrations.');
  }
}
