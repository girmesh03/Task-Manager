import { body, param, query } from 'express-validator';
import { Vendor } from '../../models/index.js';
import validate from './validation.js';
import { LENGTH_LIMITS, PAGINATION } from '../../utils/constants.js';

const validateCreateVendor = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Vendor name is required')
    .isLength({ max: LENGTH_LIMITS.MAX_NAME_LENGTH })
    .withMessage(`Name cannot exceed ${LENGTH_LIMITS.MAX_NAME_LENGTH} characters`)
    .custom(async (value, { req }) => {
      const orgId = req.user?.organization?._id || req.user?.organization;
      const vendor = await Vendor.findOne({
        name: value,
        organization: orgId
      }).withDeleted();
      if (vendor) {
        throw new Error('Vendor name already exists in this organization');
      }
      return true;
    }),
  body('contactPerson')
    .optional()
    .trim()
    .isLength({ max: LENGTH_LIMITS.MAX_NAME_LENGTH }),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email')
    .isLength({ max: LENGTH_LIMITS.MAX_EMAIL_LENGTH }),
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+251\d{9}|0\d{9})$/)
    .withMessage('Please provide a valid Ethiopian phone number'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: LENGTH_LIMITS.MAX_ADDRESS_LENGTH }),
  body('services')
    .optional()
    .isArray()
    .withMessage('Services must be an array'),
  body('services.*')
    .trim()
    .notEmpty()
    .withMessage('Service cannot be empty'),
  validate,
];

const validateUpdateVendor = [
  param('vendorId')
    .isMongoId()
    .withMessage('Vendor ID is required')
    .custom(async (value, { req }) => {
      const orgId = req.user?.organization?._id || req.user?.organization;
      const vendor = await Vendor.findOne({
        _id: value,
        organization: orgId,
      }).withDeleted();
      if (!vendor) {
        throw new Error('Vendor not found in your organization');
      }
      return true;
    }),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .isLength({ max: LENGTH_LIMITS.MAX_NAME_LENGTH })
    .custom(async (value, { req }) => {
      const orgId = req.user?.organization?._id || req.user?.organization;
      const existing = await Vendor.findOne({
        name: value,
        organization: orgId,
        _id: { $ne: req.params.vendorId }
      }).withDeleted();

      if (existing) {
        throw new Error('Vendor name already exists in this organization');
      }
      return true;
    }),
  body('email')
    .optional()
    .trim()
    .isEmail(),
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+251\d{9}|0\d{9})$/),
  validate,
];

const validateGetVendor = [
  param('vendorId')
    .isMongoId()
    .withMessage('Invalid vendor ID')
    .custom(async (value, { req }) => {
      const orgId = req.user?.organization?._id || req.user?.organization;
      const vendor = await Vendor.findOne({
        _id: value,
        organization: orgId,
      }).withDeleted();
      if (!vendor) {
        throw new Error('Vendor not found in your organization');
      }
      return true;
    }),
  validate,
];

const validateDeleteVendor = [
  param('vendorId')
    .isMongoId()
    .withMessage('Invalid vendor ID')
    .custom(async (value, { req }) => {
      const orgId = req.user?.organization?._id || req.user?.organization;
      const vendor = await Vendor.findOne({
        _id: value,
        organization: orgId,
        isDeleted: false,
      });
      if (!vendor) {
        throw new Error('Vendor not found in your organization');
      }
      return true;
    }),
  validate,
];

const validateRestoreVendor = [
  param('vendorId')
    .isMongoId()
    .withMessage('Invalid vendor ID')
    .custom(async (value, { req }) => {
      const orgId = req.user?.organization?._id || req.user?.organization;
      const vendor = await Vendor.findOne({
        _id: value,
        organization: orgId,
      }).withDeleted();
      if (!vendor || vendor.isDeleted !== true) {
        throw new Error('Soft-deleted vendor not found in your organization');
      }
      return true;
    }),
  validate,
];

const validateGetAllVendors = [
  query('page')
    .optional()
    .isInt({ min: 1 }),
  query('limit')
    .optional()
    .isInt({ min: 1, max: PAGINATION.MAX_LIMIT }),
  query('search')
    .optional()
    .trim(),
  query('sortBy')
    .optional()
    .isString(),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc']),
  query('deleted')
    .optional()
    .isBoolean()
    .withMessage('Deleted must be a boolean'),
  validate,
];

export {
  validateCreateVendor,
  validateUpdateVendor,
  validateGetVendor,
  validateDeleteVendor,
  validateRestoreVendor,
  validateGetAllVendors,
};
