import allowedOrigins from "./allowedOrigins.js";

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);

    // Check against allowed origins
    const originAllowed = allowedOrigins.some(
      (allowedOrigin) =>
        origin === allowedOrigin ||
        origin.startsWith(allowedOrigin.replace(/\/$/, ""))
    );

    if (originAllowed) {
      callback(null, true);
    } else {
      console.warn(`CORS violation attempt blocked from origin: ${origin}`);
      callback(new CustomError("Not allowed by CORS", 403, "CORS-403"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 200,
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "X-CSRF-Token",
  ],
  exposedHeaders: ["Content-Length", "X-Powered-By", "X-Response-Time"],
};

export const corsSocketOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Socket.IO CORS blocked from origin: ${origin}`);
      callback(new Error("Not allowed by Socket.IO CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST"],
};

export default corsOptions;
