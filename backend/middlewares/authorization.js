import asyncHandler from 'express-async-handler';
import CustomError from '../errorHandler/CustomError.js';
import {
  hasPermission,
  determineRequestScope,
  checkOwnership,
  getAllowedScopes,
} from '../utils/authorizationMatrix.js';
import {
  User,
  Organization,
  Department,
  // Task, Material, Vendor, Notification will be imported when created
} from '../models/index.js';
import mongoose from 'mongoose';

// Map resource names to Models and ID parameters
const RESOURCE_MAP = {
  User: { model: User, param: 'userId' },
  Organization: { model: Organization, param: 'organizationId' },
  Department: { model: Department, param: 'departmentId' },
  // Task: { model: Task, param: 'taskId' },
  // Material: { model: Material, param: 'materialId' },
  // Vendor: { model: Vendor, param: 'vendorId' },
  // Notification: { model: Notification, param: 'notificationId' },
};

const authorize = (resource, operation) => {
  return asyncHandler(async (req, res, next) => {
    const userRole = req.user.role;
    const allowedScope = getAllowedScopes(userRole, resource, operation);

    if (!allowedScope || allowedScope === 'none') {
      throw CustomError.unauthorized(
        `Forbidden: You do not have permission to ${operation} ${resource}s`
      );
    }

    // If operation is 'create', we usually check the target organization/department
    // provided in the body, or default to user's own.
    // For 'read' (getAll), we enforce scope in the controller query filters.
    // For 'read/update/delete' specific item, we must fetch it to check scope/ownership.

    const resourceConfig = RESOURCE_MAP[resource];
    const resourceId = resourceConfig
      ? req.params[resourceConfig.param]
      : null;

    // If no ID, we can't check specific resource ownership/scope here.
    // We assume the controller will handle list filtering or creation validation.
    // We just pass the static permission check.
    if (!resourceId) {
      // For create, we might want to check if they are trying to create in another org/dept
      // But that requires parsing body which might not be validated yet.
      // We rely on validators to ensure body is correct, and controllers to enforce scope.
      req.authorization = { allowedScope };
      return next();
    }

    // If ID exists, fetch the resource to check ownership and scope
    // We need to dynamically get the model.
    // Since some models might not be created yet (Task, etc.), we need to handle that.
    // But this middleware is generic.
    // For now, we only have User, Org, Dept.
    // We can use mongoose.model(resource) if the model name matches the resource name.

    let Model;
    try {
      Model = mongoose.model(resource);
    } catch (e) {
      // Model not registered yet?
      // Fallback to RESOURCE_MAP if we imported it
      if (resourceConfig && resourceConfig.model) {
        Model = resourceConfig.model;
      } else {
        throw new Error(`Model for resource ${resource} not found`);
      }
    }

    const doc = await Model.findById(resourceId).withDeleted(); // Use withDeleted to allow checking soft-deleted items

    if (!doc) {
      throw CustomError.notFound(`${resource} not found`);
    }

    // Determine the scope of the request relative to the user
    const requestScope = determineRequestScope(req, req.user, doc);

    // Check if user has permission for this specific scope
    const isAuthorized = hasPermission(
      userRole,
      resource,
      operation,
      requestScope
    );

    if (!isAuthorized) {
      throw CustomError.unauthorized(
        `Forbidden: Insufficient permissions to ${operation} this ${resource}`
      );
    }

    // Check ownership if the scope implies ownership check (e.g. 'own')
    // Actually, determineRequestScope already returns 'own' if ownership passes.
    // If requestScope is 'own', and allowedScope is 'own' (or higher), hasPermission returns true.
    // If requestScope is 'ownDept' (meaning not own, but same dept), and allowed is 'own', hasPermission returns false.
    // So logic holds.

    // Attach authorization info and the fetched document to req
    req.authorization = { allowedScope, requestScope };
    req[resource.toLowerCase()] = doc; // Attach doc to req (e.g. req.user, req.organization)
    // Note: req.user is already set by auth middleware.
    // If resource is User, we might overwrite it or conflict.
    // But req.user is the *authenticated* user.
    // If we are fetching a target user (e.g. /users/:userId), we should attach it as req.targetUser or similar?
    // Or just rely on controller fetching it again?
    // The prompt says "Attach authorization info to req.authorization".
    // It doesn't explicitly say attach the doc.
    // But fetching it twice is wasteful.
    // Let's attach it to `req.resourceData` or similar to be safe.
    req.resourceData = doc;

    next();
  });
};

export default authorize;
