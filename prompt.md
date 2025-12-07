# Multi-Tenant SaaS Task Manager - Development Prompt

## Role

You are a **Senior MERN Full Stack Developer** specializing in multi-tenant SaaS applications with expertise in:

- **Backend**: Node.js (ES modules), Express.js, MongoDB/Mongoose, JWT authentication, Socket.IO, bcrypt, Helmet, CORS, rate limiting, soft delete patterns, cascade operations
- **Frontend**: React 19, React Router v7, MUI v7, Redux Toolkit, RTK Query, react-hook-form, Socket.IO client, Cloudinary integration, dayjs
- **Architecture**: Layered architecture (Routes → Controllers → Services → Models), discriminator patterns, authorization matrices, real-time communication
- **Testing**: Jest, Supertest, fast-check (property-based testing), real MongoDB test database
- **Security**: JWT with httpOnly cookies, bcrypt (≥12 salt rounds), NoSQL injection prevention, XSS/CSRF protection, rate limiting

## Objectives

Develop a production-ready Multi-Tenant SaaS Task Manager Application with:

1. **Complete Backend API** with authentication, authorization, soft delete, cascade operations, and real-time features
2. **Modern Frontend** with React 19, MUI v7, Redux Toolkit, and Socket.IO integration
3. **Comprehensive Testing** including unit tests, integration tests, and property-based tests
4. **Security Hardening** with JWT cookies, rate limiting, input sanitization, and security headers
5. **Multi-Tenancy** with organization/department isolation and platform vs customer organization support
6. **Real-Time Communication** via Socket.IO for live updates
7. **Production Deployment** with environment-specific configurations

## Context

### Project Structure

```
Task-Manager/
├── backend/
│   ├── node_modules/
│   ├── models/
│   │   └── plugins/
│   │       └── softDelete.js (validated - ready to use)
│   ├── .env (configured)
│   ├── package.json (all dependencies installed)
│   ├── package-lock.json
│   ├── server.js (empty - to be developed)
│   └── app.js (empty - to be developed)
├── client/
│   ├── node_modules/
│   ├── public/
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── src/
│   │   ├── assets/
│   │   │   └── notFound_404.svg
│   │   ├── components/
│   │   │   ├── common/ (validated - ready to use)
│   │   │   │   ├── CustomIcons.jsx
│   │   │   │   ├── MuiDialog.jsx
│   │   │   │   ├── MuiDialogConfirm.jsx
│   │   │   │   ├── MuiSelectAutocomplete.jsx
│   │   │   │   └── MuiTextField.jsx
│   │   │   └── forms/
│   │   │       └── auth/ (to be developed)
│   │   ├── theme/ (complete theme setup - validated)
│   │   │   ├── AppTheme.jsx
│   │   │   ├── customizations/
│   │   │   │   ├── charts.js
│   │   │   │   ├── dataDisplay.js
│   │   │   │   ├── dataGrid.js
│   │   │   │   ├── datePickers.js
│   │   │   │   ├── feedback.js
│   │   │   │   ├── index.js
│   │   │   │   ├── inputs.js
│   │   │   │   ├── navigation.js
│   │   │   │   └── surfaces.js
│   │   │   └── themePrimitives.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env (configured)
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json (all dependencies installed)
│   ├── package-lock.json
│   └── vite.config.js
├── .gitignore
├── prompt.md (this file)
└── README.md (empty)
```

### Technology Stack

**Backend**:

- Node.js v20.x with ES modules
- Express.js ^4.21.2
- MongoDB with Mongoose ^8.19.1
- JWT authentication (jsonwebtoken ^9.0.2)
- Socket.IO ^4.8.1
- bcrypt ^6.0.0
- Helmet ^8.1.0, CORS ^2.8.5
- express-validator ^7.2.1
- nodemailer ^7.0.9
- dayjs ^1.11.18

**Frontend**:

- React ^19.1.1
- React Router ^7.9.4
- MUI v7.3.4 (Material-UI)
- Redux Toolkit ^2.9.0
- RTK Query
- react-hook-form ^7.65.0
- Socket.IO client ^4.8.1
- dayjs ^1.11.18

**Testing**:

- Jest ^30.2.0
- Supertest ^7.1.4
- fast-check ^4.3.0

## Warnings

### Critical Rules - MUST FOLLOW

1. **NO SKIPPING**: Complete ALL tasks in each phase before proceeding
2. **TEST BEFORE MERGE**: All tests MUST pass before merging phase branch to main
3. **FIELD NAMES**: Backend validators are ONLY source of truth - frontend MUST match exactly
4. **CONSTANTS**: Always import from utils/constants.js - NEVER hardcode values
5. **MUI v7 SYNTAX**: Use `size` prop for Grid, NOT `item` prop
6. **REACT HOOK FORM**: NEVER use watch() - ALWAYS use Controller with controlled components
7. **SOFT DELETE**: ALL models use soft delete plugin - NEVER hard delete
8. **PAGINATION**: Backend uses 1-based, MUI uses 0-based - MUST convert
9. **DIALOGS**: ALL dialogs MUST include accessibility props (disableEnforceFocus, disableRestoreFocus, aria-labelledby, aria-describedby)
10. **TRANSACTIONS**: All cascade operations MUST use MongoDB transactions

### Security Requirements - NON-NEGOTIABLE

1. JWT tokens in HTTP-only cookies ONLY (never localStorage)
2. Password hashing with bcrypt ≥12 salt rounds
3. Rate limiting in production (100 req/15min general, 5 req/15min auth)
4. Input sanitization with express-mongo-sanitize
5. Security headers with Helmet (CSP, HSTS, X-Frame-Options)
6. CORS with no wildcard origins in production
7. HTTPS enforced in production

### Architecture Principles

1. **Layered Architecture**: Routes → Controllers → Services → Models
2. **Synchronous Development**: Backend and frontend developed together per phase
3. **Incremental Integration**: Each phase produces working, integrated features
4. **Test-Driven**: Tests written and passing before moving to next phase
5. **Branch-Based**: Each phase on separate branch, merged when complete

## Requirements

### R1. Project Foundation

#### R1.1 Backend Configuration

- ES modules enabled (`"type": "module"` in package.json)
- Environment variables validated on startup
- MongoDB connection with retry logic and health checks
- Express middleware stack in correct order: helmet → cors → cookieParser → body parsers → mongoSanitize → compression → rate limiting
- Error handling with CustomError class and global error handler
- Winston logging with file and console transports
- Server lifecycle management (graceful shutdown)

#### R1.2 Frontend Configuration

- Vite configuration with React plugin and SWC
- Redux store with persistence (auth slice only)
- React Router v7 with lazy loading
- MUI theme with light/dark/system mode support
- Socket.IO client service with auto-reconnect
- Error boundaries for component and route errors
- Toast notifications with react-toastify

#### R1.3 Development Environment

- Git repository initialized with .gitignore
- Environment variables configured (.env files)
- NPM scripts for development, production, and testing
- README.md with setup instructions

### R2. Authentication & Authorization

#### R2.1 User Model

- Fields: firstName, lastName, email, password (bcrypt hashed, select: false), role (SuperAdmin/Admin/Manager/User), organization (ref: Organization, no Id postfix), department (ref: Department, no Id postfix), profilePicture, skills (max 10), employeeId, dateOfBirth, joinedAt, emailPreferences, isPlatformUser, isHod, lastLogin
- Indexes: unique email per organization, unique employeeId per organization, unique HOD per department
- Virtuals: fullName
- Pre-save hooks: set isPlatformUser, set isHod, hash password
- Instance methods: comparePassword, generatePasswordResetToken, verifyPasswordResetToken
- Soft delete plugin applied
- TTL: 365 days

#### R2.2 Organization Model

- Fields: name, description, email, phone, address, industry (24 options), logoUrl, createdBy, isPlatformOrg (immutable)
- Indexes: unique name/email/phone per non-deleted, isPlatformOrg
- Cascade delete: departments → users → tasks → activities → comments → attachments → materials → vendors → notifications
- Platform organization protection (cannot delete)
- TTL: never expires

#### R2.3 Department Model

- Fields: name, description, organization (ref: Organization, no Id postfix), createdBy (ref: User, no Id postfix)
- Indexes: unique name per organization
- Cascade delete: users → tasks → materials → vendors
- TTL: 365 days

#### R2.4 JWT Authentication

- Access token: 15 minutes expiry, stored in access_token cookie
- Refresh token: 7 days expiry, stored in refresh_token cookie, rotates on refresh
- Cookie settings: httpOnly, secure (production), sameSite: 'strict'
- Middleware: verifyJWT, verifyRefreshToken
- Endpoints: /api/auth/login, /api/auth/logout, /api/auth/refresh-token, /api/auth/register, /api/auth/forgot-password, /api/auth/reset-password

#### R2.5 Authorization Matrix

- File: config/authorizationMatrix.json
- Roles: SuperAdmin, Admin, Manager, User (descending privileges)
- Operations: create, read, update, delete
- Scopes: own, ownDept, crossDept, crossOrg
- Resources: Organization, Department, User, Task, TaskActivity, TaskComment, Material, Vendor, Attachment, Notification
- Middleware: authorize(resource, operation)
- Platform SuperAdmin: crossOrg scope for Organization resource only
- Customer SuperAdmin/Admin: crossDept scope within organization
- Manager/User: ownDept scope

#### R2.6 Password Security

- Bcrypt hashing with ≥12 salt rounds
- Minimum 8 characters
- Password reset with hashed tokens (1 hour expiry)
- Password never in API responses (select: false)

### R3. Multi-Tenancy & Data Isolation

#### R3.1 Platform vs Customer Organizations

- Platform organization: isPlatformOrg: true, only one exists, created in seed data
- Customer organizations: isPlatformOrg: false, multiple allowed, created via registration
- Platform users: isPlatformUser: true, automatically set based on organization
- Customer users: isPlatformUser: false, automatically set based on organization
- Platform SuperAdmin: crossOrg scope (all organizations)
- Customer SuperAdmin: crossDept scope (own organization only)

#### R3.2 Data Scoping

- All queries scoped to user's organization and department (except Platform SuperAdmin and on some own organization resource)
- Manager/User: queries scoped to own department
- Admin/SuperAdmin: queries scoped to own organization
- Platform SuperAdmin: no scoping (all organizations)

#### R3.3 Head of Department (HOD)

- isHod: true for SuperAdmin and Admin roles
- isHod: false for Manager and User roles
- Only one HOD per department (unique index)
- Only HOD users can be watchers on ProjectTasks
- Cannot delete last HOD in department

### R4. Task Management

#### R4.1 BaseTask Model (Discriminator)

- Fields: title (max 50), description (max 2000), status (To Do/In Progress/Completed/Pending), priority (Low/Medium/High/Urgent), organization, department, createdBy, attachments (max 10), watchers (max 20, HOD only), tags (max 5), taskType (discriminator key)
- Indexes: organization+department+createdAt, organization+createdBy+createdAt, organization+department+status+priority+dueDate
- Soft delete plugin applied
- TTL: 180 days

#### R4.2 ProjectTask Model

- Extends BaseTask
- Additional fields: vendorId (required), estimatedCost, actualCost, currency, costHistory (max 200), materials (max 20, via TaskActivity), assignees (max 20), startDate, dueDate
- Purpose: Department task outsourced to external vendor
- Vendor communication: oral with department users
- Activity logging: department users log vendor's work
- Material tracking: via TaskActivity with quantities and attachments

#### R4.3 RoutineTask Model

- Extends BaseTask
- Additional fields: materials (max 20, direct), startDate (required), dueDate (required)
- Purpose: Daily routine task received from outlets
- Status restriction: cannot be "To Do"
- Priority restriction: cannot be "Low"
- No TaskActivity: materials added directly to task
- No assignment: user receives task, not formally assigned

#### R4.4 AssignedTask Model

- Extends BaseTask
- Additional fields: assignedTo (required, single or array), startDate, dueDate
- Purpose: Task assigned to department user(s)
- Activity logging: assigned users log their own work
- Material tracking: via TaskActivity with quantities and attachments

#### R4.5 TaskActivity Model

- Fields: content (max 2000), parentId (ProjectTask or AssignedTask ONLY), parentModel, materials (max 20), createdBy, department, organization
- Purpose: Track work progress on ProjectTask and AssignedTask
- NOT for RoutineTask: RoutineTask materials added directly
- Cascade delete: comments and attachments
- TTL: 90 days

#### R4.6 TaskComment Model

- Fields: content (max 2000), parentId (task/activity/comment), parentModel, mentions (max 5), createdBy, department, organization
- Threading: max depth 3 levels
- Cascade delete: child comments and attachments
- TTL: 90 days

### R5. Material & Vendor Management

#### R5.1 Material Model

- Fields: name, description, category (9 options), quantity, unitType (30+ types), cost, price, currency, vendorId, department, organization, addedBy
- Categories: Electrical, Mechanical, Plumbing, Hardware, Cleaning, Textiles, Consumables, Construction, Other
- Unit types: pcs, kg, g, l, ml, m, cm, mm, m2, m3, box, pack, roll, sheet, etc.
- Usage: ProjectTask/AssignedTask via TaskActivity, RoutineTask directly
- TTL: 180 days

#### R5.2 Vendor Model

- Fields: name, description, contactPerson, email, phone, address, department, organization, createdBy
- Purpose: External clients/vendors who take and complete ProjectTasks
- Communication: oral with department users
- Deletion: requires material reassignment
- TTL: 180 days

### R6. File Management

#### R6.1 Attachment Model

- Fields: filename, fileUrl, fileType (Image/Video/Document/Audio/Other), fileSize, parentId, parentModel, uploadedBy, department, organization
- File types: Image (.jpg, .jpeg, .png, .gif, .webp, .svg), Video (.mp4, .avi, .mov, .wmv), Document (.pdf, .doc, .docx, .xls, .xlsx), Audio (.mp3, .wav, .ogg), Other
- Size limits: Image (10MB), Video (100MB), Document (25MB), Audio (20MB), Other (50MB)
- Max attachments: 10 per entity
- TTL: 90 days

#### R6.2 Cloudinary Integration

- Direct upload: Client → Cloudinary → Backend
- URL storage: Cloudinary URL in database
- Public ID: for deletion
- Folder structure: organized by resource type

### R7. Notifications & Real-Time

#### R7.1 Notification Model

- Fields: title, message, type (Created/Updated/Deleted/Restored/Mention/Welcome/Announcement), isRead, recipientId, entityId, entityModel, organization, expiresAt
- TTL: 30 days (or custom expiresAt)
- Max recipients: 500 per notification

#### R7.2 Socket.IO Configuration

- Backend: singleton instance in utils/socketInstance.js
- Frontend: service in services/socketService.js
- Authentication: HTTP-only cookies (same JWT as HTTP)
- Rooms: user:${userId}, department:${departmentId}, organization:${organizationId}
- Events: task:created/updated/deleted/restored, activity:created/updated, comment:created/updated/deleted, notification:created, user:online/offline/away
- Auto-reconnect: exponential backoff (1s to 5s, max 5 attempts)

#### R7.3 Email Service

- Provider: Gmail SMTP (smtp.gmail.com:587)
- Authentication: app-specific passwords
- Queue: in-memory async queue
- Templates: task notifications, mentions, welcome, password reset, announcements
- User preferences: enabled, taskNotifications, taskReminders, mentions, announcements, welcomeEmails, passwordReset

### R8. Soft Delete & Cascade Operations

#### R8.1 Soft Delete Plugin

- Fields: isDeleted (default: false), deletedAt, deletedBy, restoredAt, restoredBy, restoreCount
- Query helpers: withDeleted(), onlyDeleted()
- Instance methods: softDelete(deletedBy, {session}), restore(restoredBy, {session})
- Static methods: softDeleteById, softDeleteMany, restoreById, restoreMany, findDeletedByIds, countDeleted, ensureTTLIndex, getRestoreAudit
- Hard delete protection: all hard delete operations blocked
- Automatic filtering: queries exclude soft-deleted by default

#### R8.2 TTL Configuration

- Users: 365 days
- Tasks: 180 days
- TaskActivity: 90 days
- TaskComment: 90 days
- Organizations: never expires
- Departments: 365 days
- Materials: 180 days
- Vendors: 180 days
- Attachments: 90 days
- Notifications: 30 days

#### R8.3 Cascade Delete Tree

```
Organization
├── Department
│   ├── User
│   │   ├── Task (createdBy)
│   │   │   ├── TaskActivity
│   │   │   │   ├── TaskComment
│   │   │   │   │   └── Attachment
│   │   │   │   └── Attachment
│   │   │   ├── TaskComment
│   │   │   │   ├── TaskComment (nested, max depth 3)
│   │   │   │   │   └── Attachment
│   │   │   │   └── Attachment
│   │   │   └── Attachment
│   │   ├── TaskActivity (createdBy)
│   │   ├── TaskComment (createdBy)
│   │   ├── Attachment (uploadedBy)
│   │   ├── Material (addedBy)
│   │   └── Notification (createdBy)
│   ├── Task (department)
│   ├── Material (department)
│   └── Vendor (department)
└── [All resources in organization]
```

#### R8.4 Transaction Requirements

- All cascade operations MUST use MongoDB transactions
- All-or-nothing: if any operation fails, entire cascade rolls back
- Session management: create session, start transaction, commit/abort, end session

### R9. Security Measures

#### R9.1 Rate Limiting (Production Only)

- General API: 100 requests per 15 minutes per IP
- Auth endpoints: 5 requests per 15 minutes per IP
- Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

#### R9.2 Input Sanitization

- express-mongo-sanitize: removes $ and . from user input
- express-validator: validates all inputs
- Field types enforced
- Length limits enforced
- Enum values enforced

#### R9.3 Security Headers (Helmet)

- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS): 1 year, includeSubDomains, preload
- X-Frame-Options: deny
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Hide X-Powered-By header

#### R9.4 CORS Configuration

- Origin validation with logging
- Credentials enabled (cookies)
- Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Allowed headers: Content-Type, Authorization, X-Requested-With
- Exposed headers: X-Request-ID, X-RateLimit-\*
- Preflight cache: 24 hours
- No wildcard origins in production

#### R9.5 XSS & CSRF Protection

- HTTP-only cookies: tokens not accessible to JavaScript
- SameSite cookies: 'strict' prevents CSRF
- Input sanitization: all inputs validated
- Output encoding: Mongoose automatically escapes
- CSP headers: restrict script sources

### R10. Frontend Architecture

#### R10.1 State Management

- Redux Toolkit with RTK Query
- Persisted slices: auth only (user, isAuthenticated, isLoading)
- RTK Query cache: auto-managed, not persisted
- Cache tags: Task, TaskActivity, TaskComment, User, Organization, Department, Material, Vendor, Notification, Attachment
- Cache invalidation: on mutations and Socket.IO events

#### R10.2 Routing

- React Router v7 with lazy loading
- Public routes: Home, Login, Register, Forgot Password
- Protected routes: Dashboard, Tasks, Users, Materials, Vendors, Departments, Organizations
- Route protection: ProtectedRoute and PublicRoute components
- Error handling: RouteError component for 404 and errors

#### R10.3 UI Patterns

- DataGrid Pattern: Organizations, Departments, Materials, Vendors, Users (admin view)
- Three-Layer Pattern: Tasks, Users (user view) - Page → List → Card
- Form Pattern: CreateUpdate\* components for all resources
- Filter Pattern: \*Filter components with debouncing

#### R10.4 Component Library

- MUI v7.3.4 with breaking changes from v6
- Grid: use size prop, NOT item prop
- Autocomplete: use slots API, NOT renderTags
- Dialog: requires accessibility props (disableEnforceFocus, disableRestoreFocus, aria-labelledby, aria-describedby)

##### R10.4.1 Existing Common Components (Validated & Ready to Use)

The following components in `client/src/components/common/` are already implemented, validated, and ready for use throughout the application:

**CustomIcons.jsx**:

- `PlatformIconLogo`: Platform branding icon with gradient styling
- Usage: Navigation, headers, branding elements

**MuiDialog.jsx**:

- Reusable dialog wrapper for all CRUD operations
- Props: open, onClose, title, children, actions, fullScreen, disableBackdropClick, disableEscapeKeyDown, maxWidth, isLoading
- Features: Responsive (mobile full-screen), accessibility compliant (disableEnforceFocus, disableRestoreFocus), scrollable content, fixed header/footer
- Usage: All create/update/view dialogs across resources

**MuiDialogConfirm.jsx**:

- Confirmation dialog for destructive actions (delete, restore, etc.)
- Props: open, onClose, onConfirm, title, message, confirmText, cancelText, severity (error/warning/info), isLoading
- Features: Keyboard navigation (Enter to confirm, Escape to cancel), severity-based icons and colors, accessibility compliant
- Usage: Delete confirmations, restore confirmations, destructive action confirmations

**MuiSelectAutocomplete.jsx**:

- Autocomplete select component integrated with react-hook-form
- Props: name, control, rules, options (array of {id, label}), label, required, placeholder, startAdornment, onValueChange
- Features: Controller-based (no watch()), error handling, custom styling, optional callback on value change
- Usage: All dropdown selections (departments, users, materials, vendors, etc.)

**MuiTextField.jsx**:

- Enhanced TextField component with consistent styling
- Props: name, type, startAdornment, endAdornment, error, helperText, onChange, onBlur, ref
- Features: Forward ref support, memoized adornments, error handling, custom icon button styling
- Usage: All text inputs across forms (with Controller from react-hook-form)

**CRITICAL RULES FOR USING EXISTING COMPONENTS**:

1. ALWAYS use these components instead of creating new ones
2. MuiDialog and MuiDialogConfirm already include required accessibility props
3. MuiSelectAutocomplete and MuiTextField MUST be used with Controller from react-hook-form
4. NEVER use watch() method with these components
5. All components follow MUI v7 syntax and best practices

#### R10.5 Form Management

- react-hook-form for all forms
- NEVER use watch() method
- ALWAYS use Controller with controlled components
- Validation: client-side matching backend validators
- Error handling: field-level and form-level errors

#### R10.6 Performance Optimization

- React.memo for list/card components
- useCallback for event handlers passed to children
- useMemo for computed values (dates, colors, etc.)
- Code splitting: lazy loading for routes
- Vendor chunks: React, MUI, Redux separated

### R11. Testing Requirements

#### R11.1 Test Framework

- Jest with ES modules support
- Real MongoDB test database for isolated testing
- Supertest for HTTP assertions
- fast-check for property-based testing

#### R11.2 Test Types

- Unit tests: individual functions and methods (60%)
- Integration tests: API endpoints and workflows (30%)
- Property-based tests: universal properties (10%)

#### R11.3 Test Configuration

- Global setup: Set environment variables for test database connection
- Global teardown: cleanup after all tests
- Setup: connect to real MongoDB test database, clean collections after each test
- Timeout: 30 seconds for database operations
- Max workers: 1 (sequential execution for isolation)

#### R11.4 Test Coverage

- Statements: 80%+
- Branches: 75%+
- Functions: 80%+
- Lines: 80%+
- Focus on core logic, not 100% coverage

#### R11.5 Property-Based Testing

- fast-check library for universal properties
- Minimum 100 runs per property
- No mocks: test real functionality
- Comment header: feature, property number, requirements
- Descriptive names: explain what is being tested

### R12. Timezone Management

#### R12.1 Backend Configuration

- Server timezone: UTC (process.env.TZ = 'UTC')
- dayjs with UTC and timezone plugins
- All dates stored in UTC
- API responses in ISO 8601 format

#### R12.2 Frontend Configuration

- Automatic local timezone detection
- UTC to local conversion for display
- Local to UTC conversion for submission
- DateTimePicker handles timezone automatically

#### R12.3 Date Utilities

- formatDate: format for display
- utcToLocal: convert UTC to local
- localToUtc: convert local to UTC

### R13. Validation & Constants

#### R13.1 Backend Validators

- express-validator for all endpoints
- Validators are ONLY source of truth for field names
- Frontend MUST match backend field names exactly
- Validation rules: required, min, max, enum, custom

#### R13.2 Constants Synchronization

- backend/utils/constants.js and client/src/utils/constants.js MUST be identical
- USER_ROLES: SuperAdmin, Admin, Manager, User
- TASK_STATUS: To Do, In Progress, Completed, Pending
- TASK_PRIORITY: Low, Medium, High, Urgent
- TASK_TYPES: ProjectTask, RoutineTask, AssignedTask
- MATERIAL_CATEGORIES: 9 categories
- UNIT_TYPES: 30+ types
- PAGINATION: page size options, limits
- LIMITS: max attachments, watchers, assignees, materials, tags, mentions, skills, comment depth, cost history, notification recipients
- LENGTH_LIMITS: title, description, comment, names, email, password

#### R13.3 Never Hardcode

- ALWAYS import constants from utils/constants.js
- NEVER hardcode "Completed", "Admin", "High", etc.
- Use constants for all enum values

### R14. Pagination Conversion

#### R14.1 Backend Pagination

- 1-based page numbers
- Response format: { page: 1, limit: 10, totalCount: 100, totalPages: 10, hasNext: true, hasPrev: false }

#### R14.2 Frontend Pagination

- MUI DataGrid uses 0-based page numbers
- Conversion: Frontend → Backend (page + 1), Backend → Frontend (page - 1)
- MuiDataGrid component automatically handles conversion

#### R14.3 Page Size Options

- [5, 10, 25, 50, 100]
- Default: 10
- Max: 100

### R15. Error Handling

#### R15.1 Backend Errors

- CustomError class: message, statusCode, errorCode, isOperational
- Static methods: badRequest, unauthorized, forbidden, notFound, conflict, gone, internalServer
- Global error handler: ErrorController.js
- Mongoose errors: CastError, ValidationError, duplicate key
- JWT errors: JsonWebTokenError, TokenExpiredError

#### R15.2 Frontend Errors

- AppError class: message, code, severity, type
- Error boundaries: ErrorBoundary.jsx (component errors), RouteError.jsx (route errors)
- Toast notifications: react-toastify for user-facing errors
- RTK Query: automatic error handling in mutations

### R16. Logging

#### R16.1 Winston Logger

- Transports: console and file-based
- Log levels: error, warn, info, http, verbose, debug, silly
- Files: logs/error.log (errors only), logs/combined.log (all logs)
- Format: JSON in production, colorized in development

#### R16.2 Log Categories

- Startup: server initialization, environment validation
- Database: MongoDB connection, disconnection, errors
- Socket: Socket.IO initialization, connections
- Email: email service initialization, sending
- Shutdown: graceful shutdown process
- Error: application errors with stack traces

