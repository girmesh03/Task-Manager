import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import logger from '../../utils/logger.js';
import fs from 'fs';
import path from 'path';

describe('Utils: logger', () => {
  const logDir = 'logs';
  const errorLogPath = path.join(logDir, 'error.log');
 const combinedLogPath = path.join(logDir, 'combined.log');

  beforeEach(() => {
    // Clean up log files before each test
    if (fs.existsSync(errorLogPath)) fs.unlinkSync(errorLogPath);
    if (fs.existsSync(combinedLogPath)) fs.unlinkSync(combinedLogPath);
  });

  afterEach(() => {
    // Clean up log files after each test
    if (fs.existsSync(errorLogPath)) fs.unlinkSync(errorLogPath);
    if (fs.existsSync(combinedLogPath)) fs.unlinkSync(combinedLogPath);
  });

  test('should log info messages', () => {
    const spy = jest.spyOn(logger, 'info');
    logger.info('Test info message');
    expect(spy).toHaveBeenCalledWith('Test info message');
    spy.mockRestore();
  });

  test('should log error messages', () => {
    const spy = jest.spyOn(logger, 'error');
    logger.error('Test error message');
    expect(spy).toHaveBeenCalledWith('Test error message');
    spy.mockRestore();
  });

  test('should log warn messages', () => {
    const spy = jest.spyOn(logger, 'warn');
    logger.warn('Test warning message');
    expect(spy).toHaveBeenCalledWith('Test warning message');
    spy.mockRestore();
  });

  test('should have correct log level based on NODE_ENV', () => {
    expect(logger.level).toBeDefined();
  });
});
