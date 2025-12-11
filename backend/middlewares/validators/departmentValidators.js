import { body, param, query } from 'express-validator';
import { Department, User, Organization } from '../../models/index.js';
import validate from './validation.js';
import { LENGTH_LIMITS, PAGINATION } from '../../utils/constants.js';

const validateCreateDepartment = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Department name is required')
    .isLength({ max: LENGTH_LIMITS.MAX_NAME_LENGTH })
    .withMessage(`Department name cannot exceed ${LENGTH_LIMITS.MAX_NAME_LENGTH} characters`)
    .custom(async (value, { req }) => {
      // Check uniqueness within organization
      // Can only be created with the caller organization
      const orgId = req.user.organization;

      const dept = await Department.findOne({
        name: value,
        organization: orgId
      }).withDeleted();

      if (dept) {
        throw new Error('Department name already exists in this organization');
      }
      return true;
    }),
  body('description')
    .optional()
    .trim()
    .isLength({ max: LENGTH_LIMITS.MAX_DESCRIPTION_LENGTH })
    .withMessage(`Description cannot exceed ${LENGTH_LIMITS.MAX_DESCRIPTION_LENGTH} characters`),
  body('organization').not().exists().withMessage('Cannot set organization manually'),
  body('hod').not().exists().withMessage('Cannot set HOD during creation'),
  validate,
];

const validateUpdateDepartment = [
  param('departmentId')
    .isMongoId()
    .withMessage('Invalid department ID')
    .custom(async (value, { req }) => {
      const dept = await Department.findOne({
        _id: value,
        organization: req.user.organization
      }).withDeleted();
      if (!dept) {
        throw new Error('Department not found');
      }
      return true;
    }),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Department name cannot be empty')
    .isLength({ max: LENGTH_LIMITS.MAX_NAME_LENGTH })
    .withMessage(`Department name cannot exceed ${LENGTH_LIMITS.MAX_NAME_LENGTH} characters`)
    .custom(async (value, { req }) => {
      const existing = await Department.findOne({
        name: value,
        organization: req.user.organization,
        _id: { $ne: req.params.departmentId }
      }).withDeleted();

      if (existing) {
        throw new Error('Department name already exists in this organization');
      }
      return true;
    }),
  body('description')
    .optional()
    .trim()
    .isLength({ max: LENGTH_LIMITS.MAX_DESCRIPTION_LENGTH }),
  body('hod')
    .optional()
    .isMongoId()
    .withMessage('Invalid HOD User ID')
    .custom(async (value, { req }) => {
      const user = await User.findOne({
        _id: value,
        organization: req.user.organization
      }).withDeleted();

      if (!user) {
        throw new Error('HOD user not found in this organization');
      }

      // Check if user belongs to the department being updated?
      // "scope is req.user.organization._id and req.user.department._id"
      // This implies HOD must be in the same department?
      // Usually HOD is HEAD of that department, so they should be IN that department.
      // But we are assigning them AS HOD.
      // If they are not in the department, should we move them?
      // The comment says "scope is req.user.organization._id and req.user.department._id".
      // This might mean the *caller* must be in the same org/dept?
      // Or the *HOD candidate* must be in the same org (checked) and same dept?
      // Let's assume HOD candidate must be in the organization.
      // The comment "if not provided to be used req.user.department._id" was on `const dept = ...`.
      // The comment on HOD was "make sure defined on schema and can't be added on creating department. can be added when updating department. Note, a user to be hod must have SuperAdmin or Admin role."
      // So we should check role.

      if (!['SuperAdmin', 'Admin'].includes(user.role)) {
         throw new Error('HOD must have SuperAdmin or Admin role');
      }

      return true;
    }),

  validate,
];

const validateGetDepartment = [
  param('departmentId')
    .isMongoId()
    .withMessage('Invalid department ID')
    .custom(async (value, { req }) => {
      const dept = await Department.findOne({
        _id: value,
        organization: req.user.organization
      }).withDeleted();
      if (!dept) {
        throw new Error('Department not found');
      }
      return true;
    }),
  validate,
];

const validateGetAllDepartments = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: PAGINATION.MAX_LIMIT })
    .withMessage(`Limit must be between 1 and ${PAGINATION.MAX_LIMIT}`),
  query('search')
    .optional()
    .trim(),
  query('organizationId')
    .optional()
    .isMongoId()
    .withMessage('Invalid organization ID'),
  query('sortBy')
    .optional()
    .isString(),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('deleted')
    .optional()
    .isBoolean()
    .withMessage('deleted must be a boolean'),
  validate,
];

export {
  validateCreateDepartment,
  validateUpdateDepartment,
  validateGetDepartment,
  validateGetAllDepartments,
};