#### R16.3 Morgan HTTP Logger

- Format: 'dev' (colorized, concise)
- Development only: disabled in production
- Use Winston for production HTTP logging

### R17. Deployment

#### R17.1 Production Build

- Frontend: npm run build:prod → client/dist/
- Backend serves frontend: express.static(client/dist)
- Single server: backend serves both API and frontend

#### R17.2 Environment Configuration

- Development: separate servers (backend:4000, frontend:3000)
- Production: single server (backend:4000 serves both)
- Environment variables: different for dev/prod
- HTTPS: enforced in production (secure cookies, HSTS)

#### R17.3 Process Management

- PM2 or systemd for Node.js process
- Cluster mode for multiple cores
- Graceful shutdown: close connections, stop accepting requests
- Health checks: /api/health endpoint

#### R17.4 Monitoring

- Winston logs: logs/error.log, logs/combined.log
- PM2 monitoring: built-in process monitoring
- MongoDB Atlas: database monitoring
- Uptime monitoring: external service

### R18. Git Workflow

#### R18.1 Branch Strategy

- main: production-ready code
- phase-X-[phase-name]: development branches for each phase

#### R18.2 Commit Messages

- Format: "Phase X: [Component] - [Brief description]"
- Examples: "Phase 1: Backend - Configure Express middleware stack", "Phase 2: Frontend - Create login form"

#### R18.3 Merge Requirements

- All tests MUST pass before merging
- Manual testing of all phase features
- Code review (if team)
- Merge to main only when phase complete

## Design

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Pages      │  │  Components  │  │   Services   │      │
│  │              │  │              │  │              │      │
│  │ - Dashboard  │  │ - Forms      │  │ - Socket.IO  │      │
│  │ - Tasks      │  │ - Cards      │  │ - Cloudinary │      │
│  │ - Users      │  │ - Filters    │  │              │      │
│  │ - Materials  │  │ - DataGrid   │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │  Redux Store    │                        │
│                   │  - RTK Query    │                        │
│                   │  - Auth Slice   │                        │
│                   └────────┬────────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    HTTP/WebSocket
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                      Backend (Express)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Routes     │  │ Controllers  │  │   Services   │      │
│  │              │  │              │  │              │      │
│  │ - Auth       │  │ - Business   │  │ - Email      │      │
│  │ - Users      │  │   Logic      │  │ - Notification│     │
│  │ - Tasks      │  │ - Validation │  │ - Socket.IO  │      │
│  │ - Materials  │  │              │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │     Models      │                        │
│                   │  - Mongoose     │                        │
│                   │  - Soft Delete  │                        │
│                   └────────┬────────┘                        │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │    MongoDB      │
                    │  - Collections  │
                    │  - Indexes      │
                    │  - TTL          │
                    └─────────────────┘
```

### Data Flow

#### Authentication Flow

```
1. User submits credentials → Frontend
2. Frontend sends POST /api/auth/login → Backend
3. Backend validates credentials → MongoDB
4. Backend generates JWT tokens
5. Backend sets HTTP-only cookies
6. Backend returns user data → Frontend
7. Frontend stores user in Redux (persisted)
8. Frontend redirects to dashboard
```

#### Real-Time Update Flow

```
1. User creates task → Frontend
2. Frontend sends POST /api/tasks → Backend
3. Backend creates task → MongoDB
4. Backend emits task:created → Socket.IO
5. Socket.IO broadcasts to department/organization rooms
6. Frontend receives event → Socket.IO client
7. Frontend invalidates RTK Query cache
8. Frontend refetches tasks
9. Frontend displays toast notification
```

#### Cascade Delete Flow

```
1. User deletes organization → Frontend
2. Frontend sends DELETE /api/organizations/:id → Backend
3. Backend starts MongoDB transaction
4. Backend soft deletes organization
5. Backend cascades to departments
6. Backend cascades to users
7. Backend cascades to tasks
8. Backend cascades to activities, comments, attachments
9. Backend commits transaction
10. Backend emits organization:deleted → Socket.IO
11. Frontend invalidates cache and refetches
```

### Multi-Tenancy Architecture

```
Platform Organization (isPlatformOrg: true)
├── Platform Department
│   ├── Platform SuperAdmin (isPlatformUser: true, crossOrg scope)
│   ├── Platform Admin (isPlatformUser: true, crossDept scope)
│   ├── Platform Manager (isPlatformUser: true, ownDept scope)
│   └── Platform User (isPlatformUser: true, ownDept scope)
└── Platform Resources

Customer Organization 1 (isPlatformOrg: false)
├── Department A
│   ├── Customer SuperAdmin (isPlatformUser: false, crossDept scope)
│   ├── Customer Admin (isPlatformUser: false, crossDept scope)
│   ├── Manager (isPlatformUser: false, ownDept scope)
│   └── User (isPlatformUser: false, ownDept scope)
├── Department B
│   └── Users...
└── Resources (isolated from other customers)

Customer Organization 2 (isPlatformOrg: false)
├── Departments...
└── Resources (isolated from other customers)
```

### Task Type Architecture

```
BaseTask (Abstract)
├── title, description, status, priority
├── organization, department, createdBy
├── attachments, watchers, tags
└── taskType (discriminator key)

