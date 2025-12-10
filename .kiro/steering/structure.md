# Project Structure

## Monorepo Layout

```
/
├── backend/          # Node.js/Express API
├── client/           # React/Vite frontend
└── docs/             # Documentation
```

## Backend Structure

```
backend/
├── config/           # Configuration files (CORS, DB, auth matrix)
├── controllers/      # Request handlers (business logic)
├── middlewares/      # Express middlewares (auth, validation, rate limiting)
│   └── validators/   # Input validation schemas
├── models/           # Mongoose schemas and models
│   └── plugins/      # Reusable model plugins (e.g., soft delete)
├── routes/           # API route definitions
├── services/         # Business logic layer (currently minimal)
├── utils/            # Helper functions and utilities
├── errorHandler/     # Custom error classes and global error handler
├── templates/        # Email templates
├── logs/             # Application logs (winston)
├── __tests__/        # Test suites
│   ├── unit/         # Unit tests
│   ├── integration/  # Integration tests
│   └── property/     # Property-based tests
├── app.js            # Express app configuration
└── server.js         # Server entry point
```

## Frontend Structure

```
client/
├── src/
│   ├── components/   # React components
│   │   ├── auth/     # Authentication components
│   │   ├── common/   # Reusable UI components
│   │   ├── forms/    # Form components by feature
│   │   ├── users/    # User-specific components
│   │   └── ...       # Other feature folders
│   ├── pages/        # Route-level page components
│   ├── redux/        # State management
│   │   ├── app/      # Store configuration
│   │   └── features/ # Feature slices and API endpoints
│   ├── services/     # API service functions
│   ├── router/       # Route definitions
│   ├── theme/        # MUI theme customization
│   ├── hooks/        # Custom React hooks
│   ├── utils/        # Helper functions
│   └── main.jsx      # Application entry point
└── public/           # Static assets
```

## Key Architectural Patterns

### Backend

- **MVC Pattern**: Models, Controllers, Routes separation
- **Middleware Chain**: Validation → Authentication → Authorization → Controller
- **Error Handling**: Custom error classes with global error handler
- **Soft Delete Plugin**: Reusable Mongoose plugin for all models
- **Transaction Support**: MongoDB sessions for multi-document operations
- **Async Handler**: Wraps async controllers for error propagation

### Frontend

- **Feature-Based Organization**: Components grouped by domain (users, auth, etc.)
- **Container/Presentational**: Smart components in pages, dumb components in components/
- **Redux Slices**: Feature-based state management with RTK Query
- **Protected Routes**: Authentication guards for private pages
- **Theme Provider**: Centralized MUI theme with custom overrides
- **Error Boundaries**: React error boundaries for graceful failures

## Naming Conventions

- **Files**: camelCase for JS/JSX files, PascalCase for React components
- **Models**: PascalCase (e.g., `User.js`, `Organization.js`)
- **Controllers**: camelCase with descriptive names (e.g., `authControllers.js`)
- **Routes**: RESTful conventions (`/api/resource`)
- **Constants**: UPPER_SNAKE_CASE in `utils/constants.js`
- **Environment Variables**: UPPER_SNAKE_CASE

## Import Style

- ES modules throughout (`import`/`export`)
- File extensions required in backend imports (`.js`)
- Absolute imports avoided; use relative paths
