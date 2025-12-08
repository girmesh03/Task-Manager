import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const matrixPath = path.join(__dirname, "../config/authorizationMatrix.json");
const authorizationMatrix = JSON.parse(fs.readFileSync(matrixPath, "utf8"));

export const getAllowedScopes = (userRole, resource, operation) => {
  if (
    !authorizationMatrix[resource] ||
    !authorizationMatrix[resource][userRole] ||
    !authorizationMatrix[resource][userRole][operation]
  ) {
    return [];
  }
  return authorizationMatrix[resource][userRole][operation];
};

export const hasPermission = (userRole, resource, operation, requestScope) => {
  const allowedScopes = getAllowedScopes(userRole, resource, operation);

  if (!allowedScopes || allowedScopes.length === 0) return false;

  // Check if the request scope is in the allowed scopes
  return allowedScopes.includes(requestScope);
};

export const determineRequestScope = (req, user, resourceData) => {
  // Logic to determine the scope of the request relative to the user
  // This is complex and depends on the resource data being accessed.
  // We assume resourceData is the object being accessed (e.g., a Task, User, etc.)

  if (!resourceData) return "crossOrg"; // Default if no resource (e.g. create) - wait, create usually implies target scope.
  // For create, we usually check if target department/org matches user's.

  // If resource has organization
  if (
    resourceData.organization &&
    resourceData.organization.toString() !== user.organization.toString()
  ) {
    return "crossOrg";
  }

  // If resource has department
  if (
    resourceData.department &&
    resourceData.department.toString() !== user.department.toString()
  ) {
    return "crossDept";
  }

  // If resource belongs to user's department and organization
  // Check if it's "own" resource
  if (checkOwnership(null, user, resourceData)) {
    return "own";
  }

  return "ownDept";
};

export const checkOwnership = (resource, user, resourceData) => {
  if (!resourceData) return true; // If no resource data, ownership check passes (e.g. create new)

  const userId = user._id.toString();

  // Check createdBy
  if (resourceData.createdBy && resourceData.createdBy.toString() === userId) {
    return true;
  }

  // Check assignedTo (for Tasks)
  if (
    resourceData.assignedTo &&
    resourceData.assignedTo.toString() === userId
  ) {
    return true;
  }

  // Check assignees (Array)
  if (
    resourceData.assignees &&
    resourceData.assignees.some((id) => id.toString() === userId)
  ) {
    return true;
  }

  // Check watchers (Array)
  if (
    resourceData.watchers &&
    resourceData.watchers.some((id) => id.toString() === userId)
  ) {
    return true;
  }

  // Check uploadedBy (for Attachments/Materials)
  if (
    resourceData.uploadedBy &&
    resourceData.uploadedBy.toString() === userId
  ) {
    return true;
  }

  // Check recipientId (for Notifications)
  if (
    resourceData.recipientId &&
    resourceData.recipientId.toString() === userId
  ) {
    return true;
  }

  // Check _id (if resource is User)
  if (resourceData._id && resourceData._id.toString() === userId) {
    return true;
  }

  return false;
};
