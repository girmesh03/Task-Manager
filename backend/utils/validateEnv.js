import { logger } from './logger.js';

const validateEnv = () => {
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'JWT_ACCESS_EXPIRES_IN',
    'JWT_REFRESH_EXPIRES_IN',
  ];

  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    const message = `Missing required environment variables: ${missingEnvVars.join(', ')}`;
    logger.error(message);
    throw new Error(message);
  }

  // Optional variables check (warning only)
  const optionalEnvVars = [
    'PORT',
    'CLIENT_URL',
    'NODE_ENV',
    'APP_NAME',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'INITIALIZE_SEED_DATA',
    'PLATFORM_ORGANIZATION_NAME',
    'PLATFORM_ORGANIZATION_DESCRIPTION',
    'PLATFORM_ORGANIZATION_EMAIL',
    'PLATFORM_ORGANIZATION_PHONE',
    'PLATFORM_ORGANIZATION_ADDRESS',
    'PLATFORM_ORGANIZATION_SIZE',
    'PLATFORM_ORGANIZATION_INDUSTRY',
    'PLATFORM_DEPARTMENT_NAME',
    'PLATFORM_DEPARTMENT_DESCRIPTION',
    'PLATFORM_ADMIN_FIRST_NAME',
    'PLATFORM_ADMIN_LAST_NAME',
    'PLATFORM_ADMIN_POSITION',
    'PLATFORM_ADMIN_ROLE',
    'PLATFORM_ADMIN_EMAIL',
    'PLATFORM_ADMIN_PASSWORD',
  ];

  const missingOptionalEnvVars = optionalEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingOptionalEnvVars.length > 0) {
    logger.warn(`Missing optional environment variables: ${missingOptionalEnvVars.join(', ')}`);
  }
};

export default validateEnv;
