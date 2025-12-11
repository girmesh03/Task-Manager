import { cleanEnv, str, port, url } from 'envalid';

const validateEnv = (env = process.env, options = {}) => {
  cleanEnv(env, {
    NODE_ENV: str({ choices: ['development', 'test', 'production', 'provision'] }),
    PORT: port({ default: 3000 }),
    MONGODB_URI: str(),
    JWT_ACCESS_SECRET: str(),
    JWT_REFRESH_SECRET: str(),
    CLIENT_URL: url(),
    ALLOWED_ORIGINS: str({ default: '' }),
  }, options);
};

export default validateEnv;
