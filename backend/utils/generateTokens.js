import jwt from 'jsonwebtoken';

const generateAccess_token = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
};

const generateRefresh_token = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

const setTokenCookies = (res, access_token, refresh_token) => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Access Token Cookie
  res.cookie('access_token', access_token, {
    httpOnly: true,
    secure: isProduction, // Use secure cookies in production
    sameSite: 'strict', // Prevent CSRF
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Refresh Token Cookie
  res.cookie('refresh_token', refresh_token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const clearTokenCookies = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('access_token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    expires: new Date(0),
  });

  res.cookie('refresh_token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    expires: new Date(0),
  });
};

export {
  generateAccess_token,
  generateRefresh_token,
  setTokenCookies,
  clearTokenCookies,
};