ProjectTask (Discriminator)
├── Inherits BaseTask fields
├── vendorId (required) - external client
├── estimatedCost, actualCost, costHistory
├── materials (via TaskActivity)
├── startDate, dueDate (required, both can't be in past, startDate > dueDate )
└── Purpose: outsourced to vendor

RoutineTask (Discriminator)
├── Inherits BaseTask fields
├── materials (direct, no TaskActivity)
├── date (can not be in future)
├── Status: cannot be "To Do"
├── Priority: cannot be "Low"
└── Purpose: daily routine from outlets

AssignedTask (Discriminator)
├── Inherits BaseTask fields
├── assignee (single or array)
├── materials (via TaskActivity)
├── startDate, dueDate (required, both can't be in past, startDate > dueDate )
└── Purpose: assigned to user(s)
```

### Authorization Matrix Structure

```json
{
  "Resource": {
    "Role": {
      "operation": ["scope1", "scope2"]
    }
  }
}

Example:
{
  "Task": {
    "SuperAdmin": {
      "create": ["ownDept", "crossDept"],
      "read": ["ownDept", "crossDept"],
      "update": ["ownDept", "crossDept"],
      "delete": ["ownDept", "crossDept"]
    },
    "User": {
      "create": ["ownDept"],
      "read": ["ownDept"],
      "update": ["own"],
      "delete": ["own"]
    }
  }
}
```

### Resource Ownership

```json
{
  "Organization": ["createdBy"],
  "Department": ["createdBy"],
  "User": ["deletedBy", "restoredBy"],
  "Material": ["addedBy", "deletedBy", "restoredBy"],
  "Vendor": ["createdBy", "deletedBy", "restoredBy"],
  "BaseTask": ["createdBy", "watchers", "deletedBy", "restoredBy"],
  "RoutineTask": ["createdBy", "watchers", "deletedBy", "restoredBy"],
  "AssignedTask": [
    "createdBy",
    "watchers",
    "assignees",
    "deletedBy",
    "restoredBy"
  ],
  "ProjectTask": [
    "createdBy",
    "watchers",
    "vendor",
    "modifiedBy",
    "costHistory.changedBy",
    "deletedBy",
    "restoredBy"
  ],
  "TaskActivity": ["createdBy", "deletedBy", "restoredBy"],
  "TaskComment": ["createdBy", "mentions", "deletedBy", "restoredBy"],
  "Attachment": ["uploadedBy", "deletedBy", "restoredBy"],
  "Notification": [
    "createdBy",
    "recipients",
    "readBy.user",
    "deletedBy",
    "restoredBy"
  ]
}
```

### Controllers

1. Without session (read operation)

```
export const controllerName = asyncHandler(async (req, res, next) => {
	// Extract from req.user
	// Extract from req.validated.<body|params|query>

	// Any validation except existance and uniqueness
	// Existance and uniqueness must be handled on validators layer

	// Bussiness logic + Side Effects

	// Data population

	// Response
})

2. With Session

export const controllerName = asyncHandler(async (req, res, next) => {
	// Extract from req.user
	// Extract from req.validated.<body|params|query>

	// Any validation except existance and uniqueness
	// Existance and uniqueness must be handled on validators layer

    // Start a new session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Bussiness logic + Side Effects

        // Data population

        // Response
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
})
```

### Frontend Component Hierarchy

```
App.jsx
└── AppTheme (Theme Provider)
    └── RootLayout
        ├── PublicLayout (Public Routes)
        │   ├── Home
        │   ├── Login (LoginForm)
        │   └── Register (RegisterForm - multi-step)
        └── DashboardLayout (Protected Routes)
            ├── Header (Navigation, NotificationMenu, UserMenu)
            ├── Sidebar (Navigation Links)
            ├── Main Content
            │   ├── Dashboard (Widgets, Charts)
            │   ├── Tasks (Three-Layer: TasksList → TaskCard)
            │   ├── Users (Three-Layer: UsersList → UserCard)
            │   ├── Materials (DataGrid Pattern)
            │   ├── Vendors (DataGrid Pattern)
            │   ├── Departments (DataGrid Pattern)
            │   └── Organizations (DataGrid Pattern)
            └── Footer
```

## Tasks

### Development Principles

1. **Synchronous Development**: Backend and frontend developed together per phase
2. **Incremental Integration**: Each phase produces working, integrated features
3. **Test-Driven**: Tests written and passing before moving to next phase
4. **No Skipping**: All tasks must be completed; failures must be fixed
5. **Git Bash Compatible**: All commands work in Git Bash, WSL, VS Code integrated terminal
6. **Branch-Based Development**: Each phase on separate branch, merged to main when complete

### Git Workflow for Each Phase

```bash
# 1. Create phase branch from main
git checkout main
git pull origin main
git checkout -b phase-X-[phase-name]

# 2. Develop on phase branch (commit frequently)
git add .
git commit -m "Phase X: [Component] - [Task description]"

# 3. Test before merging (ALL TESTS MUST PASS)
cd backend && npm test
cd client && npm run build
# Manual testing of all phase features

# 4. Merge to main
git checkout main
git merge phase-X-[phase-name]
git push origin main

# 5. Delete phase branch (optional)
git branch -d phase-X-[phase-name]
```

### Phase 1: Project Foundation & Configuration

**Branch**: `phase-1-project-setup`

**Objective**: Set up complete backend and frontend infrastructure with security, logging, and error handling

#### Backend Tasks

**T1.1: Initialize Backend Structure**

```bash
cd backend
mkdir -p config controllers errorHandler middlewares/validators models/plugins routes services templates utils mock __tests__/unit __tests__/property logs
```

**T1.2: Create Core Configuration Files**

Create `backend/config/db.js`:

- MongoDB connection with retry logic
- Connection options: serverSelectionTimeoutMS: 5000, socketTimeoutMS: 45000, maxPoolSize: 10, minPoolSize: 2
- Health check every 30 seconds
- Exponential backoff retry strategy (max 30s delay)
- Connection state monitoring (0: disconnected, 1: connected, 2: connecting, 3: disconnecting)
- Graceful shutdown handling

Create `backend/config/allowedOrigins.js`:

- Development origins: http://localhost:3000, http://localhost:5173
- Production origins: process.env.CLIENT_URL + process.env.ALLOWED_ORIGINS
- Export array of allowed origins

Create `backend/config/corsOptions.js`:

- Origin validation function with logging
- Credentials: true
- Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Allowed headers: Content-Type, Authorization, X-Requested-With
- Exposed headers: X-Request-ID, X-RateLimit-Limit, X-RateLimit-Remaining
- Max age: 86400 (24 hours)
- Options success status: 200

**T1.3: Create Error Handling System**

Create `backend/errorHandler/CustomError.js`:

- CustomError class extending Error
- Properties: message, statusCode, errorCode, isOperational
- Static methods: badRequest(400), authenticated(401), unauthorized(403), notFound(404), conflict(409), validationError(422), serviceUnavailable(503), internalServer(500)
- Error.captureStackTrace for stack traces

Create `backend/errorHandler/ErrorController.js`:

- Global error handler middleware
- Handle Mongoose errors: CastError, ValidationError, duplicate key (code 11000)
- Handle JWT errors: JsonWebTokenError, TokenExpiredError
- Log errors with Winston
- Return error response: { success: false, message, errorCode, stack (dev only) }

**T1.4: Create Logging System**

Create `backend/utils/logger.js`:

- Winston logger with file and console transports
- Log levels: error, warn, info, http, verbose, debug, silly
- File transports: logs/error.log (error level), logs/combined.log (all levels)
- Console transport: colorized in development, JSON in production
- Format: timestamp, level, message, metadata
- Max file size: 5MB, max files: 5

**T1.5: Create Validation Utilities**

Create `backend/middlewares/validators/validation.js`:

- validate middleware using express-validator
- Extract validation errors from request
- Format errors: { field, message, value }
- Throw CustomError.badRequest if validation fails

**T1.6: Create Constants File**

Create `backend/utils/constants.js`:

- USER_ROLES: { SUPER_ADMIN: 'SuperAdmin', ADMIN: 'Admin', MANAGER: 'Manager', USER: 'User' }
- TASK_STATUS: ['To Do', 'In Progress', 'Completed', 'Pending']
- TASK_PRIORITY: ['Low', 'Medium', 'High', 'Urgent']
- TASK_TYPES: ['ProjectTask', 'RoutineTask', 'AssignedTask']
- USER_STATUS: ['Online', 'Offline', 'Away']
- MATERIAL_CATEGORIES: ['Electrical', 'Mechanical', 'Plumbing', 'Hardware', 'Cleaning', 'Textiles', 'Consumables', 'Construction', 'Other']
- UNIT_TYPES: ['pcs', 'kg', 'g', 'l', 'ml', 'm', 'cm', 'mm', 'm2', 'm3', 'box', 'pack', 'roll', 'sheet', 'bag', 'bottle', 'can', 'carton', 'dozen', 'gallon', 'jar', 'pair', 'ream', 'set', 'tube', 'unit', 'yard', 'ton', 'barrel', 'bundle']
- PAGINATION: { DEFAULT_PAGE: 1, DEFAULT_LIMIT: 10, DEFAULT_SORT_BY: 'createdAt', DEFAULT_SORT_ORDER: 'desc', PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100], MAX_LIMIT: 100 }
- LIMITS: { MAX_ATTACHMENTS: 10, MAX_WATCHERS: 20, MAX_ASSIGNEES: 20, MAX_MATERIALS: 20, MAX_TAGS: 5, MAX_MENTIONS: 5, MAX_SKILLS: 10, MAX_COMMENT_DEPTH: 3, MAX_COST_HISTORY: 200, MAX_NOTIFICATION_RECIPIENTS: 500 }
- LENGTH_LIMITS: { TITLE_MAX: 50, DESCRIPTION_MAX: 2000, COMMENT_MAX: 2000, ORG_NAME_MAX: 100, DEPT_NAME_MAX: 100, USER_NAME_MAX: 20, EMAIL_MAX: 50, PASSWORD_MIN: 8, POSITION_MAX: 100, ADDRESS_MAX: 500, PHONE_MAX: 20, SKILL_NAME_MAX: 50, TAG_MAX: 50 }
- INDUSTRIES: ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Hospitality', 'Real Estate', 'Transportation', 'Energy', 'Agriculture', 'Construction', 'Media', 'Telecommunications', 'Automotive', 'Aerospace', 'Pharmaceutical', 'Legal', 'Consulting', 'Non-Profit', 'Government', 'Entertainment', 'Food & Beverage', 'Other']

**T1.7: Create Helper Utilities**

Create `backend/utils/helpers.js`:

- formatResponse(success, message, data): standardize API responses
- formatPaginatedResponse(success, message, resourceName, docs, pagination): paginated responses
- validateObjectId(id): check if valid MongoDB ObjectId
- sanitizeUser(user): remove password and sensitive fields
- generateRandomToken(): generate random token for password reset

Create `backend/utils/validateEnv.js`:

- Validate required environment variables on startup
- Required: MONGODB_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
- Optional: PORT, CLIENT_URL, NODE_ENV, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM
- Throw error if required variables missing
- Log warnings for optional variables

**T1.8: Configure Express Application**

Create `backend/app.js`:

- Import dependencies: express, helmet, cors, cookieParser, mongoSanitize, compression, morgan
- Initialize Express app
- Set timezone: process.env.TZ = 'UTC'
- Configure dayjs with UTC and timezone plugins
- Apply middleware in order:
  1. helmet (security headers with CSP, HSTS in production)
  2. cors (corsOptions)
  3. cookieParser
  4. express.json({ limit: '10mb' })
  5. express.urlencoded({ extended: true, limit: '10mb' })
  6. mongoSanitize
  7. compression({ threshold: 1024 })
  8. Request ID middleware (randomUUID)
  9. morgan (development only)
  10. Rate limiting (production only)
- Mount routes: app.use('/api', routes)
- Serve frontend static files (production only)
- 404 handler
- Global error handler
- Export app

**T1.9: Configure Server**

Create `backend/server.js`:

- Import app, connectDB, logger, validateEnv
- Validate environment variables
- Connect to MongoDB
- Create HTTP server
- Initialize Socket.IO (placeholder for Phase 4)
- Start server on PORT
- Graceful shutdown: SIGTERM, SIGINT handlers
- Close MongoDB connection on shutdown
- Log startup and shutdown events

**T1.10: Create Rate Limiter**

Create `backend/middlewares/rateLimiter.js`:

- Import express-rate-limit
- General API limiter: 100 requests per 15 minutes
- Auth limiter: 5 requests per 15 minutes
- Key generator: req.ip
- Standard headers: true
- Skip in development: process.env.NODE_ENV !== 'production'
- Export apiLimiter, authLimiter

#### Frontend Tasks

**T1.11: Initialize Frontend Structure**

```bash
cd client/src
mkdir -p components/auth components/cards components/columns components/common components/filters components/forms/auth components/forms/departments components/forms/materials components/forms/users components/forms/vendors components/lists hooks layouts pages redux/app redux/features/api redux/features/auth redux/features/user redux/features/organization redux/features/department redux/features/task redux/features/material redux/features/vendor redux/features/notification redux/features/attachment router services utils
```

**T1.12: Create Constants File**

Create `client/src/utils/constants.js`:

- Copy EXACT content from backend/utils/constants.js
- MUST be identical to backend constants
- Export all constants

**T1.13: Create Error Handler**

Create `client/src/utils/errorHandler.js`:

- AppError class extending Error
- Properties: message, code, severity, type
- Static methods: badRequest, unauthorized, forbidden, notFound
- Export AppError

**T1.14: Configure Redux Store**

Create `client/src/redux/app/store.js`:

- Import configureStore, setupListeners
- Import persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER
- Import storage from redux-persist/lib/storage
- Persist config: key: 'root', storage, whitelist: ['auth']
- Configure store with api reducer and persisted auth reducer
- Middleware: getDefaultMiddleware with serializableCheck ignoring persist actions, concat api.middleware
- Export store, persistor
- Setup listeners

Create `client/src/redux/features/api.js`:

- Import createApi, fetchBaseQuery
- Base query: baseUrl: import.meta.env.VITE_API_URL, credentials: 'include', prepareHeaders
- Tag types: Task, TaskActivity, TaskComment, User, Organization, Department, Material, Vendor, Notification, Attachment
- Export api

Create `client/src/redux/features/auth/authSlice.js`:

- Initial state: { user: null, isAuthenticated: false, isLoading: false }
- Reducers: setUser, clearUser, setLoading
- Selectors: selectUser, selectIsAuthenticated, selectIsLoading
- Export slice, actions, selectors

**T1.15: Configure React Router**

Create `client/src/router/routes.jsx`:

- Import createBrowserRouter
- Import layouts: RootLayout, PublicLayout, DashboardLayout
- Import route protection: ProtectedMiddleware, PublicMiddleware
- Import ErrorBoundary, LoadingFallback
- Lazy load pages: Home, Login, Register, Dashboard, NotFound
- Define routes structure:
  - / (RootLayout, LoadingFallback, ErrorBoundary: ErrorBoundary)
    - PublicLayout
      - /(Home, PublicMiddleware)
      - /login (Login, PublicMiddleware)
      - /register (Register, PublicMiddleware)
        ...
    - DashboardLayout
      - /dashboard (Dashboard, ProtectedMiddleware)
        ...
    - (NotFound)
- Export router

- Example:

```json
const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    HydrateFallback: LoadingFallback,
    ErrorBoundary: ErrorBoundary, // react-error-boundary, for both root level and nested level
    children: [
      // Public routes with PublicLayout
      {
        Component: PublicLayout,
        middleware: [PublicMiddleware], // react-router v7 feature in data mode
        children: [
          {
            index: true,
            lazy: async () => {
              const m = await import("../pages/Home.jsx");
              return { Component: m.default };
            },
          },

          ...
        ],
      },
      // Protected routes with DashboardLayout
      {
        Component: DashboardLayout,
        middleware: [ProtectedMiddleware], // react-router v7 feature in data mode
        children: [
          {
            path: "dashboard",
            lazy: async () => {
              const m = await import("../pages/Dashboard.jsx");
              return { Component: m.default };
            },
          },

          ...
        ]
      },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);

export default router;

```

**T1.16: Create Route Protection Components**

Create `client/src/components/auth/ProtectedRoute.jsx`:

- Check isAuthenticated from Redux
- If loading, show MuiLoading fullScreen
- If not authenticated, Navigate to /login
- Otherwise render children

Create `client/src/components/auth/PublicRoute.jsx`:

- Check isAuthenticated from Redux
- If authenticated, Navigate to /dashboard
- Otherwise render children

**T1.17: Create Layout Components**

Create `client/src/layouts/RootLayout.jsx`:

- Outlet for nested routes
- ErrorBoundary wrapper

Create `client/src/layouts/PublicLayout.jsx`:

- Simple layout for public pages
- Outlet for nested routes

Create `client/src/layouts/DashboardLayout.jsx`:

- Header with navigation, NotificationMenu, UserMenu
- Sidebar with navigation links
- Main content area with Outlet
- Footer
- Responsive design (mobile drawer)

**T1.18: Create Common Components**

Create `client/src/components/common/MuiLoading.jsx`:

- LoadingFallback: CircularProgress with message, configurable height
- BackdropFallback: full-screen loading overlay
- NavigationLoader: top progress bar
- ContentLoader: loading overlay for content area
- Export all components

Create `client/src/components/common/ErrorBoundary.jsx`:

- React.Component with getDerivedStateFromError, componentDidCatch
- State: hasError, error
- Render fallback UI with error message and reload button
- Log error to console

Create `client/src/components/common/RouteError.jsx`:

- useRouteError, useNavigate
- Display error status (404, 500, etc.)
- Display error message
- Button to navigate home

**T1.19: Create Basic Pages**

Create `client/src/pages/Home.jsx`:

- Landing page with hero section
- Features overview
- Call to action (Login/Register buttons)

Create `client/src/pages/NotFound.jsx`:

- 404 page with illustration (notFound_404.svg)
- Message: "Page Not Found"
- Button to navigate home

Create `client/src/pages/Dashboard.jsx`:

- Placeholder dashboard
- Welcome message
- Statistics cards (placeholder)

**T1.20: Update App.jsx**

Update `client/src/App.jsx`:

- Import RouterProvider, router
- Import Provider from react-redux, store, persistor
- Import PersistGate from redux-persist/integration/react
- Import AppTheme
- Import ToastContainer from react-toastify
- Wrap app: Provider → PersistGate → AppTheme → RouterProvider
- Add ToastContainer with position: top-right, autoClose: 3000

**T1.21: Update main.jsx**

Update `client/src/main.jsx`:

- Import React, ReactDOM
- Import App
- Import './index.css'
- Import 'react-toastify/dist/ReactToastify.css'
- Render: ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)

#### Testing Tasks

**T1.22: Configure Jest Without MongoMemoryServer**

Create `backend/jest.config.js`:

- testEnvironment: 'node'
- transform: {}
- extensionsToTreatAsEsm: ['.js']
- moduleNameMapper: { '^(\\.{1,2}/.\*)\\.js$': '$1' }
- testMatch: ['**/__tests__/**/*.test.js', '**/__tests__/**/*.property.test.js']
- collectCoverageFrom: ['app.js', 'server.js', 'config/**/*.js', 'controllers/**/*.js', 'middlewares/**/*.js', 'models/**/*.js', 'routes/**/*.js', 'services/**/*.js', 'utils/**/*.js', '!**/node_modules/**', '!**/__tests__/**', '!**/coverage/**']
- coverageDirectory: 'coverage'
- coverageReporters: ['text', 'lcov', 'html']
- globalSetup: './**tests**/globalSetup.js'
- globalTeardown: './**tests**/globalTeardown.js'
- setupFilesAfterEnv: ['./__tests__/setup.js']
- testTimeout: 30000
- maxWorkers: 1

Create `backend/__tests__/globalSetup.js`:

- Set process.env.MONGODB_URI to a dedicated test database (e.g., mongodb://localhost:27017/task-manager-test)
- Set process.env.NODE_ENV = 'test'
- Set process.env.JWT_ACCESS_SECRET = 'test-access-secret-min-32-characters-long'
- Set process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-32-characters-long'
- No MongoMemoryServer - use real MongoDB instance with separate test database

Create `backend/__tests__/globalTeardown.js`:

- No MongoMemoryServer cleanup needed
- Optionally drop test database if desired

Create `backend/__tests__/setup.js`:

- Import mongoose
- beforeAll: connect to test database
- afterAll: drop all collections, close connection
- afterEach: delete all documents from all collections (clean slate for each test)

**T1.23: Write Unit Tests for Phase 1**

Create `backend/__tests__/unit/app.test.js`:

- Test Express app configuration
- Test middleware order
- Test CORS configuration
- Test security headers
- Test error handling

Create `backend/__tests__/unit/validateEnv.test.js`:

- Test environment variable validation
- Test missing required variables
- Test optional variables

Create `backend/__tests__/unit/helpers.test.js`:

- Test formatResponse
- Test formatPaginatedResponse
- Test validateObjectId
- Test sanitizeUser

#### Integration & Verification

**T1.24: Start Backend Server**

```bash
cd backend
npm run dev
```

- Verify server starts on port 4000
- Verify MongoDB connection successful
- Verify no errors in console
- Verify logs/combined.log created

**T1.25: Start Frontend Server**

```bash
cd client
npm run dev
```

- Verify server starts on port 3000
- Verify no errors in console
- Verify home page loads
- Verify theme applied correctly

**T1.26: Run Tests**

```bash
cd backend
npm test
```

- Verify all tests pass
- Verify coverage reports generated

**T1.27: Manual Testing**

- Navigate to http://localhost:3000
- Verify home page displays
- Verify navigation works
- Verify 404 page displays for invalid routes
- Verify error boundary catches errors
- Verify theme switcher works (if implemented)

**T1.28: Git Commit & Merge**

```bash
git add .
git commit -m "Phase 1: Complete project foundation and configuration"
git checkout main
git merge phase-1-project-setup
git push origin main
git branch -d phase-1-project-setup
```

**Phase 1 Completion Checklist**:

- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] MongoDB connection successful
- [ ] All unit tests pass
- [ ] Environment variables validated
- [ ] Logging system working
- [ ] Error handling working
- [ ] CORS configured correctly
- [ ] Security headers applied
- [ ] Rate limiting configured (production)
- [ ] Redux store configured
- [ ] React Router configured
- [ ] Theme applied
- [ ] Toast notifications working
- [ ] Error boundaries working
- [ ] Git branch merged to main

### Phase 2: Authentication & User Management

**Branch**: `phase-2-authentication`

**Objective**: Implement complete authentication system with JWT cookies, user management, and authorization

#### Backend Tasks

**T2.1: Validate and Use Existing Soft Delete Plugin**

Validate `backend/models/plugins/softDelete.js`:

- Verify fields exist: isDeleted (default: false), deletedAt, deletedBy, restoredAt, restoredBy, restoreCount
- Verify indexes: isDeleted, deletedAt, deletedBy
- Verify query helpers: withDeleted(), onlyDeleted() - these are critical for validators to check existence and uniqueness including soft-deleted records
- Verify instance methods: softDelete(deletedBy, {session}), restore(restoredBy, {session})
- Verify static methods: softDeleteById, softDeleteMany, restoreById, restoreMany, findDeletedByIds, countDeleted, ensureTTLIndex, getRestoreAudit
- Verify pre-find hooks: automatically filter out soft-deleted documents
- Verify hard delete operations blocked: deleteOne, deleteMany, findOneAndDelete, remove
- If any issues found, correct them
- Ensure withDeleted() and onlyDeleted() work correctly for validator existence/uniqueness checks
- Export plugin function

**T2.2: Create Organization Model**

Create `backend/models/Organization.js`:

- Schema fields: name (required, unique, lowercase, max 100), description (max 2000), email (required, unique, valid email, max 50), phone (required, unique, E.164 format), address (max 500), industry (required, one of 24 industries), logoUrl (url, publicId), createdBy (ref: User, no Id postfix), isPlatformOrg (default: false, immutable)
- Indexes: { name: 1 } unique partial, { email: 1 } unique partial, { phone: 1 } unique partial, { isPlatformOrg: 1 }
- Apply existing soft delete plugin (validated and corrected in T2.1)
- TTL index: never expires (null)
- Pre-save hooks: validate createdBy belongs to organization
- Static method: softDeleteByIdWithCascade (cascade to departments, users, tasks, etc.)
- Protection: cannot delete platform organization
- Export model

**T2.3: Create Department Model**

Create `backend/models/Department.js`:

- Schema fields: name (required, max 100), description (max 2000), organization (required, ref: Organization, no Id postfix), createdBy (ref: User, no Id postfix)
- Indexes: { organization: 1, name: 1 } unique partial
- Apply existing soft delete plugin (validated and corrected in T2.1)
- TTL index: 365 days
- Pre-save hooks: validate organization exists, validate createdBy belongs to organization
- Static method: softDeleteByIdWithCascade (cascade to users, tasks, materials, vendors)
- Export model

**T2.4: Create User Model**

Create `backend/models/User.js`:

- Schema fields: firstName (required, max 20), lastName (required, max 20), email (required, valid email, lowercase, max 50), password (required, min 8, select: false), role (enum: SuperAdmin/Admin/Manager/User, default: User), organization (required, ref: Organization, no Id postfix), department (required, ref: Department, no Id postfix), position (max 100), profilePicture (url, publicId), skills (array, max 10, name + proficiency 0-100), employeeId (4-digit, 1000-9999), dateOfBirth, joinedAt (required), emailPreferences (enabled, taskNotifications, taskReminders, mentions, announcements, welcomeEmails, passwordReset), passwordResetToken (select: false), passwordResetExpires (select: false), isPlatformUser (default: false, immutable), isHod (default: false), lastLogin
- Indexes: { organization: 1, email: 1 } unique partial, { department: 1, role: 1 } unique for HOD, { organization: 1, employeeId: 1 } unique partial, { isPlatformUser: 1 }, { isHod: 1 }
- Virtuals: fullName
- Apply existing soft delete plugin (validated and corrected in T2.1)
- TTL index: 365 days
- Pre-save hooks: set isPlatformUser based on organization, set isHod based on role, hash password with bcrypt (12 rounds)
- Instance methods: comparePassword, generatePasswordResetToken, verifyPasswordResetToken, clearPasswordResetToken
- Static method: softDeleteByIdWithCascade (cascade to tasks, activities, comments, attachments, materials, notifications)
- Protections: cannot delete last SuperAdmin in organization, cannot delete last HOD in department
- Export model

**T2.5: Create Model Index**

Create `backend/models/index.js`:

- Import and export all models: Organization, Department, User
- Export as named exports

**T2.6: Create JWT Utilities**

Create `backend/utils/generateTokens.js`:

- generateAccess_token(userId): sign with JWT_ACCESS_SECRET, expiresIn: '15m'
- generateRefresh_token(userId): sign with JWT_REFRESH_SECRET, expiresIn: '7d'
- setTokenCookies(res, access_token, refresh_token): set HTTP-only cookies with secure, sameSite: 'strict'
- clearTokenCookies(res): clear both cookies
- Export functions

**T2.7: Create Authentication Middleware**

Create `backend/middlewares/authMiddleware.js`:

- verifyJWT: extract access_token from cookies, verify with JWT_ACCESS_SECRET, find user by ID with select('+isDeleted organization department isHod isPlatformUser'), attach complete user object to req.user including isDeleted, organization (as organization.\_id), department (as department.\_id), isHod, isPlatformUser, role, throw CustomError if invalid or isDeleted is true
- verifyRefreshToken: extract refresh_token from cookies, verify with JWT_REFRESH_SECRET, find user by ID with select('+isDeleted organization department isHod isPlatformUser'), attach complete user object to req.user, throw CustomError if invalid or isDeleted is true
- Export middleware

**T2.8: Create Authorization Matrix**

Create `backend/config/authorizationMatrix.json`:

- Define permissions for all resources (User, Task, Material, Vendor, Organization, Department)
- Define operations (create, read, update, delete) with scopes (own, ownDept, crossDept, crossOrg)
- SuperAdmin: full access within organization (crossOrg for platform)
- Admin: full access within organization
- Manager: limited access within department
- User: basic access within department

**T2.9: Create Authorization Middleware**

Create `backend/middlewares/authorization.js`:

- authorize(resource, operation): middleware factory
- Get allowed scopes from authorization matrix
- Determine request scope based on user role and resource
- Check if user has permission for this scope
- Check ownership: verify user owns the resource by checking ALL ownership fields (createdBy, uploadedBy, watchers, assignees, assignedTo, recipientId) depending on resource type
- Combine scope authorization AND ownership authorization - both must pass
- Attach authorization info to req.authorization
- Throw CustomError.forbidden if insufficient permissions or ownership check fails
- Export middleware

Create `backend/utils/authorizationMatrix.js`:

- hasPermission(userRole, resource, operation, scope): check if user has permission
- getAllowedScopes(userRole, resource, operation): get allowed scopes for operation
- determineRequestScope(req, user): determine scope of request
- checkOwnership(resource, user, resourceData): verify user owns resource by checking ALL applicable ownership fields (createdBy, uploadedBy, watchers, assignees, assignedTo, recipientId)
- Export functions

**T2.10: Create Auth Validators**

Create `backend/middlewares/validators/authValidators.js`:

- validateRegister: organization (name, email, industry), department (name), user (firstName, lastName, email, password). Validate field types and formats. Check organization name/email uniqueness using Organization.findOne() with withDeleted() for soft-deleted check. Check user email uniqueness. After validation, attach to req.validated.body with field names matching schema (no Id postfix). Frontend sends organizationId, departmentId but validator converts to organization, department in req.validated.body
- validateLogin: email (required, valid email), password (required). After validation, attach to req.validated.body
- validateForgotPassword: email (required, valid email). Check user existence using User.findOne() with withDeleted(). After validation, attach to req.validated.body
- validateResetPassword: token (required), password (required, min 8). After validation, attach to req.validated.body
- All validators must include: field validation, existence validation (using withDeleted() and onlyDeleted() from softDelete plugin), and uniqueness validation where applicable
- Export validators

**T2.11: Create Auth Controllers**

Create `backend/controllers/authControllers.js`:

- register: extract data from req.validated.body (organization, department, user fields already converted from organizationId/departmentId to organization/department), create organization, department, and SuperAdmin user in transaction, send welcome email, return user data
- login: extract { email, password } from req.validated.body, find user by email, compare password, generate tokens, set cookies, update status to Online, return user data
- logout: extract user from req.user (includes organization, department, isHod, isPlatformUser), clear cookies, update status to Offline, disconnect Socket.IO
- refreshToken: extract user from req.user, verify refresh token, generate new tokens, set cookies, return user data
- forgotPassword: extract { email } from req.validated.body, generate reset token, hash and store, send reset email, always return success
- resetPassword: extract { token, password } from req.validated.body, verify reset token, hash new password, update user, clear reset token, send confirmation email
- Export controllers

**T2.12: Create Auth Routes**

Create `backend/routes/authRoutes.js`:

- POST /register (validateRegister, register)
- POST /login (authLimiter, validateLogin, login)
- DELETE /logout (verifyRefreshToken, logout)
- GET /refresh-token (authLimiter, verifyRefreshToken, refreshToken)
- POST /forgot-password (authLimiter, validateForgotPassword, forgotPassword)
- POST /reset-password (authLimiter, validateResetPassword, resetPassword)
- Export router

**T2.13: Create User Validators**

Create `backend/middlewares/validators/userValidators.js`:

- validateCreateUser: firstName, lastName, email, password, role, departmentId (received from frontend), position, phone, profilePicture, skills. Validate field types and formats. Check email uniqueness using User.findOne() with withDeleted(). Check departmentId existence using Department.findById() with withDeleted(). After validation, attach to req.validated.body with conversion: departmentId → department (schema field name without Id postfix)
- validateGetAllUsers: page, limit, sortBy, sortOrder, search, role, departmentId (received from frontend), status, includeDeleted. After validation, attach to req.validated.query with conversion: departmentId → department
- validateGetUser: userId (param, valid ObjectId). Check user existence using User.findById() with withDeleted(). After validation, attach to req.validated.params
- validateUpdateUser: partial user fields including departmentId (if provided). Check departmentId existence if provided. Check email uniqueness if changed. After validation, attach to req.validated.body with conversion: departmentId → department
- validateUpdateProfile: partial user fields (cannot change role, department, organization). After validation, attach to req.validated.body
- All validators must include: field validation, existence validation (using withDeleted() and onlyDeleted()), and uniqueness validation where applicable
- Export validators

**T2.14: Create User Controllers**

Create `backend/controllers/userControllers.js`:

- createUser: extract data from req.validated.body (department field already converted from departmentId), extract { organization, department, isHod, isPlatformUser } from req.user, create user, send welcome email, emit user:created, return user data
- getAllUsers: extract filters from req.validated.query (department field already converted), extract { organization, department, role, isPlatformUser } from req.user, list users with pagination, filtering, sorting, scoped by authorization
- getUser: extract { userId } from req.validated.params, extract { organization, department, role } from req.user, get single user by ID, check authorization (scope AND ownership)
- updateUser: extract data from req.validated.body, extract { userId } from req.validated.params, extract { organization, department, role } from req.user, update user by SuperAdmin, check authorization (scope AND ownership), emit user:updated
- updateProfile: extract data from req.validated.body, extract { \_id, organization, department } from req.user, update own profile, restricted fields, emit user:updated
- getAccount: extract { \_id } from req.user, get current user's account information
- getProfile: extract { \_id, organization, department } from req.user, get current user's profile with dashboard data
- deleteUser: extract { userId } from req.validated.params, extract { \_id, organization, department, role } from req.user, soft delete user with cascade, check protections, check authorization (scope AND ownership), emit user:deleted
- restoreUser: extract { userId } from req.validated.params, extract { organization, department, role } from req.user, restore soft-deleted user, check authorization, emit user:restored
- Export controllers

**T2.15: Create User Routes**

Create `backend/routes/userRoutes.js`:

- All routes require verifyJWT
- POST / (authorize('User', 'create'), validateCreateUser, createUser)
- GET / (authorize('User', 'read'), validateGetAllUsers, getAllUsers)
- GET /account (getAccount)
- GET /profile (getProfile)
- GET /:userId (authorize('User', 'read'), validateGetUser, getUser)
- PUT /:userId (authorize('User', 'update'), validateUpdateUser, updateUser)
- PUT /:userId/profile (validateUpdateProfile, updateProfile)
- DELETE /:userId (authorize('User', 'delete'), validateGetUser, deleteUser)
- PATCH /:userId/restore (authorize('User', 'update'), validateGetUser, restoreUser)
- Export router

**T2.16: Create Route Index**

Create `backend/routes/index.js`:

- Import all route modules: authRoutes, userRoutes
- Create Express router
- Mount routes: /auth, /users
- Export router

**T2.17: Update App.js**

Update `backend/app.js`:

- Import routes from routes/index.js
- Mount routes: app.use('/api', routes)

#### Frontend Tasks

**T2.18: Create Auth API**

Create `client/src/redux/features/auth/authApi.js`:

- Inject endpoints into base api
- register: POST /auth/register, invalidates User tag
- login: POST /auth/login, invalidates User tag
- logout: DELETE /auth/logout, invalidates User tag
- refreshToken: GET /auth/refresh-token
- forgotPassword: POST /auth/forgot-password
- resetPassword: POST /auth/reset-password
- Export hooks: useRegisterMutation, useLoginMutation, useLogoutMutation, useRefreshTokenMutation, useForgotPasswordMutation, useResetPasswordMutation

**T2.19: Create User API**

Create `client/src/redux/features/user/userApi.js`:

- Inject endpoints into base api
- getUsers: GET /users with params, providesTags User
- getUser: GET /users/:id, providesTags User by id
- createUser: POST /users, invalidatesTags User LIST
- updateUser: PUT /users/:id, invalidatesTags User by id and LIST
- updateProfile: PUT /users/:id/profile, invalidatesTags User by id
- getAccount: GET /users/account, providesTags User
- getProfile: GET /users/profile, providesTags User
- deleteUser: DELETE /users/:id, invalidatesTags User LIST
- restoreUser: PATCH /users/:id/restore, invalidatesTags User LIST
- Export hooks

**T2.20: Create useAuth Hook**

Create `client/src/hooks/useAuth.js`:

- useSelector for user, isAuthenticated, isLoading
- useDispatch
- useNavigate
- useLoginMutation, useLogoutMutation
- login function: call loginMutation, dispatch setUser, navigate to /dashboard
- logout function: call logoutMutation, dispatch clearUser, navigate to /login
- Return: { user, isAuthenticated, isLoading, login, logout }

**T2.21: Create Login Form**

Create `client/src/components/forms/auth/LoginForm.jsx`:

- useForm with defaultValues: email, password
- useAuth hook
- Form fields: email (MuiTextField with email validation), password (MuiTextField with type password)
- Submit handler: call login with credentials
- Error handling: display toast on error
- Loading state: disable form during submission
- Link to register and forgot password

**T2.22: Create Registration Form (Multi-Step)**

Create `client/src/components/forms/auth/RegisterForm.jsx`:

- Multi-step wizard: UserDetailsStep, OrganizationDetailsStep, UploadAttachmentsStep, ReviewStep
- useForm with all fields
- Step navigation: next, back, submit
- Progress indicator
- useRegisterMutation
- Submit handler: call register with all data
- Success: navigate to login with success message

Create `client/src/components/forms/auth/UserDetailsStep.jsx`:

- Fields: firstName, lastName, email, password, confirmPassword, phone, position
- Validation: all required, email format, password min 8, passwords match

Create `client/src/components/forms/auth/OrganizationDetailsStep.jsx`:

- Fields: organization (name, email, industry, address, phone), department (name, description)
- Validation: organization name required, email required, industry required, department name required

Create `client/src/components/forms/auth/UploadAttachmentsStep.jsx`:

- Optional: organization logo upload
- MuiFileUpload component
- Preview uploaded image

Create `client/src/components/forms/auth/ReviewStep.jsx`:

- Display all entered data for review
- Edit buttons to go back to specific steps
- Submit button

**T2.23: Create Login Page**

Create `client/src/pages/Login.jsx`:

- Import LoginForm
- Page layout with centered form
- Title: "Login to Task Manager"
- LoginForm component
- Links: Register, Forgot Password

**T2.24: Create Register Page**

Create `client/src/pages/Register.jsx`:

- Import RegisterForm
- Page layout with centered form
- Title: "Create Your Organization"
- RegisterForm component
- Link: Already have account? Login

**T2.25: Create Forgot Password Page**

Create `client/src/pages/ForgotPassword.jsx`:

- useForm with email field
- useForgotPasswordMutation
- Form: email input, submit button
- Success message: "Password reset email sent"
- Link: Back to Login

**T2.26: Create User Card Component**

Create `client/src/components/cards/UserCard.jsx`:

- React.memo wrapper
- Props: user, onClick, onEdit, onDelete
- Display: profilePicture, fullName, email, role, department, status badge
- Actions: View, Edit, Delete buttons
- useCallback for event handlers
- useMemo for computed values (status color, role badge color)

**T2.27: Create Users List Component**

Create `client/src/components/lists/UsersList.jsx`:

- Props: users, onUserClick, onUserEdit, onUserDelete
- Grid layout with responsive sizing
- Map users to UserCard components
- Empty state: "No users found"

**T2.28: Create Users Page**

Create `client/src/pages/Users.jsx`:

- useState for filters
- useGetUsersQuery with filters
- UsersList component
- Filter UI: search, role, department, status
- Create User button (Admin+)
- Loading state
- Error handling

**T2.29: Create User Form**

Create `client/src/components/forms/users/CreateUpdateUser.jsx`:

- useForm with all user fields
- useCreateUserMutation, useUpdateUserMutation
- useEffect to reset form when user changes
- Form fields: firstName, lastName, email, password (create only), role, departmentId (MuiResourceSelect), position, phone, profilePicture (MuiFileUpload), skills (array)
- Submit handler: create or update based on mode
- MuiDialog wrapper
- Validation matching backend

**T2.30: Update Router**

Update `client/src/router/routes.jsx`:

- Add lazy loaded pages: Login, Register, ForgotPassword, Users
- Add routes:
  - /login (PublicRoute)
  - /register (PublicRoute)
  - /forgot-password (PublicRoute)
  - /users (ProtectedRoute)

#### Testing Tasks

**T2.31: Write Unit Tests for Models**

Create `backend/__tests__/unit/softDelete.test.js`:

- Test soft delete plugin functionality
- Test query helpers: withDeleted, onlyDeleted
- Test instance methods: softDelete, restore
- Test static methods: softDeleteById, restoreById
- Test automatic filtering
- Test hard delete protection

Create `backend/__tests__/unit/Organization.test.js`:

- Test organization creation
- Test unique constraints (name, email, phone)
- Test isPlatformOrg immutability
- Test cascade delete
- Test platform organization protection

Create `backend/__tests__/unit/Department.test.js`:

- Test department creation
- Test unique name per organization
- Test cascade delete

Create `backend/__tests__/unit/User.test.js`:

- Test user creation
- Test password hashing
- Test comparePassword method
- Test isPlatformUser auto-set
- Test isHod auto-set
- Test unique email per organization
- Test unique HOD per department
- Test cascade delete
- Test protections (last SuperAdmin, last HOD)

**T2.32: Write Integration Tests for Auth**

Create `backend/__tests__/integration/auth.test.js`:

- Test POST /api/auth/register: success, validation errors, duplicate email
- Test POST /api/auth/login: success, invalid credentials, soft-deleted user
- Test DELETE /api/auth/logout: success, no token
- Test GET /api/auth/refresh-token: success, invalid token, expired token
- Test POST /api/auth/forgot-password: success, user not found (still success)
- Test POST /api/auth/reset-password: success, invalid token, expired token

**T2.33: Write Integration Tests for Users**

Create `backend/__tests__/integration/users.test.js`:

- Test POST /api/users: success, validation errors, authorization
- Test GET /api/users: success, pagination, filtering, sorting, authorization scoping
- Test GET /api/users/:id: success, not found, authorization
- Test PUT /api/users/:id: success, validation errors, authorization
- Test PUT /api/users/:id/profile: success, restricted fields, authorization
- Test DELETE /api/users/:id: success, cascade delete, protections, authorization
- Test PATCH /api/users/:id/restore: success, authorization

**T2.34: Write Property-Based Tests**

Create `backend/__tests__/property/softDelete.property.test.js`:

- Property 1: Soft delete preserves data
- Property 2: Soft deleted documents excluded from queries
- Property 3: withDeleted includes soft deleted
- Property 4: Restore sets isDeleted to false
- Use fast-check with 100 runs

Create `backend/__tests__/property/authorization.property.test.js`:

- Property 1: Role hierarchy (higher role has at least same permissions as lower)
- Property 2: Scope hierarchy (crossOrg > crossDept > ownDept > own)
- Property 3: Platform SuperAdmin has crossOrg for Organization only
- Use fast-check with 100 runs

#### Integration & Verification

**T2.35: Test Backend Endpoints**

```bash
cd backend
npm test
```

- Verify all tests pass
- Verify coverage meets requirements (80%+)

**T2.36: Test Frontend**

```bash
cd client
npm run build
```

- Verify build succeeds
- Verify no TypeScript/ESLint errors

**T2.37: Manual Testing**

- Register new organization with department and user
- Verify welcome email sent (check logs)
- Login with created user
- Verify JWT cookies set
- Verify redirect to dashboard
- Verify user data in Redux
- Create additional users (different roles)
- Test user list with filters
- Test user edit
- Test user delete (soft delete)
- Test user restore
- Logout and verify cookies cleared
- Test forgot password flow
- Test password reset flow

**T2.38: Test Authorization**

- Login as User: verify cannot create users, cannot access other departments
- Login as Manager: verify can create users in own department, cannot access other departments
- Login as Admin: verify can create users in any department, can access all departments
- Login as SuperAdmin: verify full access within organization
- Test Platform SuperAdmin: verify can access all organizations

**T2.39: Git Commit & Merge**

```bash
git add .
git commit -m "Phase 2: Complete authentication and user management"
git checkout main
git merge phase-2-authentication
git push origin main
git branch -d phase-2-authentication
```

**Phase 2 Completion Checklist**:

- [ ] Soft delete plugin working
- [ ] Organization model with cascade delete
- [ ] Department model with cascade delete
- [ ] User model with password hashing and HOD logic
- [ ] JWT authentication with HTTP-only cookies
- [ ] Authorization matrix implemented
- [ ] Auth endpoints working (register, login, logout, refresh, forgot, reset)
- [ ] User CRUD endpoints working
- [ ] Authorization scoping working
- [ ] Frontend auth API integrated
- [ ] Login/Register forms working
- [ ] User management UI working
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All property-based tests pass
- [ ] Manual testing complete
- [ ] Git branch merged to main

### Phase 3: Organization & Department Management

**Branch**: `phase-3-organization-department`

**Objective**: Implement organization and department management with platform vs customer organization support

#### Backend Tasks

**T3.1: Create Organization Validators**

Create `backend/middlewares/validators/organizationValidators.js`:

- validateCreateOrganization: name, description, email, phone, address, industry, logoUrl. Validate field types and formats. Check name, email, phone uniqueness using Organization.findOne() with withDeleted(). After validation, attach to req.validated.body
- validateGetAllOrganizations: page, limit, sortBy, sortOrder, search, industry, includeDeleted. After validation, attach to req.validated.query
- validateGetOrganization: organizationId (param, valid ObjectId). Check organization existence using withDeleted(). After validation, attach to req.validated.params
- validateUpdateOrganization: partial organization fields (cannot change isPlatformOrg). Check existence and uniqueness. After validation, attach to req.validated.body
- All validators must include: field validation, existence validation (using withDeleted() and onlyDeleted()), and uniqueness validation where applicable
- Export validators

**T3.2: Create Organization Controllers**

Create `backend/controllers/organizationControllers.js`:

- createOrganization: extract data from req.validated.body, extract { \_id as createdBy, isPlatformUser, role } from req.user, create organization (Platform SuperAdmin only), check authorization (scope AND ownership), emit organization:created
- getAllOrganizations: extract filters from req.validated.query, extract { isPlatformUser, role, organization } from req.user, list organizations (Platform SuperAdmin only), pagination, filtering, check authorization
- getOrganization: extract { organizationId } from req.validated.params, extract { organization, role, isPlatformUser, \_id } from req.user, get single organization, check authorization (scope AND ownership - createdBy)
- updateOrganization: extract data from req.validated.body, extract { organizationId } from req.validated.params, extract { organization, role, \_id } from req.user, update organization, check authorization (scope AND ownership - createdBy), emit organization:updated
- deleteOrganization: extract { organizationId } from req.validated.params, extract { organization, role, \_id } from req.user, soft delete with cascade, check platform protection, check authorization (scope AND ownership - createdBy), emit organization:deleted
- restoreOrganization: extract { organizationId } from req.validated.params, extract { organization, role } from req.user, restore soft-deleted organization, check authorization, emit organization:restored
- Export controllers

**T3.3: Create Organization Routes**

Create `backend/routes/organizationRoutes.js`:

- All routes require verifyJWT
- POST / (authorize('Organization', 'create'), validateCreateOrganization, createOrganization)
- GET / (authorize('Organization', 'read'), validateGetAllOrganizations, getAllOrganizations)
- GET /:organizationId (authorize('Organization', 'read'), validateGetOrganization, getOrganization)
- PUT /:organizationId (authorize('Organization', 'update'), validateUpdateOrganization, updateOrganization)
- DELETE /:organizationId (authorize('Organization', 'delete'), validateGetOrganization, deleteOrganization)
- PATCH /:organizationId/restore (authorize('Organization', 'update'), validateGetOrganization, restoreOrganization)
- Export router

**T3.4: Create Department Validators**

Create `backend/middlewares/validators/departmentValidators.js`:

- validateCreateDepartment: name, description, organizationId (received from frontend). Validate field types and formats. Check organization existence using withDeleted(). Check name uniqueness within organization. After validation, attach to req.validated.body with conversion: organizationId → organization
- validateGetAllDepartments: page, limit, sortBy, sortOrder, search, organizationId (received from frontend), includeDeleted. After validation, attach to req.validated.query with conversion: organizationId → organization
- validateGetDepartment: departmentId (param, valid ObjectId). Check department existence using withDeleted(). After validation, attach to req.validated.params
- validateUpdateDepartment: partial department fields with Id postfix from frontend. Check existence and uniqueness. After validation, attach to req.validated.body with field name conversion
- All validators must include: field validation, existence validation (using withDeleted() and onlyDeleted()), and uniqueness validation where applicable
- Export validators

**T3.5: Create Department Controllers**

Create `backend/controllers/departmentControllers.js`:

- createDepartment: extract data from req.validated.body (organization already converted), extract { organization, \_id as createdBy, role } from req.user, create department, check authorization (scope AND ownership), emit department:created
- getAllDepartments: extract filters from req.validated.query (organization already converted), extract { organization, role, isPlatformUser } from req.user, list departments, scoped by authorization, pagination, filtering
- getDepartment: extract { departmentId } from req.validated.params, extract { organization, role, \_id } from req.user, get single department, check authorization (scope AND ownership - createdBy)
- updateDepartment: extract data from req.validated.body (fields already converted), extract { departmentId } from req.validated.params, extract { organization, role, \_id } from req.user, update department, check authorization (scope AND ownership - createdBy), emit department:updated
- deleteDepartment: extract { departmentId } from req.validated.params, extract { organization, role, \_id } from req.user, soft delete with cascade, check protections, check authorization (scope AND ownership - createdBy), emit department:deleted
- restoreDepartment: extract { departmentId } from req.validated.params, extract { organization, role } from req.user, restore soft-deleted department, check authorization, emit department:restored
- Export controllers

**T3.6: Create Department Routes**

Create `backend/routes/departmentRoutes.js`:

- All routes require verifyJWT
- POST / (authorize('Department', 'create'), validateCreateDepartment, createDepartment)
- GET / (authorize('Department', 'read'), validateGetAllDepartments, getAllDepartments)
- GET /:departmentId (authorize('Department', 'read'), validateGetDepartment, getDepartment)
- PUT /:departmentId (authorize('Department', 'update'), validateUpdateDepartment, updateDepartment)
- DELETE /:departmentId (authorize('Department', 'delete'), validateGetDepartment, deleteDepartment)
- PATCH /:departmentId/restore (authorize('Department', 'update'), validateGetDepartment, restoreDepartment)
- Export router

**T3.7: Create Seed Data**

Create `backend/mock/cleanSeedSetup.js`:

- Check if platform organization exists
- If not, create platform organization (isPlatformOrg: true)
- Create platform department
- Create platform SuperAdmin user
- Create 2 sample customer organizations
- Create departments for each organization
- Create users for each department (all roles)
- Log seed data summary
- Export seed function

**T3.8: Update Server.js**

Update `backend/server.js`:

- Import seed function
- Check INITIALIZE_SEED_DATA environment variable
- Run seed data if enabled
- Log seed data status

**T3.9: Update Routes Index**

Update `backend/routes/index.js`:

- Import organizationRoutes, departmentRoutes
- Mount routes: /organizations, /departments

#### Frontend Tasks

**T3.10: Create Organization API**

Create `client/src/redux/features/organization/organizationApi.js`:

- Inject endpoints into base api
- getOrganizations: GET /organizations with params, providesTags Organization
- getOrganization: GET /organizations/:id, providesTags Organization by id
- createOrganization: POST /organizations, invalidatesTags Organization LIST
- updateOrganization: PUT /organizations/:id, invalidatesTags Organization by id and LIST
- deleteOrganization: DELETE /organizations/:id, invalidatesTags Organization LIST
- restoreOrganization: PATCH /organizations/:id/restore, invalidatesTags Organization LIST
- Export hooks

**T3.11: Create Department API**

Create `client/src/redux/features/department/departmentApi.js`:

- Inject endpoints into base api
- getDepartments: GET /departments with params, providesTags Department
- getDepartment: GET /departments/:id, providesTags Department by id
- createDepartment: POST /departments, invalidatesTags Department LIST
- updateDepartment: PUT /departments/:id, invalidatesTags Department by id and LIST
- deleteDepartment: DELETE /departments/:id, invalidatesTags Department LIST
- restoreDepartment: PATCH /departments/:id/restore, invalidatesTags Department LIST
- Export hooks

**T3.12: Create Organization Columns**

Create `client/src/components/columns/OrganizationColumns.jsx`:

- Define columns: name, email, phone, industry, createdAt
- Action column with MuiActionColumn
- Export getOrganizationColumns function

**T3.13: Create Department Columns**

Create `client/src/components/columns/DepartmentColumns.jsx`:

- Define columns: name, description, organizationId (populated), createdAt
- Action column with MuiActionColumn
- Export getDepartmentColumns function

**T3.14: Create Organization Form**

Create `client/src/components/forms/organizations/CreateUpdateOrganization.jsx`:

- useForm with organization fields
- useCreateOrganizationMutation, useUpdateOrganizationMutation
- Form fields: name, description, email, phone, address, industry (MuiSelectAutocomplete with INDUSTRIES), logoUrl (MuiFileUpload)
- Submit handler: create or update
- MuiDialog wrapper
- Validation matching backend

**T3.15: Create Department Form**

Create `client/src/components/forms/departments/CreateUpdateDepartment.jsx`:

- useForm with department fields
- useCreateDepartmentMutation, useUpdateDepartmentMutation
- Form fields: name, description, organizationId (MuiResourceSelect, disabled in edit mode)
- Submit handler: create or update
- MuiDialog wrapper
- Validation matching backend

**T3.16: Create Organizations Page (Platform SuperAdmin Only)**

Create `client/src/pages/Organizations.jsx`:

- useState for filters, pagination, dialogOpen, selectedOrganization
- useGetOrganizationsQuery with filters and pagination
- MuiDataGrid with organization columns
- Filter UI: search, industry
- Create Organization button
- CreateUpdateOrganization dialog
- Handle view, edit, delete, restore actions
- Loading and error states

**T3.17: Create Departments Page (Admin+)**

Create `client/src/pages/Departments.jsx`:

- useState for filters, pagination, dialogOpen, selectedDepartment
- useGetDepartmentsQuery with filters and pagination
- MuiDataGrid with department columns
- Filter UI: search, organizationId (Platform SuperAdmin only)
- Create Department button
- CreateUpdateDepartment dialog
- Handle view, edit, delete, restore actions
- Loading and error states

**T3.18: Create Organization Detail Page**

Create `client/src/pages/Organization.jsx`:

- useParams to get organizationId
- useGetOrganizationQuery
- Display organization details
- List departments in organization
- List users in organization
- Statistics: total departments, total users, total tasks
- Edit and delete buttons (Admin+)

**T3.19: Update Sidebar Navigation**

Update `client/src/layouts/DashboardLayout.jsx`:

- Add navigation links:
  - Organizations (Platform SuperAdmin only)
  - Departments (Admin+)
  - Users (all roles)
- Conditional rendering based on user role
- Active link highlighting

**T3.20: Update Router**

Update `client/src/router/routes.jsx`:

- Add lazy loaded pages: Organizations, Departments, Organization
- Add routes:
  - /platform/organizations (ProtectedRoute, Platform SuperAdmin only)
  - /admin/departments (ProtectedRoute, Admin+)
  - /admin/organization (ProtectedRoute, Admin+)

**T3.21: Create MuiResourceSelect Component**

Create `client/src/components/common/MuiResourceSelect.jsx`:

- Props: name, control, rules, resourceType (departments/users/materials/vendors), label, multiple, maxSelections, placeholder, startAdornment, disabled, queryParams, watchersOnly
- Fetch resources based on resourceType
- Autocomplete with search
- Single or multiple selection
- Validation
- Export component

#### Testing Tasks

**T3.22: Write Unit Tests**

Create `backend/__tests__/unit/Organization.test.js`:

- Test organization creation
- Test unique constraints
- Test isPlatformOrg immutability
- Test cascade delete
- Test platform organization protection

Create `backend/__tests__/unit/Department.test.js`:

- Test department creation
- Test unique name per organization
- Test cascade delete
- Test last department protection

**T3.23: Write Integration Tests**

Create `backend/__tests__/integration/organizations.test.js`:

- Test POST /api/organizations: success (Platform SuperAdmin), forbidden (others)
- Test GET /api/organizations: success (Platform SuperAdmin), forbidden (others)
- Test GET /api/organizations/:id: success, authorization
- Test PUT /api/organizations/:id: success, cannot change isPlatformOrg
- Test DELETE /api/organizations/:id: success, cascade delete, platform protection

Create `backend/__tests__/integration/departments.test.js`:

- Test POST /api/departments: success, authorization
- Test GET /api/departments: success, authorization scoping
- Test GET /api/departments/:id: success, authorization
- Test PUT /api/departments/:id: success, authorization
- Test DELETE /api/departments/:id: success, cascade delete

**T3.24: Write Property-Based Tests**

Create `backend/__tests__/property/cascade.property.test.js`:

- Property 1: Deleting organization cascades to all children
- Property 2: Deleting department cascades to users and tasks
- Property 3: Cascade operations are transactional (all-or-nothing)
- Use fast-check with 100 runs

#### Integration & Verification

**T3.25: Test Backend Endpoints**

```bash
cd backend
npm test
```

- Verify all tests pass
- Verify coverage maintained

**T3.26: Test Seed Data**

```bash
cd backend
# Set INITIALIZE_SEED_DATA=true in .env
npm run dev
```

- Verify platform organization created
- Verify sample organizations created
- Verify departments created
- Verify users created (all roles)
- Check MongoDB for data

**T3.27: Manual Testing**

- Login as Platform SuperAdmin
- Verify can access Organizations page
- Create new organization
- View organization details
- Edit organization
- Delete organization (verify cascade)
- Restore organization
- Login as Customer SuperAdmin
- Verify cannot access Organizations page
- Verify can access Departments page
- Create new department
- Edit department
- Delete department (verify cascade)
- Restore department
- Test authorization for all roles

**T3.28: Git Commit & Merge**

```bash
git add .
git commit -m "Phase 3: Complete organization and department management"
git checkout main
git merge phase-3-organization-department
git push origin main
git branch -d phase-3-organization-department
```

**Phase 3 Completion Checklist**:

- [ ] Organization CRUD endpoints working
- [ ] Department CRUD endpoints working
- [ ] Platform vs customer organization logic working
- [ ] Cascade delete working with transactions
- [ ] Platform organization protection working
- [ ] Seed data working
- [ ] Frontend organization management working
- [ ] Frontend department management working
- [ ] Authorization working (Platform SuperAdmin, Admin+)
- [ ] All tests pass
- [ ] Manual testing complete
- [ ] Git branch merged to main

### Phase 4: Real-Time Communication (Socket.IO)

**Branch**: `phase-4-socket-io`

**Objective**: Implement Socket.IO for real-time updates across backend and frontend

#### Backend Tasks

**T4.1: Create Socket.IO Singleton**

Create `backend/utils/socketInstance.js`:

- Import Server from socket.io
- Import corsOptions
- Variable to store io instance: let io = null
- initializeSocket(httpServer): create Socket.IO server with CORS, store in io, call setupSocketHandlers
- getIO(): return io instance, throw error if not initialized
- Export functions

**T4.2: Create Socket.IO Event Handlers**

Create `backend/utils/socket.js`:

- Import getIO, User model, logger
- setupSocketHandlers(io): configure Socket.IO event handlers
- connection event: log connection, extract user from cookies, join rooms (user, department, organization)
- disconnect event: log disconnection, update user status to Offline
- join:room event: join custom room
- leave:room event: leave custom room
- user:status event: update user status (Online/Offline/Away), broadcast to department and organization
- Export setupSocketHandlers

**T4.3: Create Socket.IO Emitter Utilities**

Create `backend/utils/socketEmitter.js`:

- Import getIO
- emitToRooms(event, data, rooms): emit event to multiple rooms
- emitTaskEvent(event, task): emit to department and organization rooms
- emitUserEvent(event, user): emit to user, department, and organization rooms
- emitOrganizationEvent(event, organization): emit to organization room
- emitDepartmentEvent(event, department): emit to department room
- emitNotificationEvent(event, notification): emit to user room
- Export functions

**T4.4: Create User Status Utility**

Create `backend/utils/userStatus.js`:

- Import User model, emitUserEvent
- updateUserStatus(userId, status): update user status, emit user:status event
- getUserStatus(userId): get user status
- Export functions

**T4.5: Update Server.js**

Update `backend/server.js`:

- Import http.createServer
- Import initializeSocket from socketInstance
- Create HTTP server: const httpServer = http.createServer(app)
- Initialize Socket.IO: initializeSocket(httpServer)
- Start server: httpServer.listen(PORT)
- Update graceful shutdown to close Socket.IO connections

**T4.6: Update Auth Controllers**

Update `backend/controllers/authControllers.js`:

- Import updateUserStatus
- login: after successful login, call updateUserStatus(user.\_id, 'Online')
- logout: before clearing cookies, call updateUserStatus(user.\_id, 'Offline')

**T4.7: Update User Controllers**

Update `backend/controllers/userControllers.js`:

- Import emitUserEvent
- createUser: after creation, call emitUserEvent('user:created', user)
- updateUser: after update, call emitUserEvent('user:updated', user)
- deleteUser: after deletion, call emitUserEvent('user:deleted', user)
- restoreUser: after restore, call emitUserEvent('user:restored', user)

**T4.8: Update Organization Controllers**

Update `backend/controllers/organizationControllers.js`:

- Import emitOrganizationEvent
- createOrganization: after creation, call emitOrganizationEvent('organization:created', organization)
- updateOrganization: after update, call emitOrganizationEvent('organization:updated', organization)
- deleteOrganization: after deletion, call emitOrganizationEvent('organization:deleted', organization)
- restoreOrganization: after restore, call emitOrganizationEvent('organization:restored', organization)

**T4.9: Update Department Controllers**

Update `backend/controllers/departmentControllers.js`:

- Import emitDepartmentEvent
- createDepartment: after creation, call emitDepartmentEvent('department:created', department)
- updateDepartment: after update, call emitDepartmentEvent('department:updated', department)
- deleteDepartment: after deletion, call emitDepartmentEvent('department:deleted', department)
- restoreDepartment: after restore, call emitDepartmentEvent('department:restored', department)

#### Frontend Tasks

**T4.10: Create Socket.IO Service**

Create `client/src/services/socketService.js`:

- Import io from socket.io-client
- SocketService class with socket property
- connect(): create socket with baseUrl (API_URL without /api), withCredentials: true, autoConnect: false, reconnection config
- disconnect(): disconnect and clear socket
- on(event, handler): register event handler
- off(event, handler): remove event handler
- emit(event, data): emit event
- Export singleton instance

**T4.11: Create Socket.IO Event Handlers**

Create `client/src/services/socketEvents.js`:

- Import store, api utilities
- Import toast
- setupSocketEventHandlers(socket): register all event handlers
- user:created: invalidate User tag, show toast
- user:updated: invalidate User tag by id
- user:deleted: invalidate User tag, show toast
- user:restored: invalidate User tag, show toast
- user:online: log to console
- user:offline: log to console
- user:status: log to console
- organization:created: invalidate Organization tag, show toast
- organization:updated: invalidate Organization tag by id
- organization:deleted: invalidate Organization tag, show toast
- organization:restored: invalidate Organization tag, show toast
- department:created: invalidate Department tag, show toast
- department:updated: invalidate Department tag by id
- department:deleted: invalidate Department tag, show toast
- department:restored: invalidate Department tag, show toast
- Export setupSocketEventHandlers

**T4.12: Create useSocket Hook**

Create `client/src/hooks/useSocket.js`:

- Import useEffect, socketService, setupSocketEventHandlers
- useEffect: connect on mount, setup event handlers, disconnect on unmount
- Return: { on: socketService.on, off: socketService.off, emit: socketService.emit }

**T4.13: Update App.jsx**

Update `client/src/App.jsx`:

- Import useSocket
- Call useSocket() at app level to initialize Socket.IO connection

**T4.14: Update Dashboard Layout**

Update `client/src/layouts/DashboardLayout.jsx`:

- Import useSocket
- Use socket to listen for real-time events
- Update UI based on events (e.g., show notification badge)

**T4.15: Create User Status Indicator**

Create `client/src/components/common/UserStatusIndicator.jsx`:

- Props: status (Online/Offline/Away)
- Display colored badge: green (Online), gray (Offline), yellow (Away)
- Export component

**T4.16: Update User Card**

Update `client/src/components/cards/UserCard.jsx`:

- Import UserStatusIndicator
- Display user status with indicator
- Update status in real-time via Socket.IO

#### Testing Tasks

**T4.17: Write Socket.IO Tests**

Create `backend/__tests__/unit/socket.test.js`:

- Test Socket.IO initialization
- Test room joining
- Test event emission
- Test user status updates

Create `backend/__tests__/integration/socket.test.js`:

- Test Socket.IO connection with authentication
- Test room-based broadcasting
- Test real-time event delivery
- Test disconnect handling

#### Integration & Verification

**T4.18: Test Backend Socket.IO**

```bash
cd backend
npm run dev
```

- Verify Socket.IO server starts
- Verify no errors in console
- Check logs for Socket.IO initialization

**T4.19: Test Frontend Socket.IO**

```bash
cd client
npm run dev
```

- Open browser console
- Verify Socket.IO connection established
- Verify "Socket connected" log message
- Check Network tab for WebSocket connection

**T4.20: Manual Testing**

- Open two browser windows (different users)
- Window 1: Create a user
- Window 2: Verify user appears in real-time
- Window 1: Update user
- Window 2: Verify update appears in real-time
- Window 1: Delete user
- Window 2: Verify user removed in real-time
- Test with organizations and departments
- Test user status updates (Online/Offline/Away)
- Test reconnection (disable network, re-enable)

**T4.21: Test Room Isolation**

- Login as users from different organizations
- Verify events only broadcast to same organization
- Login as users from different departments
- Verify department-scoped events work correctly

**T4.22: Git Commit & Merge**

```bash
git add .
git commit -m "Phase 4: Complete real-time communication with Socket.IO"
git checkout main
git merge phase-4-socket-io
git push origin main
git branch -d phase-4-socket-io
```

**Phase 4 Completion Checklist**:

- [ ] Socket.IO server initialized
- [ ] Socket.IO event handlers configured
- [ ] Room-based broadcasting working
- [ ] User status tracking working
- [ ] Frontend Socket.IO client connected
- [ ] Real-time event handlers working
- [ ] Cache invalidation on events working
- [ ] Toast notifications on events working
- [ ] User status indicator working
- [ ] Room isolation working
- [ ] Reconnection working
- [ ] All tests pass
- [ ] Manual testing complete
- [ ] Git branch merged to main

### Phase 5: Task Management (All Task Types)

**Branch**: `phase-5-task-management`

**Objective**: Implement complete task management system with discriminator pattern (ProjectTask, RoutineTask, AssignedTask)

#### Backend Tasks

**T5.1: Create BaseTask Model**

Create `backend/models/BaseTask.js`:

- Schema fields: title (required, max 50), description (required, max 2000), status (enum: To Do/In Progress/Completed/Pending, default: To Do), priority (enum: Low/Medium/High/Urgent, default: Medium), organization (required, ref: Organization, no Id postfix), department (required, ref: Department, no Id postfix), createdBy (required, ref: User, no Id postfix), attachments (array, max 10, ref: Attachment, no Ids postfix), watchers (array, max 20, ref: User, HOD only, no Ids postfix), tags (array, max 5, max 50 chars each, unique case-insensitive), taskType (discriminator key)
- Indexes: organization+department+createdAt, organization+createdBy+createdAt, organization+department+startDate+dueDate, organization+department+status+priority+dueDate, tags text index
- Apply existing soft delete plugin (validated and corrected in T2.1)
- TTL index: 180 days
- Pre-save hooks: validate department belongs to organization, validate createdBy belongs to organization and department, validate watchers are HOD in same organization
- Static method: softDeleteByIdWithCascade (cascade to activities, comments, attachments, notifications)
- Export model

**T5.2: Create ProjectTask Model**

Create `backend/models/ProjectTask.js`:

- Import BaseTask
- Additional fields: vendor (required, ref: Vendor, no Id postfix), estimatedCost (min 0), actualCost (min 0), currency (default: ETB), costHistory (array, max 200, amount + type + updatedBy + updatedAt), materials (array, max 20, material + quantity, no Id postfix), assignees (array, max 20, ref: User, no Ids postfix), startDate, dueDate
- Validation: vendor required, materials max 20, assignees max 20, startDate < dueDate
- Pre-save hooks: validate vendor exists, validate materials belong to organization, validate assignees belong to organization and department, track cost history
- Export discriminator

**T5.3: Create RoutineTask Model**

Create `backend/models/RoutineTask.js`:

- Import BaseTask
- Additional fields: materials (array, max 20, material + quantity, direct, no Id postfix), startDate (required), dueDate (required)
- Validation: status cannot be "To Do", priority cannot be "Low", startDate < dueDate, materials max 20
- Pre-save hooks: validate materials belong to organization, validate status and priority restrictions
- Export discriminator

**T5.4: Create AssignedTask Model**

Create `backend/models/AssignedTask.js`:

- Import BaseTask
- Additional fields: assignedTo (required, ObjectId or array of ObjectIds, ref: User, no Id postfix), startDate, dueDate
- Validation: assignedTo required, startDate < dueDate if both provided
- Pre-save hooks: validate assignedTo users belong to organization and department
- Export discriminator

**T5.5: Create TaskActivity Model**

Create `backend/models/TaskActivity.js`:

- Schema fields: content (required, max 2000), parent (required, ref: ProjectTask or AssignedTask ONLY, no Id postfix), parentModel (required, enum: ProjectTask/AssignedTask), materials (array, max 20, material + quantity, no Id postfix), createdBy (required, ref: User, no Id postfix), department (required, ref: Department, no Id postfix), organization (required, ref: Organization, no Id postfix)
- Indexes: parent+parentModel+createdAt, organization+department+createdAt
- Apply existing soft delete plugin (validated and corrected in T2.1)
- TTL index: 90 days
- Pre-save hooks: validate parent exists and is not RoutineTask, validate materials belong to organization
- Static method: softDeleteByIdWithCascade (cascade to comments, attachments)
- Export model

**T5.6: Create TaskComment Model**

Create `backend/models/TaskComment.js`:

- Schema fields: content (required, max 2000), parent (required, ref: Task/TaskActivity/TaskComment, no Id postfix), parentModel (required, enum: ProjectTask/RoutineTask/AssignedTask/TaskActivity/TaskComment), mentions (array, max 5, ref: User, no Ids postfix), createdBy (required, ref: User, no Id postfix), department (required, ref: Department, no Id postfix), organization (required, ref: Organization, no Id postfix)
- Indexes: parent+parentModel+createdAt, organization+department+createdAt
- Apply existing soft delete plugin (validated and corrected in T2.1)
- TTL index: 90 days
- Pre-save hooks: validate parent exists, validate mentions belong to organization, validate max depth 3
- Static method: softDeleteByIdWithCascade (cascade to child comments, attachments)
- Export model

**T5.7: Update Models Index**

Update `backend/models/index.js`:

- Import and export: BaseTask, ProjectTask, RoutineTask, AssignedTask, TaskActivity, TaskComment

**T5.8: Create Task Validators**

Create `backend/middlewares/validators/taskValidators.js`:

- validateCreateTask: title, description, status, priority, taskType, vendorId (ProjectTask, received from frontend), materialIds (RoutineTask, received from frontend), assignedToIds (AssignedTask, received from frontend), startDate, dueDate, tags, attachmentIds (received from frontend), watcherIds (received from frontend), assigneeIds (ProjectTask, received from frontend). Validate field types and formats. Check existence using withDeleted() for vendor, materials, users. Check uniqueness where applicable. After validation, attach to req.validated.body with conversion: vendorId → vendor, materialIds → materials, assignedToIds → assignedTo, attachmentIds → attachments, watcherIds → watchers, assigneeIds → assignees (schema field names without Id/Ids postfix)
- validateGetAllTasks: page, limit, sortBy, sortOrder, search, taskType, status, priority, departmentId (received from frontend), createdById (received from frontend), assignedToId (received from frontend), startDate, endDate, includeDeleted. After validation, attach to req.validated.query with conversion: departmentId → department, createdById → createdBy, assignedToId → assignedTo
- validateGetTask: taskId (param, valid ObjectId). Check task existence using withDeleted(). After validation, attach to req.validated.params
- validateUpdateTask: partial task fields with Id/Ids postfix from frontend. Check existence and uniqueness. After validation, attach to req.validated.body with field name conversion
- validateCreateActivity: content, parentId (received from frontend), parentModel, materialIds (received from frontend). Check parent existence, check materials existence. After validation, attach to req.validated.body with conversion: parentId → parent, materialIds → materials
- validateCreateComment: content, parentId (received from frontend), parentModel, mentionIds (received from frontend). Check parent existence, check mentions existence. After validation, attach to req.validated.body with conversion: parentId → parent, mentionIds → mentions
- All validators must include: field validation, existence validation (using withDeleted() and onlyDeleted()), and uniqueness validation where applicable
- Export validators

**T5.9: Create Task Controllers**

Create `backend/controllers/taskControllers.js`:

- createTask: extract data from req.validated.body (vendor, materials, assignedTo, attachments, watchers, assignees fields already converted from vendorId, materialIds, etc.), extract { organization, department, \_id as createdBy, isHod, isPlatformUser } from req.user, create task based on taskType (ProjectTask/RoutineTask/AssignedTask), validate fields, check authorization (scope AND ownership), emit task:created
- getAllTasks: extract filters from req.validated.query (department, createdBy, assignedTo already converted), extract { organization, department, role, \_id } from req.user, list tasks with pagination, filtering, sorting, scoped by authorization
- getTask: extract { taskId } from req.validated.params, extract { organization, department, role, \_id } from req.user, get single task with activities and comments, check authorization (scope AND ownership including watchers, assignees, createdBy)
- updateTask: extract data from req.validated.body (fields already converted), extract { taskId } from req.validated.params, extract { organization, department, role, \_id } from req.user, update task, validate fields, check authorization (scope AND ownership), emit task:updated
- deleteTask: extract { taskId } from req.validated.params, extract { organization, department, role, \_id } from req.user, soft delete with cascade, check authorization (scope AND ownership), emit task:deleted
- restoreTask: extract { taskId } from req.validated.params, extract { organization, department, role } from req.user, restore soft-deleted task, check authorization, emit task:restored
- createActivity: extract data from req.validated.body (parent, materials already converted), extract { organization, department, \_id as createdBy } from req.user, create activity on ProjectTask or AssignedTask, check authorization (scope AND ownership), emit activity:created
- updateActivity: extract { activityId } from req.validated.params, extract data from req.validated.body, extract { organization, department, \_id } from req.user, update activity, check authorization (scope AND ownership - createdBy), emit activity:updated
- deleteActivity: extract { activityId } from req.validated.params, extract { organization, department, \_id } from req.user, soft delete activity with cascade, check authorization (scope AND ownership - createdBy), emit activity:deleted
- createComment: extract data from req.validated.body (parent, mentions already converted), extract { organization, department, \_id as createdBy } from req.user, create comment on task/activity/comment, check authorization (scope AND ownership), emit comment:created
- updateComment: extract { commentId } from req.validated.params, extract data from req.validated.body, extract { organization, department, \_id } from req.user, update comment, check authorization (scope AND ownership - createdBy), emit comment:updated
- deleteComment: extract { commentId } from req.validated.params, extract { organization, department, \_id } from req.user, soft delete comment with cascade, check authorization (scope AND ownership - createdBy), emit comment:deleted
- Export controllers

**T5.10: Create Task Routes**

Create `backend/routes/taskRoutes.js`:

- All routes require verifyJWT
- POST / (authorize('Task', 'create'), validateCreateTask, createTask)
- GET / (authorize('Task', 'read'), validateGetAllTasks, getAllTasks)
- GET /:taskId (authorize('Task', 'read'), validateGetTask, getTask)
- PUT /:taskId (authorize('Task', 'update'), validateUpdateTask, updateTask)
- DELETE /:taskId (authorize('Task', 'delete'), validateGetTask, deleteTask)
- PATCH /:taskId/restore (authorize('Task', 'update'), validateGetTask, restoreTask)
- POST /:taskId/activities (authorize('Task', 'update'), validateCreateActivity, createActivity)
- PUT /activities/:activityId (authorize('Task', 'update'), updateActivity)
- DELETE /activities/:activityId (authorize('Task', 'delete'), deleteActivity)
- POST /:taskId/comments (authorize('Task', 'update'), validateCreateComment, createComment)
- PUT /comments/:commentId (authorize('Task', 'update'), updateComment)
- DELETE /comments/:commentId (authorize('Task', 'delete'), deleteComment)
- Export router

**T5.11: Update Routes Index**

Update `backend/routes/index.js`:

- Import taskRoutes
- Mount route: /tasks

**T5.12: Update Seed Data**

Update `backend/mock/cleanSeedSetup.js`:

- Create sample ProjectTasks with vendors, materials, assignees, watchers
- Create sample RoutineTasks with materials (direct)
- Create sample AssignedTasks with assignedTo
- Create sample TaskActivities on ProjectTasks and AssignedTasks
- Create sample TaskComments on tasks and activities

#### Frontend Tasks

**T5.13: Create Task API**

Create `client/src/redux/features/task/taskApi.js`:

- Inject endpoints into base api
- getTasks: GET /tasks with params, providesTags Task
- getTask: GET /tasks/:id, providesTags Task by id
- createTask: POST /tasks, invalidatesTags Task LIST
- updateTask: PUT /tasks/:id, invalidatesTags Task by id and LIST
- deleteTask: DELETE /tasks/:id, invalidatesTags Task LIST
- restoreTask: PATCH /tasks/:id/restore, invalidatesTags Task LIST
- createActivity: POST /tasks/:id/activities, invalidatesTags TaskActivity
- updateActivity: PUT /tasks/activities/:id, invalidatesTags TaskActivity by id
- deleteActivity: DELETE /tasks/activities/:id, invalidatesTags TaskActivity
- createComment: POST /tasks/:id/comments, invalidatesTags TaskComment
- updateComment: PUT /tasks/comments/:id, invalidatesTags TaskComment by id
- deleteComment: DELETE /tasks/comments/:id, invalidatesTags TaskComment
- Export hooks

**T5.14: Create Task Card Component**

Create `client/src/components/cards/TaskCard.jsx`:

- React.memo wrapper
- Props: task, onClick, onEdit, onDelete
- Display: title, description (truncated), status badge, priority badge, taskType badge, dueDate, assignees/assignedTo, tags
- Actions: View, Edit, Delete buttons
- useCallback for event handlers
- useMemo for computed values (status color, priority color, overdue check)
- Different styling based on taskType

**T5.15: Create Tasks List Component**

Create `client/src/components/lists/TasksList.jsx`:

- Props: tasks, onTaskClick, onTaskEdit, onTaskDelete
- Grid layout with responsive sizing
- Map tasks to TaskCard components
- Empty state: "No tasks found"
- Group by status (optional)

**T5.16: Create Task Filter Component**

Create `client/src/components/filters/TaskFilter.jsx`:

- Filter fields: search, taskType, status, priority, departmentId, createdBy, assignedTo, startDate, endDate
- FilterTextField for search
- FilterSelect for taskType, status, priority
- MuiResourceSelect for departmentId, createdBy, assignedTo
- FilterDateRange for startDate, endDate
- Clear filters button
- Active filters display with FilterChipGroup

**T5.17: Create Task Form (All Types)**

Create `client/src/components/forms/tasks/CreateUpdateTask.jsx`:

- useForm with all task fields
- useCreateTaskMutation, useUpdateTaskMutation
- Conditional fields based on taskType:
  - ProjectTask: vendorId (required), estimatedCost, actualCost, assignees, watchers (HOD only)
  - RoutineTask: materials (direct), startDate (required), dueDate (required), status (no "To Do"), priority (no "Low")
  - AssignedTask: assignedTo (required)
- Common fields: title, description, status, priority, tags, attachments
- Submit handler: create or update based on mode
- MuiDialog wrapper
- Validation matching backend
- Material selection with quantities
- Watcher selection (HOD only for ProjectTask)

**T5.18: Create Tasks Page**

Create `client/src/pages/Tasks.jsx`:

- useState for filters
- useGetTasksQuery with filters
- TasksList component
- TaskFilter component
- Create Task button (with taskType selector)
- CreateUpdateTask dialog
- Handle view, edit, delete, restore actions
- Loading and error states
- Statistics: total tasks, by status, by priority

**T5.19: Create Task Detail Page**

Create `client/src/pages/TaskDetail.jsx`:

- useParams to get taskId
- useGetTaskQuery
- Display task details (all fields)
- Display activities (ProjectTask/AssignedTask only)
- Display comments (threaded, max depth 3)
- Create activity form (ProjectTask/AssignedTask only)
- Create comment form
- Edit and delete buttons
- Material list with quantities
- Assignees/watchers list
- Attachments list

**T5.20: Create Activity List Component**

Create `client/src/components/common/TaskActivityList.jsx`:

- Props: activities, onEdit, onDelete
- Display activities in timeline format
- Show content, materials, attachments, createdBy, createdAt
- Edit and delete buttons (own activities only)

**T5.21: Create Comment List Component**

Create `client/src/components/common/TaskCommentList.jsx`:

- Props: comments, onEdit, onDelete, onReply
- Display comments in threaded format (max depth 3)
- Show content, mentions, attachments, createdBy, createdAt
- Edit, delete, reply buttons
- Nested comments with indentation

**T5.22: Update Router**

Update `client/src/router/routes.jsx`:

- Add lazy loaded pages: Tasks, TaskDetail
- Add routes:
  - /tasks (ProtectedRoute)
  - /tasks/:taskId (ProtectedRoute)

**T5.23: Update Sidebar Navigation**

Update `client/src/layouts/DashboardLayout.jsx`:

- Add Tasks navigation link

**T5.24: Update Socket Event Handlers**

Update `client/src/services/socketEvents.js`:

- task:created: invalidate Task tag, show toast
- task:updated: invalidate Task tag by id
- task:deleted: invalidate Task tag, show toast
- task:restored: invalidate Task tag, show toast
- activity:created: invalidate TaskActivity tag, show toast
- activity:updated: invalidate TaskActivity tag by id
- comment:created: invalidate TaskComment tag, show toast
- comment:updated: invalidate TaskComment tag by id
- comment:deleted: invalidate TaskComment tag, show toast

#### Testing Tasks

**T5.25: Write Unit Tests**

Create `backend/__tests__/unit/BaseTask.test.js`:

- Test task creation
- Test discriminator pattern
- Test watchers validation (HOD only)
- Test tags validation (max 5, unique)
- Test cascade delete

Create `backend/__tests__/unit/ProjectTask.test.js`:

- Test ProjectTask creation with vendorId
- Test materials via TaskActivity
- Test assignees and watchers
- Test cost tracking and history

Create `backend/__tests__/unit/RoutineTask.test.js`:

- Test RoutineTask creation
- Test materials added directly (no TaskActivity)
- Test status restriction (no "To Do")
- Test priority restriction (no "Low")

Create `backend/__tests__/unit/AssignedTask.test.js`:

- Test AssignedTask creation with assignedTo
- Test single and multiple assignees

Create `backend/__tests__/unit/TaskActivity.test.js`:

- Test activity creation on ProjectTask
- Test activity creation on AssignedTask
- Test activity CANNOT be created on RoutineTask
- Test materials with quantities

Create `backend/__tests__/unit/TaskComment.test.js`:

- Test comment creation
- Test threading (max depth 3)
- Test mentions validation

**T5.26: Write Integration Tests**

Create `backend/__tests__/integration/tasks.test.js`:

- Test POST /api/tasks: success for all task types, validation errors, authorization
- Test GET /api/tasks: success, pagination, filtering, sorting, authorization scoping
- Test GET /api/tasks/:id: success, not found, authorization
- Test PUT /api/tasks/:id: success, validation errors, authorization
- Test DELETE /api/tasks/:id: success, cascade delete, authorization
- Test PATCH /api/tasks/:id/restore: success, authorization
- Test POST /api/tasks/:id/activities: success, validation, authorization
- Test POST /api/tasks/:id/comments: success, threading, mentions, authorization

**T5.27: Write Property-Based Tests**

Create `backend/__tests__/property/tasks.property.test.js`:

- Property 1: All task types inherit BaseTask fields
- Property 2: RoutineTask status cannot be "To Do"
- Property 3: RoutineTask priority cannot be "Low"
- Property 4: ProjectTask requires vendorId
- Property 5: AssignedTask requires assignedTo
- Property 6: TaskActivity cannot be created on RoutineTask
- Use fast-check with 100 runs

#### Integration & Verification

**T5.28: Test Backend Endpoints**

```bash
cd backend
npm test
```

- Verify all tests pass
- Verify coverage maintained

**T5.29: Manual Testing**

- Create ProjectTask with vendor, materials, assignees, watchers
- Verify materials added via TaskActivity
- Verify watchers are HOD only
- Create RoutineTask with materials (direct)
- Verify cannot set status to "To Do"
- Verify cannot set priority to "Low"
- Create AssignedTask with assignedTo
- Create activities on ProjectTask and AssignedTask
- Verify cannot create activity on RoutineTask
- Create comments on tasks and activities
- Test comment threading (max depth 3)
- Test mentions in comments
- Test task edit and delete
- Test cascade delete
- Test real-time updates via Socket.IO

**T5.30: Git Commit & Merge**

```bash
git add .
git commit -m "Phase 5: Complete task management with all task types"
git checkout main
git merge phase-5-task-management
git push origin main
git branch -d phase-5-task-management
```

**Phase 5 Completion Checklist**:

- [ ] BaseTask model with discriminator pattern
- [ ] ProjectTask model with vendor and materials via TaskActivity
- [ ] RoutineTask model with direct materials and restrictions
- [ ] AssignedTask model with assignedTo
- [ ] TaskActivity model (ProjectTask/AssignedTask only)
- [ ] TaskComment model with threading
- [ ] Task CRUD endpoints working
- [ ] Activity CRUD endpoints working
- [ ] Comment CRUD endpoints working
- [ ] Frontend task management UI working
- [ ] Task filters working
- [ ] Task detail page working
- [ ] Activity list working
- [ ] Comment threading working
- [ ] Real-time updates working
- [ ] All tests pass
- [ ] Manual testing complete
- [ ] Git branch merged to main

### Phase 6: Material & Vendor Management

**Branch**: `phase-6-material-vendor`

**Objective**: Implement material inventory and vendor management systems

#### Backend Tasks

**T6.1: Create Material Model**

Create `backend/models/Material.js`:

- Schema fields: name (required, max 100), description (max 2000), category (required, enum: 9 categories), quantity (required, min 0), unitType (required, enum: 30+ types), cost (min 0), price (min 0), currency (default: ETB), vendor (ref: Vendor, no Id postfix), department (required, ref: Department, no Id postfix), organization (required, ref: Organization, no Id postfix), addedBy (required, ref: User, no Id postfix)
- Indexes: organization+department+name, organization+department+category, vendor
- Apply existing soft delete plugin (validated and corrected in T2.1)
- TTL index: 180 days
- Pre-save hooks: validate department and organization, validate vendor if provided
- Export model

**T6.2: Create Vendor Model**

Create `backend/models/Vendor.js`:

- Schema fields: name (required, max 100), description (max 2000), contactPerson (required, max 100), email (required, valid email, max 50), phone (required, E.164 format), address (required, max 500), department (required, ref: Department, no Id postfix), organization (required, ref: Organization, no Id postfix), createdBy (required, ref: User, no Id postfix)
- Indexes: organization+department+name, organization+department+email
- Apply existing soft delete plugin (validated and corrected in T2.1)
- TTL index: 180 days
- Pre-save hooks: validate department and organization
- Pre-delete hooks: check for linked materials, require reassignment
- Export model

**T6.3: Update Models Index**

Update `backend/models/index.js`:

- Import and export: Material, Vendor

**T6.4: Create Material Validators**

Create `backend/middlewares/validators/materialValidators.js`:

- validateCreateMaterial: name, description, category, quantity, unitType, cost, price, currency, vendorId (received from frontend), departmentId (received from frontend). Validate field types and formats. Check vendor existence using withDeleted() if provided. Check department existence. Check name uniqueness within department. After validation, attach to req.validated.body with conversion: vendorId → vendor, departmentId → department
- validateGetAllMaterials: page, limit, sortBy, sortOrder, search, category, vendorId (received from frontend), departmentId (received from frontend), minQuantity, maxQuantity, includeDeleted. After validation, attach to req.validated.query with conversion: vendorId → vendor, departmentId → department
- validateGetMaterial: materialId (param, valid ObjectId). Check material existence using withDeleted(). After validation, attach to req.validated.params
- validateUpdateMaterial: partial material fields with Id postfix from frontend. Check existence and uniqueness. After validation, attach to req.validated.body with field name conversion
- All validators must include: field validation, existence validation (using withDeleted() and onlyDeleted()), and uniqueness validation where applicable
- Export validators

**T6.5: Create Vendor Validators**

Create `backend/middlewares/validators/vendorValidators.js`:

- validateCreateVendor: name, description, contactPerson, email, phone, address, departmentId (received from frontend). Validate field types and formats. Check department existence using withDeleted(). Check name and email uniqueness within department. After validation, attach to req.validated.body with conversion: departmentId → department
- validateGetAllVendors: page, limit, sortBy, sortOrder, search, departmentId (received from frontend), includeDeleted. After validation, attach to req.validated.query with conversion: departmentId → department
- validateGetVendor: vendorId (param, valid ObjectId). Check vendor existence using withDeleted(). After validation, attach to req.validated.params
- validateUpdateVendor: partial vendor fields with Id postfix from frontend. Check existence and uniqueness. After validation, attach to req.validated.body with field name conversion
- All validators must include: field validation, existence validation (using withDeleted() and onlyDeleted()), and uniqueness validation where applicable
- Export validators

**T6.6: Create Material Controllers**

Create `backend/controllers/materialControllers.js`:

- createMaterial: extract data from req.validated.body (vendor, department already converted), extract { organization, department, \_id as addedBy } from req.user, create material, check authorization (scope AND ownership), emit material:created
- getAllMaterials: extract filters from req.validated.query (vendor, department already converted), extract { organization, department, role } from req.user, list materials with pagination, filtering, sorting, scoped by authorization
- getMaterial: extract { materialId } from req.validated.params, extract { organization, department, role, \_id } from req.user, get single material, check authorization (scope AND ownership - addedBy)
- updateMaterial: extract data from req.validated.body (fields already converted), extract { materialId } from req.validated.params, extract { organization, department, role, \_id } from req.user, update material, check authorization (scope AND ownership - addedBy), emit material:updated
- deleteMaterial: extract { materialId } from req.validated.params, extract { organization, department, role, \_id } from req.user, soft delete material, check authorization (scope AND ownership - addedBy), emit material:deleted
- restoreMaterial: extract { materialId } from req.validated.params, extract { organization, department, role } from req.user, restore soft-deleted material, check authorization, emit material:restored
- Export controllers

**T6.7: Create Vendor Controllers**

Create `backend/controllers/vendorControllers.js`:

- createVendor: extract data from req.validated.body (department already converted), extract { organization, department, \_id as createdBy } from req.user, create vendor, check authorization (scope AND ownership), emit vendor:created
- getAllVendors: extract filters from req.validated.query (department already converted), extract { organization, department, role } from req.user, list vendors with pagination, filtering, sorting, scoped by authorization
- getVendor: extract { vendorId } from req.validated.params, extract { organization, department, role, \_id } from req.user, get single vendor with linked materials and ProjectTasks, check authorization (scope AND ownership - createdBy)
- updateVendor: extract data from req.validated.body (fields already converted), extract { vendorId } from req.validated.params, extract { organization, department, role, \_id } from req.user, update vendor, check authorization (scope AND ownership - createdBy), emit vendor:updated
- deleteVendor: extract { vendorId } from req.validated.params, extract { organization, department, role, \_id } from req.user, check for linked materials, require reassignment, soft delete, check authorization (scope AND ownership - createdBy), emit vendor:deleted
- restoreVendor: extract { vendorId } from req.validated.params, extract { organization, department, role } from req.user, restore soft-deleted vendor, check authorization, emit vendor:restored
- Export controllers

**T6.8: Create Material Routes**

Create `backend/routes/materialRoutes.js`:

- All routes require verifyJWT
- POST / (authorize('Material', 'create'), validateCreateMaterial, createMaterial)
- GET / (authorize('Material', 'read'), validateGetAllMaterials, getAllMaterials)
- GET /:materialId (authorize('Material', 'read'), validateGetMaterial, getMaterial)
- PUT /:materialId (authorize('Material', 'update'), validateUpdateMaterial, updateMaterial)
- DELETE /:materialId (authorize('Material', 'delete'), validateGetMaterial, deleteMaterial)
- PATCH /:materialId/restore (authorize('Material', 'update'), validateGetMaterial, restoreMaterial)
- Export router

**T6.9: Create Vendor Routes**

Create `backend/routes/vendorRoutes.js`:

- All routes require verifyJWT
- POST / (authorize('Vendor', 'create'), validateCreateVendor, createVendor)
- GET / (authorize('Vendor', 'read'), validateGetAllVendors, getAllVendors)
- GET /:vendorId (authorize('Vendor', 'read'), validateGetVendor, getVendor)
- PUT /:vendorId (authorize('Vendor', 'update'), validateUpdateVendor, updateVendor)
- DELETE /:vendorId (authorize('Vendor', 'delete'), validateGetVendor, deleteVendor)
- PATCH /:vendorId/restore (authorize('Vendor', 'update'), validateGetVendor, restoreVendor)
- Export router

**T6.10: Update Routes Index**

Update `backend/routes/index.js`:

- Import materialRoutes, vendorRoutes
- Mount routes: /materials, /vendors

**T6.11: Update Seed Data**

Update `backend/mock/cleanSeedSetup.js`:

- Create sample materials (all categories)
- Create sample vendors
- Link materials to vendors

#### Frontend Tasks

**T6.12: Create Material API**

Create `client/src/redux/features/material/materialApi.js`:

- Inject endpoints into base api
- getMaterials: GET /materials with params, providesTags Material
- getMaterial: GET /materials/:id, providesTags Material by id
- createMaterial: POST /materials, invalidatesTags Material LIST
- updateMaterial: PUT /materials/:id, invalidatesTags Material by id and LIST
- deleteMaterial: DELETE /materials/:id, invalidatesTags Material LIST
- restoreMaterial: PATCH /materials/:id/restore, invalidatesTags Material LIST
- Export hooks

**T6.13: Create Vendor API**

Create `client/src/redux/features/vendor/vendorApi.js`:

- Inject endpoints into base api
- getVendors: GET /vendors with params, providesTags Vendor
- getVendor: GET /vendors/:id, providesTags Vendor by id
- createVendor: POST /vendors, invalidatesTags Vendor LIST
- updateVendor: PUT /vendors/:id, invalidatesTags Vendor by id and LIST
- deleteVendor: DELETE /vendors/:id, invalidatesTags Vendor LIST
- restoreVendor: PATCH /vendors/:id/restore, invalidatesTags Vendor LIST
- Export hooks

**T6.14: Create Material Columns**

Create `client/src/components/columns/MaterialColumns.jsx`:

- Define columns: name, category, quantity, unitType, cost, price, vendorId (populated), createdAt
- Action column with MuiActionColumn
- Export getMaterialColumns function

**T6.15: Create Vendor Columns**

Create `client/src/components/columns/VendorColumns.jsx`:

- Define columns: name, contactPerson, email, phone, address, createdAt
- Action column with MuiActionColumn
- Export getVendorColumns function

**T6.16: Create Material Filter Component**

Create `client/src/components/filters/MaterialFilter.jsx`:

- Filter fields: search, category, vendorId, minQuantity, maxQuantity
- FilterTextField for search, minQuantity, maxQuantity
- FilterSelect for category
- MuiResourceSelect for vendorId
- Clear filters button

**T6.17: Create Vendor Filter Component**

Create `client/src/components/filters/VendorFilter.jsx`:

- Filter fields: search, departmentId
- FilterTextField for search
- MuiResourceSelect for departmentId (Admin+)
- Clear filters button

**T6.18: Create Material Form**

Create `client/src/components/forms/materials/CreateUpdateMaterial.jsx`:

- useForm with material fields
- useCreateMaterialMutation, useUpdateMaterialMutation
- Form fields: name, description, category (MuiSelectAutocomplete with MATERIAL_CATEGORIES), quantity (MuiNumberField), unitType (MuiSelectAutocomplete with UNIT_TYPES), cost (MuiNumberField), price (MuiNumberField), currency, vendorId (MuiResourceSelect)
- Submit handler: create or update
- MuiDialog wrapper
- Validation matching backend

**T6.19: Create Vendor Form**

Create `client/src/components/forms/vendors/CreateUpdateVendor.jsx`:

- useForm with vendor fields
- useCreateVendorMutation, useUpdateVendorMutation
- Form fields: name, description, contactPerson, email, phone, address, departmentId (MuiResourceSelect, disabled in edit mode)
- Submit handler: create or update
- MuiDialog wrapper
- Validation matching backend

**T6.20: Create Materials Page (DataGrid Pattern)**

Create `client/src/pages/Materials.jsx`:

- useState for filters, pagination, dialogOpen, selectedMaterial
- useGetMaterialsQuery with filters and pagination
- MuiDataGrid with material columns
- MaterialFilter component
- Create Material button (Admin+)
- CreateUpdateMaterial dialog
- Handle view, edit, delete, restore actions
- Loading and error states
- Statistics: total materials, by category, low stock alerts

**T6.21: Create Vendors Page (DataGrid Pattern)**

Create `client/src/pages/Vendors.jsx`:

- useState for filters, pagination, dialogOpen, selectedVendor
- useGetVendorsQuery with filters and pagination
- MuiDataGrid with vendor columns
- VendorFilter component
- Create Vendor button (Admin+)
- CreateUpdateVendor dialog
- Handle view, edit, delete, restore actions
- Loading and error states
- Statistics: total vendors, active ProjectTasks per vendor

**T6.22: Create Material Card Component**

Create `client/src/components/cards/MaterialCard.jsx`:

- React.memo wrapper
- Props: material, onClick, onEdit, onDelete
- Display: name, category badge, quantity + unitType, cost, price, vendor
- Low stock indicator (if quantity < threshold)
- Actions: View, Edit, Delete buttons

**T6.23: Create Vendor Card Component**

Create `client/src/components/cards/VendorCard.jsx`:

- React.memo wrapper
- Props: vendor, onClick, onEdit, onDelete
- Display: name, contactPerson, email, phone, address
- Active ProjectTasks count
- Actions: View, Edit, Delete buttons

**T6.24: Update Router**

Update `client/src/router/routes.jsx`:

- Add lazy loaded pages: Materials, Vendors
- Add routes:
  - /materials (ProtectedRoute)
  - /vendors (ProtectedRoute)

**T6.25: Update Sidebar Navigation**

Update `client/src/layouts/DashboardLayout.jsx`:

- Add Materials and Vendors navigation links

**T6.26: Update Socket Event Handlers**

Update `client/src/services/socketEvents.js`:

- material:created: invalidate Material tag, show toast
- material:updated: invalidate Material tag by id
- material:deleted: invalidate Material tag, show toast
- material:restored: invalidate Material tag, show toast
- vendor:created: invalidate Vendor tag, show toast
- vendor:updated: invalidate Vendor tag by id
- vendor:deleted: invalidate Vendor tag, show toast
- vendor:restored: invalidate Vendor tag, show toast

#### Testing Tasks

**T6.27: Write Unit Tests**

Create `backend/__tests__/unit/Material.test.js`:

- Test material creation
- Test category validation
- Test quantity validation (min 0)
- Test unitType validation
- Test vendor linking

Create `backend/__tests__/unit/Vendor.test.js`:

- Test vendor creation
- Test email and phone validation
- Test material reassignment on delete

**T6.28: Write Integration Tests**

Create `backend/__tests__/integration/materials.test.js`:

- Test POST /api/materials: success, validation errors, authorization
- Test GET /api/materials: success, pagination, filtering, sorting, authorization scoping
- Test GET /api/materials/:id: success, not found, authorization
- Test PUT /api/materials/:id: success, validation errors, authorization
- Test DELETE /api/materials/:id: success, authorization
- Test PATCH /api/materials/:id/restore: success, authorization

Create `backend/__tests__/integration/vendors.test.js`:

- Test POST /api/vendors: success, validation errors, authorization
- Test GET /api/vendors: success, pagination, filtering, sorting, authorization scoping
- Test GET /api/vendors/:id: success, linked materials and ProjectTasks, authorization
- Test PUT /api/vendors/:id: success, validation errors, authorization
- Test DELETE /api/vendors/:id: success, material reassignment required, authorization
- Test PATCH /api/vendors/:id/restore: success, authorization

**T6.29: Write Property-Based Tests**

Create `backend/__tests__/property/materials.property.test.js`:

- Property 1: Material quantity always >= 0
- Property 2: Material category is valid enum value
- Property 3: Material unitType is valid enum value
- Use fast-check with 100 runs

#### Integration & Verification

**T6.30: Test Backend Endpoints**

```bash
cd backend
npm test
```

- Verify all tests pass
- Verify coverage maintained

**T6.31: Manual Testing**

- Create materials (all categories)
- Test material filters (category, vendor, quantity range)
- Edit material (update quantity, cost, price)
- Delete material
- Restore material
- Create vendors
- Link materials to vendors
- Test vendor filters
- Edit vendor
- Test vendor delete with material reassignment
- Restore vendor
- Test real-time updates via Socket.IO
- Test authorization (Manager/User can read, Admin+ can create/update/delete)

**T6.32: Git Commit & Merge**

```bash
git add .
git commit -m "Phase 6: Complete material and vendor management"
git checkout main
git merge phase-6-material-vendor
git push origin main
git branch -d phase-6-material-vendor
```

**Phase 6 Completion Checklist**:

- [ ] Material model with categories and unit types
- [ ] Vendor model with contact information
- [ ] Material CRUD endpoints working
- [ ] Vendor CRUD endpoints working
- [ ] Material-vendor linking working
- [ ] Vendor delete with material reassignment
- [ ] Frontend material management UI working
- [ ] Frontend vendor management UI working
- [ ] Material filters working
- [ ] Vendor filters working
- [ ] DataGrid pattern implemented
- [ ] Real-time updates working
- [ ] Authorization working
- [ ] All tests pass
- [ ] Manual testing complete
- [ ] Git branch merged to main

### Phase 7: Notifications & Email System

**Branch**: `phase-7-notifications-email`

**Objective**: Implement notification system with real-time and email delivery

#### Backend Tasks

**T7.1: Create Notification Model**

Create `backend/models/Notification.js`:

- Schema fields: title (required, max 100), message (required, max 500), type (required, enum: Created/Updated/Deleted/Restored/Mention/Welcome/Announcement), isRead (default: false), recipient (required, ref: User, no Id postfix), entity (ref: any resource, no Id postfix), entityModel (enum: User/Task/Material/Vendor/Organization/Department), organization (required, ref: Organization, no Id postfix), expiresAt (default: 30 days from now)
- Indexes: recipient+isRead+createdAt, organization+createdAt, expiresAt (TTL index)
- Apply existing soft delete plugin (validated and corrected in T2.1)
- TTL index: 30 days or custom expiresAt
- Pre-save hooks: validate recipient belongs to organization
- Export model

**T7.2: Update Models Index**

Update `backend/models/index.js`:

- Import and export: Notification

**T7.3: Create Email Templates**

Create `backend/templates/emailTemplates.js`:

- taskCreatedTemplate(task, user): HTML email for task created
- taskUpdatedTemplate(task, user): HTML email for task updated
- taskDeletedTemplate(task, user): HTML email for task deleted
- taskRestoredTemplate(task, user): HTML email for task restored
- mentionTemplate(comment, mentionedUser, author): HTML email for user mention
- welcomeTemplate(user, organization): HTML email for new user
- passwordResetTemplate(user, resetToken): HTML email for password reset
- announcementTemplate(title, message, organization): HTML email for announcement
- Export templates

**T7.4: Create Email Service**

Create `backend/services/emailService.js`:

- EmailService class with transporter and queue
- initialize(): create nodemailer transporter (Gmail SMTP), verify connection
- sendEmail(to, subject, html): add to queue, process asynchronously
- processQueue(): process email queue with retry logic
- getQueueStatus(): return queue status
- isInitialized(): check if service ready
- Export singleton instance

**T7.5: Create Notification Service**

Create `backend/services/notificationService.js`:

- createNotification(data): create notification, emit notification:created, send email if user preferences allow
- createBulkNotifications(recipients, data): create notifications for multiple users (max 500)
- markAsRead(notificationId): mark notification as read
- markAllAsRead(userId): mark all user notifications as read
- deleteExpired(): delete expired notifications (TTL cleanup)
- Export functions

**T7.6: Update Server.js**

Update `backend/server.js`:

- Import emailService
- Initialize email service on startup
- Log email service status

**T7.7: Create Notification Validators**

Create `backend/middlewares/validators/notificationValidators.js`:

- validateGetAllNotifications: page, limit, sortBy, sortOrder, isRead, type. After validation, attach to req.validated.query
- validateGetNotification: notificationId (param, valid ObjectId). Check notification existence using withDeleted(). After validation, attach to req.validated.params
- validateMarkAsRead: notificationId (param, valid ObjectId). Check notification existence using withDeleted(). After validation, attach to req.validated.params
- All validators must include: field validation, existence validation (using withDeleted() and onlyDeleted()), and uniqueness validation where applicable
- Export validators

**T7.8: Create Notification Controllers**

Create `backend/controllers/notificationControllers.js`:

- getAllNotifications: extract filters from req.validated.query, extract { \_id, organization } from req.user, list user's notifications with pagination, filtering (unread first), check authorization (scope AND ownership - recipient)
- getNotification: extract { notificationId } from req.validated.params, extract { \_id, organization } from req.user, get single notification, check authorization (scope AND ownership - recipient must match \_id)
- markAsRead: extract { notificationId } from req.validated.params, extract { \_id } from req.user, mark notification as read, check ownership (recipient must match \_id), emit notification:read
- markAllAsRead: extract { \_id } from req.user, mark all user notifications as read, emit notifications:read
- deleteNotification: extract { notificationId } from req.validated.params, extract { \_id } from req.user, soft delete notification, check ownership (recipient must match \_id)
- Export controllers

**T7.9: Create Notification Routes**

Create `backend/routes/notificationRoutes.js`:

- All routes require verifyJWT
- GET / (validateGetAllNotifications, getAllNotifications)
- GET /:notificationId (validateGetNotification, getNotification)
- PATCH /:notificationId/read (validateMarkAsRead, markAsRead)
- PATCH /read-all (markAllAsRead)
- DELETE /:notificationId (validateGetNotification, deleteNotification)
- Export router

**T7.10: Update Routes Index**

Update `backend/routes/index.js`:

- Import notificationRoutes
- Mount route: /notifications

**T7.11: Update Controllers to Send Notifications**

Update `backend/controllers/userControllers.js`:

- createUser: send welcome notification and email
- deleteUser: send notification to affected users

Update `backend/controllers/taskControllers.js`:

- createTask: send notification to assignees/watchers
- updateTask: send notification to assignees/watchers
- deleteTask: send notification to assignees/watchers
- createComment: send notification to mentioned users

Update `backend/controllers/organizationControllers.js`:

- createOrganization: send notification to platform admins
- deleteOrganization: send notification to organization users

Update `backend/controllers/departmentControllers.js`:

- createDepartment: send notification to department admins
- deleteDepartment: send notification to department users

#### Frontend Tasks

**T7.12: Create Notification API**

Create `client/src/redux/features/notification/notificationApi.js`:

- Inject endpoints into base api
- getNotifications: GET /notifications with params, providesTags Notification
- getNotification: GET /notifications/:id, providesTags Notification by id
- markAsRead: PATCH /notifications/:id/read, invalidatesTags Notification by id and LIST
- markAllAsRead: PATCH /notifications/read-all, invalidatesTags Notification LIST
- deleteNotification: DELETE /notifications/:id, invalidatesTags Notification LIST
- Export hooks

**T7.13: Create Notification Card Component**

Create `client/src/components/cards/NotificationCard.jsx`:

- React.memo wrapper
- Props: notification, onClick, onMarkAsRead, onDelete
- Display: title, message, type badge, isRead indicator, createdAt (relative time)
- Actions: Mark as read, Delete buttons
- Different styling based on type and isRead
- Click to navigate to related entity

**T7.14: Create Notification Menu Component**

Create `client/src/components/common/NotificationMenu.jsx`:

- useState for anchorEl, open
- useGetNotificationsQuery with limit: 5, isRead: false
- Badge with unread count
- IconButton with NotificationsIcon
- Menu with notification list
- Mark as read button for each notification
- Mark all as read button
- View all notifications link
- Real-time updates via Socket.IO

**T7.15: Create Notifications Page**

Create `client/src/pages/Notifications.jsx`:

- useState for filters (isRead, type)
- useGetNotificationsQuery with filters and pagination
- List of NotificationCard components
- Filter UI: isRead (all/unread/read), type
- Mark all as read button
- Delete all read button
- Loading and error states
- Empty state: "No notifications"

**T7.16: Update Header**

Update `client/src/layouts/DashboardLayout.jsx`:

- Add NotificationMenu component to header
- Position: right side, before UserMenu

**T7.17: Update Router**

Update `client/src/router/routes.jsx`:

- Add lazy loaded page: Notifications
- Add route: /notifications (ProtectedRoute)

**T7.18: Update Socket Event Handlers**

Update `client/src/services/socketEvents.js`:

- notification:created: invalidate Notification tag, show toast, play sound (optional)
- notification:read: invalidate Notification tag by id
- notifications:read: invalidate Notification tag LIST

**T7.19: Create Notification Sound (Optional)**

Create `client/public/notification.mp3`:

- Add notification sound file
- Play sound on notification:created event (if user preferences allow)

#### Testing Tasks

**T7.20: Write Unit Tests**

Create `backend/__tests__/unit/Notification.test.js`:

- Test notification creation
- Test TTL expiry
- Test recipient validation

Create `backend/__tests__/unit/emailService.test.js`:

- Test email service initialization
- Test email queue
- Test email sending (mock nodemailer)

Create `backend/__tests__/unit/notificationService.test.js`:

- Test createNotification
- Test createBulkNotifications (max 500)
- Test markAsRead
- Test markAllAsRead

**T7.21: Write Integration Tests**

Create `backend/__tests__/integration/notifications.test.js`:

- Test GET /api/notifications: success, pagination, filtering (unread first)
- Test GET /api/notifications/:id: success, ownership check
- Test PATCH /api/notifications/:id/read: success, ownership check
- Test PATCH /api/notifications/read-all: success
- Test DELETE /api/notifications/:id: success, ownership check

**T7.22: Write Property-Based Tests**

Create `backend/__tests__/property/notifications.property.test.js`:

- Property 1: Notification recipient must belong to organization
- Property 2: Bulk notifications respect max 500 recipients
- Property 3: Expired notifications are auto-deleted by TTL
- Use fast-check with 100 runs

#### Integration & Verification

**T7.23: Test Backend Endpoints**

```bash
cd backend
npm test
```

- Verify all tests pass
- Verify coverage maintained

**T7.24: Test Email Service**

- Configure Gmail SMTP in .env
- Create test user
- Verify welcome email sent
- Create test task
- Verify task notification email sent
- Test password reset email
- Check email logs

**T7.25: Manual Testing**

- Create task and verify notification sent to assignees
- Verify notification appears in NotificationMenu
- Verify unread count badge updates
- Click notification and verify navigation to task
- Mark notification as read
- Verify read status updates in real-time
- Mark all as read
- Delete notification
- Test mention in comment
- Verify mentioned user receives notification and email
- Test notification filters (unread, type)
- Test real-time notification updates via Socket.IO
- Test notification sound (if implemented)

**T7.26: Git Commit & Merge**

```bash
git add .
git commit -m "Phase 7: Complete notifications and email system"
git checkout main
git merge phase-7-notifications-email
git push origin main
git branch -d phase-7-notifications-email
```

**Phase 7 Completion Checklist**:

- [ ] Notification model with TTL
- [ ] Email templates created
- [ ] Email service initialized
- [ ] Notification service working
- [ ] Notification CRUD endpoints working
- [ ] Notifications sent on events (task, user, etc.)
- [ ] Email sent on notifications (if user preferences allow)
- [ ] Frontend notification API integrated
- [ ] NotificationMenu component working
- [ ] Notifications page working
- [ ] Real-time notification updates working
- [ ] Mark as read working
- [ ] Mark all as read working
- [ ] Notification navigation working
- [ ] All tests pass
- [ ] Email delivery working
- [ ] Manual testing complete
- [ ] Git branch merged to main

### Phase 8: File Attachments & Cloudinary Integration

**Branch**: `phase-8-attachments`

**Objective**: Implement file upload system with Cloudinary integration

#### Backend Tasks

**T8.1: Create Attachment Model**

Create `backend/models/Attachment.js`:

- Schema fields: filename (required, max 255), fileUrl (required, Cloudinary URL), fileType (required, enum: Image/Video/Document/Audio/Other), fileSize (required, in bytes), parent (required, ref: any resource, no Id postfix), parentModel (required, enum: ProjectTask/RoutineTask/AssignedTask/TaskActivity/TaskComment), uploadedBy (required, ref: User, no Id postfix), department (required, ref: Department, no Id postfix), organization (required, ref: Organization, no Id postfix)
- Indexes: parent+parentModel+createdAt, organization+department+createdAt, uploadedBy+createdAt
- Apply existing soft delete plugin (validated and corrected in T2.1)
- TTL index: 90 days
- Pre-save hooks: validate parent exists, validate fileSize limits by type
- Export model

**T8.2: Update Models Index**

Update `backend/models/index.js`:

- Import and export: Attachment

**T8.3: Create Attachment Validators**

Create `backend/middlewares/validators/attachmentValidators.js`:

- validateCreateAttachment: filename, fileUrl, fileType, fileSize, parentId (received from frontend), parentModel. Validate field types and formats. Check parent existence using withDeleted(). Check max attachments per entity (10). After validation, attach to req.validated.body with conversion: parentId → parent
- validateGetAllAttachments: page, limit, sortBy, sortOrder, parentId (received from frontend), parentModel, fileType, uploadedById (received from frontend). After validation, attach to req.validated.query with conversion: parentId → parent, uploadedById → uploadedBy
- validateGetAttachment: attachmentId (param, valid ObjectId). Check attachment existence using withDeleted(). After validation, attach to req.validated.params
- All validators must include: field validation, existence validation (using withDeleted() and onlyDeleted()), and uniqueness validation where applicable
- Export validators

**T8.4: Create Attachment Controllers**

Create `backend/controllers/attachmentControllers.js`:

- createAttachment: extract data from req.validated.body (parent already converted), extract { organization, department, \_id as uploadedBy } from req.user, create attachment, validate file size limits, check max attachments per entity (10), check authorization (scope AND ownership), emit attachment:created
- getAllAttachments: extract filters from req.validated.query (parent, uploadedBy already converted), extract { organization, department, role } from req.user, list attachments with pagination, filtering, scoped by authorization
- getAttachment: extract { attachmentId } from req.validated.params, extract { organization, department, role, \_id } from req.user, get single attachment, check authorization (scope AND ownership - uploadedBy)
- deleteAttachment: extract { attachmentId } from req.validated.params, extract { organization, department, role, \_id } from req.user, soft delete attachment, check authorization (scope AND ownership - uploadedBy), emit attachment:deleted
- Export controllers

**T8.5: Create Attachment Routes**

Create `backend/routes/attachmentRoutes.js`:

- All routes require verifyJWT
- POST / (validateCreateAttachment, createAttachment)
- GET / (validateGetAllAttachments, getAllAttachments)
- GET /:attachmentId (validateGetAttachment, getAttachment)
- DELETE /:attachmentId (validateGetAttachment, deleteAttachment)
- Export router

**T8.6: Update Routes Index**

Update `backend/routes/index.js`:

- Import attachmentRoutes
- Mount route: /attachments

**T8.7: Update Task Models**

Update `backend/models/BaseTask.js`:

- Add attachments field: array of ObjectIds (ref: Attachment), max 10, unique
- Add validation: max 10 attachments per task

Update `backend/models/TaskActivity.js`:

- Add attachments field: array of ObjectIds (ref: Attachment), max 10, unique

Update `backend/models/TaskComment.js`:

- Add attachments field: array of ObjectIds (ref: Attachment), max 10, unique

**T8.8: Update User Model**

Update `backend/models/User.js`:

- Update profilePicture field: { url: String (Cloudinary URL), publicId: String }
- Add validation: profilePicture must be image type, max 10MB

**T8.9: Update Organization Model**

Update `backend/models/Organization.js`:

- Update logoUrl field: { url: String (Cloudinary URL), publicId: String }
- Add validation: logoUrl must be image type, max 10MB

#### Frontend Tasks

**T8.10: Create Attachment API**

Create `client/src/redux/features/attachment/attachmentApi.js`:

- Inject endpoints into base api
- getAttachments: GET /attachments with params, providesTags Attachment
- getAttachment: GET /attachments/:id, providesTags Attachment by id
- createAttachment: POST /attachments, invalidatesTags Attachment LIST
- deleteAttachment: DELETE /attachments/:id, invalidatesTags Attachment LIST
- Export hooks

**T8.11: Create Cloudinary Service**

Create `client/src/services/cloudinaryService.js`:

- CLOUDINARY_UPLOAD_PRESET: from environment variable
- CLOUDINARY_CLOUD_NAME: from environment variable
- uploadToCloudinary(file, folder): upload file to Cloudinary, return { url, publicId, format, size }
- validateFileType(file, allowedTypes): validate file type
- validateFileSize(file, maxSize): validate file size
- Export functions

**T8.12: Create MuiFileUpload Component**

Create `client/src/components/common/MuiFileUpload.jsx`:

- Props: name, control, accept, maxSize, multiple, onUpload
- useState for uploading, progress, preview
- File input with drag-and-drop support (react-dropzone)
- File validation: type and size
- Upload to Cloudinary on file select
- Show preview for images
- Show progress bar during upload
- Show file list with remove buttons
- Export component

**T8.13: Create Attachment Card Component**

Create `client/src/components/cards/AttachmentCard.jsx`:

- React.memo wrapper
- Props: attachment, onDelete, onDownload
- Display: filename, fileType icon, fileSize (formatted), uploadedBy, createdAt
- Preview for images (thumbnail)
- Actions: Download, Delete buttons
- Click to open in new tab

**T8.14: Create Attachment List Component**

Create `client/src/components/common/AttachmentList.jsx`:

- Props: attachments, onDelete, onDownload
- Grid layout with AttachmentCard components
- Empty state: "No attachments"
- Max attachments indicator (10)

**T8.15: Update Task Form**

Update `client/src/components/forms/tasks/CreateUpdateTask.jsx`:

- Add MuiFileUpload for attachments
- Handle file upload to Cloudinary
- Store attachment metadata
- Display uploaded attachments
- Remove attachment button

**T8.16: Update User Form**

Update `client/src/components/forms/users/CreateUpdateUser.jsx`:

- Add MuiFileUpload for profilePicture (single image)
- Handle image upload to Cloudinary
- Show image preview
- Remove image button

**T8.17: Update Organization Form**

Update `client/src/components/forms/organizations/CreateUpdateOrganization.jsx`:

- Add MuiFileUpload for logoUrl (single image)
- Handle image upload to Cloudinary
- Show logo preview
- Remove logo button

**T8.18: Update Task Detail Page**

Update `client/src/pages/TaskDetail.jsx`:

- Display AttachmentList for task attachments
- Add attachment upload button
- Handle attachment delete

**T8.19: Update Activity List**

Update `client/src/components/common/TaskActivityList.jsx`:

- Display attachments for each activity
- Add attachment upload to activity form

**T8.20: Update Comment List**

Update `client/src/components/common/TaskCommentList.jsx`:

- Display attachments for each comment
- Add attachment upload to comment form

**T8.21: Create Image Lightbox (Optional)**

Create `client/src/components/common/ImageLightbox.jsx`:

- Props: images, currentIndex, onClose
- Display image in fullscreen overlay
- Navigation: previous, next buttons
- Zoom controls
- Close button
- Use yet-another-react-lightbox library

**T8.22: Update Socket Event Handlers**

Update `client/src/services/socketEvents.js`:

- attachment:created: invalidate Attachment tag
- attachment:deleted: invalidate Attachment tag

#### Testing Tasks

**T8.23: Write Unit Tests**

Create `backend/__tests__/unit/Attachment.test.js`:

- Test attachment creation
- Test file type validation
- Test file size validation by type
- Test max attachments per entity (10)

**T8.24: Write Integration Tests**

Create `backend/__tests__/integration/attachments.test.js`:

- Test POST /api/attachments: success, validation errors, max attachments
- Test GET /api/attachments: success, pagination, filtering
- Test GET /api/attachments/:id: success, authorization
- Test DELETE /api/attachments/:id: success, authorization

**T8.25: Write Property-Based Tests**

Create `backend/__tests__/property/attachments.property.test.js`:

- Property 1: Attachment fileSize respects type limits
- Property 2: Max 10 attachments per entity
- Property 3: Attachment parentId must exist
- Use fast-check with 100 runs

#### Integration & Verification

**T8.26: Test Backend Endpoints**

```bash
cd backend
npm test
```

- Verify all tests pass
- Verify coverage maintained

**T8.27: Configure Cloudinary**

- Create Cloudinary account
- Get cloud name and upload preset
- Add to .env files (backend and frontend)
- Configure upload preset settings

**T8.28: Manual Testing**

- Upload image to task
- Verify image uploaded to Cloudinary
- Verify attachment metadata saved to database
- View attachment in task detail
- Download attachment
- Delete attachment
- Upload multiple attachments (test max 10)
- Upload different file types (image, video, document, audio)
- Test file size limits
- Upload profile picture
- Upload organization logo
- Test attachment in activity
- Test attachment in comment
- Test real-time attachment updates via Socket.IO
- Test image lightbox (if implemented)

**T8.29: Git Commit & Merge**

```bash
git add .
git commit -m "Phase 8: Complete file attachments and Cloudinary integration"
git checkout main
git merge phase-8-attachments
git push origin main
git branch -d phase-8-attachments
```

**Phase 8 Completion Checklist**:

- [ ] Attachment model created
- [ ] Attachment CRUD endpoints working
- [ ] File type and size validation working
- [ ] Max attachments per entity enforced (10)
- [ ] Cloudinary service configured
- [ ] MuiFileUpload component working
- [ ] File upload to Cloudinary working
- [ ] Attachment display in tasks working
- [ ] Attachment display in activities working
- [ ] Attachment display in comments working
- [ ] Profile picture upload working
- [ ] Organization logo upload working
- [ ] Attachment download working
- [ ] Attachment delete working
- [ ] Real-time updates working
- [ ] All tests pass
- [ ] Manual testing complete
- [ ] Git branch merged to main

### Phase 9: Timezone Management & Date Handling

**Branch**: `phase-9-timezone-management`

**Objective**: Implement comprehensive timezone management for consistent date/time handling across global users

#### Backend Tasks

**T9.1: Configure Server Timezone**

Update `backend/app.js`:

- Import dayjs, utc plugin, timezone plugin
- Extend dayjs with plugins: dayjs.extend(utc), dayjs.extend(timezone)
- Force UTC timezone: process.env.TZ = 'UTC'
- Log timezone configuration on startup

**T9.2: Update All Models with UTC Storage**

Update all models to ensure dates stored in UTC:

- Organization: createdAt, updatedAt, deletedAt, restoredAt
- Department: createdAt, updatedAt, deletedAt, restoredAt
- User: createdAt, updatedAt, deletedAt, restoredAt, dateOfBirth, joinedAt, lastLogin, passwordResetExpires
- Task: createdAt, updatedAt, deletedAt, restoredAt, startDate, dueDate
- TaskActivity: createdAt, updatedAt, deletedAt, restoredAt
- TaskComment: createdAt, updatedAt, deletedAt, restoredAt
- Material: createdAt, updatedAt, deletedAt, restoredAt
- Vendor: createdAt, updatedAt, deletedAt, restoredAt
- Attachment: createdAt, updatedAt, deletedAt, restoredAt
- Notification: createdAt, updatedAt, expiresAt

**T9.3: Update Controllers to Return ISO Dates**

Update all controllers to return dates in ISO 8601 format:

- Use toJSON() method which automatically converts to ISO
- Ensure all date fields in responses are ISO strings

**T9.4: Create Date Utility Functions**

Create `backend/utils/dateUtils.js`:

- parseToUTC(dateString): parse date string to UTC
- formatToISO(date): format date to ISO 8601 string
- addDays(date, days): add days to date
- subtractDays(date, days): subtract days from date
- isExpired(date): check if date is in the past
- getDaysDifference(date1, date2): get difference in days
- Export functions

#### Frontend Tasks

**T9.5: Create Date Utility Functions**

Create `client/src/utils/dateUtils.js`:

- Import dayjs with utc and timezone plugins
- getUserTimezone(): get user's local timezone
- utcToLocal(date): convert UTC date to local timezone
- localToUtc(date): convert local date to UTC
- formatDate(date, format): format date for display (default: 'MMM DD, YYYY')
- formatDateTime(date, format): format date and time (default: 'MMM DD, YYYY HH:mm')
- formatRelativeTime(date): format as relative time (e.g., "2 hours ago")
- isToday(date): check if date is today
- isFuture(date): check if date is in the future
- Export functions

**T9.6: Update MuiDatePicker Component**

Update `client/src/components/common/MuiDatePicker.jsx`:

- Automatic UTC to local conversion for display
- Automatic local to UTC conversion on change
- Use dateUtils for conversions
- Handle timezone properly in validation

**T9.7: Update MuiDateRangePicker Component**

Update `client/src/components/common/MuiDateRangePicker.jsx`:

- Automatic UTC to local conversion for display
- Automatic local to UTC conversion on change
- Use dateUtils for conversions
- Validate end date is after start date in local timezone

**T9.8: Update All Date Displays**

Update all components that display dates:

- TaskCard: use formatRelativeTime for createdAt
- UserCard: use formatDate for joinedAt
- NotificationCard: use formatRelativeTime for createdAt
- All list views: use formatDate or formatDateTime
- All detail views: use formatDateTime

**T9.9: Update Task Form Date Fields**

Update `client/src/components/forms/tasks/CreateUpdateTask.jsx`:

- Use MuiDatePicker for startDate and dueDate
- Convert UTC dates from backend to local for editing
- Convert local dates to UTC before submitting

**T9.10: Update User Form Date Fields**

Update `client/src/components/forms/users/CreateUpdateUser.jsx`:

- Use MuiDatePicker for dateOfBirth and joinedAt
- Convert UTC dates from backend to local for editing
- Convert local dates to UTC before submitting

#### Testing Tasks

**T9.11: Write Timezone Tests**

Create `backend/__tests__/unit/dateUtils.test.js`:

- Test parseToUTC with various date formats
- Test formatToISO
- Test date arithmetic functions
- Test isExpired

Create `backend/__tests__/property/timezone.property.test.js`:

- Property 1: All dates stored in database are UTC
- Property 2: API responses return ISO 8601 format
- Property 3: Date conversions are reversible (UTC → Local → UTC)
- Use fast-check with 100 runs

#### Integration & Verification

**T9.12: Test Backend Timezone**

```bash
cd backend
npm test
```

- Verify all tests pass
- Verify dates stored in UTC in MongoDB
- Verify API responses return ISO format

**T9.13: Manual Testing**

- Create task with due date in local timezone
- Verify stored as UTC in database
- Retrieve task and verify date converted to local timezone
- Test with users in different timezones (change browser timezone)
- Create user with date of birth
- Verify date displays correctly in local timezone
- Test date filters (date range)
- Verify date comparisons work correctly
- Test notification expiry dates
- Test password reset token expiry

**T9.14: Git Commit & Merge**

```bash
git add .
git commit -m "Phase 9: Complete timezone management and date handling"
git checkout main
git merge phase-9-timezone-management
git push origin main
git branch -d phase-9-timezone-management
```

**Phase 9 Completion Checklist**:

- [ ] Server timezone set to UTC
- [ ] All dates stored in UTC in database
- [ ] API responses return ISO 8601 format
- [ ] Frontend date utilities created
- [ ] UTC to local conversion working
- [ ] Local to UTC conversion working
- [ ] Date pickers handle timezone correctly
- [ ] All date displays use local timezone
- [ ] Date filters work correctly
- [ ] All tests pass
- [ ] Manual testing complete
- [ ] Git branch merged to main

### Phase 10: Testing & Quality Assurance

**Branch**: `phase-10-testing-qa`

**Objective**: Achieve comprehensive test coverage with unit, integration, and property-based tests

#### Backend Testing Tasks

**T10.1: Complete Unit Test Coverage**

Ensure all models have unit tests:

- Organization.test.js: cascade delete, platform protection, unique constraints
- Department.test.js: cascade delete, unique name per org
- User.test.js: password hashing, HOD logic, cascade delete, protections
- BaseTask.test.js: discriminator pattern, watchers validation
- ProjectTask.test.js: vendor requirement, cost tracking, materials via activity
- RoutineTask.test.js: status/priority restrictions, direct materials
- AssignedTask.test.js: assignedTo validation
- TaskActivity.test.js: parent validation (not RoutineTask), materials
- TaskComment.test.js: threading (max depth 3), mentions
- Material.test.js: category/unit validation, vendor linking
- Vendor.test.js: material reassignment on delete
- Attachment.test.js: file type/size validation, max per entity
- Notification.test.js: TTL expiry, recipient validation

**T10.2: Complete Integration Test Coverage**

Ensure all endpoints have integration tests:

- auth.test.js: register, login, logout, refresh, forgot password, reset password
- users.test.js: CRUD operations, authorization scoping, cascade delete
- organizations.test.js: CRUD operations, platform SuperAdmin only, cascade delete
- departments.test.js: CRUD operations, authorization scoping, cascade delete
- tasks.test.js: CRUD for all task types, activities, comments, authorization
- materials.test.js: CRUD operations, filtering, authorization
- vendors.test.js: CRUD operations, material reassignment, authorization
- notifications.test.js: list, mark as read, mark all as read, ownership
- attachments.test.js: upload, download, delete, max per entity

**T10.3: Complete Property-Based Test Coverage**

Create comprehensive property-based tests:

- softDelete.property.test.js: soft delete preserves data, automatic filtering, restore
- authorization.property.test.js: role hierarchy, scope hierarchy, platform rules
- cascade.property.test.js: cascade operations are transactional, all-or-nothing
- cors.property.test.js: origin validation, no wildcards in production
- securityHeaders.property.test.js: all required headers present
- timezone.property.test.js: dates stored in UTC, ISO format responses
- pagination.property.test.js: page boundaries, consistent results
- validation.property.test.js: field length limits, enum values

**T10.4: Write Edge Case Tests**

Create tests for edge cases:

- Last SuperAdmin deletion (should fail)
- Last HOD deletion (should fail)
- Platform organization deletion (should fail)
- Vendor deletion with linked materials (should require reassignment)
- Max attachments per entity (should fail at 11)
- Max watchers per task (should fail at 21)
- Comment threading beyond depth 3 (should fail)
- Soft delete cascade rollback on error
- Concurrent user creation with same email
- Token expiry edge cases

**T10.5: Performance Testing**

Create performance tests:

- Load testing: 100 concurrent users
- Database query performance: pagination with large datasets
- Socket.IO performance: 1000 concurrent connections
- File upload performance: large files (up to max size)
- Cascade delete performance: organization with 1000+ users

**T10.6: Security Testing**

Create security tests:

- SQL injection attempts (should be blocked by mongoSanitize)
- XSS attempts (should be blocked by input validation)
- CSRF attempts (should be blocked by SameSite cookies)
- Rate limiting (should block after limit)
- JWT token tampering (should fail verification)
- Password brute force (should be rate limited)
- Unauthorized access attempts (should return 401/403)

**T10.7: Code Quality Checks**

Run code quality tools:

```bash
cd backend
npm run lint
npm audit
npm outdated
```

- Fix all linting errors
- Fix all security vulnerabilities
- Update outdated dependencies (if safe)

#### Frontend Testing Tasks

**T10.8: Component Testing (Optional)**

If time permits, add component tests:

- LoginForm.test.jsx: form validation, submission
- RegisterForm.test.jsx: multi-step wizard, validation
- CreateUpdateUser.test.jsx: form validation, submission
- TaskCard.test.jsx: display, actions
- MuiDataGrid.test.jsx: pagination conversion, sorting, filtering

**T10.9: E2E Testing (Optional)**

If time permits, add E2E tests with Playwright or Cypress:

- User registration flow
- Login flow
- Create task flow
- Edit user flow
- Delete organization flow (cascade)
- Real-time update flow

**T10.10: Frontend Code Quality**

Run code quality tools:

```bash
cd client
npm run lint
npm audit
npm outdated
npm run build
```

- Fix all linting errors
- Fix all security vulnerabilities
- Update outdated dependencies (if safe)
- Verify production build succeeds

#### Documentation Tasks

**T10.11: Update README.md**

Create comprehensive README.md:

- Project overview and features
- Technology stack
- Prerequisites (Node.js, MongoDB, npm)
- Installation instructions (backend and frontend)
- Environment variables setup
- Running in development
- Running tests
- Building for production
- Deployment instructions
- API documentation link
- Contributing guidelines
- License

**T10.12: Create API Documentation**

Create `backend/API.md`:

- Base URL and authentication
- All endpoints with request/response examples
- Error codes and messages
- Rate limiting information
- Pagination format
- Authorization scopes
- WebSocket events

**T10.13: Create Architecture Documentation**

Create `ARCHITECTURE.md`:

- System architecture diagram
- Data flow diagrams
- Multi-tenancy architecture
- Task type architecture
- Authorization matrix explanation
- Soft delete and cascade operations
- Real-time communication flow
- Timezone management approach

**T10.14: Code Comments**

Add JSDoc comments to all functions:

- Backend: controllers, services, utilities, models
- Frontend: components, hooks, utilities, services
- Include parameter types, return types, descriptions

#### Integration & Verification

**T10.15: Run Full Test Suite**

```bash
cd backend
npm test
npm run test:coverage
```

- Verify all tests pass
- Verify coverage meets requirements:
  - Statements: 80%+
  - Branches: 75%+
  - Functions: 80%+
  - Lines: 80%+

**T10.16: Manual Testing Checklist**

Complete comprehensive manual testing:

- [ ] User registration and login
- [ ] Password reset flow
- [ ] User CRUD operations (all roles)
- [ ] Organization CRUD operations (Platform SuperAdmin)
- [ ] Department CRUD operations (Admin+)
- [ ] Task CRUD operations (all task types)
- [ ] Material CRUD operations (Admin+)
- [ ] Vendor CRUD operations (Admin+)
- [ ] Notification system
- [ ] File attachments (all types)
- [ ] Real-time updates (Socket.IO)
- [ ] Authorization (all roles and scopes)
- [ ] Soft delete and restore
- [ ] Cascade delete operations
- [ ] Timezone handling
- [ ] Pagination and filtering
- [ ] Search functionality
- [ ] Email notifications
- [ ] Rate limiting (production)
- [ ] Error handling
- [ ] Mobile responsiveness

**T10.17: Browser Compatibility Testing**

Test on multiple browsers:

- [ ] Chrome (latest 2 versions)
- [ ] Firefox (latest 2 versions)
- [ ] Safari (latest 2 versions)
- [ ] Edge (latest 2 versions)

**T10.18: Performance Optimization**

Optimize application performance:

- Backend: database indexes, query optimization, caching
- Frontend: code splitting, lazy loading, memoization
- Verify Lighthouse scores: Performance 90+, Accessibility 90+, Best Practices 90+, SEO 90+

**T10.19: Security Audit**

Perform security audit:

- [ ] All environment variables secured
- [ ] No secrets in code
- [ ] HTTPS enforced in production
- [ ] Security headers configured
- [ ] Rate limiting working
- [ ] Input sanitization working
- [ ] JWT tokens in HTTP-only cookies
- [ ] Password hashing with bcrypt ≥12 rounds
- [ ] CORS configured correctly
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] No CSRF vulnerabilities

**T10.20: Git Commit & Merge**

```bash
git add .
git commit -m "Phase 10: Complete testing and quality assurance"
git checkout main
git merge phase-10-testing-qa
git push origin main
git branch -d phase-10-testing-qa
```

**Phase 10 Completion Checklist**:

- [ ] All unit tests pass (80%+ coverage)
- [ ] All integration tests pass
- [ ] All property-based tests pass
- [ ] Edge case tests pass
- [ ] Performance tests pass
- [ ] Security tests pass
- [ ] Code quality checks pass
- [ ] Frontend build succeeds
- [ ] README.md complete
- [ ] API documentation complete
- [ ] Architecture documentation complete
- [ ] Code comments added
- [ ] Manual testing complete
- [ ] Browser compatibility verified
- [ ] Performance optimized
- [ ] Security audit complete
- [ ] Git branch merged to main

### Phase 11: Production Deployment

**Branch**: `phase-11-production-deployment`

**Objective**: Deploy application to production with proper configuration and monitoring

#### Deployment Preparation

**T11.1: Environment Configuration**

Create production environment files:

- `backend/.env.production`: production environment variables
- `client/.env.production`: production environment variables
- Ensure all secrets are strong and unique
- Configure production database connection
- Configure production email service
- Configure production Cloudinary settings

**T11.2: Build Frontend for Production**

```bash
cd client
npm run build:prod
```

- Verify build succeeds
- Verify dist/ folder created
- Verify assets optimized (minified, compressed)
- Verify no console.log statements in production build

**T11.3: Configure Backend to Serve Frontend**

Update `backend/app.js`:

- In production mode, serve static files from ../client/dist
- Add catch-all route to serve index.html for client-side routing
- Verify production configuration

**T11.4: Database Setup**

Prepare production database:

- Create MongoDB Atlas cluster (or self-hosted MongoDB)
- Configure database user with strong password
- Configure IP whitelist
- Enable authentication
- Create database backup schedule
- Test connection from production server

**T11.5: SSL/TLS Certificate**

Obtain SSL certificate:

- Use Let's Encrypt (free) or commercial certificate
- Configure certificate renewal
- Test HTTPS connection

**T11.6: Server Configuration**

Configure production server:

- Install Node.js v20.x LTS
- Install MongoDB (if self-hosted)
- Install PM2 or configure systemd service
- Configure firewall (ports 80, 443, 27017 internal only)
- Configure reverse proxy (Nginx or Apache)
- Set up log rotation
- Configure automatic backups

**T11.7: Nginx Configuration**

Create Nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API proxy
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO proxy
    location /socket.io {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files (frontend)
    location / {
        root /var/www/task-manager/client/dist;
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
}
```

**T11.8: PM2 Configuration**

Create PM2 ecosystem file `backend/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: "task-manager-api",
      script: "./server.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      max_memory_restart: "1G",
    },
  ],
};
```

#### Deployment Steps

**T11.9: Deploy to Server**

```bash
# 1. Clone repository on server
git clone <repository-url> /var/www/task-manager
cd /var/www/task-manager

# 2. Install backend dependencies
cd backend
npm ci --production

# 3. Install frontend dependencies and build
cd ../client
npm ci
npm run build:prod

# 4. Configure environment variables
cd ../backend
cp .env.example .env.production
# Edit .env.production with production values

# 5. Start application with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# 6. Configure Nginx
sudo cp nginx.conf /etc/nginx/sites-available/task-manager
sudo ln -s /etc/nginx/sites-available/task-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 7. Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com
sudo certbot renew --dry-run
```

**T11.10: Initialize Production Database**

```bash
cd backend
# Set INITIALIZE_SEED_DATA=true in .env.production (one-time only)
pm2 restart task-manager-api
# Verify platform organization created
# Set INITIALIZE_SEED_DATA=false after initialization
pm2 restart task-manager-api
```

**T11.11: Verify Deployment**

- [ ] Access https://yourdomain.com
- [ ] Verify frontend loads
- [ ] Verify HTTPS working
- [ ] Verify API endpoints working
- [ ] Verify Socket.IO connection working
- [ ] Verify database connection working
- [ ] Verify email service working
- [ ] Verify file uploads working (Cloudinary)
- [ ] Check browser console for errors
- [ ] Check server logs for errors
- [ ] Test user registration
- [ ] Test login
- [ ] Test all major features

#### Monitoring & Maintenance

**T11.12: Set Up Monitoring**

Configure monitoring tools:

- PM2 monitoring: `pm2 monitor`
- MongoDB Atlas monitoring (if using Atlas)
- Uptime monitoring: UptimeRobot or similar
- Error tracking: Sentry (optional)
- Log aggregation: Papertrail or similar (optional)

**T11.13: Configure Backups**

Set up automated backups:

```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
mongodump --uri="mongodb://username:password@host:27017/task-manager" --out=/backup/$DATE
find /backup -type d -mtime +7 -exec rm -rf {} \;

# Add to crontab (daily at 2 AM)
0 2 * * * /path/to/backup-script.sh
```

**T11.14: Configure Log Rotation**

Create logrotate configuration `/etc/logrotate.d/task-manager`:

```
/var/www/task-manager/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

**T11.15: Health Check Endpoint**

Create `backend/routes/healthRoutes.js`:

```javascript
import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/health", (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: "OK",
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  };
  res.status(200).json(health);
});

