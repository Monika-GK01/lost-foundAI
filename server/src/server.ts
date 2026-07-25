import app from './app';
import { env } from './config/env';
import { connectDB, disconnectDB } from './config/database';
import { logger } from './utils/logger';

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });

      // Force shutdown after 10s
      setTimeout(() => {
        logger.error('Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('unhandledRejection', (reason: unknown) => {
      logger.error(`Unhandled Rejection: ${reason}`);
      server.close(() => {
        process.exit(1);
      });
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error(`Uncaught Exception: ${error.message}`);
      process.exit(1);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Failed to start server: ${message}`);
    process.exit(1);
  }
};

startServer();
