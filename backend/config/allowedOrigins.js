const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CLIENT_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
].filter(origin => {
  if (!origin) return false;
  if (origin === '*') return false;
  try {
    new URL(origin);
    return true;
  } catch {
    return false;
  }
});

export default allowedOrigins;
