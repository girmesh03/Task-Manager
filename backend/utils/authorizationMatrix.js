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
