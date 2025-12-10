// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  USER: 'User'
};

export const USER_ROLES_ARRAY = Object.values(USER_ROLES);

// Task Status
export const TASK_STATUS = {
  TO_DO: 'To Do',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  PENDING: 'Pending'
};

export const TASK_STATUS_ARRAY = Object.values(TASK_STATUS);

// Task Priority
export const TASK_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent'
};

export const TASK_PRIORITY_ARRAY = Object.values(TASK_PRIORITY);

// Task Types
export const TASK_TYPES = {
  PROJECT_TASK: 'ProjectTask',
  ROUTINE_TASK: 'RoutineTask',
  ASSIGNED_TASK: 'AssignedTask'
};

export const TASK_TYPES_ARRAY = Object.values(TASK_TYPES);

// Material Categories
export const MATERIAL_CATEGORIES = [
  'Electrical',
  'Mechanical',
  'Plumbing',
  'Hardware',
  'Cleaning',
  'Textiles',
  'Consumables',
  'Construction',
  'Other'
];

// Unit Types
export const UNIT_TYPES = [
  'pcs', 'kg', 'g', 'l', 'ml', 'm', 'cm', 'mm', 'm2', 'm3',
  'box', 'pack', 'roll', 'sheet', 'bag', 'bottle', 'can', 'jar',
  'tube', 'set', 'pair', 'dozen', 'gross', 'carton', 'pallet',
  'bundle', 'coil', 'reel', 'spool', 'drum'
];

// Attachment Types
export const ATTACHMENT_TYPES = {
  IMAGE: 'Image',
  VIDEO: 'Video',
  DOCUMENT: 'Document',
  AUDIO: 'Audio',
  OTHER: 'Other'
};

export const ATTACHMENT_TYPES_ARRAY = Object.values(ATTACHMENT_TYPES);

// Notification Types
export const NOTIFICATION_TYPES = {
  CREATED: 'Created',
  UPDATED: 'Updated',
  DELETED: 'Deleted',
  RESTORED: 'Restored',
  MENTION: 'Mention',
  WELCOME: 'Welcome',
  ANNOUNCEMENT: 'Announcement'
};

export const NOTIFICATION_TYPES_ARRAY = Object.values(NOTIFICATION_TYPES);

// User Status
export const USER_STATUS = {
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  AWAY: 'Away'
};

export const USER_STATUS_ARRAY = Object.values(USER_STATUS);

// Industries
export const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
  'Retail', 'Construction', 'Transportation', 'Hospitality', 'Real Estate',
  'Agriculture', 'Energy', 'Telecommunications', 'Media', 'Entertainment',
  'Legal', 'Consulting', 'Non-Profit', 'Government', 'Automotive',
  'Aerospace', 'Pharmaceutical', 'Food & Beverage', 'Other'
];

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  DEFAULT_SORT_BY: 'createdAt',
  DEFAULT_SORT_ORDER: 'desc'
};

// Validation Limits
export const LIMITS = {
  MAX_TAGS: 5,
  MAX_WATCHERS: 20,
  MAX_ASSIGNEES: 20,
  MAX_MATERIALS: 20,
  MAX_ATTACHMENTS: 10,
  MAX_SKILLS: 10,
  MAX_MENTIONS: 5,
  MAX_COMMENT_DEPTH: 3,
  MAX_COST_HISTORY: 200,
  MAX_BULK_NOTIFICATIONS: 500
};

// Length Limits
export const LENGTH_LIMITS = {
  MAX_TITLE_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_NAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 50,
  MAX_PHONE_LENGTH: 20,
  MAX_ADDRESS_LENGTH: 500,
  MAX_POSITION_LENGTH: 100,
  MAX_SKILL_LENGTH: 50,
  MAX_TAG_LENGTH: 50,
  MAX_COMMENT_LENGTH: 1000
};

// File Size Limits (bytes)
export const FILE_SIZE_LIMITS = {
  MAX_IMAGE_SIZE: 10485760, // 10MB
  MAX_VIDEO_SIZE: 104857600, // 100MB
  MAX_DOCUMENT_SIZE: 26214400, // 25MB
  MAX_AUDIO_SIZE: 20971520, // 20MB
  MAX_OTHER_SIZE: 52428800 // 50MB
};

// TTL Values (days)
export const TTL = {
  ORGANIZATION: null, // never
  DEPARTMENT: 365,
  USER: 365,
  TASK: 180,
  ACTIVITY: 90,
  COMMENT: 90,
  MATERIAL: 180,
  VENDOR: 180,
  ATTACHMENT: 90,
  NOTIFICATION: 30
};

// Auth Constants
export const AUTH = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  BCRYPT_SALT_ROUNDS: 12,
  BCRYPT_RESET_TOKEN_ROUNDS: 10,
  RATE_LIMIT_WINDOW: 900000, // 15 min
  RATE_LIMIT_MAX_GENERAL: 100,
  RATE_LIMIT_MAX_AUTH: 5
};
