import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import CustomError from "../errorHandler/CustomError.js";

export const verifyJWT = async (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return next(
      new CustomError("Authorization token required", 401, "AUTH-401")
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Validate token structure
    if (!decoded._id || !decoded.tokenVersion) {
      throw new CustomError("Invalid token structure", 401, "AUTH-401");
    }

    const user = await User.findById(decoded._id)
      .select("+isVerified +isActive +tokenVersion department role")
      .populate("department", "_id");

    if (!user) {
      return next(new CustomError("User account not found", 404, "AUTH-404"));
    }

    if (!user.isVerified) {
      return next(
        new CustomError(
          "Account not verified. Please verify your email",
          403,
          "AUTH-403"
        )
      );
    }

    if (!user.isActive) {
      return next(
        new CustomError(
          "Account suspended. Contact administrator",
          403,
          "AUTH-403"
        )
      );
    }

    if (user.tokenVersion !== decoded.tokenVersion) {
      return next(
        new CustomError("Session expired. Please log in again", 401, "AUTH-401")
      );
    }

    // Attach full user object to request
    req.user = {
      _id: user._id,
      role: user.role,
      department: user.department._id,
      position: user.position,
    };

    next();
  } catch (error) {
    let message = "Authentication failed";
    let code = "AUTH-401";

    if (error.name === "TokenExpiredError") {
      message = "Session expired. Please log in again";
    } else if (error.name === "JsonWebTokenError") {
      message = "Invalid token. Please log in again";
    } else if (error.name === "CustomError") {
      message = error.message;
      code = error.errorCode;
    } else {
      code = "AUTH-500";
      message = "Authentication system error";
    }

    next(new CustomError(message, 401, code));
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new CustomError("Authentication required", 401, "AUTH-401"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new CustomError(
          "Insufficient permissions for this action",
          403,
          "AUTH-403"
        )
      );
    }
    next();
  };
};

export const verifyDepartmentAccess = async (req, res, next) => {
  const { departmentId } = req.params;
  const userId = req.user._id;

  try {
    // Validate departmentId format
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      throw new CustomError("Invalid department ID", 400, "INVALID_ID");
    }

    const user = await User.findById(userId).select("department role");
    if (!user) throw new CustomError("User account not found", 404, "AUTH-404");

    // SuperAdmin bypass
    if (user.role === "SuperAdmin") return next();

    const department = await mongoose
      .model("Department")
      .findById(departmentId)
      .select("_id")
      .lean();

    if (!department) {
      throw new CustomError("Department not found", 404, "AUTH-404");
    }

    if (!user.department.equals(departmentId)) {
      throw new CustomError(
        "Access denied: You don't belong to this department",
        403,
        "AUTH-403"
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Department-scoped authorization middleware
export const authorizeDepartmentAccess = (modelName) => {
  return async (req, res, next) => {
    const userId = req.user._id;
    const resourceId = req.params.id;

    try {
      if (!mongoose.Types.ObjectId.isValid(resourceId)) {
        throw new CustomError("Invalid resource ID", 400, "INVALID_ID");
      }

      const user = await User.findById(userId).select("department role");
      if (!user) throw new CustomError("User not found", 404, "AUTH-404");

      // SuperAdmin bypass
      if (user.role === "SuperAdmin") return next();

      const resource = await mongoose
        .model(modelName)
        .findById(resourceId)
        .select("department")
        .lean();

      if (!resource) {
        throw new CustomError("Resource not found", 404, "RESOURCE-404");
      }

      if (!resource.department.equals(user.department)) {
        throw new CustomError(
          "Access denied: Resource belongs to another department",
          403,
          "AUTH-403"
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
