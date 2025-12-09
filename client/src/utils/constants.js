export const USER_ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  USER: 'User',
};

export const TASK_STATUS = ['To Do', 'In Progress', 'Completed', 'Pending'];

export const TASK_PRIORITY = ['Low', 'Medium', 'High', 'Urgent'];

export const TASK_TYPES = ['ProjectTask', 'RoutineTask', 'AssignedTask'];

export const USER_STATUS = ['Online', 'Offline', 'Away'];

export const MATERIAL_CATEGORIES = [
  'Electrical',
  'Mechanical',
  'Plumbing',
  'Hardware',
  'Cleaning',
  'Textiles',
  'Consumables',
  'Construction',
  'Other',
];

export const UNIT_TYPES = [
  'pcs',
  'kg',
  'g',
  'l',
  'ml',
  'm',
  'cm',
  'mm',
  'm2',
  'm3',
  'box',
  'pack',
  'roll',
  'sheet',
  'bag',
  'bottle',
  'can',
  'carton',
  'dozen',
  'gallon',
  'jar',
  'pair',
  'ream',
  'set',
  'tube',
  'unit',
  'yard',
  'ton',
  'barrel',
  'bundle',
];

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  DEFAULT_SORT_BY: 'createdAt',
  DEFAULT_SORT_ORDER: 'desc',
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
  MAX_LIMIT: 100,
};

export const LIMITS = {
  MAX_ATTACHMENTS: 10,
  MAX_WATCHERS: 20,
  MAX_ASSIGNEES: 20,
  MAX_MATERIALS: 20,
  MAX_TAGS: 5,
  MAX_MENTIONS: 5,
  MAX_SKILLS: 10,
  MAX_COMMENT_DEPTH: 3,
  MAX_COST_HISTORY: 200,
  MAX_NOTIFICATION_RECIPIENTS: 500,
};

export const LENGTH_LIMITS = {
  TITLE_MAX: 50,
  DESCRIPTION_MAX: 2000,
  COMMENT_MAX: 2000,
  ORG_NAME_MAX: 100,
  DEPT_NAME_MAX: 100,
  USER_NAME_MAX: 20,
  EMAIL_MAX: 50,
  PASSWORD_MIN: 8,
  POSITION_MAX: 100,
  ADDRESS_MAX: 500,
  PHONE_MAX: 20,
  SKILL_NAME_MAX: 50,
  TAG_MAX: 50,
};

export const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Hospitality',
  'Real Estate',
  'Transportation',
  'Energy',
  'Agriculture',
  'Construction',
  'Media',
  'Telecommunications',
  'Automotive',
  'Aerospace',
  'Pharmaceutical',
  'Legal',
  'Consulting',
  'Non-Profit',
  'Government',
  'Entertainment',
  'Food & Beverage',
  'Other',
];

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
};

// UI Messages
export const UI_MESSAGES = {
  ERRORS: {
    SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
  },
  SUCCESS: {
    LOGIN: 'Login successful!',
    LOGOUT: 'Logout successful!',
    REGISTER: 'Registration successful! Please login.',
    UPDATE: 'Updated successfully!',
    DELETE: 'Deleted successfully!',
    CREATE: 'Created successfully!',
  },
  PLACEHOLDERS: {
    SELECT_OPTION: 'Select an option...',
    SEARCH: 'Search...',
    ENTER_TEXT: 'Enter text...',
  },
};

// Convenience exports for backwards compatibility
export const MIN_PASSWORD_LENGTH = LENGTH_LIMITS.PASSWORD_MIN;
export const MAX_POSITION_LENGTH = LENGTH_LIMITS.POSITION_MAX;
export const MAX_DEPT_NAME_LENGTH = LENGTH_LIMITS.DEPT_NAME_MAX;
export const MAX_DEPT_DESCRIPTION_LENGTH = LENGTH_LIMITS.DESCRIPTION_MAX;
export const MAX_ORG_NAME_LENGTH = LENGTH_LIMITS.ORG_NAME_MAX;
export const MAX_ORG_DESCRIPTION_LENGTH = LENGTH_LIMITS.DESCRIPTION_MAX;
export const MAX_EMAIL_LENGTH = LENGTH_LIMITS.EMAIL_MAX;
export const MAX_USER_NAME_LENGTH = LENGTH_LIMITS.USER_NAME_MAX;
export const MAX_ADDRESS_LENGTH = LENGTH_LIMITS.ADDRESS_MAX;

// Alias for INDUSTRIES
export const VALID_INDUSTRIES = INDUSTRIES;

// Validation Patterns
export const PHONE_REGEX = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
