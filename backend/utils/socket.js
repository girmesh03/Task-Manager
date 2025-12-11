/**
 * Socket.IO Event Handlers
 *
 * Setup and manage Socket.IO connection events, authentication,
 * and room management.
 *
 * @module utils/socket
 */

import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import logger from './logger.js';
import { initializeSocket } from './socketInstance.js';

/**
 * Parse cookie string into an object
 * @param {string} cookieString - Raw cookie header string
 * @returns {object} Parsed cookies
 */
const parseCookies = (cookieString) => {
  if (!cookieString) return {};
  return Object.fromEntries(
    cookieString.split(';').map((cookie) => {
      const [key, ...value] = cookie.trim().split('=');
      return [key, value.join('=')];
    })
  );
};

/**
 * Setup Socket.IO server with authentication and event handlers
 * @param {import('socket.io').Server} io - Socket.IO server instance
 */
export const setupSocketIO = (io) => {
  // Initialize the singleton
  initializeSocket(io);

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      // Extract cookies from handshake
      const cookies = socket.handshake.headers.cookie;
      if (!cookies) {
        return next(new Error('Authentication error: No cookies provided'));
      }

      const parsedCookies = parseCookies(cookies);
      const token = parsedCookies.access_token;

      if (!token) {
        return next(new Error('Authentication error: No access token'));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      // Find user
      const user = await User.findById(decoded.userId)
        .select('+isDeleted')
        .populate('organization', 'name isDeleted')
        .populate('department', 'name isDeleted');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      if (user.isDeleted) {
        return next(new Error('Authentication error: User account is deactivated'));
      }

      if (user.organization?.isDeleted) {
        return next(new Error('Authentication error: Organization is deactivated'));
      }

      if (user.department?.isDeleted) {
        return next(new Error('Authentication error: Department is deactivated'));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return next(new Error('Authentication error: Invalid token'));
      }
      if (error.name === 'TokenExpiredError') {
        return next(new Error('Authentication error: Token expired'));
      }
      logger.error(`Socket authentication error: ${error.message}`);
      return next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', async (socket) => {
    const { user } = socket;
    const userId = user._id.toString();
    const departmentId = user.department?._id?.toString() || user.department?.toString();
    const organizationId = user.organization?._id?.toString() || user.organization?.toString();

    logger.info(`Socket connected: ${socket.id} (User: ${user.firstName} ${user.lastName})`);

    // Join rooms
    socket.join(`user:${userId}`);
    if (departmentId) {
      socket.join(`department:${departmentId}`);
    }
    if (organizationId) {
      socket.join(`organization:${organizationId}`);
    }

    // Update user status to Online
    try {
      await User.findByIdAndUpdate(userId, { status: 'Online' });

      // Emit user:online event to department and organization rooms
      if (departmentId) {
        io.to(`department:${departmentId}`).emit('user:online', {
          userId,
          status: 'Online',
          timestamp: new Date().toISOString(),
        });
      }
      if (organizationId) {
        io.to(`organization:${organizationId}`).emit('user:online', {
          userId,
          status: 'Online',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error(`Failed to update user status: ${error.message}`);
    }

    // Handle status change
    socket.on('status:change', async (status) => {
      if (!['Online', 'Offline', 'Away'].includes(status)) {
        return;
      }

      try {
        await User.findByIdAndUpdate(userId, { status });

        // Emit status event
        const eventName = `user:${status.toLowerCase()}`;
        if (departmentId) {
          io.to(`department:${departmentId}`).emit(eventName, {
            userId,
            status,
            timestamp: new Date().toISOString(),
          });
        }
        if (organizationId) {
          io.to(`organization:${organizationId}`).emit(eventName, {
            userId,
            status,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        logger.error(`Failed to update user status: ${error.message}`);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      logger.info(`Socket disconnected: ${socket.id} (User: ${user.firstName} ${user.lastName})`);

      try {
        await User.findByIdAndUpdate(userId, { status: 'Offline' });

        // Emit user:offline event
        if (departmentId) {
          io.to(`department:${departmentId}`).emit('user:offline', {
            userId,
            status: 'Offline',
            timestamp: new Date().toISOString(),
          });
        }
        if (organizationId) {
          io.to(`organization:${organizationId}`).emit('user:offline', {
            userId,
            status: 'Offline',
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        logger.error(`Failed to update user status on disconnect: ${error.message}`);
      }
    });
  });
};

export default { setupSocketIO };
