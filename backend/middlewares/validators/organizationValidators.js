import { body, param, query } from 'express-validator';
import { Organization } from '../../models/index.js';
import validate from './validation.js';
import { INDUSTRIES, LENGTH_LIMITS, PAGINATION } from '../../utils/constants.js';

const validateUpdateOrganization = [
  param('organizationId')
    .isMongoId()
    .withMessage('Invalid organization ID')
    .custom(async (value) => {
      const org = await Organization.findById(value).withDeleted();
      if (!org) {
        throw new Error('Organization not found');
      }
      return true;
    }),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Organization name cannot be empty')
    .isLength({ max: LENGTH_LIMITS.ORG_NAME_MAX })
    .withMessage(`Organization name cannot exceed ${LENGTH_LIMITS.ORG_NAME_MAX} characters`)
    .custom(async (value, { req }) => {
      const org = await Organization.findOne({
        name: value,
        _id: { $ne: req.params.organizationId }
      }).withDeleted();
      if (org) {
        throw new Error('Organization name already exists');
      }
      return true;
    }),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email')
    .isLength({ max: LENGTH_LIMITS.EMAIL_MAX })
    .custom(async (value, { req }) => {
      const org = await Organization.findOne({
        email: value,
        _id: { $ne: req.params.organizationId }
      }).withDeleted();
      if (org) {
        throw new Error('Organization email already exists');
      }
      return true;
    }),
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+251\d{9}|0\d{9})$/)
    .withMessage('Please provide a valid Ethiopian phone number (+251XXXXXXXXX or 0XXXXXXXXX)')
    .custom(async (value, { req }) => {
      const org = await Organization.findOne({
        phone: value,
        _id: { $ne: req.params.organizationId }
      }).withDeleted();
      if (org) {
        throw new Error('Organization phone already exists');
      }
      return true;
    }),
  body('industry')
    .optional()
    .isIn(INDUSTRIES)
    .withMessage('Invalid industry selected'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: LENGTH_LIMITS.ADDRESS_MAX }),
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: LENGTH_LIMITS.ADDRESS_MAX }),
  body('address.state')
    .optional()
    .trim()
    .isLength({ max: LENGTH_LIMITS.ADDRESS_MAX }),
  body('address.zipCode')
    .optional()
    .trim()
    .isLength({ max: 20 }),
  body('address.country')
    .optional()
    .trim()
    .isLength({ max: LENGTH_LIMITS.ADDRESS_MAX }),
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid website URL'),
  body('logo')
    .optional()
    .isObject()
    .withMessage('Logo must be an object with url and publicId')
    .custom((value) => {
      if (!value.url || !value.publicId) {
        throw new Error('Logo must contain url and publicId');
      }
      return true;
    }),
  body('logo.url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid logo URL'),
  body('logo.publicId')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Logo publicId is required'),
  validate,
];

const validateGetOrganization = [
  param('organizationId')
    .isMongoId()
    .withMessage('Invalid organization ID')
    .custom(async (value) => {
      const org = await Organization.findById(value).withDeleted();
      if (!org) {
        throw new Error('Organization not found');
      }
      return true;
    }),
  validate,
];

const validateGetAllOrganizations = [
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
  query('industry')
    .optional()
    .isIn(INDUSTRIES)
    .withMessage('Invalid industry filter'),
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
  validateUpdateOrganization,
  validateGetOrganization,
  validateGetAllOrganizations,
};
