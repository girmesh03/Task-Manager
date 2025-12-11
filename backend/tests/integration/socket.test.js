/**
 * Socket.IO Integration Tests
 *
 * Tests for Socket.IO connection, authentication, and event handling.
 */

import { jest } from '@jest/globals';
import http from 'http';
import { Server } from 'socket.io';
import { io as ioc } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Mock User model
const mockUser = {
  _id: new mongoose.Types.ObjectId(),
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  isDeleted: false,
  status: 'Offline',
  organization: {
    _id: new mongoose.Types.ObjectId(),
    name: 'Test Org',
    isDeleted: false,
  },
  department: {
    _id: new mongoose.Types.ObjectId(),
    name: 'Test Dept',
    isDeleted: false,
  },
};

// Mock User.findById
jest.unstable_mockModule('../../models/index.js', () => ({
  User: {
    findById: jest.fn(() => ({
      select: jest.fn(() => ({
        populate: jest.fn(() => ({
          populate: jest.fn().mockResolvedValue(mockUser),
        })),
      })),
    })),
    findByIdAndUpdate: jest.fn().mockResolvedValue(mockUser),
  },
  Notification: {
    create: jest.fn(),
    findOne: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

// Set environment variables
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.NODE_ENV = 'test';

describe('Socket.IO Integration', () => {
  let httpServer;
  let io;
  let clientSocket;
  const PORT = 4999;

  // Generate valid access token
  const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  };

  beforeAll(async () => {
    // Import after mocking
    const { setupSocketIO } = await import('../../utils/socket.js');

    // Create HTTP server
    httpServer = http.createServer();

    // Create Socket.IO server
    io = new Server(httpServer, {
      cors: {
        origin: '*',
        credentials: true,
      },
    });

    // Setup Socket.IO handlers
    setupSocketIO(io);

    // Start server
    await new Promise((resolve) => {
      httpServer.listen(PORT, resolve);
    });
  });

  afterAll(async () => {
    if (clientSocket) {
      clientSocket.disconnect();
    }
    io.close();
    await new Promise((resolve) => {
      httpServer.close(resolve);
    });
  });

  afterEach(() => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  describe('Authentication', () => {
    test('should reject connection without cookies', (done) => {
      clientSocket = ioc(`http://localhost:${PORT}`, {
        autoConnect: false,
        transports: ['websocket'],
      });

      clientSocket.on('connect_error', (err) => {
        expect(err.message).toContain('Authentication error');
        done();
      });

      clientSocket.connect();
    });

    test('should reject connection with invalid token', (done) => {
      clientSocket = ioc(`http://localhost:${PORT}`, {
        autoConnect: false,
        transports: ['websocket'],
        extraHeaders: {
          cookie: 'access_token=invalid-token',
        },
      });

      clientSocket.on('connect_error', (err) => {
        expect(err.message).toContain('Authentication error');
        done();
      });

      clientSocket.connect();
    });

    test('should accept connection with valid token', (done) => {
      const token = generateToken(mockUser._id.toString());

      clientSocket = ioc(`http://localhost:${PORT}`, {
        autoConnect: false,
        transports: ['websocket'],
        extraHeaders: {
          cookie: `access_token=${token}`,
        },
      });

      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBe(true);
        done();
      });

      clientSocket.on('connect_error', (err) => {
        done(err);
      });

      clientSocket.connect();
    });
  });

  describe('Room Joining', () => {
    test('should join user, department, and organization rooms on connect', (done) => {
      const token = generateToken(mockUser._id.toString());

      clientSocket = ioc(`http://localhost:${PORT}`, {
        autoConnect: false,
        transports: ['websocket'],
        extraHeaders: {
          cookie: `access_token=${token}`,
        },
      });

      clientSocket.on('connect', () => {
        // Give time for room joining
        setTimeout(() => {
          const rooms = io.sockets.adapter.rooms;

          expect(rooms.has(`user:${mockUser._id}`)).toBe(true);
          expect(rooms.has(`department:${mockUser.department._id}`)).toBe(true);
          expect(rooms.has(`organization:${mockUser.organization._id}`)).toBe(true);
          done();
        }, 100);
      });

      clientSocket.connect();
    });
  });

  describe('Status Events', () => {
    test('should emit user:online on connect', (done) => {
      const token = generateToken(mockUser._id.toString());

      clientSocket = ioc(`http://localhost:${PORT}`, {
        autoConnect: false,
        transports: ['websocket'],
        extraHeaders: {
          cookie: `access_token=${token}`,
        },
      });

      // Use once() to only handle first event
      clientSocket.once('user:online', (data) => {
        expect(data.userId).toBeDefined();
        expect(data.status).toBe('Online');
        expect(data.timestamp).toBeDefined();
        done();
      });

      clientSocket.connect();
    });
  });
});
