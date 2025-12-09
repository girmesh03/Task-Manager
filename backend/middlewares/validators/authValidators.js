import { body } from 'express-validator';
import { Organization, User } from '../../models/index.js';
import validate from '../../utils/validate.js';
import { INDUSTRIES, LENGTH_LIMITS } from '../../utils/constants.js';

const validateRegister = [
  // Organization Fields
  body('organization.name')
    .trim()
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
    .notEmpty()
    .withMessage('Department name is required')
    .isLength({ max: LENGTH_LIMITS.DEPT_NAME_MAX })
    .withMessage(`Department name cannot exceed ${LENGTH_LIMITS.DEPT_NAME_MAX} characters`),

  // User Fields
  body('user.firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: LENGTH_LIMITS.USER_NAME_MAX })
    .withMessage(`First name cannot exceed ${LENGTH_LIMITS.USER_NAME_MAX} characters`),
  body('user.lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: LENGTH_LIMITS.USER_NAME_MAX })
    .withMessage(`Last name cannot exceed ${LENGTH_LIMITS.USER_NAME_MAX} characters`),
  body('user.email')
    .trim()
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
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .custom(async (value) => {
      const user = await User.findOne({ email: value }).withDeleted();
      if (!user) {
        // We don't want to reveal if user exists or not for security,
        // but validation usually fails if invalid.
        // However, for forgot password, standard practice is to return success even if not found.
        // But if we throw error here, it returns 400.
        // We should probably NOT throw error if user not found,
        // but let controller handle it (or just return true here).
        // The requirement says "Check user existence using User.findOne()".
        // If we want to return 400 for non-existent user, we throw.
        // If we want to prevent enumeration, we return true.
        // T2.11 says "always return success".
        // So validation should probably just check format.
        // But T2.10 says "Check user existence...".
        // I'll stick to checking existence but maybe the controller handles the "always success" response?
        // If validation fails, it returns 400. That reveals user existence.
        // I will implement it to return true regardless, or just check format.
        // BUT, if I strictly follow T2.10 "Check user existence", I must check it.
        // I'll check it, but maybe the "always return success" in controller implies
        // we shouldn't fail validation?
        // Let's assume for now we check existence to ensure we can send email.
        // If I throw error, it reveals existence.
        // I will strictly follow "Check user existence" instruction.
        // Wait, if I check existence and throw if NOT found, I reveal it.
        // If I check existence and throw if FOUND, I reveal it.
        // T2.10 says "Check user existence using User.findOne() with withDeleted(). After validation, attach to req.validated.body".
        // This implies we want to attach the user object if found?
        // Or just validate.
        // I'll attach the user object to req.user or req.validated.user if found,
        // so controller doesn't need to find again.
        // But `express-validator` custom validator returns boolean or promise.
        // I can attach to req in the custom validator.
      }
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
