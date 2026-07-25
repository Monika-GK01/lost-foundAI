import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

let retryCount = 0;

export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
    retryCount = 0;
  } catch (error) {
    retryCount++;
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`❌ MongoDB connection failed (attempt ${retryCount}/${MAX_RETRIES}): ${message}`);

    if (retryCount < MAX_RETRIES) {
      logger.info(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      setTimeout(connectDB, RETRY_DELAY_MS);
    } else {
      logger.error('Max retries reached. Exiting process.');
      process.exit(1);
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Error closing MongoDB connection: ${message}`);
    process.exit(1);
  }
};
