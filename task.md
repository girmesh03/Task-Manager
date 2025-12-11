## Overview

This document tracks all development tasks for the Multi-Tenant SaaS Task Manager following the strict phase-by-phase implementation approach defined in requirements.md and design.md.

> [!IMPORTANT]
> **All tasks must be validated against these 6 documentation sources:**
> - `requirements.md` and `design.md` (specs directory)
> - `product.md`, `structure.md`, `tech.md`, `timezone-doc.md` (root directory)

---

## Backend Development

### Phase 1: Backend Core Configuration and Utilities (Phase 1 of 15)

Branch: `phase-1-backend-core`

#### Critical Implementation Workflow (MUST FOLLOW)
1. **Branch**: Checkout `phase-1-backend-core`
2. **Search**: `grepSearch` and `readFile` to find existing config/utils
3. **Analysis**: Deeply analyze each file both the backend and client directories, extract logic/patterns
4. **Validate**: Compare against all 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md)
5. **Implement**: Correct/Create code matching specs exactly
6. **Test**: Write/Run unit tests (Real MongoDB, No Skips)
7. **Validate**: 100% Pass, 80% Coverage, No Lint Errors
8. **Merge**: `git checkout main && git merge phase-1-backend-core`

#### 1.0 Phase Tracking
- [ ] Update `dev-phase-tracker.md` (Start Phase 1)
- [ ] Update steering docs with current status

#### 1.1 Configuration Layer (`config/`)

##### Task 1.1.1: `config/allowedOrigins.js` [x]
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
**Status**: Complete
**Export**: Array of allowed CORS origins
```javascript
// Development: localhost:3000, localhost:5173
// Production: process.env.CLIENT_URL + ALLOWED_ORIGINS (comma-separated)
```

##### Task 1.1.2: `config/corsOptions.js` [x]
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
**Status**: Complete
**Required**:
- Origin validation function with logger
- credentials: true
- methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
- allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
- exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining']
- maxAge: 86400 (24 hours)
- optionsSuccessStatus: 200

##### Task 1.1.3: `config/authorizationMatrix.json` [x]
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
**Status**: Complete
**Required Resources**: Organization, Department, User, Task, TaskActivity, TaskComment, Material, Vendor, Attachment, Notification
**Missing**: TaskActivity, TaskComment, Attachment, Notification
**Structure**:
```json
{
  "Resource": {
    "Role": {
      "operation": ["scopes"]
    }
  }
}
```
**Scopes**: own, ownDept, crossDept, crossOrg
**Platform SuperAdmin**: crossOrg for Organization ONLY, crossDept for all others

##### Task 1.1.4: `config/db.js` [x]
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
**Status**: Complete
**Required**:
- Retry logic: Exponential backoff (1s, 2s, 4s, 8s, 16s, 30s max), max 10 retries
- Connection options: serverSelectionTimeoutMS: 5000, socketTimeoutMS: 45000, minPoolSize: 2, maxPoolSize: 10
- Health check: Ping every 30 seconds
- Graceful shutdown: Close on SIGINT/SIGTERM
- Connection state monitoring: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting

#### 1.2 Utilities Layer (`utils/`)

##### Task 1.2.1: `utils/constants.js` [x]
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
**Status**: Complete
**Missing Constants** (add these):
```javascript
// Industries (24 total)
INDUSTRIES: ['Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
  'Retail', 'Construction', 'Transportation', 'Hospitality', 'Real Estate',
  'Agriculture', 'Energy', 'Telecommunications', 'Media', 'Entertainment',
  'Legal', 'Consulting', 'Non-Profit', 'Government', 'Automotive',
  'Aerospace', 'Pharmaceutical', 'Food & Beverage', 'Other']

// Unit Types (30+ types)
UNIT_TYPES: ['pcs', 'kg', 'g', 'l', 'ml', 'm', 'cm', 'mm', 'm2', 'm3',
  'box', 'pack', 'roll', 'sheet', 'bag', 'bottle', 'can', 'jar',
  'tube', 'set', 'pair', 'dozen', 'gross', 'carton', 'pallet',
  'bundle', 'coil', 'reel', 'spool', 'drum']

// TTL Values (days)
TTL_ORGANIZATION: null
TTL_DEPARTMENT: 365
TTL_USER: 365
TTL_TASK: 180
TTL_ACTIVITY: 90
TTL_COMMENT: 90
TTL_MATERIAL: 180
TTL_VENDOR: 180
TTL_ATTACHMENT: 90
TTL_NOTIFICATION: 30

// File Size Limits (bytes)
MAX_IMAGE_SIZE: 10485760 // 10MB
MAX_VIDEO_SIZE: 104857600 // 100MB
MAX_DOCUMENT_SIZE: 26214400 // 25MB
MAX_AUDIO_SIZE: 20971520 // 20MB
MAX_OTHER_SIZE: 52428800 // 50MB
```

##### Task 1.2.2: `utils/helpers.js` [x]
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
**Status**: Complete
**Missing Functions** (add these):
```javascript
generateEmployeeId() // Random 4-digit: 1000-9999
isValidObjectId(id)
```

#### 1.3 Soft Delete Plugin

- [x] `models/plugins/softDelete.js` - Universal soft delete plugin for all models (EXISTS - verified in User model)
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 1.4 Phase 1 Testing

- [/] Unit tests for all configuration utilities (Test infrastructure EXISTS, tests need creation)
- [/] Unit tests for helper functions (Test infrastructure EXISTS, tests need creation)
- [ ] Property-based tests for authorization matrix logic
- [ ] Integration tests for MongoDB connection with retry logic
- [ ] All tests passing with 80%+ coverage