export default router;
```

Update `backend/routes/index.js`:

- Import healthRoutes
- Mount route: router.use('/', healthRoutes)

**T11.16: Create Deployment Documentation**

Create `DEPLOYMENT.md`:

- Server requirements
- Installation steps
- Environment variables
- Database setup
- SSL certificate setup
- Nginx configuration
- PM2 configuration
- Backup procedures
- Monitoring setup
- Troubleshooting guide
- Rollback procedures

**T11.17: Performance Monitoring**

Set up performance monitoring:

- Monitor response times
- Monitor database query performance
- Monitor memory usage
- Monitor CPU usage
- Set up alerts for high resource usage
- Monitor Socket.IO connection count
- Monitor error rates

**T11.18: Security Hardening**

Final security checks:

- [ ] All environment variables secured
- [ ] Strong passwords for all services
- [ ] Firewall configured correctly
- [ ] SSH key-based authentication only
- [ ] Fail2ban configured (optional)
- [ ] Regular security updates scheduled
- [ ] Database access restricted to application only
- [ ] No unnecessary ports open
- [ ] HTTPS enforced everywhere
- [ ] Security headers verified

**T11.19: Git Commit & Merge**

```bash
git add .
git commit -m "Phase 11: Complete production deployment"
git checkout main
git merge phase-11-production-deployment
git push origin main
git branch -d phase-11-production-deployment
```

**Phase 11 Completion Checklist**:

- [ ] Production environment configured
- [ ] Frontend built for production
- [ ] Backend serves frontend static files
- [ ] Production database configured
- [ ] SSL certificate obtained and configured
- [ ] Server configured (Node.js, PM2, Nginx)
- [ ] Application deployed to server
- [ ] Platform organization initialized
- [ ] Deployment verified (all features working)
- [ ] Monitoring configured
- [ ] Backups configured
- [ ] Log rotation configured
- [ ] Health check endpoint working
- [ ] Deployment documentation complete
- [ ] Performance monitoring set up
- [ ] Security hardening complete
- [ ] Git branch merged to main

## Final Deliverables

### Code Deliverables

1. **Backend Application**

   - Complete Express.js API with all endpoints
   - MongoDB models with soft delete and cascade operations
   - JWT authentication with HTTP-only cookies
   - Authorization matrix implementation
   - Socket.IO real-time communication
   - Email service with templates
   - Comprehensive error handling
   - Security middleware (Helmet, CORS, rate limiting)
   - Logging system (Winston)
   - Test suite (unit, integration, property-based)

2. **Frontend Application**

   - Complete React application with all pages
   - Redux Toolkit state management with RTK Query
   - React Router v7 with lazy loading
   - MUI v7 component library
   - Socket.IO client integration
   - Form management with react-hook-form
   - File upload with Cloudinary
   - Timezone management
   - Error boundaries and error handling
   - Toast notifications
   - Responsive design

3. **Database**

   - MongoDB schema with indexes
   - Soft delete plugin
   - TTL indexes for auto-cleanup
   - Seed data script
   - Backup scripts

4. **Configuration Files**
   - Environment variables (.env.example)
   - Jest configuration
   - ESLint configuration
   - Vite configuration
   - PM2 ecosystem configuration
   - Nginx configuration
   - Git configuration (.gitignore)

### Documentation Deliverables

1. **README.md**

   - Project overview
   - Features list
   - Technology stack
   - Installation instructions
   - Running instructions
   - Testing instructions
   - Deployment instructions

2. **API.md**

   - Complete API documentation
   - All endpoints with examples
   - Authentication and authorization
   - Error codes
   - WebSocket events

3. **ARCHITECTURE.md**

   - System architecture
   - Data flow diagrams
   - Multi-tenancy architecture
   - Authorization matrix
   - Soft delete and cascade operations
   - Real-time communication

4. **DEPLOYMENT.md**
   - Server requirements
   - Deployment steps
   - Configuration guide
   - Monitoring setup
   - Backup procedures
   - Troubleshooting

### Testing Deliverables

1. **Unit Tests**

   - All models tested
   - All utilities tested
   - All middleware tested
   - Coverage: 80%+ statements, 75%+ branches, 80%+ functions

2. **Integration Tests**

   - All API endpoints tested
   - Authentication flow tested
   - Authorization tested
   - Cascade operations tested

3. **Property-Based Tests**

   - Soft delete properties
   - Authorization properties
   - Cascade properties
   - Security properties
   - Timezone properties
   - Minimum 100 runs per property

4. **Test Reports**
   - Coverage reports (HTML, LCOV)
   - Test results summary
   - Performance test results

### Quality Assurance Deliverables

1. **Code Quality**

   - ESLint passing (no errors)
   - No security vulnerabilities (npm audit)
   - Code comments (JSDoc)
   - Consistent code style

2. **Security Audit**

   - Security checklist completed
   - Penetration testing results
   - Vulnerability assessment
   - Security recommendations

3. **Performance Audit**

   - Lighthouse scores (90+ all categories)
   - Load testing results
   - Database query optimization
   - Bundle size optimization

4. **Browser Compatibility**
   - Chrome (latest 2 versions)
   - Firefox (latest 2 versions)
   - Safari (latest 2 versions)
   - Edge (latest 2 versions)

## Success Criteria

### Functional Requirements

- [ ] User registration and authentication working
- [ ] JWT authentication with HTTP-only cookies
- [ ] Role-based authorization (4 roles, 4 scopes)
- [ ] Platform vs customer organization support
- [ ] Organization, department, and user management
- [ ] Task management (3 task types with discriminator pattern)
- [ ] Material and vendor management
- [ ] File attachments with Cloudinary
- [ ] Notifications (real-time and email)
- [ ] Real-time updates via Socket.IO
- [ ] Soft delete and restore for all resources
- [ ] Cascade delete with transactions
- [ ] Timezone management (UTC storage, local display)
- [ ] Pagination, filtering, and sorting
- [ ] Search functionality

### Non-Functional Requirements

- [ ] Security: JWT cookies, bcrypt, rate limiting, input sanitization, security headers
- [ ] Performance: Response time < 200ms, page load < 3s
- [ ] Scalability: Supports 1000+ concurrent users
- [ ] Reliability: 99.9% uptime
- [ ] Maintainability: Clean code, documentation, tests
- [ ] Usability: Intuitive UI, responsive design, accessibility
- [ ] Testability: 80%+ test coverage

### Technical Requirements

- [ ] Backend: Node.js, Express, MongoDB, Socket.IO
- [ ] Frontend: React 19, MUI v7, Redux Toolkit, Socket.IO client
- [ ] Testing: Jest, Supertest, fast-check, 80%+ coverage
- [ ] Security: HTTPS, JWT cookies, bcrypt ≥12 rounds, rate limiting
- [ ] Deployment: Production-ready, monitored, backed up

### Quality Requirements

- [ ] Code quality: ESLint passing, no vulnerabilities
- [ ] Documentation: Complete README, API docs, architecture docs
- [ ] Testing: All tests passing, coverage requirements met
- [ ] Performance: Lighthouse scores 90+
- [ ] Security: Security audit passed
- [ ] Browser compatibility: Latest 2 versions of major browsers

## Troubleshooting Guide

### Common Issues and Solutions

#### Backend Issues

**Issue: MongoDB connection failed**

Solution:

- Check MONGODB_URI in .env
- Verify MongoDB is running: `mongosh --eval "db.adminCommand('ping')"`
- Check network connectivity
- Verify credentials

**Issue: JWT token errors**

Solution:

- Check JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in .env
- Verify cookies are being set (check browser DevTools)
- Check cookie settings (httpOnly, secure, sameSite)
- Clear browser cookies and try again

**Issue: Rate limiting blocking requests**

Solution:

- Rate limiting only active in production
- Check X-RateLimit-\* headers
- Wait for rate limit window to reset (15 minutes)
- Adjust rate limits in rateLimiter.js if needed

**Issue: Email not sending**

Solution:

- Check EMAIL_USER and EMAIL_PASSWORD in .env
- Verify Gmail app password (not regular password)
- Check email service initialization logs
- Verify SMTP settings (smtp.gmail.com:587)

**Issue: Socket.IO not connecting**

Solution:

- Check Socket.IO server initialization
- Verify CORS configuration includes Socket.IO
- Check browser console for connection errors
- Verify WebSocket not blocked by firewall

**Issue: Cascade delete failing**

Solution:

- Check MongoDB transaction support (requires replica set)
- Verify all models have soft delete plugin
- Check error logs for specific failure
- Ensure no circular dependencies

#### Frontend Issues

**Issue: MUI v7 Grid errors**

Solution:

- Use `size` prop, NOT `item` prop
- Correct: `<Grid size={{ xs: 12, md: 6 }}>`
- Incorrect: `<Grid item xs={12} md={6}>`

**Issue: React Hook Form watch() errors**

Solution:

- NEVER use watch() method
- ALWAYS use Controller with controlled components
- Use `value` and `onChange` props

**Issue: Pagination not working**

Solution:

- Backend uses 1-based pagination
- Frontend MUI DataGrid uses 0-based
- Convert: Frontend → Backend (page + 1)
- MuiDataGrid component handles conversion automatically

**Issue: Constants not synchronized**

Solution:

- Ensure client/src/utils/constants.js matches backend/utils/constants.js exactly
- Never hardcode enum values
- Always import from constants.js

**Issue: Real-time updates not working**

Solution:

- Check Socket.IO connection in browser console
- Verify event handlers registered in socketEvents.js
- Check cache invalidation in RTK Query
- Verify user in correct rooms (user, department, organization)

**Issue: File upload failing**

Solution:

- Check Cloudinary credentials in .env
- Verify file type and size limits
- Check browser console for errors
- Verify CORS allows Cloudinary domain

**Issue: Timezone issues**

Solution:

- Verify server timezone set to UTC
- Check date conversion functions in dateUtils.js
- Ensure dates stored as UTC in database
- Verify DatePicker components use timezone conversion

#### Testing Issues

**Issue: Tests failing with MongoDB connection error**

Solution:

- Verify MongoDB is running locally or accessible
- Check MONGODB_URI in test environment (should point to test database like mongodb://localhost:27017/task-manager-test)
- Ensure test database exists and is accessible
- Increase test timeout in jest.config.js
- Check network connectivity to MongoDB server
- Verify MongoDB authentication credentials if required

**Issue: Tests timing out**

Solution:

- Increase testTimeout in jest.config.js (default: 30000ms)
- Check for async operations without await
- Verify database cleanup in afterEach
- Use --runInBand flag for sequential execution

**Issue: Property-based tests failing**

Solution:

- Review counterexample provided by fast-check
- Create unit test with failing input
- Fix code or test based on analysis
- Ensure minimum 100 runs per property

**Issue: Coverage not meeting requirements**

Solution:

- Identify uncovered lines in coverage report
- Add tests for uncovered code
- Focus on core business logic
- Don't aim for 100% coverage

#### Deployment Issues

**Issue: Production build failing**

Solution:

- Check for console.log statements (removed in production)
- Verify all dependencies installed
- Check for TypeScript/ESLint errors
- Verify environment variables set

**Issue: HTTPS not working**

Solution:

- Verify SSL certificate installed correctly
- Check Nginx configuration
- Verify certificate not expired
- Check firewall allows port 443

**Issue: PM2 process crashing**

Solution:

- Check PM2 logs: `pm2 logs task-manager-api`
- Verify environment variables set
- Check memory limits
- Verify database connection
- Check for unhandled promise rejections

## Best Practices Summary

### Backend Best Practices

1. **Always use soft delete** - Never hard delete resources
2. **Use transactions for cascade operations** - Ensure all-or-nothing
3. **Import constants** - Never hardcode enum values
4. **Validate all inputs** - Use express-validator
5. **Use CustomError** - Consistent error handling
6. **Wrap async handlers** - Use express-async-handler
7. **Check authorization** - Use authorize middleware
8. **Emit Socket.IO events** - For real-time updates
9. **Log important events** - Use Winston logger
10. **Write tests** - Unit, integration, and property-based

### Frontend Best Practices

1. **Use MUI v7 syntax** - `size` prop for Grid, NOT `item`
2. **Never use watch()** - Use Controller with controlled components
3. **Match backend field names** - Check validators for exact names
4. **Import constants** - Never hardcode enum values
5. **Convert pagination** - Frontend (0-based) ↔ Backend (1-based)
6. **Memoize components** - Use React.memo for list/card components
7. **Use useCallback** - For event handlers passed to children
8. **Use useMemo** - For computed values
9. **Handle timezones** - UTC storage, local display
10. **Invalidate cache** - On mutations and Socket.IO events

### Security Best Practices

1. **JWT in HTTP-only cookies** - Never localStorage
2. **Bcrypt ≥12 salt rounds** - Strong password hashing
3. **Rate limiting in production** - Prevent brute force
4. **Input sanitization** - Prevent NoSQL injection
5. **Security headers** - Use Helmet with CSP, HSTS
6. **CORS configuration** - No wildcards in production
7. **HTTPS in production** - Enforce secure connections
8. **Environment variables** - Never commit secrets
9. **Regular updates** - Keep dependencies current
10. **Security audits** - Regular npm audit and penetration testing

### Testing Best Practices

1. **Write tests first** - Test-driven development
2. **Test business logic** - Focus on core functionality
3. **Use real database** - Real MongoDB test database for integration tests (no MongoMemoryServer)
4. **Property-based testing** - Test universal properties
5. **Minimum 100 runs** - For property-based tests
6. **No mocks for PBT** - Test real functionality
7. **Test edge cases** - Boundary conditions and errors
8. **Maintain coverage** - 80%+ statements, 75%+ branches
9. **Test authorization** - All roles and scopes
10. **Test cascade operations** - Verify transactions work

## Performance Optimization Checklist

### Backend Optimization

- [ ] Database indexes on frequently queried fields
- [ ] Lean queries for read-only operations
- [ ] Pagination for all list endpoints
- [ ] Connection pooling (min: 2, max: 10)
- [ ] Response compression (gzip, threshold: 1KB)
- [ ] Query optimization (select only needed fields)
- [ ] Aggregation pipelines for complex queries
- [ ] Caching strategy (Redis optional)

### Frontend Optimization

- [ ] Code splitting (lazy loading routes)
- [ ] Vendor chunks (React, MUI, Redux separated)
- [ ] React.memo for list/card components
- [ ] useCallback for event handlers
- [ ] useMemo for computed values
- [ ] Image optimization (Cloudinary)
- [ ] Bundle size optimization (Terser minification)
- [ ] Tree shaking (automatic with Vite)
- [ ] Asset optimization (fonts, icons)
- [ ] HTTP/2 support

### Database Optimization

- [ ] Compound indexes on common query patterns
- [ ] Text indexes for search functionality
- [ ] TTL indexes for auto-cleanup
- [ ] Index usage monitoring
- [ ] Query performance monitoring
- [ ] Connection pool tuning
- [ ] Replica set for high availability (optional)
- [ ] Sharding for large datasets (optional)

### Network Optimization

- [ ] Gzip compression enabled
- [ ] Cache-Control headers for static assets
- [ ] CDN for static assets (optional)
- [ ] HTTP/2 enabled
- [ ] Minimize API calls (batch operations)
- [ ] WebSocket for real-time (Socket.IO)
- [ ] Lazy loading for images
- [ ] Prefetching for critical resources

## Maintenance and Support

### Regular Maintenance Tasks

**Daily**:

- Monitor server health and uptime
- Check error logs for issues
- Monitor database performance
- Check backup completion

**Weekly**:

- Review application metrics
- Check disk space usage
- Review security logs
- Update documentation if needed

**Monthly**:

- Update dependencies (security patches)
- Review and optimize database indexes
- Analyze performance metrics
- Review user feedback
- Test backup restoration

**Quarterly**:

- Security audit
- Performance audit
- Code review
- Update documentation
- Dependency major version updates (if safe)

### Monitoring Metrics

**Application Metrics**:

- Response time (target: < 200ms)
- Error rate (target: < 1%)
- Request rate
- Active users
- Database query performance

**Server Metrics**:

- CPU usage (target: < 70%)
- Memory usage (target: < 80%)
- Disk usage (target: < 80%)
- Network bandwidth
- Uptime (target: 99.9%)

**Database Metrics**:

- Connection count
- Query execution time
- Index usage
- Database size
- Replication lag (if using replica set)

**User Metrics**:

- Active users (daily, weekly, monthly)
- User registration rate
- Task creation rate
- Feature usage statistics
- User satisfaction (surveys)

### Support Procedures

**Bug Reports**:

1. User reports bug via support channel
2. Reproduce bug in development environment
3. Create GitHub issue with reproduction steps
4. Prioritize based on severity (Critical/High/Medium/Low)
5. Fix bug and write regression test
6. Deploy fix to production
7. Notify user of resolution

**Feature Requests**:

1. User submits feature request
2. Evaluate feasibility and priority
3. Create GitHub issue with requirements
4. Design feature (if approved)
5. Implement feature with tests
6. Deploy to production
7. Update documentation
8. Notify user of new feature

**Security Incidents**:

1. Identify security issue
2. Assess severity and impact
3. Implement fix immediately (if critical)
4. Deploy fix to production
5. Notify affected users (if data breach)
6. Document incident and resolution
7. Review security procedures

### Backup and Recovery

**Backup Strategy**:

- Database: Daily automated backups, 7-day retention
- Application code: Git repository (GitHub/GitLab)
- Environment variables: Secure vault (encrypted)
- Uploaded files: Cloudinary (automatic backup)
- Logs: 14-day retention with rotation

**Recovery Procedures**:

**Database Recovery**:

```bash
# Restore from backup
mongorestore --uri="mongodb://username:password@host:27017/task-manager" /backup/20240101
```

**Application Recovery**:

```bash
# Rollback to previous version
git checkout <previous-commit>
cd backend && npm ci --production
cd ../client && npm ci && npm run build:prod
pm2 restart task-manager-api
```

**Disaster Recovery**:

1. Provision new server
2. Install dependencies (Node.js, MongoDB, Nginx)
3. Clone repository
4. Restore database from backup
5. Configure environment variables
6. Deploy application
7. Update DNS records
8. Verify all services working

## Scaling Considerations

### Horizontal Scaling

**Load Balancing**:

- Use Nginx or HAProxy as load balancer
- Multiple Node.js instances with PM2 cluster mode
- Session affinity not required (stateless JWT auth)
- Shared storage for uploaded files (Cloudinary)

**Database Scaling**:

- MongoDB replica set for high availability
- Read replicas for read-heavy workloads
- Sharding for very large datasets (>100GB)
- Connection pooling across instances

**Caching Layer** (Optional):

- Redis for session caching
- Redis for frequently accessed data
- Cache invalidation strategy
- TTL-based expiration

### Vertical Scaling

**Server Resources**:

- CPU: 2+ cores recommended
- Memory: 4GB+ RAM for production
- Storage: SSD for database
- Network: High bandwidth for file uploads

**Database Resources**:

- Dedicated database server
- SSD storage for better I/O
- Adequate RAM for working set
- Regular index optimization

### Microservices Architecture (Future)

**Potential Service Separation**:

- Authentication service
- User management service
- Task management service
- Notification service
- File upload service
- Email service

**Benefits**:

- Independent scaling
- Technology flexibility
- Fault isolation
- Easier maintenance

**Challenges**:

- Increased complexity
- Distributed transactions
- Service communication overhead
- Monitoring complexity

## Future Enhancements

### Phase 12: Advanced Features (Optional)

**Dashboard Analytics**:

- Task completion statistics
- User activity metrics
- Department performance charts
- Material usage tracking
- Vendor performance metrics
- Custom date range filters
- Export reports (PDF, Excel)

**Advanced Search**:

- Full-text search across all resources
- Elasticsearch integration
- Advanced filters and facets
- Search history
- Saved searches

**Collaboration Features**:

- Task comments with rich text editor
- @mentions with autocomplete
- File sharing and collaboration
- Activity feed
- Team chat (optional)

**Mobile Application**:

- React Native mobile app
- Push notifications
- Offline support
- Camera integration for attachments
- Biometric authentication

**Integrations**:

- Calendar integration (Google Calendar, Outlook)
- Email integration (Gmail, Outlook)
- Slack notifications
- Zapier integration
- REST API for third-party integrations

**Advanced Permissions**:

- Custom roles
- Fine-grained permissions
- Resource-level permissions
- Time-based access
- IP-based restrictions

**Audit Trail**:

- Complete audit log for all actions
- User activity tracking
- Change history for all resources
- Compliance reporting
- Data retention policies

**Multi-Language Support**:

- i18n implementation
- Language selection
- RTL support
- Translation management
- Date/time localization

## Appendix

### A. Technology Stack Details

**Backend Technologies**:

- Node.js v20.x LTS - JavaScript runtime
- Express.js ^4.21.2 - Web framework
- MongoDB - NoSQL database
- Mongoose ^8.19.1 - MongoDB ODM
- Socket.IO ^4.8.1 - Real-time communication
- JWT (jsonwebtoken ^9.0.2) - Authentication
- bcrypt ^6.0.0 - Password hashing
- Helmet ^8.1.0 - Security headers
- CORS ^2.8.5 - Cross-origin resource sharing
- express-validator ^7.2.1 - Input validation
- nodemailer ^7.0.9 - Email service
- dayjs ^1.11.18 - Date manipulation
- Winston ^3.18.3 - Logging

**Frontend Technologies**:

- React ^19.1.1 - UI library
- React Router ^7.9.4 - Routing
- MUI v7.3.4 - Component library
- Redux Toolkit ^2.9.0 - State management
- RTK Query - Data fetching and caching
- react-hook-form ^7.65.0 - Form management
- Socket.IO client ^4.8.1 - Real-time client
- dayjs ^1.11.18 - Date manipulation
- react-toastify ^11.0.5 - Toast notifications
- Vite ^7.1.7 - Build tool

**Testing Technologies**:

- Jest ^30.2.0 - Testing framework
- Supertest ^7.1.4 - HTTP assertions
- fast-check ^4.3.0 - Property-based testing
- Real MongoDB test database - Isolated test database (no mongodb-memory-server)

**Development Tools**:

- ESLint - Code linting
- Nodemon - Auto-restart server
- PM2 - Process manager
- Git - Version control

### B. Environment Variables Reference

**Backend Environment Variables**:

```env
# Required
MONGODB_URI=mongodb://localhost:27017/task-manager
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Optional
PORT=4000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
INITIALIZE_SEED_DATA=true

