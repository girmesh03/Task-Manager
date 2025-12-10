import { describe, test, expect } from '@jest/globals';
import { hasPermission, getAllowedScopes } from '../../utils/authorizationMatrix.js';

describe('Utils: authorizationMatrix', () => {
  test('should return true for valid permission', () => {
    // SuperAdmin can create Organization with crossOrg scope
    const result = hasPermission('SuperAdmin', 'Organization', 'create', 'crossOrg');
    expect(result).toBe(true);
  });

  test('should return false for invalid role', () => {
    const result = hasPermission('InvalidRole', 'Organization', 'create', 'crossOrg');
    expect(result).toBe(false);
  });

  test('should return false for invalid resource', () => {
    const result = hasPermission('SuperAdmin', 'InvalidResource', 'create', 'crossOrg');
    expect(result).toBe(false);
  });

  test('should return false for invalid operation', () => {
    const result = hasPermission('SuperAdmin', 'Organization', 'invalidOp', 'crossOrg');
    expect(result).toBe(false);
  });

  test('should return false for invalid scope', () => {
    // User cannot read Organization with crossOrg scope (only own/ownDept depending on matrix)
    // Based on my matrix implementation: User read Organization is 'own'
    const result = hasPermission('User', 'Organization', 'read', 'crossOrg');
    expect(result).toBe(false);
  });

  test('should return allowed scopes', () => {
    const scopes = getAllowedScopes('SuperAdmin', 'Organization', 'create');
    expect(scopes).toContain('crossOrg');
  });

  test('should return empty array for invalid inputs', () => {
    const scopes = getAllowedScopes('InvalidRole', 'Organization', 'create');
    expect(scopes).toEqual([]);
  });
});