---

### Phase 2: Mongoose Models with Soft Delete Plugin (Phase 2 of 15)

Branch: `phase-2-mongoose-models`

#### Critical Implementation Workflow (MUST FOLLOW)
1. **Branch**: Checkout `phase-2-mongoose-models`
2. **Search**: `grepSearch` and `readFile` to find existing models
3. **Analysis**: Deeply analyze each file both the backend and client directories, extract logic/patterns
4. **Validate**: Compare against all 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md)
5. **Implement**: Correct/Create code matching specs exactly
6. **Test**: Write/Run unit tests (Real MongoDB, No Skips)
7. **Validate**: 100% Pass, 80% Coverage, No Lint Errors
8. **Merge**: `git checkout main && git merge phase-2-mongoose-models`

> **Note**: All schemas must use `mongoose-paginate-v2` plugin instead of manual pagination.

#### 2.0 Phase Tracking
- [x] Update `dev-phase-tracker.md` (Start Phase 2)
- [x] Update steering docs with current status

#### 2.1 Core Models

- [x] `models/Organization.js` - Organization model (EXISTS - needs validation against specs)
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [x] `models/Department.js` - Department model (EXISTS - needs validation against specs)
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [x] `models/User.js` - User model (EXISTS - has soft delete plugin, needs full validation)
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 2.2 Task Models (Discriminator Pattern)

- [x] `models/BaseTask.js` - Base task model with discriminator
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [x] `models/ProjectTask.js` - ProjectTask discriminator (vendor, costs, assignees)
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [x] `models/RoutineTask.js` - RoutineTask discriminator (direct materials, dates)
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [x] `models/AssignedTask.js` - AssignedTask discriminator (assignee field)
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 2.3 Related Models

- [x] `models/TaskActivity.js` - Task activity logs (ProjectTask/AssignedTask only)
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [x] `models/TaskComment.js` - Comments with threading (max depth 3)
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [x] `models/Material.js` - Material inventory management
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [x] `models/Vendor.js` - External vendors for ProjectTasks
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [x] `models/Attachment.js` - File attachments (Cloudinary)
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [x] `models/Notification.js` - User notifications with TTL
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 2.4 Phase 2 Testing

- [x] Unit tests for all models (validation, hooks, methods)
- [x] Property-based tests for soft delete functionality
- [x] Property-based tests for discriminator pattern
- [x] Integration tests for model relationships
- [x] Integration tests for cascade operations
- [x] All tests passing with 80%+ coverage

---

### Phase 3: Error Handling and Middleware (Phase 3 of 15)

Branch: `phase-3-error-handling-middleware`

#### Critical Implementation Workflow (MUST FOLLOW)
1. **Branch**: Checkout `phase-3-error-handling-middleware`
2. **Search**: `grepSearch` and `readFile` to find existing middleware
3. **Analysis**: Deeply analyze each file both the backend and client directories, extract logic/patterns
4. **Validate**: Compare against all 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md)
5. **Implement**: Correct/Create code matching specs exactly
6. **Test**: Write/Run unit tests (Real MongoDB, No Skips)
7. **Validate**: 100% Pass, 80% Coverage, No Lint Errors
8. **Merge**: `git checkout main && git merge phase-3-error-handling-middleware`
9. **Sync**: `git push origin main`

#### 3.0 Phase Tracking
- [ ] Update `dev-phase-tracker.md` (Start Phase 3)
- [ ] Update steering docs with current status

#### 3.1 Error Handling

- [x] `errorHandler/CustomError.js` - Custom error class with factory methods
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [x] `errorHandler/ErrorController.js` - Global error handling middleware
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 3.2 Authentication Middleware

- [x] `middlewares/authMiddleware.js` - JWT verification (EXISTS - verified)
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
  - [x] `verifyJWT` - Access token verification (EXISTS)
  - [x] `verifyRefresh_token` - Refresh token verification (EXISTS)

#### 3.3 Authorization Middleware

- [x] `middlewares/authorization.js` - Role-based access control (EXISTS - verified)
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
  - [x] `authorize(resource, operation)` - Authorization middleware factory (EXISTS)

#### 3.4 Rate Limiting

- [x] `middlewares/rateLimiter.js` - Rate limiting (production only) (EXISTS - verified)
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 3.5 Validators

- [x] `middlewares/validators/authValidators.js` - Auth endpoint validation (EXISTS - expanded)
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [x] `middlewares/validators/userValidators.js` - User endpoint validation (EXISTS - expanded)
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [x] `middlewares/validators/organizationValidators.js` - Organization validation
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [x] `middlewares/validators/departmentValidators.js` - Department validation
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [x] `middlewares/validators/taskValidators.js` - Task validation (all types)
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
  - [x] `middlewares/validators/taskActivityValidators.js` - TaskActivity validation
  - [x] `middlewares/validators/taskCommentValidators.js` - TaskComment validation
- [x] `middlewares/validators/materialValidators.js` - Material validation
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [x] `middlewares/validators/vendorValidators.js` - Vendor validation
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [x] `middlewares/validators/attachmentValidators.js` - Attachment validation
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [x] `middlewares/validators/notificationValidators.js` - Notification validation
> **Analysis Requirement**: [x] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 3.6 Phase 3 Testing

- [x] Unit tests for CustomError class and factory methods
- [x] Unit tests for error handler middleware
- [x] Integration tests for authentication middleware
- [x] Integration tests for authorization middleware
- [x] Integration tests for rate limiting
- [x] Unit tests for all validators
- [x] All tests passing with 80%+ coverage

