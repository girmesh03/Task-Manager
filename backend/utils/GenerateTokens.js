// backend/utils/GenerateTokens.js
import jwt from "jsonwebtoken";

/**
 * Creates the payload for the JWT. This ensures consistency between access and refresh tokens.
 * The payload is lean, containing only essential, non-sensitive data to keep tokens small
 * and reduce the need for database lookups in middleware.
 * @param {object} user - The user document.
 * @returns {object} The JWT payload.
 */
const createTokenPayload = (user) => {
  return {
    _id: user._id.toString(),
    role: user.role,
    department: user.department.toString(),
    tokenVersion: user.tokenVersion,
  };
};

/**
 * A generic function to generate a JWT and set it as an HTTP-only cookie.
 * @param {object} res - The Express response object.
 * @param {object} user - The user document.
 * @param {string} type - The type of token to generate ('access' or 'refresh').
 */
const generateToken = (res, user, type) => {
  const isAccess = type === "access";

  const secret = isAccess
    ? process.env.JWT_ACCESS_SECRET
    : process.env.JWT_REFRESH_SECRET;
  const cookieName = isAccess ? "access_token" : "refresh_token";
  const expiresIn = isAccess
    ? process.env.JWT_ACCESS_EXPIRES_IN || "15m"
    : process.env.JWT_REFRESH_EXPIRES_IN || "7d";

  // Calculate maxAge in milliseconds
  const maxAge = isAccess ? 15 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

  const payload = createTokenPayload(user);
  const token = jwt.sign(payload, secret, { expiresIn });

  res.cookie(cookieName, token, {
    httpOnly: true, // Prevents client-side script access, mitigating XSS.
    secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production.
    sameSite: "strict", // Mitigates CSRF attacks.
    maxAge,
  });
};

export const generateAccessToken = (res, user) =>
  generateToken(res, user, "access");
export const generateRefreshToken = (res, user) =>
  generateToken(res, user, "refresh");
