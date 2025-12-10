import { describe, test, expect, beforeEach } from '@jest/globals';
import Organization from '../../models/Organization.js';
import Department from '../../models/Department.js';
import User from '../../models/User.js';
import Material from '../../models/Material.js';
import Vendor from '../../models/Vendor.js';
import { INDUSTRIES, MATERIAL_CATEGORIES, UNIT_TYPES } from '../../utils/constants.js';

describe('Material and Vendor Models', () => {
  let testOrg;
  let testDept;
  let testUser;

  beforeEach(async () => {
    testOrg = await Organization.create({
      name: 'Material Vendor Test Org',
      email: 'mvorg@example.com',
      phone: '+251912340003',
      industry: INDUSTRIES[0],
    });

    testDept = await Department.create({
      name: 'Material Vendor Test Dept',
      organization: testOrg._id,
    });

    testUser = await User.create({
      firstName: 'Material',
      lastName: 'Manager',
      email: 'materialmanager@example.com',
      password: 'password123',
      organization: testOrg._id,
      department: testDept._id,
    });
  });

  describe('Material Model', () => {
    test('should create material with valid data', async () => {
      const material = await Material.create({
        name: 'Steel Pipe',
        description: 'Heavy duty steel pipe',
        category: MATERIAL_CATEGORIES[0],
        quantity: 50,
        unit: UNIT_TYPES[0],
        unitPrice: 100,
        supplier: 'Steel Co.',
        location: 'Warehouse A',
        organization: testOrg._id,
        department: testDept._id,
        createdBy: testUser._id,
      });

      expect(material._id).toBeDefined();
      expect(material.name).toBe('Steel Pipe');
      expect(material.quantity).toBe(50);
      expect(material.unit).toBe(UNIT_TYPES[0]);
      expect(material.isDeleted).toBe(false);
    });

    test('should auto-calculate totalPrice', async () => {
      const material = await Material.create({
        name: 'Cement Bags',
        category: MATERIAL_CATEGORIES[0],
        quantity: 20,
        unit: UNIT_TYPES[0],
        unitPrice: 50,
        organization: testOrg._id,
        department: testDept._id,
        createdBy: testUser._id,
      });

      expect(material.totalPrice).toBe(1000); // 20 * 50
    });

    test('should fail without required fields', async () => {
      await expect(
        Material.create({
          name: 'Incomplete Material',
          organization: testOrg._id,
        })
      ).rejects.toThrow();
    });

    test('should fail with invalid category', async () => {
      await expect(
        Material.create({
          name: 'Invalid Category',
          category: 'InvalidCategory',
          quantity: 10,
          unit: UNIT_TYPES[0],
          organization: testOrg._id,
          department: testDept._id,
          createdBy: testUser._id,
        })
      ).rejects.toThrow();
    });

    test('should support soft delete with 180-day TTL', async () => {
      const material = await Material.create({
        name: 'Delete Test',
        category: MATERIAL_CATEGORIES[0],
        quantity: 5,
        unit: UNIT_TYPES[0],
        organization: testOrg._id,
        department: testDept._id,
        createdBy: testUser._id,
      });

      await material.softDelete();

      expect(material.isDeleted).toBe(true);
      expect(material.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('Vendor Model', () => {
    test('should create vendor with valid data', async () => {
      const vendor = await Vendor.create({
        name: 'ABC Services',
        description: 'General maintenance services',
        email: 'contact@abcservices.com',
        phone: '+251911111111',
        address: '123 Main St',
        contactPerson: 'John Doe',
        organization: testOrg._id,
        createdBy: testUser._id,
      });

      expect(vendor._id).toBeDefined();
      expect(vendor.name).toBe('ABC Services');
      expect(vendor.email).toBe('contact@abcservices.com');
      expect(vendor.isDeleted).toBe(false);
    });

    test('should NOT have department field (organization-scoped)', async () => {
      const vendor = await Vendor.create({
        name: 'XYZ Services',
        email: 'contact@xyzservices.com',
        phone: '+251922222222',
        organization: testOrg._id,
        createdBy: testUser._id,
      });

      expect(vendor.department).toBeUndefined();
    });

    test('should enforce unique email per organization', async () => {
      await Vendor.create({
        name: 'First Vendor',
        email: 'unique@vendor.com',
        phone: '+251933333333',
        organization: testOrg._id,
        createdBy: testUser._id,
      });

      await expect(
        Vendor.create({
          name: 'Second Vendor',
          email: 'unique@vendor.com', // Duplicate email
          phone: '+251944444444',
          organization: testOrg._id,
          createdBy: testUser._id,
        })
      ).rejects.toThrow();
    });

    test('should enforce unique phone per organization', async () => {
      await Vendor.create({
        name: 'First Vendor',
        email: 'first@vendor.com',
        phone: '+251955555555',
        organization: testOrg._id,
        createdBy: testUser._id,
      });

      await expect(
        Vendor.create({
          name: 'Second Vendor',
          email: 'second@vendor.com',
          phone: '+251955555555', // Duplicate phone
          organization: testOrg._id,
          createdBy: testUser._id,
        })
      ).rejects.toThrow();
    });

    test('should allow same email in different organizations', async () => {
      const anotherOrg = await Organization.create({
        name: 'Another Org',
        email: 'anotherorg2@example.com',
        phone: '+251912340004',
        industry: INDUSTRIES[0],
      });

      await Vendor.create({
        name: 'Vendor 1',
        email: 'shared@vendor.com',
        phone: '+251966666666',
        organization: testOrg._id,
        createdBy: testUser._id,
      });

      const vendor2 = await Vendor.create({
        name: 'Vendor 2',
        email: 'shared@vendor.com', // Same email, different org
        phone: '+251977777777',
        organization: anotherOrg._id,
      });

      expect(vendor2._id).toBeDefined();
    });

    test('should support soft delete', async () => {
      const vendor = await Vendor.create({
        name: 'Delete Test Vendor',
        email: 'delete@vendor.com',
        phone: '+251988888888',
        organization: testOrg._id,
        createdBy: testUser._id,
      });

      await vendor.softDelete();

      expect(vendor.isDeleted).toBe(true);
      const found = await Vendor.findById(vendor._id);
      expect(found).toBeNull();
    });
  });
});