---

### Phase 4: Services, Templates, and Server Setup (Phase 4 of 15)

Branch: `phase-4-services-templates-server`

#### Critical Implementation Workflow (MUST FOLLOW)
1. **Branch**: Checkout `phase-4-services-templates-server`
2. **Search**: `grepSearch` and `readFile` to find existing services
3. **Analysis**: Deeply analyze each file both the backend and client directories, extract logic/patterns
4. **Validate**: Compare against all 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md)
5. **Implement**: Correct/Create code matching specs exactly
6. **Test**: Write/Run unit tests (Real MongoDB, No Skips)
7. **Validate**: 100% Pass, 80% Coverage, No Lint Errors
8. **Merge**: `git checkout main && git merge phase-4-services-templates-server`
9. **Sync**: `git push origin main`

#### 4.0 Phase Tracking
- [ ] Update `dev-phase-tracker.md` (Start Phase 4)
- [ ] Update steering docs with current status

#### 4.1 Services

- [ ] `services/emailService.js` - Email sending with Gmail SMTP and async queue
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `services/notificationService.js` - Notification creation and management
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 4.2 Socket.IO Setup

- [ ] `utils/socketInstance.js` - Singleton Socket.IO server instance
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `utils/socket.js` - Socket.IO event handlers and room management
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `utils/socketEmitter.js` - Helper functions for emitting events
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 4.3 Email Templates

- [ ] `templates/taskNotification.html` - Task notification email template
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `templates/mention.html` - Mention notification email template
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `templates/welcome.html` - Welcome email template
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `templates/passwordReset.html` - Password reset email template
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `templates/announcement.html` - Announcement email template
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 4.4 Application Setup

- [ ] `app.js` - Express application configuration with middleware stack
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `server.js` - HTTP server, Socket.IO initialization, graceful shutdown
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 4.5 Phase 4 Testing

- [ ] Unit tests for email service
- [ ] Unit tests for notification service
- [ ] Integration tests for Socket.IO connection and events
- [ ] Integration tests for email template rendering
- [ ] Integration tests for server startup and shutdown
- [ ] All tests passing with 80%+ coverage

---

### Phase 5: Routes, Validators, and Controllers (Phase 5 of 15)

Branch: `phase-5-routes-validators-controllers`

#### Critical Implementation Workflow (MUST FOLLOW)
1. **Branch**: Checkout `phase-5-routes-validators-controllers`
2. **Search**: `grepSearch` and `readFile` to find existing routes/controllers
3. **Analysis**: Deeply analyze each file both the backend and client directories, extract logic/patterns
4. **Validate**: Compare against all 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md)
5. **Implement**: Correct/Create code matching specs exactly
6. **Test**: Write/Run unit tests (Real MongoDB, No Skips)
7. **Validate**: 100% Pass, 80% Coverage, No Lint Errors
8. **Merge**: `git checkout main && git merge phase-5-routes-validators-controllers`
9. **Sync**: `git push origin main`

#### 5.0 Phase Tracking
- [ ] Update `dev-phase-tracker.md` (Start Phase 5)
- [ ] Update steering docs with current status

#### 5.1 Authentication Routes and Controllers

- [/] `routes/authRoutes.js` - Auth routes (EXISTS - needs validation)
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [/] `controllers/authControllers.js` - Auth controllers (EXISTS - needs expansion)
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
  - [/] Register (organization + department + user)
  - [/] Login
  - [/] Logout
  - [/] Refresh token
  - [/] Forgot password
  - [/] Reset password

#### 5.2 Organization Management

- [ ] `routes/organizationRoutes.js` - Organization CRUD routes
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `controllers/organizationControllers.js` - Organization CRUD controllers
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
  - [ ] Create (There is no create route/validator/controller. Customer organization must follow the onboarding process and platform organization must be initialized using seedData.js)
  - [ ] List (scoped by role)
  - [ ] Get by ID
  - [ ] Update
  - [ ] Delete (cascade with transaction)
  - [ ] Restore

#### 5.3 Department Management

- [ ] `routes/departmentRoutes.js` - Department CRUD routes
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `controllers/departmentControllers.js` - Department CRUD controllers
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
  - [ ] Create
  - [ ] List (scoped by organization)
  - [ ] Get by ID
  - [ ] Update
  - [ ] Delete (cascade with transaction)
  - [ ] Restore

#### 5.4 User Management

- [/] `routes/userRoutes.js` - User CRUD routes (EXISTS - needs expansion)
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [/] `controllers/userControllers.js` - User CRUD controllers (EXISTS - needs expansion)
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
  - [/] Create
  - [/] List (scoped by organization/department)
  - [/] Get by ID
  - [/] Get profile
  - [/] Update
  - [/] Delete (cascade with transaction)
  - [ ] Restore

#### 5.5 Task Management

- [ ] `routes/taskRoutes.js` - Task CRUD routes (all types)
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `controllers/taskControllers.js` - Task CRUD controllers
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
  - [ ] Create (ProjectTask, RoutineTask, AssignedTask)
  - [ ] List (scoped by department/organization, filters)
  - [ ] Get by ID (with activities and comments)
  - [ ] Update (type-specific fields)
  - [ ] Delete (cascade with transaction)
  - [ ] Restore

#### 5.6 TaskActivity Management

- [ ] `routes/taskActivityRoutes.js` - TaskActivity CRUD routes
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `controllers/taskActivityControllers.js` - TaskActivity CRUD controllers
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
  - [ ] Create (ProjectTask/AssignedTask only)
  - [ ] List (by task)
  - [ ] Get by ID
  - [ ] Update
  - [ ] Delete (cascade with transaction)

