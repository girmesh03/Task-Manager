import { describe, it, expect } from '@jest/globals';
import mongoose from 'mongoose';
import {
  formatResponse,
  formatPaginatedResponse,
  validateObjectId,
  sanitizeUser,
} from '../../utils/helpers.js';

describe('Helper Utilities', () => {
  describe('formatResponse', () => {
    it('should format success response correctly', () => {
      const result = formatResponse(true, 'Success', { id: 1 });
      expect(result).toEqual({
        success: true,
        message: 'Success',
        data: { id: 1 },
      });
    });

    it('should format error response correctly', () => {
      const result = formatResponse(false, 'Error');
      expect(result).toEqual({
        success: false,
        message: 'Error',
        data: null,
      });
    });
  });

  describe('formatPaginatedResponse', () => {
    it('should format paginated response correctly', () => {
      const docs = [{ id: 1 }, { id: 2 }];
      const pagination = {
        page: 1,
        limit: 10,
        totalDocs: 20,
        totalPages: 2,
        hasNextPage: true,
        hasPrevPage: false,
      };
      const result = formatPaginatedResponse(true, 'Success', 'users', docs, pagination);

      expect(result.success).toBe(true);
      expect(result.data.users).toEqual(docs);
      expect(result.data.pagination).toEqual({
        page: 1,
        limit: 10,
        totalCount: 20,
        totalPages: 2,
        hasNext: true,
        hasPrev: false,
      });
    });
  });

  describe('validateObjectId', () => {
    it('should return true for valid ObjectId', () => {
      const validId = new mongoose.Types.ObjectId().toString();
      expect(validateObjectId(validId)).toBe(true);
    });

    it('should return false for invalid ObjectId', () => {
      expect(validateObjectId('invalid-id')).toBe(false);
    });
  });

  describe('sanitizeUser', () => {
    it('should remove sensitive fields', () => {
      const user = {
        _id: '123',
        name: 'Test User',
        password: 'password123',
        __v: 0,
        isDeleted: false,
      };
      const sanitized = sanitizeUser(user);

      expect(sanitized.password).toBeUndefined();
      expect(sanitized.__v).toBeUndefined();
      expect(sanitized.isDeleted).toBeUndefined();
      expect(sanitized.name).toBe('Test User');
    });

    it('should handle mongoose document', () => {
        // Mock mongoose document structure if needed, or just rely on toObject check
        const user = {
            toObject: () => ({
                _id: '123',
                password: 'password123'
            })
        };
        const sanitized = sanitizeUser(user);
        expect(sanitized.password).toBeUndefined();
    });
  });
});
