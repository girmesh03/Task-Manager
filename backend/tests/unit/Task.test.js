import { describe, test, expect, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import Organization from '../../models/Organization.js';
import Department from '../../models/Department.js';
import User from '../../models/User.js';
import Vendor from '../../models/Vendor.js';
import BaseTask from '../../models/BaseTask.js';
import ProjectTask from '../../models/ProjectTask.js';
import RoutineTask from '../../models/RoutineTask.js';
import AssignedTask from '../../models/AssignedTask.js';
import Material from '../../models/Material.js';
import { INDUSTRIES, TASK_STATUS, TASK_PRIORITY, MATERIAL_CATEGORIES, UNIT_TYPES } from '../../utils/constants.js';

describe('Task Models (Discriminator Pattern)', () => {
  let testOrg;
  let testDept;
  let testUser;
  let testMaterial;
  let testVendor;

  beforeEach(async () => {
    // Create test organization
    testOrg = await Organization.create({
      name: 'Task Test Org',
      email: 'taskorg@example.com',
      phone: '+251912340001',
      industry: INDUSTRIES[0],
    });

    // Create test department
    testDept = await Department.create({
      name: 'Task Test Dept',
      organization: testOrg._id,
    });

    // Create test user
    testUser = await User.create({
      firstName: 'Task',
      lastName: 'Creator',
      email: 'taskcreator@example.com',
      password: 'password123',
      organization: testOrg._id,
      department: testDept._id,
    });

    // Create test material
    testMaterial = await Material.create({
      name: 'Test Material',
      category: MATERIAL_CATEGORIES[0],
      quantity: 10,
      unit: UNIT_TYPES[0],
      organization: testOrg._id,
      department: testDept._id,
      createdBy: testUser._id,
    });

    // Create test vendor for ProjectTask
    testVendor = await Vendor.create({
      name: 'Test Vendor',
      organization: testOrg._id,
    });
  });

  describe('ProjectTask', () => {
    test('should create ProjectTask with valid data', async () => {
      const projectTask = await ProjectTask.create({
        title: 'Project Task 1',
        description: 'Test project task',
        organization: testOrg._id,
        department: testDept._id,
        createdBy: testUser._id,
        vendor: testVendor._id,
        estimatedCost: 1000,
        actualCost: 800,
        startDate: new Date('2025-01-01'),
        dueDate: new Date('2025-01-31'),
      });

      expect(projectTask._id).toBeDefined();
      expect(projectTask.taskType).toBe('ProjectTask');
      expect(projectTask.title).toBe('Project Task 1');
      expect(projectTask.estimatedCost).toBe(1000);
      expect(projectTask.actualCost).toBe(800);
      expect(projectTask.status).toBe(TASK_STATUS.TO_DO);
      expect(projectTask.priority).toBe(TASK_PRIORITY.MEDIUM);
    });

    test('should fail if endDate is before startDate', async () => {
      await expect(
        ProjectTask.create({
          title: 'Invalid Date Task',
          organization: testOrg._id,
          department: testDept._id,
          createdBy: testUser._id,
          vendor: testVendor._id,
          startDate: new Date('2025-01-31'),
          dueDate: new Date('2025-01-01'),
        })
      ).rejects.toThrow('End date must be after start date');
    });

    test('should enforce max watchers limit', async () => {
      const watchers = Array(11).fill(testUser._id);
      await expect(
        ProjectTask.create({
          title: 'Too Many Watchers',
          organization: testOrg._id,
          department: testDept._id,
          createdBy: testUser._id,
          vendor: testVendor._id,
          watchers,
        })
      ).rejects.toThrow();
    });

    test('should enforce max tags limit', async () => {
      const tags = Array(11).fill('tag');
      await expect(
        ProjectTask.create({
          title: 'Too Many Tags',
          organization: testOrg._id,
          department: testDept._id,
          createdBy: testUser._id,
          vendor: testVendor._id,
          tags,
        })
      ).rejects.toThrow();
    });
  });

  describe('RoutineTask', () => {
    test('should create RoutineTask with valid data', async () => {
      const routineTask = await RoutineTask.create({
        title: 'Routine Task 1',
        description: 'Test routine task',
        organization: testOrg._id,
        department: testDept._id,
        createdBy: testUser._id,
        materials: [testMaterial._id],
        date: new Date('2025-01-01'),
      });

      expect(routineTask._id).toBeDefined();
      expect(routineTask.taskType).toBe('RoutineTask');
      expect(routineTask.title).toBe('Routine Task 1');
      expect(routineTask.materials).toHaveLength(1);
      expect(routineTask.date).toBeInstanceOf(Date);
    });

    test('should fail if date is in future', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      await expect(
        RoutineTask.create({
          title: 'Future Date Task',
          organization: testOrg._id,
          department: testDept._id,
          createdBy: testUser._id,
          date: futureDate,
        })
      ).rejects.toThrow('Routine task date cannot be in the future');
    });

    test('should fail without required date field', async () => {
      await expect(
        RoutineTask.create({
          title: 'No Date Task',
          organization: testOrg._id,
          department: testDept._id,
          createdBy: testUser._id,
        })
      ).rejects.toThrow();
    });
  });

  describe('AssignedTask', () => {
    test('should create AssignedTask with valid data', async () => {
      const assignedTask = await AssignedTask.create({
        title: 'Assigned Task 1',
        description: 'Test assigned task',
        organization: testOrg._id,
        department: testDept._id,
        createdBy: testUser._id,
        assignee: testUser._id,
        dueDate: new Date('2025-12-31'),
      });

      expect(assignedTask._id).toBeDefined();
      expect(assignedTask.taskType).toBe('AssignedTask');
      expect(assignedTask.title).toBe('Assigned Task 1');
      expect(assignedTask.assignee.toString()).toBe(testUser._id.toString());
    });

    test('should fail without required assignee field', async () => {
      await expect(
        AssignedTask.create({
          title: 'No Assignee Task',
          organization: testOrg._id,
          department: testDept._id,
          createdBy: testUser._id,
        })
      ).rejects.toThrow();
    });

    test('should fail if completedDate is before dueDate', async () => {
      await expect(
        AssignedTask.create({
          title: 'Invalid Completion',
          organization: testOrg._id,
          department: testDept._id,
          createdBy: testUser._id,
          assignee: testUser._id,
          dueDate: new Date('2025-12-31'),
          completedDate: new Date('2025-01-01'),
        })
      ).rejects.toThrow('Completed date cannot be before due date');
    });
  });

  describe('BaseTask Validation', () => {
    test('should fail if department does not belong to organization', async () => {
      const anotherOrg = await Organization.create({
        name: 'Another Org',
        email: 'anotherorg@example.com',
        phone: '+251912340002',
        industry: INDUSTRIES[0],
      });

      await expect(
        ProjectTask.create({
          title: 'Invalid Org/Dept',
          organization: anotherOrg._id,
          department: testDept._id, // Belongs to testOrg, not anotherOrg
          createdBy: testUser._id,
          vendor: testVendor._id,
        })
      ).rejects.toThrow('Department does not belong to the specified organization');
    });

    test('should support soft delete', async () => {
      const task = await ProjectTask.create({
        title: 'Delete Test',
        organization: testOrg._id,
        department: testDept._id,
        createdBy: testUser._id,
        vendor: testVendor._id,
      });

      await task.softDelete();

      expect(task.isDeleted).toBe(true);
      const found = await ProjectTask.findById(task._id);
      expect(found).toBeNull();

      const withDeleted = await ProjectTask.findById(task._id).withDeleted();
      expect(withDeleted).toBeTruthy();
    });
  });
});
