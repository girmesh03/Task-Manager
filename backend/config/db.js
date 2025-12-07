import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

const connectDB = async () => {
  const MAX_RETRIES = 5;
  let retries = 0;

  const connect = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 2,
      });

      logger.info(`MongoDB Connected: ${conn.connection.host}`);

      // Connection state monitoring
      mongoose.connection.on('connected', () => {
        logger.info('Mongoose connected to DB');
      });

      mongoose.connection.on('error', (err) => {
        logger.error(`Mongoose connection error: ${err.message}`);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('Mongoose disconnected');
      });

      // Health check every 30 seconds
      const healthCheckInterval = setInterval(async () => {
        if (mongoose.connection.readyState === 1) {
          try {
            await mongoose.connection.db.admin().ping();
            // logger.debug('MongoDB health check passed');
          } catch (error) {
            logger.error(`MongoDB health check failed: ${error.message}`);
          }
        }
      }, 30000);

      // Graceful shutdown handling
      const gracefulShutdown = async () => {
        clearInterval(healthCheckInterval);
        try {
          await mongoose.connection.close();
          logger.info('Mongoose connection closed through app termination');
          process.exit(0);
        } catch (err) {
          logger.error(`Error during database disconnection: ${err.message}`);
          process.exit(1);
        }
      };

      process.on('SIGINT', gracefulShutdown);
      process.on('SIGTERM', gracefulShutdown);

    } catch (error) {
      logger.error(`Error: ${error.message}`);

      if (retries < MAX_RETRIES) {
        retries++;
        const delay = Math.min(1000 * Math.pow(2, retries), 30000); // Exponential backoff max 30s
        logger.info(`Retrying connection in ${delay}ms... (Attempt ${retries}/${MAX_RETRIES})`);
        setTimeout(connect, delay);
      } else {
        logger.error('Max retries reached. Exiting...');
        process.exit(1);
      }
    }
  };

  await connect();
};

export default connectDB;
