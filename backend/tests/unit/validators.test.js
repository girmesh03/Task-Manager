import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';
import { validateUpdateOrganization } from '../../middlewares/validators/organizationValidators.js';
import { validateCreateDepartment } from '../../middlewares/validators/departmentValidators.js';
import { validateCreateTask } from '../../middlewares/validators/taskValidators.js';
import { validateCreateMaterial } from '../../middlewares/validators/materialValidators.js';
import { Organization, Department, User, BaseTask, Material, Vendor } from '../../models/index.js';
import errorHandler from '../../errorHandler/ErrorController.js';

// Mock Models
// Models are not mocked via jest.mock to avoid ESM issues.
// We will spy on them in beforeAll.

const app = express();
app.use(express.json());

// Mock Auth Middleware to set req.user
app.use((req, res, next) => {
  req.user = {
    _id: 'userId',
    organization: 'orgId',
    department: 'deptId',
  };
  next();
});

// Routes for testing
app.patch('/organizations/:organizationId', validateUpdateOrganization, (req, res) => res.status(200).json({ success: true }));
app.post('/departments', validateCreateDepartment, (req, res) => res.status(200).json({ success: true }));
app.post('/tasks', validateCreateTask, (req, res) => res.status(200).json({ success: true }));
app.post('/materials', validateCreateMaterial, (req, res) => res.status(200).json({ success: true }));

app.use(errorHandler);

describe('Validators', () => {
  beforeAll(() => {
    jest.spyOn(Organization, 'findById').mockImplementation(() => {});
    jest.spyOn(Organization, 'findOne').mockImplementation(() => {});
    jest.spyOn(Department, 'findById').mockImplementation(() => {});
    jest.spyOn(Department, 'findOne').mockImplementation(() => {});
    jest.spyOn(User, 'findById').mockImplementation(() => {});
    jest.spyOn(User, 'findOne').mockImplementation(() => {});
    jest.spyOn(BaseTask, 'findById').mockImplementation(() => {});
    jest.spyOn(Material, 'findById').mockImplementation(() => {});
    jest.spyOn(Material, 'findOne').mockImplementation(() => {});
    jest.spyOn(Vendor, 'findById').mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mocks
    Organization.findById.mockReturnValue({ withDeleted: jest.fn().mockResolvedValue({ _id: 'orgId' }) });
    Organization.findOne.mockReturnValue({ withDeleted: jest.fn().mockResolvedValue(null) });
    Department.findById.mockReturnValue({ withDeleted: jest.fn().mockResolvedValue({ _id: 'deptId', organization: 'orgId' }) });
    Department.findOne.mockReturnValue({ withDeleted: jest.fn().mockResolvedValue(null) });
    User.findById.mockReturnValue({ withDeleted: jest.fn().mockResolvedValue({ _id: 'userId', organization: 'orgId' }) });
    User.findOne.mockResolvedValue({ _id: '507f1f77bcf86cd799439011', organization: 'orgId', department: 'deptId' });
    Material.findOne.mockReturnValue({ withDeleted: jest.fn().mockResolvedValue(null) });
    Vendor.findById.mockReturnValue({ withDeleted: jest.fn().mockResolvedValue({ _id: 'vendorId' }) });
  });

  describe('Organization Validator', () => {
    test('should validate valid update', async () => {
      const res = await request(app)
        .patch('/organizations/507f1f77bcf86cd799439011')
        .send({ name: 'New Name' });
      expect(res.status).toBe(200);
    });

    test('should fail if name exists', async () => {
      Organization.findOne.mockReturnValue({ withDeleted: jest.fn().mockResolvedValue({ _id: 'otherId' }) });
      const res = await request(app)
        .patch('/organizations/507f1f77bcf86cd799439011')
        .send({ name: 'Existing Name' });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Organization name already exists');
    });
  });

  describe('Department Validator', () => {
    test('should validate valid create', async () => {
      const res = await request(app)
        .post('/departments')
        .send({ name: 'New Dept' });
      expect(res.status).toBe(200);
    });

    test('should fail if name exists in org', async () => {
      Department.findOne.mockReturnValue({ withDeleted: jest.fn().mockResolvedValue({ _id: 'existingId' }) });
      const res = await request(app)
        .post('/departments')
        .send({ name: 'Existing Dept' });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Department name already exists');
    });

    test('should fail if HOD set during creation', async () => {
      const res = await request(app)
        .post('/departments')
        .send({ name: 'Dept', hod: '507f1f77bcf86cd799439011' });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Cannot set HOD during creation');
    });
  });

  describe('Task Validator', () => {
    test('should validate valid ProjectTask', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({
          title: 'Task',
          description: 'Description',
          taskType: 'ProjectTask',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
          priority: 'High'
        });
      expect(res.status).toBe(200);
    });

    test('should fail if taskType missing', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'Task' });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('taskType is required');
    });

    test('should validate AssignedTask assignee', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({
          title: 'Task',
          description: 'Description',
          taskType: 'AssignedTask',
          assigneeIds: '507f1f77bcf86cd799439011',
          startDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 86400000).toISOString()
        });
      expect(res.status).toBe(200);
    });

    test('should fail AssignedTask without assignee', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({
          title: 'Task',
          description: 'Description',
          taskType: 'AssignedTask',
          startDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 86400000).toISOString()
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Assignee is required');
    });
  });

  describe('Material Validator', () => {
    test('should validate valid material', async () => {
      const res = await request(app)
        .post('/materials')
        .send({
          name: 'Material A',
          category: 'Hardware',
          unit: 'pcs'
        });
      expect(res.status).toBe(200);
    });

    test('should fail if invalid category', async () => {
      const res = await request(app)
        .post('/materials')
        .send({
          name: 'Material A',
          category: 'Invalid',
          unit: 'pcs'
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid category');
    });
  });
});
