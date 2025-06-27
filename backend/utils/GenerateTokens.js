import jwt from "jsonwebtoken";

// Token expiration times
const ACCESS_TOKEN_EXPIRY = "1d";
const REFRESH_TOKEN_EXPIRY = "7d";
const ACCESS_TOKEN_MAX_AGE = 1 * 24 * 60 * 60 * 1000; // 1 day
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// Simple HTML escape function
const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const generateAccessToken = (res, user) => {
  const accessToken = jwt.sign(
    {
      _id: user._id,
      role: user.role,
      department: user.department._id,
      tokenVersion: user.tokenVersion,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: ACCESS_TOKEN_MAX_AGE,
    domain: process.env.COOKIE_DOMAIN || "localhost",
    path: "/",
  });

  return accessToken;
};

export const generateRefreshToken = (res, user) => {
  const refreshToken = jwt.sign(
    {
      _id: user._id,
      role: user.role,
      department: user.department._id,
      tokenVersion: user.tokenVersion, // Added token version
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_MAX_AGE,
    domain: process.env.COOKIE_DOMAIN || "localhost",
    path: "/",
  });

  return refreshToken;
};

export const clearTokens = (res) => {
  res.clearCookie("access_token", {
    domain: process.env.COOKIE_DOMAIN || "localhost",
    path: "/",
  });
  res.clearCookie("refresh_token", {
    domain: process.env.COOKIE_DOMAIN || "localhost",
    path: "/",
  });
};

export const generateAuthTokens = (res, user) => {
  const accessToken = generateAccessToken(res, user);
  const refreshToken = generateRefreshToken(res, user);
  return { accessToken, refreshToken };
};
