import { body } from 'express-validator';
import { Organization, User } from '../../models/index.js';
import validate from './validation.js';
import { INDUSTRIES, LENGTH_LIMITS } from '../../utils/constants.js';

const validateRegister = [
  // Organization Fields
  body('organization.name')
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage('Organization name is required')
    .isLength({ max: LENGTH_LIMITS.ORG_NAME_MAX })
    .withMessage(`Organization name cannot exceed ${LENGTH_LIMITS.ORG_NAME_MAX} characters`)
    .custom(async (value) => {
      const org = await Organization.findOne({ name: value }).withDeleted();
      if (org) {
        throw new Error('Organization name already exists');
      }
      return true;
    }),
  body('organization.email')
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage('Organization email is required')
    .isEmail()
    .withMessage('Please provide a valid organization email')
    .isLength({ max: LENGTH_LIMITS.EMAIL_MAX })
    .withMessage(`Email cannot exceed ${LENGTH_LIMITS.EMAIL_MAX} characters`)
    .custom(async (value) => {
      const org = await Organization.findOne({ email: value }).withDeleted();
      if (org) {
        throw new Error('Organization email already exists');
      }
      return true;
    }),
  body('organization.phone')
    .trim()
    .notEmpty()
    .withMessage('Organization phone is required')
    .matches(/^(\+251\d{9}|0\d{9})$/)
    .withMessage('Please provide a valid Ethiopian phone number (+251XXXXXXXXX or 0XXXXXXXXX)')
    .custom(async (value) => {
      const org = await Organization.findOne({ phone: value }).withDeleted();
      if (org) {
        throw new Error('Organization phone already exists');
      }
      return true;
    }),
  body('organization.industry')
    .trim()
    .notEmpty()
    .withMessage('Industry is required')
    .isIn(INDUSTRIES)
    .withMessage('Invalid industry selected'),

  // Department Fields
  body('department.name')
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage('Department name is required')
    .isLength({ max: LENGTH_LIMITS.DEPT_NAME_MAX })
    .withMessage(`Department name cannot exceed ${LENGTH_LIMITS.DEPT_NAME_MAX} characters`),

  // User Fields
  body('user.firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isAlpha()
    .withMessage('First name must contain only alphabets')
    .isLength({ max: LENGTH_LIMITS.USER_NAME_MAX })
    .withMessage(`First name cannot exceed ${LENGTH_LIMITS.USER_NAME_MAX} characters`),
  body('user.lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isAlpha()
    .withMessage('Last name must contain only alphabets')
    .isLength({ max: LENGTH_LIMITS.USER_NAME_MAX })
    .withMessage(`Last name cannot exceed ${LENGTH_LIMITS.USER_NAME_MAX} characters`),
  body('user.email')
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage('User email is required')
    .isEmail()
    .withMessage('Please provide a valid user email')
    .isLength({ max: LENGTH_LIMITS.EMAIL_MAX })
    .withMessage(`Email cannot exceed ${LENGTH_LIMITS.EMAIL_MAX} characters`)
    .custom(async (value) => {
      const user = await User.findOne({ email: value }).withDeleted();
      if (user) {
        throw new Error('User email already exists');
      }
      return true;
    }),
  body('user.password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: LENGTH_LIMITS.PASSWORD_MIN })
    .withMessage(`Password must be at least ${LENGTH_LIMITS.PASSWORD_MIN} characters`),

  validate,
];

const validateLogin = [
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required'),
  validate,
];

const validateForgotPassword = [
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .custom(async (value, { req }) => {
      const user = await User.findOne({ email: value }).withDeleted();
      if (!user) {
        throw new Error('User not found');
      }
      req.user = user;
      return true;
    }),
  validate,
];

const validateResetPassword = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('Token is required'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: LENGTH_LIMITS.PASSWORD_MIN })
    .withMessage(`Password must be at least ${LENGTH_LIMITS.PASSWORD_MIN} characters`),
  validate,
];

export {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
};