#### 5.7 TaskComment Management

- [ ] `routes/taskCommentRoutes.js` - TaskComment CRUD routes
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `controllers/taskCommentControllers.js` - TaskComment CRUD controllers
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
  - [ ] Create (with threading, max depth 3)
  - [ ] List (by parent)
  - [ ] Get by ID
  - [ ] Update
  - [ ] Delete (cascade to child comments)

#### 5.8 Material Management

- [ ] `routes/materialRoutes.js` - Material CRUD routes
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `controllers/materialControllers.js` - Material CRUD controllers
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
  - [ ] Create
  - [ ] List (scoped by department, filters)
  - [ ] Get by ID
  - [ ] Update
  - [ ] Delete
  - [ ] Restore

#### 5.9 Vendor Management

- [ ] `routes/vendorRoutes.js` - Vendor CRUD routes
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `controllers/vendorControllers.js` - Vendor CRUD controllers
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
  - [ ] Create
  - [ ] List (scoped by department)
  - [ ] Get by ID
  - [ ] Update
  - [ ] Delete (require material reassignment)
  - [ ] Restore

#### 5.10 Attachment Management

- [ ] `routes/attachmentRoutes.js` - Attachment CRUD routes
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `controllers/attachmentControllers.js` - Attachment CRUD controllers
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
  - [ ] Create (upload to Cloudinary)
  - [ ] List (scoped by organization/department)
  - [ ] Get by ID
  - [ ] Delete (remove from Cloudinary)

#### 5.11 Notification Management

- [ ] `routes/notificationRoutes.js` - Notification routes
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `controllers/notificationControllers.js` - Notification controllers
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
  - [ ] List (by recipient)
  - [ ] Get by ID
  - [ ] Mark as read
  - [ ] Mark all as read
  - [ ] Delete

#### 5.12 Phase 5 Testing

- [ ] Integration tests for all auth endpoints
- [ ] Integration tests for all organization endpoints
- [ ] Integration tests for all department endpoints
- [ ] Integration tests for all user endpoints
- [ ] Integration tests for all task endpoints (all types)
- [ ] Integration tests for all task activity endpoints
- [ ] Integration tests for all task comment endpoints
- [ ] Integration tests for all material endpoints
- [ ] Integration tests for all vendor endpoints
- [ ] Integration tests for all attachment endpoints
- [ ] Integration tests for all notification endpoints
- [ ] Property-based tests for cascade operations
- [ ] All tests passing with 80%+ coverage

---

### Phase 6: Test Infrastructure and Seed Data (Phase 6 of 15)

Branch: `phase-6-test-infrastructure-seed`

#### Critical Implementation Workflow (MUST FOLLOW)
1. **Branch**: Checkout `phase-6-test-infrastructure-seed`
2. **Search**: `grepSearch` and `readFile` to find existing test setup
3. **Analysis**: Deeply analyze each file both the backend and client directories, extract logic/patterns
4. **Validate**: Compare against all 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md)
5. **Implement**: Correct/Create code matching specs exactly
6. **Test**: Write/Run unit tests (Real MongoDB, No Skips)
7. **Validate**: 100% Pass, 80% Coverage, No Lint Errors
8. **Merge**: `git checkout main && git merge phase-6-test-infrastructure-seed`
9. **Sync**: `git push origin main`

#### 6.0 Phase Tracking
- [ ] Update `dev-phase-tracker.md` (Start Phase 6)
- [ ] Update steering docs with current status

#### 6.1 Test Infrastructure

- [x] `jest.config.js` - Jest configuration (ES modules, real MongoDB)
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [x] `__tests__/globalSetup.js` - Connect to test DB, set env vars (EXISTS)
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [x] `__tests__/globalTeardown.js` - Disconnect from test DB (EXISTS)
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [x] `__tests__/setup.js` - Clean collections after each test (EXISTS)
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `__tests__/helpers.js` - Test helper functions
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 6.2 Seed Data

- [ ] `utils/seedData.js` - Development seed data script
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
  - [ ] Create platform organization
  - [ ] Create platform department and SuperAdmin user
  - [ ] Create 2-3 customer organizations with departments
  - [ ] Create users with all roles
  - [ ] Create sample tasks (all types)
  - [ ] Create sample materials, vendors, notifications

#### 6.3 Phase 6 Testing

- [ ] All existing tests converted to use real MongoDB
- [ ] Test infrastructure working correctly
- [ ] Seed data script creates all resources successfully
- [ ] All tests passing with 80%+ coverage

---

### Phase 7: Complete Backend Validation (Phase 7 of 15)

Branch: `phase-7-complete-backend-validation`

#### Critical Implementation Workflow (MUST FOLLOW)
1. **Branch**: Checkout `phase-7-complete-backend-validation`
2. **Search**: `grepSearch` and `readFile` to find existing tests
3. **Analysis**: Deeply analyze each file both the backend and client directories, extract logic/patterns
4. **Validate**: Compare against all 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md)
5. **Implement**: Correct/Create code matching specs exactly
6. **Test**: Write/Run unit tests (Real MongoDB, No Skips)
7. **Validate**: 100% Pass, 80% Coverage, No Lint Errors
8. **Merge**: `git checkout main && git merge phase-7-complete-backend-validation`
9. **Sync**: `git push origin main`

#### 7.0 Phase Tracking
- [ ] Update `dev-phase-tracker.md` (Start Phase 7)
- [ ] Update steering docs with current status

#### 7.1 Integration Testing

