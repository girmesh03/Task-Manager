// backend/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import CustomError from "../errorHandler/CustomError.js";

/**
 * Middleware to verify the JSON Web Token (JWT) from cookies.
 * This is the primary gatekeeper for all protected routes.
 * It decodes the token and attaches a lean `req.user` object to the request
 * without performing a database lookup, making it highly performant.
 */
export const verifyJWT = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return next(new CustomError("Unauthorized: No token provided.", 401));
  }

  // Verify the token using the secret from environment variables.
  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) {
      // This single block handles both invalid signatures and expired tokens.
      if (err.name === "TokenExpiredError") {
        return next(new CustomError("Unauthorized: Session has expired.", 401));
      }
      return next(new CustomError("Unauthorized: Invalid token.", 403));
    }

    // Attach the clean, trusted payload to the request object.
    // This payload contains all data needed for subsequent authorization checks.
    req.user = {
      _id: decoded._id,
      role: decoded.role,
      department: decoded.department,
    };

    next();
  });
};

/**
 * Middleware factory to authorize access based on user roles.
 * It checks the `req.user.role` attached by `verifyJWT`.
 *
 * @param {...string} roles - A list of roles that are permitted to access the route.
 * @returns {function} An Express middleware function.
 * @example
 * // Allows only 'Admin' and 'SuperAdmin'
 * router.post('/', authorizeRoles('Admin', 'SuperAdmin'), createSomething);
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Assumes `verifyJWT` has already run and attached `req.user`.
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new CustomError(
          "Forbidden: You do not have permission to perform this action.",
          403
        )
      );
    }
    next();
  };
};

/**
 * Middleware to verify that a user is accessing a resource within their own department.
 * It compares the department ID from the route parameters (`req.params.departmentId`)
 * with the department ID from the user's trusted JWT payload.
 * A 'SuperAdmin' bypasses this check.
 */
export const verifyDepartmentAccess = (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const user = req.user; // User data comes from the decoded JWT via verifyJWT.

    if (!departmentId) {
      return next(
        new CustomError(
          "Bad Request: Department ID is missing from the URL.",
          400
        )
      );
    }

    // The SuperAdmin can access any department's resources.
    if (user.role === "SuperAdmin") {
      return next();
    }

    // For all other roles, their department must match the one in the request params.
    // This check is instantaneous, with no database lookup required.
    if (user.department !== departmentId) {
      return next(
        new CustomError(
          "Forbidden: You do not have access to this department's resources.",
          403
        )
      );
    }

    next();
  } catch (error) {
    // Pass any unexpected errors to the global error handler.
    next(error);
  }
};
