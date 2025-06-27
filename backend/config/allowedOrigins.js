const allowedOrigins = [
  "http://localhost:3000",
  ...(process.env.PRODUCTION_ORIGINS
    ? process.env.PRODUCTION_ORIGINS.split(",").filter(Boolean)
    : []),
];

export default allowedOrigins;
