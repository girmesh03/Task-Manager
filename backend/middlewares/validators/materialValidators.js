import { body, param, query } from 'express-validator';
import { Material, Vendor } from '../../models/index.js';
import validate from './validation.js';
import {
  MATERIAL_CATEGORIES,
  UNIT_TYPES,
  LENGTH_LIMITS,
  PAGINATION
} from '../../utils/constants.js';

const validateCreateMaterial = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Material name is required')
    .isLength({ max: LENGTH_LIMITS.MAX_NAME_LENGTH })
    .withMessage(`Name cannot exceed ${LENGTH_LIMITS.MAX_NAME_LENGTH} characters`)
    .custom(async (value, { req }) => {
      // Check uniqueness within department
      // If user is creating, it's for their department (or specified).
      const deptId = req.user.department._id;
      if (deptId) {
        const mat = await Material.findOne({
          name: value,
          department: deptId
        }).withDeleted();
        if (mat) {
          throw new Error('Material name already exists in this department');
        }
      }
      return true;
    }),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isIn(MATERIAL_CATEGORIES)
    .withMessage('Invalid category'),
  body('unit')
    .trim()
    .notEmpty()
    .withMessage('Unit is required')
    .isIn(UNIT_TYPES)
    .withMessage('Invalid unit type'),
  body('quantity')
    .optional() // Default 0
    .isFloat({ min: 0 })
    .withMessage('Quantity must be non-negative'),
  body('unitPrice')
    .optional() // Default 0
    .isFloat({ min: 0 })
    .withMessage('Unit price must be non-negative'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),

  validate,
];

const validateUpdateMaterial = [
  param('materialId')
    .isMongoId()
    .withMessage('Invalid material ID')
    .custom(async (value) => {
      const mat = await Material.findById(value).withDeleted();
      if (!mat) {
        throw new Error('Material not found');
      }
      return true;
    }),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .isLength({ max: LENGTH_LIMITS.MAX_NAME_LENGTH })
    .custom(async (value, { req }) => {
      const mat = await Material.findById(req.params.materialId);
      if (!mat) return true;

      const existing = await Material.findOne({
        name: value,
        department: mat.department,
        _id: { $ne: req.params.materialId }
      }).withDeleted();

      if (existing) {
        throw new Error('Material name already exists in this department');
      }
      return true;
    }),
  body('category')
    .optional()
    .isIn(MATERIAL_CATEGORIES),
  body('unit')
    .optional()
    .isIn(UNIT_TYPES),
  body('quantity')
    .optional()
    .isFloat({ min: 0 }),
  body('unitPrice')
    .optional()
    .isFloat({ min: 0 }),
  body('vendor')
    .optional()
    .isMongoId()
    .custom(async (value) => {
      const vendor = await Vendor.findById(value).withDeleted();
      if (!vendor) {
        throw new Error('Vendor not found');
      }
      return true;
    }),
  validate,
];

const validateGetMaterial = [
  param('materialId')
    .isMongoId()
    .withMessage('Invalid material ID')
    .custom(async (value) => {
      const mat = await Material.findById(value).withDeleted();
      if (!mat) {
        throw new Error('Material not found');
      }
      return true;
    }),
  validate,
];

const validateGetAllMaterials = [
  query('page')
    .optional()
    .isInt({ min: 1 }),
  query('limit')
    .optional()
    .isInt({ min: 1, max: PAGINATION.MAX_LIMIT }),
  query('category')
    .optional()
    .isIn(MATERIAL_CATEGORIES),
  query('search')
    .optional()
    .trim(),
  query('lowStock')
    .optional()
    .isBoolean(),
  query('sortBy')
    .optional()
    .isString(),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc']),
  query('deleted')
    .optional()
    .isBoolean(),
  validate,
];

export {
  validateCreateMaterial,
  validateUpdateMaterial,
  validateGetMaterial,
  validateGetAllMaterials,
};
