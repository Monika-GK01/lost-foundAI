import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import mongoose from 'mongoose';
import axios from 'axios';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import routes from './routes';
import {
  notFound,
  errorHandler,
  globalRateLimiter,
  requestId,
} from './middlewares';
import { logger } from './utils/logger';
import { swaggerSpec } from './config/swagger';

const app: Application = express();

// Security middleware
app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  })
);

// Compression
app.use(compression());

// Request ID
app.use(requestId);

// Rate limiting
app.use(globalRateLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Protect against NoSQL injection
app.use(mongoSanitize());

// Request logging
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    requestId: req.requestId,
  });
  next();
});

/**
 * Root Route
 */
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 Campus LostFoundAI Backend is running!',
    version: '1.0.0',
    environment: env.NODE_ENV,
    endpoints: {
      health: '/api/health',
      docs: '/api/docs',
      api: '/api',
    },
  });
});

/**
 * Health Check
 */
app.get('/api/health', async (_req, res) => {
  const mongoStatus =
    mongoose.connection.readyState === 1
      ? 'connected'
      : 'disconnected';

  let aiStatus = 'unknown';

  try {
    await axios.get(`${env.AI_SERVICE_URL}/health`, {
      timeout: 3000,
    });
    aiStatus = 'reachable';
  } catch {
    aiStatus = 'unreachable';
  }

  res.status(200).json({
    success: true,
    message: 'Server is running',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      uptime: process.uptime(),
      mongo: mongoStatus,
      aiService: aiStatus,
    },
  });
});

/**
 * API Routes
 */
app.use('/api', routes);

/**
 * Swagger Documentation
 */
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Campus LostFoundAI API',
  })
);

/**
 * 404 Handler
 */
app.use(notFound);

/**
 * Global Error Handler
 */
app.use(errorHandler);

export default app;