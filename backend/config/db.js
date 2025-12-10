import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    logger.error('MONGODB_URI environment variable is not defined');
    process.exit(1);
  }

  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    minPoolSize: 2,
    maxPoolSize: 10,
  };

  let retries = 0;
  const maxRetries = 10;

  const connectWithRetry = async () => {
    try {
      await mongoose.connect(MONGODB_URI, options);
      logger.info('MongoDB connected successfully');

      // Start health check
      startHealthCheck();
    } catch (err) {
      retries++;
      logger.error(`MongoDB connection attempt ${retries} failed: ${err.message}`);

      if (retries < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retries - 1), 30000);
        logger.info(`Retrying in ${delay}ms...`);
        setTimeout(connectWithRetry, delay);
      } else {
        logger.error('Max retries reached. Exiting...');
        process.exit(1);
      }
    }
  };

  mongoose.connection.on('connected', () => {
    logger.info('Mongoose connected to DB');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`Mongoose connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('Mongoose disconnected');
  });

  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    logger.info('Mongoose connection closed through app termination');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await mongoose.connection.close();
    logger.info('Mongoose connection closed through app termination');
    process.exit(0);
  });

  await connectWithRetry();
};

const startHealthCheck = () => {
  setInterval(async () => {
    if (mongoose.connection.readyState === 1) {
      try {
        await mongoose.connection.db.admin().ping();
        // logger.debug('MongoDB health check passed');
      } catch (err) {
        logger.error(`MongoDB health check failed: ${err.message}`);
      }
    }
  }, 30000);
};

export default connectDB;