- [ ] End-to-end API tests for all resources
- [ ] Multi-tenancy isolation tests
- [ ] Cascade delete operation tests (all relationships)
- [ ] Socket.IO real-time event tests
- [ ] Email notification tests

#### 7.2 Code Quality

- [ ] All linting errors fixed
- [ ] All code documented with JSDoc
- [ ] No hardcoded values (all from constants.js)
- [ ] Backend and frontend constants.js synchronized

#### 7.3 Documentation

- [ ] README.md - Backend API documentation
- [ ] API endpoint documentation (Postman/OpenAPI)
- [ ] Database schema documentation
- [ ] Authorization matrix documentation
- [ ] Environment variables documentation

#### 7.4 Final Validation

- [ ] All 80%+ code coverage requirement met
- [ ] All tests passing (100% pass rate)
- [ ] No critical security vulnerabilities (npm audit)
- [ ] Performance benchmarks acceptable
- [ ] Backend ready for production deployment

---

## Frontend Development

### Phase 8: Frontend Redux Store and Routing (Phase 8 of 15)

Branch: `phase-8-frontend-redux-routing`

#### Critical Implementation Workflow (MUST FOLLOW)
1. **Branch**: Checkout `phase-8-frontend-redux-routing`
2. **Search**: `grepSearch` and `readFile` to find existing redux/router
3. **Analysis**: Deeply analyze each file both the backend and client directories, extract logic/patterns
4. **Validate**: Compare against all 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md)
5. **Implement**: Correct/Create code matching specs exactly
6. **Test**: Write/Run unit tests (Real MongoDB, No Skips)
7. **Validate**: 100% Pass, 80% Coverage, No Lint Errors
8. **Merge**: `git checkout main && git merge phase-8-frontend-redux-routing`
9. **Sync**: `git push origin main`

#### 8.0 Phase Tracking
- [ ] Update `dev-phase-tracker.md` (Start Phase 8)
- [ ] Update steering docs with current status

#### 8.1 Redux Store Configuration

- [ ] `redux/app/store.js` - Store configuration with persistence
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `redux/features/api.js` - Base RTK Query API
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `redux/features/authSlice.js` - Auth slice with user state
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 8.2 API Slices

- [ ] `redux/features/authApi.js` - Auth API endpoints
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `redux/features/userApi.js` - User API endpoints
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `redux/features/organizationApi.js` - Organization API endpoints
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `redux/features/departmentApi.js` - Department API endpoints
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `redux/features/taskApi.js` - Task API endpoints (all types)
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `redux/features/materialApi.js` - Material API endpoints
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `redux/features/vendorApi.js` - Vendor API endpoints
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `redux/features/notificationApi.js` - Notification API endpoints
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `redux/features/attachmentApi.js` - Attachment API endpoints
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 8.3 Routing Configuration

- [ ] `router/routes.jsx` - React Router v7 configuration
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `router/ProtectedRoute.jsx` - Protected route component
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `router/PublicRoute.jsx` - Public route component
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 8.4 Layouts

- [ ] `layouts/RootLayout.jsx` - Root layout with error boundary
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `layouts/PublicLayout.jsx` - Public pages layout
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `layouts/DashboardLayout.jsx` - Dashboard layout with navigation
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 8.5 Utilities

- [ ] `utils/constants.js` - Frontend constants (MUST match backend exactly)
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `utils/dateUtils.js` - Date formatting and timezone conversion
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 8.6 Phase 8 Testing

- [ ] Unit tests for Redux slices
- [ ] Unit tests for custom hooks
- [ ] Integration tests for routing
- [ ] All tests passing

---

### Phase 9: Common Components (Phase 9 of 15)

Branch: `phase-9-frontend-common-components`

#### Critical Implementation Workflow (MUST FOLLOW)
1. **Branch**: Checkout `phase-9-frontend-common-components`
2. **Search**: `grepSearch` and `readFile` to find existing components
3. **Analysis**: Deeply analyze each file both the backend and client directories, extract logic/patterns
4. **Validate**: Compare against all 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md)
5. **Implement**: Correct/Create code matching specs exactly
6. **Test**: Write/Run unit tests (Real MongoDB, No Skips)
7. **Validate**: 100% Pass, 80% Coverage, No Lint Errors
8. **Merge**: `git checkout main && git merge phase-9-frontend-common-components`
9. **Sync**: `git push origin main`

#### 9.0 Phase Tracking
- [ ] Update `dev-phase-tracker.md` (Start Phase 9)
- [ ] Update steering docs with current status

#### 9.1 Form Components (React Hook Form + MUI)

- [ ] `components/common/MuiTextField.jsx` - Text input with validation
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/common/MuiTextArea.jsx` - Multi-line text input
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/common/MuiNumberField.jsx` - Number input
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/common/MuiSelectAutocomplete.jsx` - Single select with search
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/common/MuiMultiSelect.jsx` - Multi-select with chips
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/common/MuiResourceSelect.jsx` - Fetch and select resources
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/common/MuiDatePicker.jsx` - Date picker
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/common/MuiDateRangePicker.jsx` - Date range picker
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/common/MuiCheckbox.jsx` - Checkbox with label
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/common/MuiRadioGroup.jsx` - Radio button group
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/common/MuiFileUpload.jsx` - File upload with preview
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 9.2 DataGrid Components

- [ ] `components/common/MuiDataGrid.jsx` - Server-side pagination DataGrid
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/common/MuiActionColumn.jsx` - Action buttons for DataGrid
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/common/CustomDataGridToolbar.jsx` - DataGrid toolbar
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 9.3 Filter Components

