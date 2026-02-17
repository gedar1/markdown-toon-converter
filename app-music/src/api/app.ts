import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler, notFoundHandler } from '../shared/errors/errorHandler';
import { logger, morganStream } from '../shared/utils/logger';

// Import routes
import authRoutes from '../modules/auth/auth.routes';
import creatorsRoutes from '../modules/users/users.routes';
import subscribersRoutes from '../modules/users/subscribers.routes';
import accessRoutes from '../modules/access/access.routes';
import contentRoutes from '../modules/content/content.routes';
import streamingRoutes from '../modules/streaming/streaming.routes';
import liveRoutes from '../modules/live/live.routes';
import paymentRoutes from '../modules/payments/payment.routes';

/**
 * Create and configure Express application
 */
export function createApp(): Application {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration
  const corsOrigins = (process.env.CORS_ORIGIN || '*').split(',').map((origin) => origin.trim());
  const corsOptions = {
    origin: corsOrigins,
    credentials: true,
    optionsSuccessStatus: 200,
  };
  app.use(cors(corsOptions));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging middleware
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev', { stream: morganStream }));
  } else {
    app.use(morgan('combined', { stream: morganStream }));
  }

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // API version endpoint
  app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: 'Music Streaming Platform API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/auth',
        users: '/users',
        creators: '/creators',
        subscribers: '/subscribers',
        access: '/access',
        content: '/content',
        playlists: '/playlists',
        stream: '/stream',
        live: '/live',
        payments: '/payments',
        webhooks: '/webhooks',
      },
    });
  });

  // Mount API routes
  app.use('/auth', authRoutes);
  app.use('/creators', creatorsRoutes);
  app.use('/subscribers', subscribersRoutes);
  app.use('/access', accessRoutes);
  app.use('/content', contentRoutes);
  app.use('/stream', streamingRoutes);
  app.use('/live', liveRoutes);
  app.use('/payments', paymentRoutes);
  app.use('/webhooks', accessRoutes); // Webhook routes are in access module

  // 404 handler (must be after all routes)
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  logger.info('Express application configured successfully');

  return app;
}

export default createApp;