# Email (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=Task Manager <noreply@taskmanager.com>

# Production Only
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Frontend Environment Variables**:

```env
VITE_API_URL=http://localhost:4000/api
VITE_PLATFORM_ORG=000000000000000000000000
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
```

### C. API Endpoints Reference

**Authentication Endpoints**:

- POST /api/auth/register - Register new organization
- POST /api/auth/login - User login
- DELETE /api/auth/logout - User logout
- GET /api/auth/refresh-token - Refresh access token
- POST /api/auth/forgot-password - Request password reset
- POST /api/auth/reset-password - Reset password

**User Endpoints**:

- GET /api/users - List users
- GET /api/users/:id - Get user details
- POST /api/users - Create user
- PUT /api/users/:id - Update user
- PUT /api/users/:id/profile - Update own profile
- DELETE /api/users/:id - Soft delete user
- PATCH /api/users/:id/restore - Restore user
- GET /api/users/account - Get current user account
- GET /api/users/profile - Get current user profile

**Organization Endpoints**:

- GET /api/organizations - List organizations (Platform SuperAdmin)
- GET /api/organizations/:id - Get organization details
- POST /api/organizations - Create organization (Platform SuperAdmin)
- PUT /api/organizations/:id - Update organization
- DELETE /api/organizations/:id - Soft delete organization
- PATCH /api/organizations/:id/restore - Restore organization

