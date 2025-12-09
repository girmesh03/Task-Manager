import { validationResult, matchedData } from 'express-validator';

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
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
