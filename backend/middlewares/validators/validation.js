import { validationResult, matchedData } from 'express-validator';
import CustomError from '../../errorHandler/CustomError.js';

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    const message = `${firstError.msg}`;
    throw new CustomError(message, 400, 'VALIDATION_ERROR');
  }

  // Attach validated data to req.validated
  req.validated = {
    body: matchedData(req, { locations: ['body'] }),
    params: matchedData(req, { locations: ['params'] }),
    query: matchedData(req, { locations: ['query'] }),
  };

  next();
};

export default validate;
