import { describe, test, expect, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import Organization from '../../models/Organization.js';
import Department from '../../models/Department.js';
import User from '../../models/User.js';
import { USER_ROLES, INDUSTRIES } from '../../utils/constants.js';

describe('User Model', () => {
  let testOrg;
  let testDept;
  let testUser;

  beforeEach(async () => {
    // Create test organization
    testOrg = await Organization.create({
      name: 'User Test Org',
      email: 'userorg@example.com',
      phone: '+251912340000',
      industry: INDUSTRIES[0],
    });

    // Create test department
    testDept = await Department.create({
      name: 'User Test Dept',
      organization: testOrg._id,
    });
  });

  describe('User Creation', () => {
    test('should create user with valid data', async () => {
      testUser = await User.create({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'securePassword123',
        organization: testOrg._id,
        department: testDept._id,
      });

      expect(testUser._id).toBeDefined();
      expect(testUser.firstName).toBe('John');
      expect(testUser.email).toBe('john.doe@example.com');
      expect(testUser.role).toBe(USER_ROLES.USER); // Default role
      expect(testUser.isDeleted).toBe(false);
    });

    test('should fail without required fields', async () => {
      await expect(
        User.create({
          firstName: 'John',
          lastName: 'Doe',
        })
      ).rejects.toThrow();
    });

    test('should set default role to USER', async () => {
      testUser = await User.create({
        firstName: 'Default',
        lastName: 'Role',
        email: 'default@example.com',
        password: 'password123',
        organization: testOrg._id,
        department: testDept._id,
      });

      expect(testUser.role).toBe(USER_ROLES.USER);
    });

    test('should accept custom role', async () => {
      testUser = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'password123',
        role: USER_ROLES.ADMIN,
        organization: testOrg._id,
        department: testDept._id,
      });

      expect(testUser.role).toBe(USER_ROLES.ADMIN);
    });
  });

  describe('Password Hashing', () => {
    test('should hash password on creation', async () => {
      const plainPassword = 'mySecretPassword123';

      testUser = await User.create({
        firstName: 'Hash',
        lastName: 'Test',
        email: 'hash@example.com',
        password: plainPassword,
        organization: testOrg._id,
        department: testDept._id,
      });

      // Password in DB should not be plain text
      const userWithPassword = await User.findById(testUser._id).select('+password');
      expect(userWithPassword.password).toBeDefined();
      expect(userWithPassword.password).not.toBe(plainPassword);
      expect(userWithPassword.password.length).toBeGreaterThan(50); // Bcrypt hash length
    });

    test('should hash password on update', async () => {
      testUser = await User.create({
        firstName: 'Update',
        lastName: 'Password',
        email: 'updatepw@example.com',
        password: 'initialPassword123',
        organization: testOrg._id,
        department: testDept._id,
      });

      const userWithPassword = await User.findById(testUser._id).select('+password');
      const initialHash = userWithPassword.password;

      // Update password
      userWithPassword.password = 'newPassword456';
      await userWithPassword.save();

      const updatedUser = await User.findById(testUser._id).select('+password');
      expect(updatedUser.password).not.toBe(initialHash);
      expect(updatedUser.password).not.toBe('newPassword456');
    });

    test('should not rehash password if not modified', async () => {
      testUser = await User.create({
        firstName: 'No',
        lastName: 'Rehash',
        email: 'norehash@example.com',
        password: 'password123',
        organization: testOrg._id,
        department: testDept._id,
      });

      const userWithPassword = await User.findById(testUser._id).select('+password');
      const originalHash = userWithPassword.password;

      // Update other field
      userWithPassword.firstName = 'Updated';
      await userWithPassword.save();

      const updatedUser = await User.findById(testUser._id).select('+password');
      expect(updatedUser.password).toBe(originalHash); // Hash unchanged
    });
  });

  describe('comparePassword Method', () => {
    beforeEach(async () => {
      testUser = await User.create({
        firstName: 'Compare',
        lastName: 'Test',
        email: 'compare@example.com',
        password: 'correctPassword123',
        organization: testOrg._id,
        department: testDept._id,
      });
    });

    test('should return true for correct password', async () => {
      const userWithPassword = await User.findById(testUser._id).select('+password');
      const isMatch = await userWithPassword.comparePassword('correctPassword123');
      expect(isMatch).toBe(true);
    });

    test('should return false for incorrect password', async () => {
      const userWithPassword = await User.findById(testUser._id).select('+password');
      const isMatch = await userWithPassword.comparePassword('wrongPassword');
      expect(isMatch).toBe(false);
    });
  });

  describe('Unique Email per Organization', () => {
    beforeEach(async () => {
      testUser = await User.create({
        firstName: 'Unique',
        lastName: 'Email',
        email: 'unique@example.com',
        password: 'password123',
        organization: testOrg._id,
        department: testDept._id,
      });
    });

    test('should enforce unique email within organization', async () => {
      await expect(
        User.create({
          firstName: 'Duplicate',
          lastName: 'Email',
          email: 'unique@example.com',
          password: 'password123',
          organization: testOrg._id,
          department: testDept._id,
        })
      ).rejects.toThrow();
    });

    test('should allow same email in different organizations', async () => {
      const anotherOrg = await Organization.create({
        name: 'Another Org',
        email: 'anotheruserorg@example.com',
        phone: '+251923450000',
        industry: INDUSTRIES[0],
    });

      const anotherDept = await Department.create({
        name: 'Another Dept',
        organization: anotherOrg._id,
      });

      const user2 = await User.create({
        firstName: 'Same',
        lastName: 'Email',
        email: 'unique@example.com',
        password: 'password123',
        organization: anotherOrg._id,
        department: anotherDept._id,
      });

      expect(user2._id).toBeDefined();
      expect(user2.email).toBe('unique@example.com');
      expect(user2.organization.toString()).not.toBe(testOrg._id.toString());
    });

    test('should allow duplicate email for soft-deleted user in same org', async () => {
      // Soft delete the first user
      await testUser.softDelete();

      // Should be able to create new user with same email in same org
      const newUser = await User.create({
        firstName: 'New',
        lastName: 'User',
        email: 'unique@example.com',
        password: 'password123',
        organization: testOrg._id,
        department: testDept._id,
      });

      expect(newUser._id).toBeDefined();
      expect(newUser.email).toBe('unique@example.com');
    });
  });

  describe('Unique HOD per Department', () => {
    test('should allow only one HOD per department', async () => {
      const hod1 = await User.create({
        firstName: 'HOD',
        lastName: 'One',
        email: 'hod1@example.com',
        password: 'password123',
        organization: testOrg._id,
        department: testDept._id,
        isHod: true,
      });

      expect(hod1.isHod).toBe(true);

      // Try to create another HOD in same department
      await expect(
        User.create({
          firstName: 'HOD',
          lastName: 'Two',
          email: 'hod2@example.com',
          password: 'password123',
          organization: testOrg._id,
          department: testDept._id,
          isHod: true,
        })
      ).rejects.toThrow();
    });

    test('should allow HODs in different departments', async () => {
      const dept2 = await Department.create({
        name: 'Another Department',
        organization: testOrg._id,
      });

      const hod1 = await User.create({
        firstName: 'HOD',
        lastName: 'Dept1',
        email: 'hod.dept1@example.com',
        password: 'password123',
        organization: testOrg._id,
        department: testDept._id,
        isHod: true,
      });

      const hod2 = await User.create({
        firstName: 'HOD',
        lastName: 'Dept2',
        email: 'hod.dept2@example.com',
        password: 'password123',
        organization: testOrg._id,
        department: dept2._id,
        isHod: true,
      });

      expect(hod1.isHod).toBe(true);
      expect(hod2.isHod).toBe(true);
      expect(hod1.department.toString()).not.toBe(hod2.department.toString());
    });
  });

  describe('Cascade Delete Protections', () => {
    test('should prevent deletion of last SuperAdmin in organization', async () => {
      const superAdmin = await User.create({
        firstName: 'Last',
        lastName: 'SuperAdmin',
        email: 'lastsuperadmin@example.com',
        password: 'password123',
        role: USER_ROLES.SUPER_ADMIN,
        organization: testOrg._id,
        department: testDept._id,
      });

      await expect(
        User.softDeleteByIdWithCascade(superAdmin._id)
      ).rejects.toThrow('Cannot delete the last Super Admin');
    });

    test('should allow deletion of SuperAdmin if not the last one', async () => {
      const superAdmin1 = await User.create({
        firstName: 'Super',
        lastName: 'Admin1',
        email: 'superadmin1@example.com',
        password: 'password123',
        role: USER_ROLES.SUPER_ADMIN,
        organization: testOrg._id,
        department: testDept._id,
      });

      const superAdmin2 = await User.create({
        firstName: 'Super',
        lastName: 'Admin2',
        email: 'superadmin2@example.com',
        password: 'password123',
        role: USER_ROLES.SUPER_ADMIN,
        organization: testOrg._id,
        department: testDept._id,
      });

      // Should be able to delete one since there are two
      await User.softDeleteByIdWithCascade(superAdmin1._id);

      const deleted = await User.findById(superAdmin1._id).withDeleted();
      expect(deleted.isDeleted).toBe(true);
    });

    test('should prevent deletion of HOD', async () => {
      const hod = await User.create({
        firstName: 'Head',
        lastName: 'Of Department',
        email: 'hod@example.com',
        password: 'password123',
        organization: testOrg._id,
        department: testDept._id,
        isHod: true,
      });

      await expect(
        User.softDeleteByIdWithCascade(hod._id)
      ).rejects.toThrow('Cannot delete the Head of Department');
    });

    test('should allow deletion of regular user', async () => {
      const regularUser = await User.create({
        firstName: 'Regular',
        lastName: 'User',
        email: 'regular@example.com',
        password: 'password123',
        organization: testOrg._id,
        department: testDept._id,
      });

      await User.softDeleteByIdWithCascade(regularUser._id);

      const deleted = await User.findById(regularUser._id).withDeleted();
      expect(deleted.isDeleted).toBe(true);
    });
  });

  describe('Virtual Fields', () => {
    test('should have fullName virtual', async () => {
      testUser = await User.create({
        firstName: 'Virtual',
        lastName: 'Field',
        email: 'virtual@example.com',
        password: 'password123',
        organization: testOrg._id,
        department: testDept._id,
      });

      expect(testUser.fullName).toBe('Virtual Field');
    });
  });

  describe('Password Reset Token', () => {
    beforeEach(async () => {
      testUser = await User.create({
        firstName: 'Reset',
        lastName: 'Test',
        email: 'reset@example.com',
        password: 'password123',
        organization: testOrg._id,
        department: testDept._id,
      });
    });

    test('generatePasswordResetToken should create token and set expiry', async () => {
      const resetToken = testUser.generatePasswordResetToken();

      expect(resetToken).toBeDefined();
      expect(resetToken.length).toBeGreaterThan(0);
      expect(testUser.passwordResetToken).toBeDefined();
      expect(testUser.passwordResetExpires).toBeInstanceOf(Date);
      expect(testUser.passwordResetExpires.getTime()).toBeGreaterThan(Date.now());
    });

    test('verifyPasswordResetToken should validate correct token', async () => {
      const resetToken = testUser.generatePasswordResetToken();
      await testUser.save({ validateBeforeSave: false });

      const isValid = testUser.verifyPasswordResetToken(resetToken);
      expect(isValid).toBe(true);
    });

    test('verifyPasswordResetToken should reject incorrect token', async () => {
      testUser.generatePasswordResetToken();
      await testUser.save({ validateBeforeSave: false });

      const isValid = testUser.verifyPasswordResetToken('wrongtoken');
      expect(isValid).toBe(false);
    });

    test('clearPasswordResetToken should clear token fields', async () => {
      testUser.generatePasswordResetToken();
      await testUser.save({ validateBeforeSave: false });

      testUser.clearPasswordResetToken();
      await testUser.save();

      expect(testUser.passwordResetToken).toBeUndefined();
      expect(testUser.passwordResetExpires).toBeUndefined();
    });
  });

  describe('Soft Delete Integration', () => {
    test('should support soft delete via plugin', async () => {
      testUser = await User.create({
        firstName: 'Soft',
        lastName: 'Delete',
        email: 'softdelete@example.com',
        password: 'password123',
        organization: testOrg._id,
        department: testDept._id,
      });

      await testUser.softDelete();

      expect(testUser.isDeleted).toBe(true);

      // Should not be found in normal queries
      const found = await User.findById(testUser._id);
      expect(found).toBeNull();
    });

    test('should restore soft-deleted user', async () => {
      testUser = await User.create({
        firstName: 'Restore',
        lastName: 'User',
        email: 'restoreuser@example.com',
        password: 'password123',
        organization: testOrg._id,
        department: testDept._id,
      });

      await testUser.softDelete();
      await testUser.restore();

      expect(testUser.isDeleted).toBe(false);

      const found = await User.findById(testUser._id);
      expect(found).toBeTruthy();
    });
  });
});
