import authorizationMatrix from '../config/authorizationMatrix.json' with { type: 'json' };

/**
 * Check if a role has permission for an operation on a resource with a specific scope
 * @param {string} role - User role
 * @param {string} resource - Resource name
 * @param {string} operation - Operation (create, read, update, delete)
 * @param {string} scope - Scope (own, ownDept, crossDept, crossOrg)
 * @returns {boolean} - True if permitted
 */
export const hasPermission = (role, resource, operation, scope) => {
  if (!authorizationMatrix[resource]) return false;
  if (!authorizationMatrix[resource][role]) return false;

  const allowedScopes = authorizationMatrix[resource][role][operation];
  if (!allowedScopes) return false;

  return allowedScopes.includes(scope);
};

/**
 * Get all allowed scopes for a role, resource, and operation
 * @param {string} role - User role
 * @param {string} resource - Resource name
 * @param {string} operation - Operation (create, read, update, delete)
 * @returns {string[]} - Array of allowed scopes
 */
export const getAllowedScopes = (role, resource, operation) => {
  if (!authorizationMatrix[resource]) return [];
  if (!authorizationMatrix[resource][role]) return [];

  return authorizationMatrix[resource][role][operation] || [];
};

/**
 * Check if user owns the resource
 * @param {Object} resource - The resource object
 * @param {Object} user - The user object
 * @param {string} field - The field to check ownership against (default: createdBy)
 * @returns {boolean} - True if user owns the resource
 */
export const checkOwnership = (resource, user, field = 'createdBy') => {
  if (!resource || !user || !resource[field]) return false;
  return resource[field].toString() === user._id.toString();
};

/**
 * Determine the scope of the request relative to the resource
 * @param {Object} resource - The resource object
 * @param {Object} user - The user object
 * @returns {string} - Scope (own, ownDept, crossDept, crossOrg)
 */
export const determineRequestScope = (resource, user) => {
  if (!resource || !user) return 'crossOrg'; // Default to most restrictive if unknown

  // Check ownership
  if (resource.createdBy && resource.createdBy.toString() === user._id.toString()) {
    return 'own';
  }

  // Check organization
  if (resource.organization && resource.organization.toString() !== user.organization.toString()) {
    return 'crossOrg';
  }

  // Check department
  if (resource.department && resource.department.toString() === user.department.toString()) {
    return 'ownDept';
  }

  // Same org, different dept
  return 'crossDept';
};