**Department Endpoints**:

- GET /api/departments - List departments
- GET /api/departments/:id - Get department details
- POST /api/departments - Create department
- PUT /api/departments/:id - Update department
- DELETE /api/departments/:id - Soft delete department
- PATCH /api/departments/:id/restore - Restore department

**Task Endpoints**:

- GET /api/tasks - List tasks
- GET /api/tasks/:id - Get task details
- POST /api/tasks - Create task (any type)
- PUT /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Soft delete task
- PATCH /api/tasks/:id/restore - Restore task
- POST /api/tasks/:id/activities - Create activity
- POST /api/tasks/:id/comments - Create comment

**Material Endpoints**:

- GET /api/materials - List materials
- GET /api/materials/:id - Get material details
- POST /api/materials - Create material
- PUT /api/materials/:id - Update material
- DELETE /api/materials/:id - Soft delete material
- PATCH /api/materials/:id/restore - Restore material

**Vendor Endpoints**:

- GET /api/vendors - List vendors
- GET /api/vendors/:id - Get vendor details
- POST /api/vendors - Create vendor
- PUT /api/vendors/:id - Update vendor
- DELETE /api/vendors/:id - Soft delete vendor
- PATCH /api/vendors/:id/restore - Restore vendor

**Notification Endpoints**:

