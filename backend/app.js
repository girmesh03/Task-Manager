import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { randomUUID } from 'crypto';

import corsOptions from './config/corsOptions.js';
import globalErrorHandler from './errorHandler/ErrorController.js';
import CustomError from './errorHandler/CustomError.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import logger from './utils/logger.js';

// Configure dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

// Set timezone to UTC
process.env.TZ = 'UTC';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security Headers
app.use(helmet());

// CORS
app.use(cors(corsOptions));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Compression
app.use(compression({ threshold: 1024 }));

// Request ID
app.use((req, res, next) => {
  req.id = randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Logging (Development only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiting (Production only)
if (process.env.NODE_ENV === 'production') {
  app.use('/api', apiLimiter);
}

// Routes
import routes from './routes/index.js';

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// 404 Handler
app.all('*', (req, res, next) => {
  next(CustomError.notFound(`Can't find ${req.originalUrl} on this server!`));
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
