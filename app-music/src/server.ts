import dotenv from 'dotenv';
import { createApp } from './api/app';
import { logger } from './shared/utils/logger';
import { disconnectDatabase } from './shared/database/client';

// Load environment variables
dotenv.config();

// Configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start the server
 */
async function startServer() {
  try {
    // Create Express app
    const app = createApp();

    // Start listening
    const server = app.listen(PORT, () => {
      logger.info('Server started successfully', {
        port: PORT,
        host: HOST,
        environment: NODE_ENV,
        nodeVersion: process.version,
      });

      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎵 Music Streaming Platform API                        ║
║                                                           ║
║   Environment: ${NODE_ENV.padEnd(43)}║
║   Port:        ${String(PORT).padEnd(43)}║
║   Host:        ${HOST.padEnd(43)}║
║                                                           ║
║   Health:      http://localhost:${PORT}/health${' '.repeat(20)}║
║   API Docs:    http://localhost:${PORT}/${' '.repeat(24)}║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown handler
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, starting graceful shutdown`);

      // Stop accepting new connections
      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          // Disconnect from database
          await disconnectDatabase();
          logger.info('Database connection closed');

          logger.info('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown', { error });
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught exception', {
        error: error.message,
        stack: error.stack,
      });
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled rejection', {
        reason: reason?.message || reason,
        stack: reason?.stack,
      });
      gracefulShutdown('unhandledRejection');
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

// Start the server
startServer();