- [ ] `components/common/FilterTextField.jsx` - Text filter with debouncing
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/common/FilterSelect.jsx` - Select filter
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/common/FilterDateRange.jsx` - Date range filter
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/common/FilterChipGroup.jsx` - Chip-based filter
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 9.4 Dialog Components

- [ ] `components/common/MuiDialog.jsx` - Base dialog wrapper
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/common/MuiDialogConfirm.jsx` - Confirmation dialog
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 9.5 Loading Components

- [ ] `components/common/MuiLoading.jsx` - Loading spinner
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/common/BackdropFallback.jsx` - Full-screen loading
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/common/NavigationLoader.jsx` - Navigation progress bar
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/common/ContentLoader.jsx` - Content area loading
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 9.6 Utility Components

- [ ] `components/common/NotificationMenu.jsx` - Notification dropdown
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/common/GlobalSearch.jsx` - Global search component
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/common/ErrorBoundary.jsx` - Error boundary component
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/common/RouteError.jsx` - Route error component
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/common/CustomIcons.jsx` - Custom icons
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 9.7 Phase 9 Testing

- [ ] Unit tests for all form components
- [ ] Unit tests for dialog components
- [ ] Unit tests for filter components
- [ ] Integration tests for DataGrid components
- [ ] Accessibility tests for all components
- [ ] All tests passing

---

### Phase 10: Authentication and Authorization UI (Phase 10 of 15)

Branch: `phase-10-frontend-auth`

#### Critical Implementation Workflow (MUST FOLLOW)
1. **Branch**: Checkout `phase-10-frontend-auth`
2. **Search**: `grepSearch` and `readFile` to find existing auth UI
3. **Analysis**: Deeply analyze each file both the backend and client directories, extract logic/patterns
4. **Validate**: Compare against all 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md)
5. **Implement**: Correct/Create code matching specs exactly
6. **Test**: Write/Run unit tests (Real MongoDB, No Skips)
7. **Validate**: 100% Pass, 80% Coverage, No Lint Errors
8. **Merge**: `git checkout main && git merge phase-10-frontend-auth`

#### 10.0 Phase Tracking
- [ ] Update `dev-phase-tracker.md` (Start Phase 10)
- [ ] Update steering docs with current status

#### 10.1 Auth Pages

- [ ] `pages/auth/LoginPage.jsx` - Login page
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `pages/auth/RegisterPage.jsx` - Registration page (multi-step wizard)
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `pages/auth/ForgotPasswordPage.jsx` - Forgot password page
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `pages/auth/ResetPasswordPage.jsx` - Reset password page
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 10.2 Auth Components

- [ ] `components/auth/LoginForm.jsx` - Login form
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/auth/RegisterWizard.jsx` - Multi-step registration wizard
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/auth/ForgotPasswordForm.jsx` - Forgot password form
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/auth/ResetPasswordForm.jsx` - Reset password form
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 10.3 Hooks

- [ ] `hooks/useAuth.js` - Authentication hook
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 10.4 Phase 10 Testing

- [ ] Unit tests for auth forms
- [ ] Integration tests for auth flows
- [ ] All tests passing

---

### Phase 11: Resource Management UI (Phase 11 of 15)

Branch: `phase-11-frontend-resource-management`

#### Critical Implementation Workflow (MUST FOLLOW)
1. **Branch**: Checkout `phase-11-frontend-resource-management`
2. **Search**: `grepSearch` and `readFile` to find existing resource UI
3. **Analysis**: Deeply analyze each file both the backend and client directories, extract logic/patterns
4. **Validate**: Compare against all 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md)
5. **Implement**: Correct/Create code matching specs exactly
6. **Test**: Write/Run unit tests (Real MongoDB, No Skips)
7. **Validate**: 100% Pass, 80% Coverage, No Lint Errors
8. **Merge**: `git checkout main && git merge phase-11-frontend-resource-management`

#### 11.0 Phase Tracking
- [ ] Update `dev-phase-tracker.md` (Start Phase 11)
- [ ] Update steering docs with current status

#### 11.1 Organization Management (DataGrid Pattern)

- [ ] `pages/organization/OrganizationsPage.jsx` - Organizations list
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/columns/organizationColumns.jsx` - DataGrid columns
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/filters/OrganizationFilter.jsx` - Organization filters
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/forms/OrganizationForm.jsx` - Create/Update organization
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 11.2 Department Management (DataGrid Pattern)

- [ ] `pages/department/DepartmentsPage.jsx` - Departments list
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/columns/departmentColumns.jsx` - DataGrid columns
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/filters/DepartmentFilter.jsx` - Department filters
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/forms/DepartmentForm.jsx` - Create/Update department
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 11.3 User Management (DataGrid + Three-Layer Pattern)

- [ ] `pages/user/UsersPage.jsx` - Users list (admin view with DataGrid)
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `pages/user/UserProfilePage.jsx` - User profile page
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/columns/userColumns.jsx` - DataGrid columns
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/filters/UserFilter.jsx` - User filters
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/forms/UserForm.jsx` - Create/Update user
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/users/UserList.jsx` - User list component
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/users/UserCard.jsx` - User card component
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 11.4 Material Management (DataGrid Pattern)

- [ ] `pages/material/MaterialsPage.jsx` - Materials list
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/columns/materialColumns.jsx` - DataGrid columns
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/filters/MaterialFilter.jsx` - Material filters
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/forms/MaterialForm.jsx` - Create/Update material
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 11.5 Vendor Management (DataGrid Pattern)

