// backend/middlewares/paginationMiddleware.js

/**
 * A reusable utility middleware to parse and sanitize pagination parameters.
 * It reads `page` and `limit` from the query string, validates them,
 * and attaches a `pagination` object to the request (`req.pagination`)
 * for use in controllers and services. This reduces boilerplate code.
 */
const paginationMiddleware = (req, res, next) => {
  // Default to page 1, limit 10 if not provided.
  let { page = 1, limit = 10 } = req.query;

  // Convert to numbers.
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  // Sanitize inputs to ensure they are positive integers.
  if (isNaN(page) || page < 1) {
    page = 1;
  }
  if (isNaN(limit) || limit < 1) {
    limit = 10;
  }

  // Set a reasonable maximum limit to prevent abuse and protect server performance.
  if (limit > 100) {
    limit = 100;
  }

  // Attach the sanitized pagination data to the request object.
  req.pagination = {
    page,
    limit,
    skip: (page - 1) * limit, // Calculate the skip value for MongoDB queries.
  };

  next();
};

export default paginationMiddleware;