- GET /api/notifications - List notifications
- GET /api/notifications/:id - Get notification details
- PATCH /api/notifications/:id/read - Mark as read
- PATCH /api/notifications/read-all - Mark all as read
- DELETE /api/notifications/:id - Delete notification

**Attachment Endpoints**:

- GET /api/attachments - List attachments
- GET /api/attachments/:id - Get attachment details
- POST /api/attachments - Upload attachment
- DELETE /api/attachments/:id - Delete attachment

**Health Check**:

- GET /api/health - Server health status

### D. Database Schema Reference

**Collections**:

- organizations - Tenant organizations
- departments - Organizational units
- users - System users
- basetasks - All task types (discriminator)
- taskactivities - Task activities (ProjectTask/AssignedTask only)
- taskcomments - Task comments (threaded)
- materials - Inventory materials
- vendors - External vendors/clients
- attachments - File attachments
- notifications - User notifications

**Key Indexes**:

- organizations: name, email, phone (unique), isPlatformOrg
- departments: organizationId+name (unique)
- users: organizationId+email (unique), departmentId+role (HOD unique)
- basetasks: organizationId+departmentId+createdAt, tags (text)
- materials: organizationId+departmentId+name, category
- vendors: organizationId+departmentId+name
- All models: isDeleted, deletedAt (TTL)

