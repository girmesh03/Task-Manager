import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';

// Define mocks using unstable_mockModule
jest.unstable_mockModule('mongoose', () => ({
  default: {
    connect: jest.fn(),
    connection: {
      on: jest.fn(),
      close: jest.fn(),
      readyState: 1,
      db: {
        admin: jest.fn().mockReturnValue({
          ping: jest.fn()
        })
      }
    }
  }
}));

jest.unstable_mockModule('../../utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('Config: db', () => {
  let connectDB;
  let mongoose;
  let logger;
  const originalEnv = process.env;
  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, MONGODB_URI: 'mongodb://test:27017/test' };

    // Dynamic import to ensure mocks are used
    mongoose = (await import('mongoose')).default;
    logger = (await import('../../utils/logger.js')).default;
    connectDB = (await import('../../config/db.js')).default;

    // Use fake timers to prevent open handles from setInterval
    jest.useFakeTimers();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.resetModules();
    jest.useRealTimers();
  });

  test('should connect to MongoDB successfully', async () => {
    mongoose.connect.mockResolvedValueOnce('Connected');

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://test:27017/test', expect.objectContaining({
      serverSelectionTimeoutMS: 5000,
      minPoolSize: 2
    }));
    expect(logger.info).toHaveBeenCalledWith('MongoDB connected successfully');
  });

  test('should exit if MONGODB_URI is missing', async () => {
    delete process.env.MONGODB_URI;

    // Re-import to trigger the check inside connectDB if it was top-level (it's not, it's inside function)
    // But connectDB reads env var when called.

    await connectDB();

    expect(logger.error).toHaveBeenCalledWith('MONGODB_URI environment variable is not defined');
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  test('should retry connection on failure', async () => {
    // Fail once, then succeed
    mongoose.connect
      .mockRejectedValueOnce(new Error('Connection failed'))
      .mockResolvedValueOnce('Connected');

    jest.useFakeTimers();

    // Mock setInterval to prevent infinite loop from health check
    jest.spyOn(global, 'setInterval').mockImplementation(() => {});

    const connectPromise = connectDB();

    // Advance time for retry (1000ms is the first delay)
    await jest.advanceTimersByTimeAsync(1000);

    await connectPromise;

    expect(mongoose.connect).toHaveBeenCalledTimes(2);
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('MongoDB connection attempt 1 failed'));
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Retrying in'));
    expect(logger.info).toHaveBeenCalledWith('MongoDB connected successfully');

    jest.useRealTimers();
  });

  test('should setup event listeners', async () => {
    mongoose.connect.mockResolvedValueOnce('Connected');

    await connectDB();

    expect(mongoose.connection.on).toHaveBeenCalledWith('connected', expect.any(Function));
    expect(mongoose.connection.on).toHaveBeenCalledWith('error', expect.any(Function));
    expect(mongoose.connection.on).toHaveBeenCalledWith('disconnected', expect.any(Function));
  });
});
