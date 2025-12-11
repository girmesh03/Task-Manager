import { body, query, param } from 'express-validator';
import { User, Department } from '../../models/index.js';
import validate from './validation.js';
import { USER_ROLES, LENGTH_LIMITS, PAGINATION } from '../../utils/constants.js';

const validateCreateUser = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isAlpha()
    .withMessage('First name must contain only alphabets')
    .isLength({ max: LENGTH_LIMITS.USER_NAME_MAX })
    .withMessage(`First name cannot exceed ${LENGTH_LIMITS.USER_NAME_MAX} characters`),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isAlpha()
    .withMessage('Last name must contain only alphabets')
    .isLength({ max: LENGTH_LIMITS.USER_NAME_MAX })
    .withMessage(`Last name cannot exceed ${LENGTH_LIMITS.USER_NAME_MAX} characters`),
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .isLength({ max: LENGTH_LIMITS.EMAIL_MAX })
    .withMessage(`Email cannot exceed ${LENGTH_LIMITS.EMAIL_MAX} characters`)
    .custom(async (value, { req }) => {
      const user = await User.findOne({
        email: value,
        organization: req.user.organization
      }).withDeleted();
      if (user) {
        throw new Error('Email already exists');
      }
      return true;
    }),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: LENGTH_LIMITS.PASSWORD_MIN })
    .withMessage(`Password must be at least ${LENGTH_LIMITS.PASSWORD_MIN} characters`),
  body('role')
    .optional()
    .isIn(Object.values(USER_ROLES))
    .withMessage('Invalid role'),
  body('departmentId')
    .trim()
    .notEmpty()
    .withMessage('Department is required')
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
      // Convert departmentId to department for controller
      req.body.department = value;
      return true;
    }),
  body('position')
    .optional()
    .trim()
    .isLength({ max: LENGTH_LIMITS.POSITION_MAX })
    .withMessage(`Position cannot exceed ${LENGTH_LIMITS.POSITION_MAX} characters`),
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+251\d{9}|0\d{9})$/)
    .withMessage('Please provide a valid Ethiopian phone number (+251XXXXXXXXX or 0XXXXXXXXX)'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array')
    .custom((value) => {
      if (value.length > 10) {
        throw new Error('Cannot have more than 10 skills');
      }
      return true;
    }),
  body('skills.*.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Skill name is required')
    .isLength({ max: LENGTH_LIMITS.SKILL_NAME_MAX })
    .withMessage(`Skill name cannot exceed ${LENGTH_LIMITS.SKILL_NAME_MAX} characters`),
  body('skills.*.proficiency')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Proficiency must be between 0 and 100'),
  validate,
];

const validateGetAllUsers = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: PAGINATION.MAX_LIMIT })
    .withMessage(`Limit must be between 1 and ${PAGINATION.MAX_LIMIT}`),
  query('sortBy')
    .optional()
    .isString(),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('role')
    .optional()
    .isIn(Object.values(USER_ROLES))
    .withMessage('Invalid role filter'),
  query('departmentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid department ID')
    .custom((value, { req }) => {
      req.query.department = value;
      return true;
    }),
  query('deleted')
    .optional()
    .isBoolean()
    .withMessage('deleted must be a boolean'),
  validate,
];

const validateGetUser = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID')
    .custom(async (value, { req }) => {
      const user = await User.findOne({
        _id: value,
        organization: req.user.organization
      }).withDeleted();
      if (!user) {
        throw new Error('User not found');
      }
      return true;
    }),
  validate,
];

const validateUpdateUser = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID')
    .custom(async (value, { req }) => {
      const user = await User.findOne({
        _id: value,
        organization: req.user.organization
      }).withDeleted();
      if (!user) {
        throw new Error('User not found');
      }
      return true;
    }),
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .isAlpha()
    .withMessage('First name must contain only alphabets')
    .isLength({ max: LENGTH_LIMITS.USER_NAME_MAX }),
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .isAlpha()
    .withMessage('Last name must contain only alphabets')
    .isLength({ max: LENGTH_LIMITS.USER_NAME_MAX }),
  body('email')
    .optional()
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Invalid email')
    .isLength({ max: LENGTH_LIMITS.EMAIL_MAX })
    .custom(async (value, { req }) => {
      const user = await User.findOne({
        email: value,
        organization: req.user.organization,
        _id: { $ne: req.params.userId }
      }).withDeleted();
      if (user) {
        throw new Error('Email already exists');
      }
      return true;
    }),
  body('role')
    .optional()
    .isIn(Object.values(USER_ROLES))
    .withMessage('Invalid role'),
  body('departmentId')
    .optional()
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
      req.body.department = value;
      return true;
    }),
  body('position')
    .optional()
    .trim()
    .isLength({ max: LENGTH_LIMITS.POSITION_MAX }),
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+251\d{9}|0\d{9})$/)
    .withMessage('Please provide a valid Ethiopian phone number (+251XXXXXXXXX or 0XXXXXXXXX)'),
  body('skills')
    .optional()
    .isArray()
    .custom((value) => {
      if (value.length > 10) {
        throw new Error('Cannot have more than 10 skills');
      }
      return true;
    }),
  validate,
];

const validateUpdateProfile = [
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .isAlpha()
    .withMessage('First name must contain only alphabets')
    .isLength({ max: LENGTH_LIMITS.USER_NAME_MAX }),
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .isAlpha()
    .withMessage('Last name must contain only alphabets')
    .isLength({ max: LENGTH_LIMITS.USER_NAME_MAX }),
  body('email')
    .optional()
    .trim()
    .toLowerCase()
    .isEmail()
    .isLength({ max: LENGTH_LIMITS.EMAIL_MAX })
    .custom(async (value, { req }) => {
      const user = await User.findOne({
        email: value,
        organization: req.user.organization,
        _id: { $ne: req.user._id }
      }).withDeleted();
      if (user) {
        throw new Error('Email already exists');
      }
      return true;
    }),
  body('position')
    .optional()
    .trim()
    .isLength({ max: LENGTH_LIMITS.POSITION_MAX }),
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+251\d{9}|0\d{9})$/)
    .withMessage('Please provide a valid Ethiopian phone number (+251XXXXXXXXX or 0XXXXXXXXX)'),
  body('role').not().exists().withMessage('Cannot update role in profile'),
  body('departmentId').not().exists().withMessage('Cannot update department in profile'),
  body('organizationId').not().exists().withMessage('Cannot update organization in profile'),
  validate,
];

export {
  validateCreateUser,
  validateGetAllUsers,
  validateGetUser,
  validateUpdateUser,
  validateUpdateProfile,
};
