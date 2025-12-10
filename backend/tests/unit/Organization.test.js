import { describe, test, expect, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import Organization from '../../models/Organization.js';
import Department from '../../models/Department.js';
import User from '../../models/User.js';
import { INDUSTRIES } from '../../utils/constants.js';

describe('Organization Model', () => {
  let testOrg;
  let testUser;

  beforeEach(async () => {
    // Create a test user for createdBy field
    testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      organization: new mongoose.Types.ObjectId(),
      department: new mongoose.Types.ObjectId(),
    });
  });

  describe('Organization Creation', () => {
    test('should create organization with valid data', async () => {
      testOrg = await Organization.create({
        name: 'Test Organization',
        email: 'org@example.com',
        phone: '+251912345678',
        industry: INDUSTRIES[0],
        createdBy: testUser._id,
      });

      expect(testOrg._id).toBeDefined();
      expect(testOrg.name).toBe('test organization'); // lowercase
      expect(testOrg.email).toBe('org@example.com');
      expect(testOrg.isPlatformOrg).toBe(false);
      expect(testOrg.isDeleted).toBe(false);
    });

    test('should fail without required fields', async () => {
      await expect(
        Organization.create({
          email: 'org@example.com',
        })
      ).rejects.toThrow();
    });

    test('should convert name to lowercase', async () => {
      testOrg = await Organization.create({
        name: 'UPPERCASE ORG',
        email: 'upper@example.com',
        phone:'+251987654321',
        industry: INDUSTRIES[0],
      });

      expect(testOrg.name).toBe('uppercase org');
    });

    test('should set isPlatformOrg to false by default', async () => {
      testOrg = await Organization.create({
        name: 'Default Org',
        email: 'default@example.com',
        phone: '+251911111111',
        industry: INDUSTRIES[0],
      });

      expect(testOrg.isPlatformOrg).toBe(false);
    });

    test('should reject invalid industry', async () => {
      await expect(
        Organization.create({
          name: 'Invalid Industry Org',
          email: 'invalid@example.com',
          phone: '+251922222222',
          industry: 'NonExistentIndustry',
        })
      ).rejects.toThrow();
    });
  });

  describe('Unique Constraints', () => {
    beforeEach(async () => {
      testOrg = await Organization.create({
        name: 'Unique Test Org',
        email: 'unique@example.com',
        phone: '+251933333333',
        industry: INDUSTRIES[0],
      });
    });

    test('should enforce unique name (via index)', async () => {
      await expect(
        Organization.create({
          name: 'Unique Test Org',
          email: 'different@example.com',
          phone: '+251944444444',
          industry: INDUSTRIES[0],
        })
      ).rejects.toThrow();
    });

    test('should enforce unique email (via index)', async () => {
      await expect(
        Organization.create({
          name: 'Different Org',
          email: 'unique@example.com',
          phone: '+251955555555',
          industry: INDUSTRIES[0],
        })
      ).rejects.toThrow();
    });

    test('should enforce unique phone (via index)', async () => {
      await expect(
        Organization.create({
          name: 'Another Org',
          email: 'another@example.com',
          phone: '+251933333333',
          industry: INDUSTRIES[0],
        })
      ).rejects.toThrow();
    });

    test('should allow duplicate name/email/phone for soft-deleted organizations', async () => {
      // Soft delete the first org
      await testOrg.softDelete();

      // Should be able to create new org with same name/email/phone
      const newOrg = await Organization.create({
        name: 'Unique Test Org',
        email: 'unique@example.com',
        phone: '+251933333333',
        industry: INDUSTRIES[0],
      });

      expect(newOrg._id).toBeDefined();
      expect(newOrg.name).toBe('unique test org');
    });
  });

  describe('isPlatformOrg Immutability', () => {
    test('should not allow changing isPlatformOrg after creation', async () => {
      testOrg = await Organization.create({
        name: 'Immutable Test Org',
        email: 'immutable@example.com',
        phone: '+251966666666',
        industry: INDUSTRIES[0],
        isPlatformOrg: true,
      });

      expect(testOrg.isPlatformOrg).toBe(true);

      // Try to change it
      testOrg.isPlatformOrg = false;
      await testOrg.save();

      // Reload from DB
      const reloaded = await Organization.findById(testOrg._id);
      expect(reloaded.isPlatformOrg).toBe(true); // Should still be true (immutable)
    });
  });

  describe('Cascade Delete', () => {
    test('softDeleteByIdWithCascade should soft delete organization', async () => {
      testOrg = await Organization.create({
        name: 'Cascade Test Org',
        email: 'cascade@example.com',
        phone: '+251977777777',
        industry: INDUSTRIES[0],
      });

      await Organization.softDeleteByIdWithCascade(testOrg._id, {
        deletedBy: testUser._id,
      });

      const deleted = await Organization.findById(testOrg._id).withDeleted();
      expect(deleted.isDeleted).toBe(true);
      expect(deleted.deletedBy.toString()).toBe(testUser._id.toString());
    });
  });

  describe('Platform Organization Protection', () => {
    test('should prevent deletion of platform organization', async () => {
      testOrg = await Organization.create({
        name: 'Platform Org',
        email: 'platform@example.com',
        phone: '+251988888888',
        industry: INDUSTRIES[0],
        isPlatformOrg: true,
      });

      await expect(
        Organization.softDeleteByIdWithCascade(testOrg._id)
      ).rejects.toThrow('Cannot delete platform organization');
    });
  });

  describe('Soft Delete Integration', () => {
    test('should support soft delete via plugin', async () => {
      testOrg = await Organization.create({
        name: 'Soft Delete Test',
        email: 'softdelete@example.com',
        phone: '+251999999999',
        industry: INDUSTRIES[0],
      });

      await testOrg.softDelete();

      expect(testOrg.isDeleted).toBe(true);
      expect(testOrg.deletedAt).toBeInstanceOf(Date);

      // Should not be found in normal queries
      const found = await Organization.findById(testOrg._id);
      expect(found).toBeNull();

      // Should be found with withDeleted
      const withDeleted = await Organization.findById(testOrg._id).withDeleted();
      expect(withDeleted).toBeTruthy();
      expect(withDeleted.isDeleted).toBe(true);
    });

    test('should restore soft-deleted organization', async () => {
      testOrg = await Organization.create({
        name: 'Restore Test',
        email: 'restore@example.com',
        phone: '+251900000000',
        industry: INDUSTRIES[0],
      });

      // Soft delete
      await testOrg.softDelete();
      expect(testOrg.isDeleted).toBe(true);

      // Restore
      await testOrg.restore();
      expect(testOrg.isDeleted).toBe(false);

      // Should be found in normal queries
      const found = await Organization.findById(testOrg._id);
      expect(found).toBeTruthy();
      expect(found.isDeleted).toBe(false);
    });
  });
});
