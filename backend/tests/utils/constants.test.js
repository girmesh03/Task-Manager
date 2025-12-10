import { describe, test, expect } from '@jest/globals';
import * as constants from '../../utils/constants.js';

describe('Utils: constants', () => {
  test('should export USER_ROLES', () => {
    expect(constants.USER_ROLES).toBeDefined();
    expect(constants.USER_ROLES.SUPER_ADMIN).toBe('SuperAdmin');
    expect(constants.USER_ROLES_ARRAY).toContain('SuperAdmin');
  });

  test('should export TASK_STATUS', () => {
    expect(constants.TASK_STATUS).toBeDefined();
    expect(constants.TASK_STATUS.TO_DO).toBe('To Do');
    expect(constants.TASK_STATUS_ARRAY).toContain('To Do');
  });

  test('should export MATERIAL_CATEGORIES', () => {
    expect(constants.MATERIAL_CATEGORIES).toBeDefined();
    expect(constants.MATERIAL_CATEGORIES).toContain('Electrical');
    expect(constants.MATERIAL_CATEGORIES.length).toBe(9);
  });

  test('should export UNIT_TYPES', () => {
    expect(constants.UNIT_TYPES).toBeDefined();
    expect(constants.UNIT_TYPES).toContain('pcs');
    expect(constants.UNIT_TYPES.length).toBeGreaterThan(20);
  });

  test('should export LIMITS', () => {
    expect(constants.LIMITS).toBeDefined();
    expect(constants.LIMITS.MAX_TAGS).toBe(5);
  });

  test('should export AUTH constants', () => {
    expect(constants.AUTH).toBeDefined();
    expect(constants.AUTH.ACCESS_TOKEN_EXPIRY).toBe('15m');
  });
});