- [ ] `pages/vendor/VendorsPage.jsx` - Vendors list
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/columns/vendorColumns.jsx` - DataGrid columns
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/filters/VendorFilter.jsx` - Vendor filters
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/forms/VendorForm.jsx` - Create/Update vendor
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 11.6 Phase 11 Testing

- [ ] Unit tests for all pages
- [ ] Unit tests for all forms
- [ ] Integration tests for CRUD operations
- [ ] All tests passing

---

### Phase 12: Task Management UI (Phase 12 of 15)

Branch: `phase-12-frontend-task-management`

#### Critical Implementation Workflow (MUST FOLLOW)
1. **Branch**: Checkout `phase-12-frontend-task-management`
2. **Search**: `grepSearch` and `readFile` to find existing task UI
3. **Analysis**: Deeply analyze each file both the backend and client directories, extract logic/patterns
4. **Validate**: Compare against all 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md)
5. **Implement**: Correct/Create code matching specs exactly
6. **Test**: Write/Run unit tests (Real MongoDB, No Skips)
7. **Validate**: 100% Pass, 80% Coverage, No Lint Errors
8. **Merge**: `git checkout main && git merge phase-12-frontend-task-management`

#### 12.0 Phase Tracking
- [ ] Update `dev-phase-tracker.md` (Start Phase 12)
- [ ] Update steering docs with current status

#### 12.1 Task Pages (Three-Layer Pattern)

- [ ] `pages/task/TasksPage.jsx` - Tasks list page
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `pages/task/TaskDetailPage.jsx` - Task detail page
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/lists/TaskList.jsx` - Task list component
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/cards/TaskCard.jsx` - Task card component (memoized)
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 12.2 Task Forms (Type-Specific)

- [ ] `components/forms/TaskForm.jsx` - Task form with type selection
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/forms/ProjectTaskFields.jsx` - ProjectTask specific fields
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/forms/RoutineTaskFields.jsx` - RoutineTask specific fields
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/forms/AssignedTaskFields.jsx` - AssignedTask specific fields
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 12.3 Task Filters

- [ ] `components/filters/TaskFilter.jsx` - Task filters (status, priority, type, assignee, date)
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 12.4 TaskActivity Components

- [ ] `components/task/TaskActivityList.jsx` - TaskActivity list
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/task/TaskActivityCard.jsx` - TaskActivity card
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/forms/TaskActivityForm.jsx` - Create/Update activity
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 12.5 TaskComment Components

- [ ] `components/task/TaskCommentList.jsx` - TaskComment list (threaded)
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/task/TaskCommentCard.jsx` - TaskComment card
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/forms/TaskCommentForm.jsx` - Create comment with mentions
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 12.6 Phase 12 Testing

- [ ] Unit tests for all task components
- [ ] Unit tests for all task forms
- [ ] Integration tests for task CRUD operations
- [ ] Integration tests for activity and comment threading
- [ ] All tests passing

---

### Phase 13: Notifications and Real-Time Updates (Phase 13 of 15)

Branch: `phase-13-frontend-notifications-realtime`

#### Critical Implementation Workflow (MUST FOLLOW)
1. **Branch**: Checkout `phase-13-frontend-notifications-realtime`
2. **Search**: `grepSearch` and `readFile` to find existing notification UI
3. **Analysis**: Deeply analyze each file both the backend and client directories, extract logic/patterns
4. **Validate**: Compare against all 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md)
5. **Implement**: Correct/Create code matching specs exactly
6. **Test**: Write/Run unit tests (Real MongoDB, No Skips)
7. **Validate**: 100% Pass, 80% Coverage, No Lint Errors
8. **Merge**: `git checkout main && git merge phase-13-frontend-notifications-realtime`

#### 13.0 Phase Tracking
- [ ] Update `dev-phase-tracker.md` (Start Phase 13)
- [ ] Update steering docs with current status

#### 13.1 Notification UI

- [ ] `pages/notification/NotificationsPage.jsx` - Notifications list
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/notifications/NotificationList.jsx` - Notification list
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/notifications/NotificationCard.jsx` - Notification card
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 13.2 Socket.IO Integration

- [ ] `services/socketService.js` - Socket.IO client service
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `services/socketEvents.js` - Event handlers for real-time updates
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `hooks/useSocket.js` - Socket.IO hook
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 13.3 Real-Time Features

- [ ] Real-time task updates
- [ ] Real-time notification delivery
- [ ] Real-time user status updates
- [ ] Toast notifications for events

#### 13.4 Phase 13 Testing

- [ ] Unit tests for socket service
- [ ] Integration tests for real-time events
- [ ] All tests passing

---

### Phase 14: Dashboard and File Upload (Phase 14 of 15)

Branch: `phase-14-frontend-dashboard-files`

#### Critical Implementation Workflow (MUST FOLLOW)
1. **Branch**: Checkout `phase-14-frontend-dashboard-files`
2. **Search**: `grepSearch` and `readFile` to find existing dashboard UI
3. **Analysis**: Deeply analyze each file both the backend and client directories, extract logic/patterns
4. **Validate**: Compare against all 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md)
5. **Implement**: Correct/Create code matching specs exactly
6. **Test**: Write/Run unit tests (Real MongoDB, No Skips)
7. **Validate**: 100% Pass, 80% Coverage, No Lint Errors
8. **Merge**: `git checkout main && git merge phase-14-frontend-dashboard-files`

#### 14.0 Phase Tracking
- [ ] Update `dev-phase-tracker.md` (Start Phase 14)
- [ ] Update steering docs with current status

#### 14.1 Dashboard

