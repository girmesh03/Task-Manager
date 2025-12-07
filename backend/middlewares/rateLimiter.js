import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers

  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).json({
      success: false,
      message: 'Too many requests from this IP, please try again after 15 minutes',
      errorCode: 'RATE_LIMIT_EXCEEDED',
    });
  },
  skip: (req, res) => process.env.NODE_ENV !== 'production',
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res, next, options) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).json({
      success: false,
      message: 'Too many login attempts from this IP, please try again after 15 minutes',
      errorCode: 'AUTH_RATE_LIMIT_EXCEEDED',
    });
  },
  skip: (req, res) => process.env.NODE_ENV !== 'production',
});
