import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import connectDB from './config/db.js';
import logger from './utils/logger.js';
import validateEnv from './utils/validateEnv.js';
import allowedOrigins from './config/allowedOrigins.js';

// Validate environment variables
validateEnv();

// Connect to Database
connectDB();

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  pingTimeout: 60000,
});

// Socket.IO connection handler (Placeholder)
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Make io accessible globally (if needed, or pass it to routes)
app.set('io', io);

server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Graceful Shutdown
const gracefulShutdown = () => {
  logger.info('SIGTERM/SIGINT received. Shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