- [ ] `pages/dashboard/DashboardPage.jsx` - Dashboard with widgets
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/dashboard/TaskStatsWidget.jsx` - Task statistics
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/dashboard/RecentTasksWidget.jsx` - Recent tasks
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/dashboard/UpcomingDeadlinesWidget.jsx` - Upcoming deadlines
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.
- [ ] `components/dashboard/ChartWidget.jsx` - Charts (task status, priority)
> **Analysis Requirement**: [ ] Super deep analysis of ALL 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md) required before starting.

#### 14.2 File Upload

- [ ] `services/cloudinaryService.js` - Cloudinary upload service
- [ ] `components/common/AttachmentList.jsx` - Attachment list component

#### 14.3 Global Search

- [ ] Implementation of global search across resources
- [ ] Keyboard shortcut support (Ctrl+K/Cmd+K)

#### 14.4 Phase 14 Testing

- [ ] Unit tests for dashboard widgets
- [ ] Unit tests for file upload service
- [ ] Integration tests for global search
- [ ] All tests passing

---

### Phase 15: Frontend Finalization and Production Optimization (Phase 15 of 15)

Branch: `phase-15-frontend-finalization`

#### Critical Implementation Workflow (MUST FOLLOW)
1. **Branch**: Checkout `phase-15-frontend-finalization`
2. **Search**: `grepSearch` and `readFile` to find existing code
3. **Analysis**: Deeply analyze each file both the backend and client directories, extract logic/patterns
4. **Validate**: Compare against all 6 docs (requirements.md, design.md, product.md, structure.md, tech.md, timezone-doc.md)
5. **Implement**: Correct/Create code matching specs exactly
6. **Test**: Write/Run unit tests (Real MongoDB, No Skips)
7. **Validate**: 100% Pass, 80% Coverage, No Lint Errors
8. **Merge**: `git checkout main && git merge phase-15-frontend-finalization`

#### 15.0 Phase Tracking
- [ ] Update `dev-phase-tracker.md` (Start Phase 15)
- [ ] Update steering docs with current status

#### 15.1 Production Optimization

- [ ] Code splitting configuration in vite.config.js
- [ ] Chunk size optimization
- [ ] React.memo optimization for all cards
- [ ] useCallback and useMemo optimizations
- [ ] Image lazy loading

#### 15.2 Testing and Quality

- [ ] All frontend tests passing
- [ ] Accessibility audit (WCAG AA compliance)
- [ ] Performance audit (Lighthouse score 90+)
- [ ] Code coverage 80%+

#### 15.3 Documentation

- [ ] README.md - Frontend documentation
- [ ] Component library documentation
- [ ] State management documentation
- [ ] Testing documentation

#### 15.4 Final Validation

- [ ] All features working end-to-end
- [ ] Backend and frontend integrated seamlessly
- [ ] Real-time updates working correctly
- [ ] No critical bugs or errors
- [ ] Production build successful
- [ ] Application ready for deployment

---

## Post-Development Tasks

### Documentation

- [ ] Complete API documentation (Postman/OpenAPI)
- [ ] Database schema documentation
- [ ] Deployment guide
- [ ] User manual
- [ ] Admin manual

### Deployment

- [ ] Environment configuration (production)
- [ ] SSL/TLS certificate setup
- [ ] Nginx reverse proxy configuration
- [ ] MongoDB production setup
- [ ] PM2 process management
- [ ] Health check endpoints
- [ ] Monitoring setup (PM2, MongoDB Atlas, Sentry)
- [ ] Backup strategy implementation

### Security Hardening

- [ ] Security audit checklist completed
- [ ] HTTPS enforced
- [ ] Strong JWT secrets
- [ ] MongoDB authentication enabled
- [ ] Firewall configured
- [ ] Rate limiting enabled
- [ ] CORS restricted to production domain
- [ ] Security headers configured
- [ ] Input sanitization verified
- [ ] Password hashing verified
- [ ] Regular dependency updates scheduled

---

## Success Criteria

- [ ] All 15 phases completed with 100% task completion
- [ ] All backend and frontend tests passing
- [ ] 80%+ code coverage (statements), 75%+ (branches)
- [ ] No critical bugs or security vulnerabilities
- [ ] Performance acceptable under load
- [ ] Application deployed to production
- [ ] All documentation complete and up-to-date
- [ ] User acceptance testing completed
- [ ] Security hardening checklist verified

---

## Notes

### Development Workflow

1. **Before Starting Any Task**:
   - Search entire codebase (`backend/*` and `client/*`) for existing implementations
   - Analyze existing files deeply to understand current implementation
   - Validate against requirements.md and design.md
   - Decision: Keep as-is, correct, or implement from scratch

2. **Testing Rules**:
   - NEVER use MongoDB Memory Server (causes timeout issues)
   - ALWAYS use real MongoDB test instance
   - NEVER skip tests - all must pass before proceeding
   - Minimum 80% statement coverage, 75% branch coverage

3. **Git Workflow**:
   - Create new branch for each phase: `git checkout -b phase-X-[name]`
   - Commit format: "Phase X: [Component] - [Description]"
   - Merge to main only when phase is 100% complete with all tests passing
   - `git checkout main && git merge phase-X-[name] && git push`

4. **Constants Synchronization**:
   - `backend/utils/constants.js` is ONLY source of truth
   - `client/src/utils/constants.js` MUST match exactly
   - NEVER hardcode enum values anywhere

5. **Field Name Consistency**:
   - Backend validator field names are source of truth
   - Frontend MUST use exact same field names
   - Validators handle Id/Ids to schema field conversion

---

*This task list is comprehensive and covers all requirements from requirements.md and design.md. Each task should be completed with thorough testing before proceeding to the next.*

