import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import app from './app.js';
import connectDB from './config/db.js';
import logger from './utils/logger.js';
import validateEnv from './utils/validateEnv.js';
import allowedOrigins from './config/allowedOrigins.js';
import { setupSocketIO } from './utils/socket.js';
import { initializeEmailService } from './services/emailService.js';

// Validate environment variables
validateEnv();

const PORT = process.env.PORT || 4000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
});

// Setup Socket.IO authentication and event handlers
setupSocketIO(io);

// Make io accessible via app (for controllers)
app.set('io', io);

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize email service
    await initializeEmailService();

    // Start listening
    server.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Start the server
startServer();

/**
 * Graceful Shutdown Handler
 */
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  // Close server to stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      // Close Socket.IO connections
      io.close(() => {
        logger.info('Socket.IO connections closed');
      });

      // Close MongoDB connection
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');

      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error(`Error during shutdown: ${error.message}`);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export { server, io };