**Relationships**:

- User → Department → Organization (hierarchical)
- BaseTask → ProjectTask/RoutineTask/AssignedTask (discriminator)
- ProjectTask → Vendor (required)
- ProjectTask → Materials (via TaskActivity)
- RoutineTask → Materials (direct)
- TaskActivity → ProjectTask/AssignedTask (parent)
- TaskComment → Task/Activity/Comment (polymorphic)
- Attachment → Task/Activity/Comment (polymorphic)
- Notification → User (recipient)

### E. Socket.IO Events Reference

**User Events**:

- user:created - New user created
- user:updated - User updated
- user:deleted - User soft deleted
- user:restored - User restored
- user:online - User came online
- user:offline - User went offline
- user:status - User status changed

**Organization Events**:

- organization:created - New organization created
- organization:updated - Organization updated
- organization:deleted - Organization soft deleted
- organization:restored - Organization restored

**Department Events**:

- department:created - New department created
- department:updated - Department updated
- department:deleted - Department soft deleted
- department:restored - Department restored

**Task Events**:

- task:created - New task created
- task:updated - Task updated
- task:deleted - Task soft deleted
- task:restored - Task restored

**Activity Events**:

- activity:created - New activity created
- activity:updated - Activity updated

**Comment Events**:

- comment:created - New comment created
- comment:updated - Comment updated
- comment:deleted - Comment soft deleted

**Notification Events**:

- notification:created - New notification created
- notification:read - Notification marked as read
- notifications:read - All notifications marked as read

**Material Events**:

- material:created - New material created
- material:updated - Material updated
- material:deleted - Material soft deleted
- material:restored - Material restored

**Vendor Events**:

- vendor:created - New vendor created
- vendor:updated - Vendor updated
- vendor:deleted - Vendor soft deleted
- vendor:restored - Vendor restored

**Attachment Events**:

- attachment:created - New attachment uploaded
- attachment:deleted - Attachment deleted

### F. Authorization Matrix Reference

**Scopes**:

- own - User's own resources only
- ownDept - Resources in user's department
- crossDept - Resources across departments in organization
- crossOrg - Resources across organizations (Platform SuperAdmin only)

**Role Permissions Summary**:

**SuperAdmin (Platform)**:

- Organization: create (crossOrg), read (own + crossOrg), update (own), delete (own)
- All other resources: create/read/update/delete (ownDept + crossDept)

**SuperAdmin (Customer)**:

- Organization: read (own), update (own), delete (own)
- Department: create (own), read (own + crossDept), update (own + crossDept), delete (own + crossDept)
- All other resources: create/read/update/delete (ownDept + crossDept)

**Admin**:

- Organization: read (own)
- Department: read (own + crossDept), update (own)
- User: create/read/update/delete (ownDept + crossDept)
- Task: create/read/update/delete (ownDept + crossDept)
- Material: create/read/update/delete (ownDept + crossDept)
- Vendor: create/read/update/delete (ownDept + crossDept)

**Manager**:

- Organization: read (own)
- Department: read (own)
- User: create (ownDept), read (ownDept), update (own)
- Task: create (ownDept), read (ownDept), update (own), delete (own)
- Material: read (ownDept)
- Vendor: read (ownDept)

**User**:

- Organization: read (own)
- Department: read (own)
- User: read (ownDept), update (own)
- Task: create (ownDept), read (ownDept), update (own), delete (own)
- Material: read (ownDept)
- Vendor: read (ownDept)

### G. Error Codes Reference

**Authentication Errors (401)**:

- UNAUTHORIZED - No token provided or invalid token
- TOKEN_EXPIRED - Access token expired
- INVALID_CREDENTIALS - Wrong email or password

**Authorization Errors (403)**:

- FORBIDDEN - Insufficient permissions
- INSUFFICIENT_SCOPE - Operation not allowed for user's scope

**Validation Errors (400)**:

- VALIDATION_ERROR - Input validation failed
- BAD_REQUEST - Malformed request

**Resource Errors (404)**:

- NOT_FOUND - Resource not found
- USER_NOT_FOUND - User not found
- TASK_NOT_FOUND - Task not found

**Conflict Errors (409)**:

- CONFLICT - Resource already exists
- DUPLICATE_EMAIL - Email already in use
- DUPLICATE_NAME - Name already in use

**Gone Errors (410)**:

- GONE - Resource has been soft deleted

**Server Errors (500)**:

- INTERNAL_SERVER_ERROR - Unexpected server error
- DATABASE_ERROR - Database operation failed

### H. Testing Commands Reference

**Backend Testing**:

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only property-based tests
npm run test:property

# Run only unit tests
npm run test:unit

# Run specific test file
npm test -- __tests__/unit/User.test.js

# Run tests matching pattern
npm test -- --testNamePattern="soft delete"
```

**Frontend Testing**:

```bash
cd client

# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

**Code Quality**:

```bash
# Backend
cd backend
npm audit                    # Check for vulnerabilities
npm audit fix                # Fix vulnerabilities
npm outdated                 # Check for outdated packages

# Frontend
cd client
npm audit
npm audit fix
npm outdated
```

### I. Deployment Commands Reference

**Development**:

```bash
# Start backend (development)
cd backend
npm run dev

# Start frontend (development)
cd client
npm run dev
```

**Production Build**:

```bash
# Build frontend
cd client
npm ci
npm run build:prod

# Install backend dependencies
cd ../backend
npm ci --production
```

**Production Deployment**:

```bash
# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# View logs
pm2 logs task-manager-api

# Restart application
pm2 restart task-manager-api

# Stop application
pm2 stop task-manager-api

# Delete application
pm2 delete task-manager-api
```

**Database Operations**:

```bash
# Backup database
mongodump --uri="mongodb://user:pass@host:27017/task-manager" --out=/backup/$(date +%Y%m%d)

# Restore database
mongorestore --uri="mongodb://user:pass@host:27017/task-manager" /backup/20240101

# Connect to database
mongosh "mongodb://user:pass@host:27017/task-manager"
```

**Nginx Operations**:

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

**SSL Certificate**:

```bash
# Obtain certificate (Let's Encrypt)
sudo certbot --nginx -d yourdomain.com

# Renew certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

### J. Git Workflow Reference

**Branch Naming Convention**:

- phase-X-[phase-name] - Development branches for each phase
- main - Production-ready code
- hotfix-[issue] - Emergency fixes
- feature-[feature-name] - New features (post-deployment)

**Commit Message Format**:

```
Phase X: [Component] - [Brief description]

Examples:
- Phase 1: Backend - Configure Express middleware stack
- Phase 2: Frontend - Create login form
- Phase 5: Testing - Add property-based tests for tasks
```

**Standard Workflow**:

```bash
# 1. Create phase branch
git checkout main
git pull origin main
git checkout -b phase-X-[phase-name]

# 2. Make changes and commit
git add .
git commit -m "Phase X: [Component] - [Description]"

# 3. Push to remote (optional)
git push origin phase-X-[phase-name]

# 4. Run tests before merging
cd backend && npm test
cd ../client && npm run build

# 5. Merge to main
git checkout main
git merge phase-X-[phase-name]
git push origin main

# 6. Delete phase branch
git branch -d phase-X-[phase-name]
```

**Hotfix Workflow**:

```bash
# 1. Create hotfix branch from main
git checkout main
git checkout -b hotfix-[issue]

# 2. Fix issue and commit
git add .
git commit -m "Hotfix: [Description]"

# 3. Test fix
npm test

# 4. Merge to main
git checkout main
git merge hotfix-[issue]
git push origin main

# 5. Delete hotfix branch
git branch -d hotfix-[issue]

# 6. Deploy to production
pm2 restart task-manager-api
```

### K. Useful Resources

**Documentation**:

- Node.js: https://nodejs.org/docs
- Express.js: https://expressjs.com
- MongoDB: https://docs.mongodb.com
- Mongoose: https://mongoosejs.com/docs
- React: https://react.dev
- MUI: https://mui.com
- Redux Toolkit: https://redux-toolkit.js.org
- Socket.IO: https://socket.io/docs
- Jest: https://jestjs.io/docs
- fast-check: https://fast-check.dev

**Tools**:

- MongoDB Compass: GUI for MongoDB
- Postman: API testing
- React DevTools: Browser extension
- Redux DevTools: Browser extension
- PM2: Process manager
- Nginx: Web server
- Let's Encrypt: Free SSL certificates

**Learning Resources**:

- MDN Web Docs: https://developer.mozilla.org
- JavaScript.info: https://javascript.info
- React Tutorial: https://react.dev/learn
- Node.js Best Practices: https://github.com/goldbergyoni/nodebestpractices

## Conclusion

This comprehensive prompt provides complete guidance for developing a production-ready Multi-Tenant SaaS Task Manager Application. The development is structured in 11 phases, each building upon the previous phase to create a fully functional, secure, and scalable application.

### Key Achievements

By following this prompt, you will have built:

1. **Complete Backend API** with authentication, authorization, soft delete, cascade operations, and real-time features
2. **Modern Frontend** with React 19, MUI v7, Redux Toolkit, and Socket.IO integration
3. **Comprehensive Testing** with 80%+ coverage including unit, integration, and property-based tests
4. **Production Deployment** with monitoring, backups, and security hardening
5. **Complete Documentation** including README, API docs, and architecture documentation

### Development Timeline

**Estimated Timeline** (for experienced developer):

- Phase 1: Project Foundation - 2-3 days
- Phase 2: Authentication & User Management - 3-4 days
- Phase 3: Organization & Department Management - 2-3 days
- Phase 4: Real-Time Communication - 1-2 days
- Phase 5: Task Management - 4-5 days
- Phase 6: Material & Vendor Management - 2-3 days
- Phase 7: Notifications & Email - 2-3 days
- Phase 8: File Attachments - 2-3 days
- Phase 9: Timezone Management - 1-2 days
- Phase 10: Testing & QA - 3-4 days
- Phase 11: Production Deployment - 2-3 days

**Total: 24-35 days** (approximately 5-7 weeks)

### Critical Success Factors

1. **Follow the phases sequentially** - Each phase builds on the previous
2. **Complete all tasks** - No skipping or shortcuts
3. **Test before merging** - All tests must pass
4. **Match backend validators** - Frontend field names must be exact
5. **Use constants** - Never hardcode enum values
6. **Follow MUI v7 syntax** - Use size prop, not item prop
7. **Never use watch()** - Use Controller with controlled components
8. **Soft delete everything** - Never hard delete
9. **Use transactions** - For all cascade operations
10. **Document as you go** - Keep documentation current

### Final Notes

This application demonstrates best practices in:

- Multi-tenant SaaS architecture
- Role-based access control
- Real-time communication
- Soft delete and cascade operations
- Timezone management
- Security hardening
- Comprehensive testing
- Production deployment

The codebase is production-ready, scalable, maintainable, and follows industry best practices. It can serve as a foundation for similar enterprise applications or be extended with additional features as needed.

**Good luck with your development!**

---

**Document Version**: 1.0
**Last Updated**: December 7, 2024
**Total Pages**: 200+
**Total Phases**: 11
**Total Tasks**: 500+
