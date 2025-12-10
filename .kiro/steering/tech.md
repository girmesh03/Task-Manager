# Technology Stack

## Backend

- **Runtime**: Node.js with ES modules (`"type": "module"`)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (access + refresh tokens) with HTTP-only cookies
- **Real-time**: Socket.IO
- **Validation**: express-validator
- **Testing**: Jest with supertest and fast-check (property-based testing)

### Key Backend Libraries

- `bcrypt` - Password hashing
- `helmet` - Security headers
- `cors` - Cross-origin resource sharing
- `express-rate-limit` - Rate limiting
- `express-mongo-sanitize` - NoSQL injection prevention
- `winston` - Logging
- `nodemailer` - Email sending
- `dayjs` - Date/time handling (UTC timezone)
- `compression` - Response compression

## Frontend

- **Framework**: React 19 with Vite
- **UI Library**: Material-UI (MUI) v7
- **State Management**: Redux Toolkit with Redux Persist
- **Routing**: React Router v7
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Data Visualization**: MUI X Charts, MUI X Data Grid
- **Notifications**: React Toastify

## Common Commands

### Backend

```bash
# Development
npm run dev              # Start with nodemon
npm start                # Production start

# Testing
npm test                 # Run all tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run test:property    # Property-based tests
```

### Frontend

```bash
# Development
npm run dev              # Start Vite dev server

# Production
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
```

## Environment Configuration

Both backend and client use `.env` files for configuration. Key variables include:

- `MONGODB_URI` - Database connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET` - Token signing keys
- `NODE_ENV` - Environment (development/production)
- `CLIENT_URL` / `VITE_API_URL` - Cross-origin URLs
