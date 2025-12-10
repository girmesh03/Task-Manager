import { describe, test, expect, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import Organization from '../../models/Organization.js';
import Department from '../../models/Department.js';
import User from '../../models/User.js';
import { INDUSTRIES } from '../../utils/constants.js';

describe('Department Model', () => {
  let testOrg;
  let testDept;
  let testUser;

  beforeEach(async () => {
    // Create test organization
    testOrg = await Organization.create({
      name: 'Test Org for Dept',
      email: 'deptorg@example.com',
      phone: '+251901234567',
      industry: INDUSTRIES[0],
    });

    // Create test user
    testUser = await User.create({
      firstName: 'Dept',
      lastName: 'User',
      email: 'deptuser@example.com',
      password: 'password123',
      organization: testOrg._id,
      department: new mongoose.Types.ObjectId(), // Temporary ID
    });
  });

  describe('Department Creation', () => {
    test('should create department with valid data', async () => {
      testDept = await Department.create({
        name: 'Engineering',
        description: 'Engineering Department',
        organization: testOrg._id,
        createdBy: testUser._id,
      });

      expect(testDept._id).toBeDefined();
      expect(testDept.name).toBe('Engineering');
      expect(testDept.organization.toString()).toBe(testOrg._id.toString());
      expect(testDept.isDeleted).toBe(false);
    });

    test('should fail without required fields', async () => {
      await expect(
        Department.create({
          description: 'Missing required fields',
        })
      ).rejects.toThrow();
    });

    test('should require organization reference', async () => {
      await expect(
        Department.create({
          name: 'No Org Dept',
        })
      ).rejects.toThrow();
    });
  });

  describe('Unique Name per Organization', () => {
    beforeEach(async () => {
      testDept = await Department.create({
        name: 'Sales',
        organization: testOrg._id,
      });
    });

    test('should enforce unique name within same organization', async () => {
      await expect(
        Department.create({
          name: 'Sales',
          organization: testOrg._id,
        })
      ).rejects.toThrow();
    });

    test('should allow same name in different organizations', async () => {
      const anotherOrg = await Organization.create({
        name: 'Another Org',
        email: 'another@example.com',
        phone: '+251909876543',
        industry: INDUSTRIES[0],
      });

      const dept2 = await Department.create({
        name: 'Sales',
        organization: anotherOrg._id,
      });

      expect(dept2._id).toBeDefined();
      expect(dept2.name).toBe('Sales');
      expect(dept2.organization.toString()).toBe(anotherOrg._id.toString());
    });

    test('should allow duplicate name for soft-deleted department in same org', async () => {
      // Soft delete the first dept
      await testDept.softDelete();

      // Should be able to create new dept with same name in same org
      const newDept = await Department.create({
        name: 'Sales',
        organization: testOrg._id,
      });

      expect(newDept._id).toBeDefined();
      expect(newDept.name).toBe('Sales');
    });
  });

  describe('Organization Validation', () => {
    test('should validate organization exists', async () => {
      const nonExistentOrgId = new mongoose.Types.ObjectId();

      await expect(
        Department.create({
          name: 'Invalid Org Dept',
          organization: nonExistentOrgId,
        })
      ).rejects.toThrow('Organization not found');
    });
  });

  describe('Cascade Delete', () => {
    test('softDeleteByIdWithCascade should soft delete department', async () => {
      testDept = await Department.create({
        name: 'Cascade Test Dept',
        organization: testOrg._id,
      });

      await Department.softDeleteByIdWithCascade(testDept._id, {
        deletedBy: testUser._id,
      });

      const deleted = await Department.findById(testDept._id).withDeleted();
      expect(deleted.isDeleted).toBe(true);
      expect(deleted.deletedBy.toString()).toBe(testUser._id.toString());
    });
  });

  describe('Soft Delete Integration', () => {
    test('should support soft delete via plugin', async () => {
      testDept = await Department.create({
        name: 'Soft Delete Test',
        organization: testOrg._id,
      });

      await testDept.softDelete();

      expect(testDept.isDeleted).toBe(true);
      expect(testDept.deletedAt).toBeInstanceOf(Date);

      // Should not be found in normal queries
      const found = await Department.findById(testDept._id);
      expect(found).toBeNull();

      // Should be found with withDeleted
      const withDeleted = await Department.findById(testDept._id).withDeleted();
      expect(withDeleted).toBeTruthy();
      expect(withDeleted.isDeleted).toBe(true);
    });

    test('should restore soft-deleted department', async () => {
      testDept = await Department.create({
        name: 'Restore Test',
        organization: testOrg._id,
      });

      // Soft delete
      await testDept.softDelete();
      expect(testDept.isDeleted).toBe(true);

      // Restore
      await testDept.restore();
      expect(testDept.isDeleted).toBe(false);

      // Should be found in normal queries
      const found = await Department.findById(testDept._id);
      expect(found).toBeTruthy();
      expect(found.isDeleted).toBe(false);
    });
  });
});
