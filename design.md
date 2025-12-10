# Multi-Tenant SaaS Task Manager - Design Document

## Overview

**Requirements Reference**: Requirements 1-30 (All)

This design document provides the complete technical blueprint for implementing a Multi-Tenant SaaS Task Manager following a strict phase sequential development approach. The system features role-based access control, real-time updates via Socket.IO, three distinct task types with different workflows, universal soft delete with cascade operations, and comprehensive security measures.

### System Goals

**Requirements Reference**: Requirement 1 (Sequential Development), Requirements 2-15 (Backend), Requirements 16-27 (Frontend), Requirements 28-30 (Production)

1. **Sequential Development**: Backend-first approach with 15 phases, each 100% complete before proceeding _(Requirement 1)_
2. **Multi-Tenancy**: Complete data isolation between customer organizations with platform organization oversight _(Requirements 8, 20)_
3. **Role-Based Access**: Granular permissions using authorization matrix (SuperAdmin, Admin, Manager, User) _(Requirements 4, 8)_
4. **Task Management**: Three task types (ProjectTask, RoutineTask, AssignedTask) with distinct workflows _(Requirements 3, 10, 22)_
5. **Real-Time Updates**: Socket.IO for instant notifications and UI updates across clients _(Requirements 5, 13, 23)_
6. **Soft Delete**: Universal soft delete with TTL-based auto-cleanup and restore functionality _(Requirements 3, 11, 12)_
7. **Security**: JWT authentication (HTTP-only cookies), bcrypt hashing, rate limiting, input sanitization _(Requirements 4, 7)_
8. **Testing**: Comprehensive unit, integration, and property-based tests with 80%+ coverage _(Requirements 6, 27)_
9. **Scalability**: Optimized queries, pagination, caching, connection pooling, code splitting _(Requirement 28)_
10. **Production Ready**: Complete documentation, deployment guides, monitoring, and backup strategies _(Requirement 29)_

### Technology Stack

**Requirements Reference**: Requirements 2-6 (Backend Stack), Requirements 16-18 (Frontend Stack)

**Backend (Node.js/Express)**:

- Express.js 4.21+ - Web framework
- MongoDB 7.0+ with Mongoose 8.19+ - Database and ODM
- JWT (jsonwebtoken 9.0+) - Authentication with HTTP-only cookies
- Socket.IO 4.8+ - Real-time bidirectional communication
- Bcrypt 6.0+ - Password hashing (≥12 salt rounds)
- Winston 3.18+ - Structured logging with file transports
- Nodemailer 7.0+ - Email service with Gmail SMTP
- Express-validator 7.2+ - Request validation
- Jest 30.2+ - Testing framework with ES modules
- Fast-check 4.3+ - Property-based testing library
- **CRITICAL**: NEVER use MongoDB Memory Server (causes timeout issues) - use real MongoDB test instance
- Helmet 8.1+ - Security headers (CSP, HSTS, X-Frame-Options)
- Express-rate-limit 8.1+ - Rate limiting (production)
- Express-mongo-sanitize 2.2+ - NoSQL injection prevention

**Frontend (React/Vite)**:

- React 19.1+ - UI library with concurrent features
- Vite 7.1+ - Build tool with fast HMR
- Material-UI (MUI) v7.3+ - Component library (breaking changes from v6)
- Redux Toolkit 2.9+ - State management with RTK Query
- React Hook Form 7.65+ - Form management (NEVER use watch())
- React Router 7.9+ - Declarative routing
- Socket.IO Client 4.8+ - Real-time client
- Redux Persist 6.0+ - State persistence (auth only)
- React Toastify 11.0+ - Toast notifications
- Dayjs 1.11+ - Date manipulation (UTC/timezone plugins)

## Architecture

**Requirements Reference**: Requirements 1-15 (Backend Architecture), Requirements 16-27 (Frontend Architecture)

### High-Level System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐│
│  │   Pages    │  │ Components │  │Redux Store │  │  Services  ││
│  │            │  │            │  │            │  │            ││
│  │ Dashboard  │  │ Forms      │  │ Auth Slice │  │ Socket.IO  ││
│  │ Tasks      │  │ Cards      │  │ RTK Query  │  │ Cloudinary ││
│  │ Users      │  │ DataGrid   │  │ Persist    │  │ API Calls  ││
│  │ Materials  │  │ Filters    │  │ Cache      │  │            ││
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘│
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (REST API)
                              │ WSS (WebSocket)
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                   Backend (Express + Socket.IO)                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐│
│  │   Routes   │  │Controllers │  │  Services  │  │Middleware  ││
│  │            │  │            │  │            │  │            ││
│  │ Auth       │  │ Business   │  │ Email      │  │ Auth JWT   ││
│  │ Users      │  │ Logic      │  │ Notif      │  │ Authz      ││
│  │ Tasks      │  │ CRUD       │  │ Socket     │  │ Validate   ││
│  │ Materials  │  │ Cascade    │  │            │  │ RateLimit  ││
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘│
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐│
│  │   Models   │  │   Utils    │  │   Config   │  │  Templates ││
│  │            │  │            │  │            │  │            ││
│  │ Mongoose   │  │ Constants  │  │ CORS       │  │ Email HTML ││
│  │ SoftDelete │  │ Helpers    │  │ AuthzMtrx  │  │            ││
│  │ Validators │  │ Logger     │  │ DB Conn    │  │            ││
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘│
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ MongoDB Protocol
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      MongoDB Database                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │Organizations │  │ Departments  │  │    Users     │          │
│  │(Platform/    │  │              │  │(Platform/    │          │
│  │ Customer)    │  │              │  │ Customer)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  BaseTasks   │  │TaskActivities│  │TaskComments  │          │
│  │(Discrimin.)  │  │(ProjectTask/ │  │(Threading    │          │
│  │-ProjectTask  │  │ AssignedTask)│  │ Max Depth 3) │          │
│  │-RoutineTask  │  │              │  │              │          │
│  │-AssignedTask │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Materials   │  │   Vendors    │  │ Attachments  │          │
│  │              │  │(External     │  │(Cloudinary)  │          │
│  │              │  │ Clients)     │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐                                                │
│  │Notifications │  All collections have soft delete fields      │
│  │              │  with TTL indexes for auto-cleanup            │
│  └──────────────┘                                                │
└──────────────────────────────────────────────────────────────────┘
```

### Request Lifecycle and Data Flow

```
1. Client Request
   │
   ├─→ HTTP Request (JWT in HTTP-only cookies)
   │   └─→ Express Middleware Stack (IN ORDER):
   │       1. Helmet (security headers: CSP, HSTS, X-Frame-Options)
   │       2. CORS (origin validation, credentials: true)
   │       3. Cookie Parser (extract JWT cookies)
   │       4. Body Parser (JSON/URL-encoded, 10MB limit)
   │       5. Mongo Sanitize (NoSQL injection prevention)
   │       6. Compression (gzip, threshold: 1KB)
   │       7. Request ID (UUID for tracing)
   │       8. Rate Limiter (production: 100/15min general, 5/15min auth)
   │       9. Morgan (development logging only)
   │
   ├─→ Route Matching (/api/*)
   │   └─→ Authentication Layer
   │       ├─→ verifyJWT middleware
   │       │   ├─→ Extract access_token from cookies
   │       │   ├─→ Verify with JWT_ACCESS_SECRET
   │       │   ├─→ Find user by decoded userId
   │       │   ├─→ Check user exists and not soft-deleted
   │       │   └─→ Attach user to req.user
   │       │
   │       └─→ Authorization Layer
   │           ├─→ authorize(resource, operation) middleware
   │           ├─→ Get allowed scopes from authorizationMatrix.json
   │           ├─→ Determine request scope (own/ownDept/crossDept/crossOrg)
   │           ├─→ Check if user has permission for this scope
   │           └─→ Attach authorization info to req.authorization
   │
   ├─→ Validation Layer
   │   └─→ Express-validator rules
   │       ├─→ Field type/length/format checks
   │       ├─→ Custom validation logic
   │       ├─→ Format error messages
   │       └─→ Throw CustomError.badRequest if validation fails
   │
   ├─→ Controller Layer
   │   └─→ Business logic execution
   │       ├─→ Extract request data (body, params, query)
   │       ├─→ Apply multi-tenancy scoping
   │       ├─→ Call model methods (CRUD, cascade, etc.)
   │       ├─→ Handle transactions for cascade operations
   │       └─→ Format response
   │
   ├─→ Model Layer (Mongoose)
   │   └─→ Database operations
   │       ├─→ Apply soft delete filtering (automatic)
   │       ├─→ Execute queries with indexes
   │       ├─→ Run pre/post hooks (validation, auto-set fields)
   │       ├─→ Handle cascade operations with transactions
   │       └─→ Return results
   │
   ├─→ Side Effects
   │   ├─→ Socket.IO: Emit events to rooms
   │   ├─→ Email Service: Queue email notifications
   │   └─→ Notification Service: Create notification documents
   │
   └─→ Response
       ├─→ Format JSON response (success, message, data, pagination)
       ├─→ Set HTTP status code
       └─→ Send to client

2. Socket.IO Connection
   │
   ├─→ Client connects with credentials: true
   ├─→ Server authenticates via HTTP-only cookies
   ├─→ User joins rooms: user:${userId}, department:${deptId}, organization:${orgId}
   ├─→ Emit user:online event to department and organization rooms
   │
   └─→ Event Broadcasting
       ├─→ task:created/updated/deleted/restored → department + organization rooms
       ├─→ notification:created → user room
       └─→ user:online/offline/away → department + organization rooms
```

### Socket.IO Connection Flow

```
Client Application Startup
   │
   ├─→ useSocket hook initializes
   │   └─→ socketService.connect()
   │       ├─→ Create Socket.IO client with:
   │       │   - baseUrl: VITE_API_URL without /api
   │       │   - withCredentials: true (send HTTP-only cookies)
   │       │   - autoConnect: false
   │       │   - reconnection: true (exponential backoff 1s-5s, max 5 attempts)
   │       │
   │       └─→ socket.connect()
   │
   ├─→ Server receives connection
   │   └─→ Socket.IO middleware (utils/socket.js)
   │       ├─→ Extract JWT from cookies (same as HTTP)
   │       ├─→ Verify access_token
   │       ├─→ Find user by decoded userId
   │       ├─→ Check user exists and not soft-deleted
   │       └─→ Attach user to socket.data.user
   │
   ├─→ Connection established
   │   └─→ setupSocketHandlers (utils/socket.js)
   │       ├─→ Join user room: user:${userId}
   │       ├─→ Join department room: department:${departmentId}
   │       ├─→ Join organization room: organization:${organizationId}
   │       ├─→ Update user status to 'Online'
   │       └─→ Emit user:online to department + organization rooms
   │
   ├─→ Client sets up event handlers (services/socketEvents.js)
   │   ├─→ task:created → invalidate Task cache, show toast
   │   ├─→ task:updated → invalidate specific Task, update UI
   │   ├─→ task:deleted → invalidate Task cache, show toast
   │   ├─→ notification:created → invalidate Notification cache, show toast
   │   └─→ user:online/offline → update user status in UI
   │
   └─→ Disconnection
       ├─→ Client: socketService.disconnect()
       ├─→ Server: disconnect event handler
       ├─→ Update user status to 'Offline'
       └─→ Emit user:offline to department + organization rooms
```

## Components

**Requirements Reference**: Requirements 2-15 (Backend Components), Requirements 16-27 (Frontend Components)

### Backend Components

**Requirements Reference**: Requirements 2-15

#### 1. Configuration Layer (`config/`)

**Requirements Reference**: Requirement 2 (CORS, Authorization Matrix, DB Connection, Token Generation)

**Purpose**: Centralized configuration for CORS, authorization, and database connection

**Files**:

- `allowedOrigins.js`: Manages allowed CORS origins (development + production)
- `corsOptions.js`: CORS configuration with origin validation and logging
- `authorizationMatrix.json`: Role-based permission matrix (ONLY source of truth)
- `db.js`: MongoDB connection with retry logic, health checks, connection pooling

**Key Features**:

- No wildcard origins in production
- Exponential backoff for MongoDB reconnection (max 30s delay)
- Connection monitoring every 30 seconds
- Server selection timeout: 5000ms, Socket timeout: 45000ms
- Pool size: min 2, max 10 connections

#### 2. Models Layer (`models/`)

**Requirements Reference**: Requirement 3 (Mongoose Models with Soft Delete Plugin)

**Purpose**: Mongoose schemas with universal soft delete, validation, and cascade operations

**Plugin**:

- `plugins/softDelete.js`: Universal soft delete functionality
  - Fields: isDeleted, deletedAt, deletedBy, restoredAt, restoredBy, restoreCount
  - Query helpers: withDeleted(), onlyDeleted()
  - Instance methods: softDelete(), restore()
  - Static methods: softDeleteById(), restoreById(), softDeleteMany(), etc.
  - Hard delete protection (blocks deleteOne, deleteMany, findOneAndDelete, remove)
  - TTL index creation for auto-cleanup

**Core Models**:

- `Organization.js`: Tenant organizations (platform vs customer)

  - isPlatformOrg flag (immutable, only one platform org)
  - Unique constraints: name, email, phone (per non-deleted)
  - Cascade: departments → users → tasks → activities → comments → attachments
  - TTL: Never expires (null)

- `Department.js`: Organizational units within organizations

  - Unique name per organization
  - Cascade: users → tasks → materials → vendors
  - TTL: 365 days

- `User.js`: System users with authentication

  - Auto-set isPlatformUser from organization's isPlatformOrg
  - Auto-set isHod for SuperAdmin/Admin roles
  - Unique email per organization
  - Unique HOD per department (SuperAdmin or Admin)
  - Password hashing with bcrypt (12 salt rounds)
  - Skills array (max 10, each with name and proficiency 0-100)
  - Email preferences for notifications
  - Cascade: tasks → activities → comments → attachments → materials
  - TTL: 365 days

- `BaseTask.js`: Abstract base for all task types (discriminator pattern)

  - Common fields: title, description, status, priority, tags, attachments, watchers
  - Discriminator key: taskType (ProjectTask, RoutineTask, AssignedTask)
  - Watchers: max 20, HOD only (SuperAdmin/Admin)
  - Tags: max 5, unique case-insensitive
  - Attachments: max 10, unique
  - Cascade: activities → comments → attachments → notifications
  - TTL: 180 days

- `ProjectTask.js`: Tasks outsourced to external vendors

  - Required: vendorId (external client taking the task)
  - Cost tracking: estimatedCost, actualCost, currency, costHistory (max 200)
  - Assignees: max 20 department users managing vendor work
  - Materials: via TaskActivity with quantities (max 20)
  - Department users log vendor's work progress via TaskActivity

- `RoutineTask.js`: Daily routine tasks from outlets

  - Required: startDate, dueDate
  - Restrictions: status cannot be "To Do", priority cannot be "Low"
  - Materials: added directly to task (max 20), NO TaskActivity
  - No formal assignment (user receives task to perform)

- `AssignedTask.js`: Tasks assigned to users

  - Required: assignedTo (single user or array)
  - Materials: via TaskActivity with quantities (max 20)
  - Assigned users log their own work progress via TaskActivity

- `TaskActivity.js`: Work progress logs on ProjectTask/AssignedTask ONLY

  - Parent: ProjectTask or AssignedTask (NOT RoutineTask)
  - Materials: max 20 with quantities and attachments as proof
  - ProjectTask: Department users log vendor's work
  - AssignedTask: Assigned users log their own work
  - Cascade: comments → attachments
  - TTL: 90 days

- `TaskComment.js`: Comments on tasks, activities, and other comments

  - Threading: max depth 3 levels
  - Mentions: max 5 users per comment
  - Attachments: max 10 per comment
  - Cascade: child comments (recursive) → attachments
  - TTL: 90 days

- `Material.js`: Inventory resources

  - Categories: Electrical, Mechanical, Plumbing, Hardware, Cleaning, Textiles, Consumables, Construction, Other
  - Unit types: 30+ options (pcs, kg, l, m, m2, m3, box, pack, roll, etc.)
  - Linked to vendor (optional)
  - Usage: via TaskActivity (ProjectTask/AssignedTask) or directly (RoutineTask)
  - TTL: 180 days

- `Vendor.js`: External clients/vendors for ProjectTasks

  - Required: contactPerson, email, phone, address
  - Purpose: External client who takes and completes outsourced ProjectTasks
  - Communication: Oral communication with department users
  - Deletion: Requires material reassignment to another vendor
  - TTL: 180 days

- `Attachment.js`: File attachments

  - Types: Image, Video, Document, Audio, Other
  - Size limits: Image 10MB, Video 100MB, Document 25MB, Audio 20MB, Other 50MB
  - Storage: Cloudinary URL and publicId
  - Parent: Task, TaskActivity, or TaskComment (polymorphic)
  - TTL: 90 days

- `Notification.js`: User notifications
  - Types: Created, Updated, Deleted, Restored, Mention, Welcome, Announcement
  - Delivery: Real-time (Socket.IO) + Email (if preferences allow)
  - TTL: 30 days or custom expiresAt

#### 3. Middleware Layer (`middlewares/`)

**Requirements Reference**: Requirement 4 (Error Handling and Middleware)

**Authentication**:

- `authMiddleware.js`: JWT verification
  - verifyJWT: Extract access_token from cookies, verify, find user, attach to req.user
  - verifyRefresh_token: Extract refresh_token from cookies, verify, find user

**Authorization**:

- `authorization.js`: Role-based access control
  - authorize(resource, operation): Check permissions from authorizationMatrix.json
  - Scopes: own (user's resources), ownDept (same department), crossDept (other departments), crossOrg (other organizations)
  - Platform SuperAdmin: crossOrg scope for Organization resource only
  - Customer SuperAdmin/Admin: crossDept scope within organization
  - Manager/User: ownDept scope only

**Validation**:

- `validators/*.js`: Express-validator rules for each resource
  - Field names are ONLY source of truth (frontend MUST match exactly)
  - Type validation, length limits, enum values, custom validators
  - validation.js: Format validation errors consistently

**Rate Limiting**:

- `rateLimiter.js`: Production-only rate limiting
  - General API: 100 requests per 15 minutes per IP
  - Auth endpoints: 5 requests per 15 minutes per IP
  - Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

#### 4. Controllers Layer (`controllers/`)

**Requirements Reference**: Requirements 7-10 (Authentication, Organization/Department/User, Material/Vendor/Attachment/Notification, Task/Activity/Comment Management)

**Purpose**: Business logic and request handling

**Pattern**: All controllers follow consistent structure:

1. Extract and validate data from request
2. Check authorization (handled by middleware)
3. Perform business logic (CRUD, cascade, etc.)
4. Emit Socket.IO events
5. Send formatted response

**Controllers**:

- `authControllers.js`: Register, login, logout, refresh token, forgot/reset password
- `userControllers.js`: User CRUD, profile management, status updates
- `organizationControllers.js`: Organization CRUD (Platform SuperAdmin only for create)
- `departmentControllers.js`: Department CRUD within organizations
- `taskControllers.js`: Task CRUD for all types (ProjectTask, RoutineTask, AssignedTask)
- `materialControllers.js`: Material inventory management
- `vendorControllers.js`: Vendor management with material reassignment on delete
- `notificationControllers.js`: Notification CRUD, mark as read
- `attachmentControllers.js`: Attachment upload/delete

**Key Features**:

- Multi-tenancy scoping (organization/department)
- Soft delete with cascade operations using MongoDB transactions
- Socket.IO event emission for real-time updates
- Pagination with 1-based page numbers (backend standard)
- Error handling with CustomError class

#### 5. Services Layer (`services/`)

**Requirements Reference**: Requirement 5 (Services, Templates, and Server Setup), Requirement 14 (Email Notification System)

**Email Service** (`emailService.js`):

- Provider: Gmail SMTP (smtp.gmail.com:587)
- Authentication: App-specific passwords (not regular Gmail password)
- Queue: In-memory async queue for non-blocking email sending
- Retry: Automatic retry on failure
- Templates: HTML email templates for task events, mentions, welcome, password reset

**Notification Service** (`notificationService.js`):

- Create notifications for users
- Bulk notification creation (max 500 recipients)
- Mark as read functionality
- TTL-based expiry (30 days default or custom expiresAt)
- Integration with Socket.IO for real-time delivery

#### 6. Utilities Layer (`utils/`)

**Requirements Reference**: Requirement 2 (Constants, Response Transform, Token Generation, Logger)

**Constants** (`constants.js`):

- ONLY source of truth for all enum values
- User roles, task status/priority/types, material categories, unit types
- Pagination defaults, validation limits, length limits
- Frontend MUST mirror this file EXACTLY

**Response Transform** (`responseTransform.js`):

- formatResponse: Standard success/error response format
- formatPaginatedResponse: Paginated list response with metadata

**Socket Emitter** (`socketEmitter.js`):

- emitToRooms: Emit events to specific Socket.IO rooms
- emitTaskEvent: Emit task events to department + organization rooms
- emitUserEvent: Emit user events to user + department + organization rooms

**Authorization Matrix** (`authorizationMatrix.js`):

- hasPermission: Check if user has permission for operation
- getAllowedScopes: Get allowed scopes for user role and resource

**Token Generation** (`generateTokens.js`):

- generateAccess_token: Create JWT access token (15 min expiry)
- generateRefresh_token: Create JWT refresh token (7 days expiry)
- setTokenCookies: Set HTTP-only cookies with proper security settings

**Logger** (`logger.js`):

- Winston structured logging with file transports
- Separate error.log and combined.log files
- Console logging in development only
- Request ID for tracing

### Frontend Components

**Requirements Reference**: Requirements 16-27

#### 1. State Management (`redux/`)

**Requirements Reference**: Requirement 16 (Frontend Redux Store and API Setup)

**Store Configuration** (`app/store.js`):

- Redux Toolkit with RTK Query
- Persisted auth slice (localStorage)
- API reducer for cache management
- Middleware: RTK Query + Redux Persist

**Base API** (`features/api.js`):

- fetchBaseQuery with baseUrl from VITE_API_URL
- credentials: 'include' for HTTP-only cookies
- Tag types: Task, TaskActivity, TaskComment, User, Organization, Department, Material, Vendor, Notification, Attachment
- Automatic cache invalidation on mutations

**Resource APIs**:

- `authApi.js`: Register, login, logout, refresh, forgot/reset password
- `userApi.js`: User CRUD, profile, status updates
- `organizationApi.js`: Organization CRUD
- `departmentApi.js`: Department CRUD
- `taskApi.js`: Task CRUD for all types
- `materialApi.js`: Material CRUD
- `vendorApi.js`: Vendor CRUD
- `notificationApi.js`: Notification CRUD, mark as read
- `attachmentApi.js`: Attachment upload/delete

**Slices**:

- `authSlice.js`: User, isAuthenticated, isLoading state

#### 2. Routing (`router/`)

**Requirements Reference**: Requirement 17 (Frontend Routing and Layouts)

**Route Configuration** (`routes.jsx`):

- React Router with lazy loading for code splitting
- Nested routes with layouts
- Protected routes with authentication check
- Public routes with redirect if authenticated
- Error boundaries for route errors

**Route Structure**:

- Public: /, /login, /register, /forgot-password, /reset-password
- Protected: /dashboard, /tasks, /users, /materials, /vendors, /departments, /organizations
- Admin: /admin/organization, /admin/departments, /admin/users
- Platform: /platform/organizations (Platform SuperAdmin only)

**Route Protection**:

- ProtectedRoute: Check isAuthenticated, redirect to /login if not
- PublicRoute: Redirect to /dashboard if authenticated
- Role-based access: Check user role for admin/platform routes

#### 3. Common Components (`components/common/`)

**Requirements Reference**: Requirement 18 (Frontend Common Components)

**Form Components** (React Hook Form + MUI):

- `MuiTextField.js`: Text input with validation and adornments
- `MuiTextArea.js`: Multi-line text with character counter
- `MuiNumberField.js`: Number input with prefix/suffix
- `MuiSelectAutocomplete.js`: Single-select with search
- `MuiMultiSelect.js`: Multi-select with chips (max selections)
- `MuiResourceSelect.js`: Fetch and select resources (users, departments, materials, vendors)
- `MuiDatePicker.js`: Single date picker with timezone conversion
- `MuiDateRangePicker.js`: Start/end date pickers with validation
- `MuiCheckbox.js`: Checkbox with label
- `MuiRadioGroup.js`: Radio button group
- `MuiFileUpload.js`: File upload with preview and validation

**CRITICAL**: NEVER use watch() method from react-hook-form, ALWAYS use Controller with control prop

**DataGrid Components**:

- `MuiDataGrid.js`: Server-side pagination with auto-conversion (0-based MUI ↔ 1-based backend)
- `MuiActionColumn.js`: Action buttons (View/Edit/Delete/Restore) with auto soft-delete detection
- `CustomDataGridToolbar.js`: Toolbar with export, filters, columns, density controls

**Filter Components**:

- `FilterTextField.js`: Text input with debouncing (300ms)
- `FilterSelect.js`: Single/multiple select for filtering
- `FilterDateRange.js`: Date range picker for filtering
- `FilterChipGroup.js`: Chip-based multi-select filter

**Dialog Components**:

- `MuiDialog.js`: Base dialog wrapper with accessibility props
- `MuiDialogConfirm.js`: Confirmation dialog for destructive actions

**ALL dialogs MUST include**: disableEnforceFocus, disableRestoreFocus, aria-labelledby, aria-describedby

**Loading Components**:

- `MuiLoading.js`: Loading spinner with message
- `BackdropFallback.js`: Full-screen loading overlay
- `NavigationLoader.js`: Top progress bar for navigation
- `ContentLoader.js`: Loading overlay for content area

**Utility Components**:

- `NotificationMenu.js`: Notification dropdown with bell icon and unread count
- `GlobalSearch.js`: Global search across all resources (Ctrl+K or Cmd+K)
- `ErrorBoundary.js`: Catch React component errors
- `RouteError.js`: Display routing errors (404, etc.)
- `CustomIcons.js`: Custom icon components

#### 4. UI Patterns

**Requirements Reference**: Requirements 18, 20, 21, 22 (DataGrid and Three-Layer Patterns)

**DataGrid Pattern** (Admin Views):

- Use for: Organizations, Departments, Materials, Vendors, Users (admin view)
- Structure: Page → DataGrid with filters
- Required files: *Page.jsx, *Columns.jsx, _Filter.jsx, CreateUpdate_.jsx
- Features: Server-side pagination, sorting, filtering, CRUD operations
- ALWAYS use MuiDataGrid with MuiActionColumn

**Three-Layer Pattern** (User Views):

- Use for: Tasks, Users (user view), Dashboard widgets
- Structure: Page → List → Card
- Layer responsibilities:
  - Page: Data fetching, state management, event handling
  - List: Layout, mapping items, delegating events
  - Card: Display single item, memoized with React.memo
- ALWAYS wrap cards with React.memo, use useCallback for event handlers, useMemo for computed values

#### 5. Services (`services/`)

**Requirements Reference**: Requirements 23, 25 (Socket.IO, Cloudinary)

**Socket.IO Service** (`socketService.js`):

- Singleton Socket.IO client instance
- Configuration: withCredentials: true, autoConnect: false, reconnection with exponential backoff
- Methods: connect(), disconnect(), on(), off(), emit()
- Authentication: HTTP-only cookies (same JWT as HTTP)

**Socket Event Handlers** (`socketEvents.js`):

- Setup event handlers for real-time updates
- Invalidate RTK Query cache on events
- Show toast notifications for important events
- Events: task:created/updated/deleted/restored, notification:created, user:online/offline/away

**Cloudinary Service** (`cloudinaryService.js`):

- Direct upload to Cloudinary
- Return URL, publicId, format, size
- Client-side file validation before upload

#### 6. Hooks (`hooks/`)

**Requirements Reference**: Requirements 19, 23 (useAuth, useSocket)

**useAuth** (`useAuth.js`):

- Access authentication state and methods
- Methods: login, logout
- State: user, isAuthenticated

**useSocket** (`useSocket.js`):

- Access Socket.IO connection and methods
- Methods: on, off, emit
- Auto-connect on mount, disconnect on unmount

## Data Models

**Requirements Reference**: Requirement 3 (Mongoose Models with Soft Delete Plugin)

### Model Relationships

```
Organization (1) ──────────────────────────────────────────────────────────┐
│                                                                           │
├─→ Department (N)                                                         │
│   │                                                                       │
│   ├─→ User (N)                                                          │
│   │   │                                                                   │
│   │   ├─→ Task (N) [createdBy]                                          │
│   │   │   │                                                               │
│   │   │   ├─→ TaskActivity (N) [ProjectTask/AssignedTask only]         │
│   │   │   │   ├─→ TaskComment (N)                                       │
│   │   │   │   │   ├─→ TaskComment (N) [nested, max depth 3]            │
│   │   │   │   │   │   └─→ Attachment (N)                                │
│   │   │   │   │   └─→ Attachment (N)                                    │
│   │   │   │   └─→ Attachment (N)                                        │
│   │   │   │                                                               │
│   │   │   ├─→ TaskComment (N)                                           │
│   │   │   │   ├─→ TaskComment (N) [nested, max depth 3]                │
│   │   │   │   │   └─→ Attachment (N)                                    │
│   │   │   │   └─→ Attachment (N)                                        │
│   │   │   │                                                               │
│   │   │   └─→ Attachment (N)                                            │
│   │   │                                                                   │
│   │   ├─→ TaskActivity (N) [createdBy]                                  │
│   │   ├─→ TaskComment (N) [createdBy]                                   │
│   │   ├─→ Attachment (N) [uploadedBy]                                   │
│   │   ├─→ Material (N) [addedBy]                                        │
│   │   └─→ Notification (N) [createdBy]                                  │
│   │                                                                       │
│   ├─→ Task (N) [department]                                             │
│   ├─→ Material (N) [department]                                         │
│   └─→ Vendor (N) [department]                                           │
│                                                                           │
└─→ [All resources scoped to organization]                                │
```

### Schema Definitions

**Requirements Reference**: Requirement 3 (All Model Schemas)

#### Organization Schema

**Requirements Reference**: Requirement 3.6 (Organization Model)

```javascript
{
  name: String (required, unique per non-deleted, lowercase, max 100),
  description: String (required, max 2000),
  email: String (required, unique per non-deleted, valid email, max 50),
  phone: String (required, unique per non-deleted, E.164 format),
  address: String (required, max 500),
  industry: String (required, one of 24 industries, max 100),
  logo: {
    url: String (Cloudinary URL or image URL),
    publicId: String (required if logo, Cloudinary public ID)
  },
  createdBy: ObjectId (ref: User),
  isPlatformOrg: Boolean (default: false, immutable, indexed),
  // Soft delete fields (from plugin)
  isDeleted: Boolean (default: false, indexed),
  deletedAt: Date (default: null, indexed, TTL: never),
  deletedBy: ObjectId (ref: User, default: null),
  restoredAt: Date (default: null),
  restoredBy: ObjectId (ref: User, default: null),
  restoreCount: Number (default: 0),
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:

- `{ name: 1 }` - Unique, partial (isDeleted: false)
- `{ email: 1 }` - Unique, partial (isDeleted: false)
- `{ phone: 1 }` - Unique, partial (isDeleted: false)
- `{ isPlatformOrg: 1 }` - For platform organization queries

**Business Rules**:

- Only ONE platform organization (isPlatformOrg: true)
- isPlatformOrg is immutable after creation
- Platform organization CANNOT be deleted
- Cascade delete to all children using MongoDB transactions

#### User Schema

**Requirements Reference**: Requirement 3.8 (User Model)

```javascript
{
  firstName: String (required, max 20),
  lastName: String (required, max 20),
  position: String (required, max 100),
  role: String (enum: SuperAdmin, Admin, Manager, User, default: User),
  email: String (required, unique per org, valid email, lowercase, max 50),
  password: String (required, min 8, select: false, bcrypt hashed with 12 rounds),
  organization: ObjectId (required, ref: Organization),
  department: ObjectId (required, ref: Department),
  profilePicture: {
    url: String (Cloudinary URL or image URL),
    publicId: String (required if profilePicture, Cloudinary public ID)
  },
  skills: [{
    skill: String (max 50),
    percentage: Number (0-100)
  }] (max 10 skills),
  employeeId: Number (4-digit, 1000-9999, unique per org),
  dateOfBirth: Date (not in future),
  joinedAt: Date (required, not in future),
  emailPreferences: {
    enabled: Boolean (default: true),
    taskNotifications: Boolean (default: true),
    taskReminders: Boolean (default: true),
    mentions: Boolean (default: true),
    announcements: Boolean (default: true),
    welcomeEmails: Boolean (default: true),
    passwordReset: Boolean (default: true)
  },
  passwordResetToken: String (select: false, bcrypt hashed),
  passwordResetExpires: Date (select: false),
  isPlatformUser: Boolean (default: false, immutable, indexed),
  isHod: Boolean (default: false, indexed, Head of Department),
  lastLogin: Date (default: null),
  // Soft delete fields
  isDeleted: Boolean (default: false, indexed),
  deletedAt: Date (default: null, indexed, TTL: 365 days),
  deletedBy: ObjectId (ref: User, default: null),
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:

- `{ organization: 1, email: 1 }` - Unique, partial (isDeleted: false)
- `{ department: 1 }` - Unique for HOD roles, partial (role: SuperAdmin/Admin, isDeleted: false)
- `{ organization: 1, employeeId: 1 }` - Unique, partial (isDeleted: false, employeeId exists)
- `{ isPlatformUser: 1 }`, `{ isHod: 1 }`

**Business Rules**:

- isPlatformUser auto-set from organization's isPlatformOrg
- isHod auto-set to true for SuperAdmin/Admin, false for Manager/User
- Only ONE HOD (SuperAdmin or Admin) per department
- Cannot delete last SuperAdmin in organization
- Cannot delete last HOD in department

#### BaseTask Schema (Discriminator Pattern)

**Requirements Reference**: Requirement 3.9 (BaseTask Model with Discriminator)

```javascript
{
  title: String (required, max 50),
  description: String (required, max 2000),
  status: String (enum: To Do, In Progress, Completed, Pending, default: To Do),
  priority: String (enum: Low, Medium, High, Urgent, default: Medium),
  organization: ObjectId (required, ref: Organization),
  department: ObjectId (required, ref: Department),
  createdBy: ObjectId (required, ref: User),
  attachments: [ObjectId] (ref: Attachment, max 10, unique),
  watchers: [ObjectId] (ref: User, max 20, unique, HOD only),
  tags: [String] (max 5, max 50 chars each, unique case-insensitive),
  taskType: String (discriminator key: ProjectTask, RoutineTask, AssignedTask),
  // Soft delete fields
  isDeleted: Boolean (default: false, indexed),
  deletedAt: Date (default: null, indexed, TTL: 180 days),
  deletedBy: ObjectId (ref: User, default: null),
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**ProjectTask Additional Fields**:

**Requirements Reference**: Requirement 3.10 (ProjectTask Model)

```javascript
{
  vendor: ObjectId (required, ref: Vendor),
  estimatedCost: Number (min 0),
  actualCost: Number (min 0),
  currency: String (default: ETB),
  costHistory: [{
    amount: Number,
    type: String (estimated, actual),
    updatedBy: ObjectId (ref: User),
    updatedAt: Date
  }] (max 200 entries),
  startDate: Date,
  dueDate: Date
}
```

**RoutineTask Additional Fields**:

**Requirements Reference**: Requirement 3.11 (RoutineTask Model)

```javascript
{
  materials: [{
    material: ObjectId (ref: Material),
    quantity: Number (min 0)
  }] (max 20),
  date: Date (required),
}
```

**AssignedTask Additional Fields**:

**Requirements Reference**: Requirement 3.12 (AssignedTask Model)

```javascript
{
  assignee: ObjectId | [ObjectId] (required, ref: User),
  startDate: Date,
  dueDate: Date
}
```

## API Endpoints

**Requirements Reference**: Requirements 7-10 (All API Endpoints)

### Base URL

- **Development**: `http://localhost:4000/api`
- **Production**: `https://yourdomain.com/api`

### Authentication Endpoints

**Requirements Reference**: Requirement 7 (Authentication System)

#### POST /api/auth/register

**Requirements Reference**: Requirement 7.1 (Registration)

Register new organization with department and SuperAdmin user.

**Authentication**: None (public)
**Rate Limit**: 5 requests per 15 minutes

**Request Body**:

```json
{
  "organization": {
    "name": "string",
    "description": "string",
    "industry": "string",
    "email": "string",
    "phone": "string",
    "address": "string"
  },
  "department": {
    "name": "string",
    "description": "string"
  },
  "user": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "password": "string",
    "position": "string"
  }
}
```

**Response (201)**:

```json
{
  "success": true,
  "message": "Organization registered successfully",
  "data": {
    "organization": {
      /* organization object */
    },
    "department": {
      /* department object */
    },
    "user": {
      /* user object without password */
    }
  }
}
```

**Side Effects**:

- Creates organization (isPlatformOrg: false), department, and SuperAdmin user in transaction
- Sends welcome email
- Emits organization:created event

#### POST /api/auth/login

**Requirements Reference**: Requirement 7.3 (Login)

Authenticate user and set JWT tokens in HTTP-only cookies.

**Authentication**: None (public)
**Rate Limit**: 5 requests per 15 minutes

**Request Body**:

```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200)**:

```json
{
  "success": true,
  "message": "Login successful",
  "data": { user }
}
```

**Cookies Set**:

- `access_token`: JWT (15 min expiry, httpOnly, secure in prod, sameSite: strict)
- `refresh_token`: JWT (7 days expiry, httpOnly, secure in prod, sameSite: strict)

**Side Effects**:

- Updates user status to 'Online'
- Socket.IO: User joins rooms, emits user:online

#### DELETE /api/auth/logout

**Requirements Reference**: Requirement 7.4 (Logout)

Logout user and clear authentication cookies.

**Authentication**: Required (refresh token)
**Rate Limit**: 5 requests per 15 minutes

**Response (200)**:

```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Side Effects**:

- Clears access_token and refresh_token cookies
- Updates user status to 'Offline'
- Socket.IO: Disconnects user, emits user:offline

### Resource Endpoints Pattern

**Requirements Reference**: Requirements 8-10 (Organization/Department/User, Material/Vendor/Attachment/Notification, Task/Activity/Comment)

All resource endpoints follow consistent patterns:

#### List Resources: GET /api/{resource}

**Authentication**: Required
**Authorization**: Resource-specific read permission

**Query Parameters**:

- `page` (number): Page number (1-based, default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `sortBy` (string): Field to sort by (default: 'createdAt')
- `sortOrder` (string): 'asc' or 'desc' (default: 'desc')
- `search` (string): Search term for text fields
- `includeDeleted` (boolean): Include soft-deleted (SuperAdmin only)
- Resource-specific filters (status, priority, type, etc.)

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "{resource}": [
      /* array of resources */
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalCount": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**Note**: Backend uses 1-based pagination. Frontend MUI DataGrid uses 0-based. MuiDataGrid component auto-converts.

#### Get Single Resource: GET /api/{resource}/:id

**Authentication**: Required
**Authorization**: Resource-specific read permission

**Response (200)**:

```json
{
  "success": true,
  "data": {
    "{resource}": {
      /* resource object with populated references */
    }
  }
}
```

#### Create Resource: POST /api/{resource}

**Authentication**: Required
**Authorization**: Resource-specific create permission

**Request Body**: Resource-specific fields (see validators for exact field names)

**Response (201)**:

```json
{
  "success": true,
  "message": "{Resource} created successfully",
  "data": {
    "{resource}": {
      /* created resource object */
    }
  }
}
```

**Side Effects**:

- Emits {resource}:created event to appropriate rooms
- Creates notification for relevant users
- Sends email if preferences allow

#### Update Resource: PUT /api/{resource}/:id

**Authentication**: Required
**Authorization**: Resource-specific update permission

**Request Body**: Partial resource object (fields to update)

**Response (200)**:

```json
{
  "success": true,
  "message": "{Resource} updated successfully",
  "data": {
    "{resource}": {
      /* updated resource object */
    }
  }
}
```

**Side Effects**:

- Emits {resource}:updated event
- Creates notification for relevant users

#### Delete Resource: DELETE /api/{resource}/:id

**Authentication**: Required
**Authorization**: Resource-specific delete permission

**Response (200)**:

```json
{
  "success": true,
  "message": "{Resource} deleted successfully"
}
```

**Side Effects**:

- Soft deletes resource (isDeleted: true, deletedAt: now)
- Cascades to children using MongoDB transaction
- Emits {resource}:deleted event
- Creates notification for relevant users

#### Restore Resource: PATCH /api/{resource}/:id/restore

**Authentication**: Required
**Authorization**: Resource-specific update permission

**Response (200)**:

```json
{
  "success": true,
  "message": "{Resource} restored successfully",
  "data": {
    "{resource}": {
      /* restored resource object */
    }
  }
}
```

**Side Effects**:

- Restores resource (isDeleted: false, deletedAt: null, restoreCount++)
- Emits {resource}:restored event

## Security Design

**Requirements Reference**: Requirements 4, 7 (Security, Authentication, Authorization)

### Authentication Security

**Requirements Reference**: Requirement 7 (Authentication System)

**JWT Token System**:

- **Access Token**: 15 minutes expiry, stored in `access_token` HTTP-only cookie
- **Refresh Token**: 7 days expiry, stored in `refresh_token` HTTP-only cookie
- **Token Rotation**: New refresh token issued on each refresh (prevents token reuse)
- **Cookie Settings**:
  - `httpOnly: true` - Prevents JavaScript access (XSS protection)
  - `secure: true` (production) - HTTPS only
  - `sameSite: 'strict'` - CSRF protection
  - No tokens in localStorage or sessionStorage

**Password Security**:

- **Hashing**: Bcrypt with ≥12 salt rounds
- **Minimum Length**: 8 characters
- **Storage**: Never stored in plain text, never returned in API responses (select: false)
- **Reset Tokens**: Hashed with bcrypt (10 rounds), 1 hour expiry

**Password Reset Flow**:

1. User requests reset with email
2. Generate random token, hash with bcrypt
3. Store hashed token in user document with 1 hour expiry
4. Send email with unhashed token
5. User submits token + new password
6. Verify token, hash new password with bcrypt (12 rounds)
7. Update password, clear reset token
8. Always return success (prevents email enumeration)

### Authorization Security

**Requirements Reference**: Requirement 4 (Authorization Middleware), Requirement 2.2 (Authorization Matrix)

**Authorization Matrix** (`config/authorizationMatrix.json`):

- ONLY source of truth for permissions
- Structure: `{ Resource: { Role: { operation: [scopes] } } }`
- Roles: SuperAdmin, Admin, Manager, User (descending privileges)
- Operations: create, read, update, delete
- Scopes: own (user's resources), ownDept (same department), crossDept (other departments), crossOrg (other organizations)

**Platform vs Customer Organization**:

- **Platform SuperAdmin**: crossOrg scope for Organization resource, crossDept for all others
- **Customer SuperAdmin/Admin**: crossDept scope within own organization only
- **Manager/User**: ownDept scope only

**Authorization Flow**:

1. Extract user from req.user (set by verifyJWT middleware)
2. Get allowed scopes from authorization matrix for user role, resource, and operation
3. Determine request scope based on resource ownership and user context
4. Check if user's allowed scopes include request scope
5. Throw CustomError.forbidden if not authorized
6. Attach authorization info to req.authorization for controller use

**Multi-Tenancy Isolation**:

- All queries automatically scoped to user's organization
- Customer organizations cannot access other organizations' data
- Exception: Platform SuperAdmin can access all organizations

### Input Validation and Sanitization

**Requirements Reference**: Requirement 4.7 (Input Validation)

**Express-Validator**:

- All endpoints have validation rules in `middlewares/validators/*.js`
- Field names in validators are ONLY source of truth (frontend MUST match exactly)
- Validation: type, length, format, enum values, custom logic
- Error formatting: Consistent error messages with field, message, value

**NoSQL Injection Prevention**:

- `express-mongo-sanitize` removes `$` and `.` from user input
- Prevents MongoDB operator injection attacks
- Example: `{ "email": { "$gt": "" } }` → `{ "email": "" }`

**XSS Prevention**:

- HTTP-only cookies prevent JavaScript access to tokens
- Mongoose automatically escapes data
- CSP headers restrict script sources
- Input validation and sanitization on all user inputs

**CSRF Protection**:

- `sameSite: 'strict'` cookies prevent CSRF attacks
- No CSRF tokens needed with SameSite cookies
- Origin validation in CORS configuration

### Security Headers (Helmet)

**Requirements Reference**: Requirement 5.4 (Express App Configuration with Helmet)

**Content Security Policy (CSP)**:

```javascript
{
  defaultSrc: ["'self'"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  scriptSrc: ["'self'"],
  imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
  connectSrc: ["'self'", "wss:", "https://api.cloudinary.com"],
  fontSrc: ["'self'", "data:"],
  objectSrc: ["'none'"],
  mediaSrc: ["'self'", "https://res.cloudinary.com"],
  frameSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  upgradeInsecureRequests: []
}
```

**HTTP Strict Transport Security (HSTS)**:

- `maxAge: 31536000` (1 year)
- `includeSubDomains: true`
- `preload: true`
- Enforces HTTPS in production

**Other Headers**:

- `X-Frame-Options: deny` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - Browser XSS filter
- `Referrer-Policy: strict-origin-when-cross-origin`
- Hide `X-Powered-By` header

### Rate Limiting (Production Only)

**Requirements Reference**: Requirement 4.6 (Rate Limiting)

**General API Limiter**:

- 100 requests per 15 minutes per IP
- Applies to all `/api/*` endpoints except auth

**Auth Endpoints Limiter**:

- 5 requests per 15 minutes per IP
- Applies to: login, register, logout, refresh, forgot/reset password
- Prevents brute-force attacks

**Headers**:

- `X-RateLimit-Limit`: Total requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when limit resets

**Disabled in Development**: Rate limiting only active in production

### CORS Configuration

**Requirements Reference**: Requirement 2.1 (CORS Configuration)

**Origin Validation**:

- Development: `http://localhost:3000`, `http://localhost:5173`
- Production: `process.env.CLIENT_URL` + `process.env.ALLOWED_ORIGINS`
- NO wildcards in production
- Logging for rejected origins

**Configuration**:

- `credentials: true` - Enable cookies
- `methods`: GET, POST, PUT, PATCH, DELETE, OPTIONS
- `allowedHeaders`: Content-Type, Authorization, X-Requested-With
- `exposedHeaders`: X-Request-ID, X-RateLimit-\*
- `maxAge: 86400` - 24 hours preflight cache

## Testing Strategy

**Requirements Reference**: Requirement 6 (Test Setup with Real MongoDB Instance), Requirement 27 (Frontend Testing)

### Backend Testing

**Requirements Reference**: Requirement 6 (Test Setup with Real MongoDB Instance)

**Testing Framework**: Jest with ES modules support

**Test Types**:

1. **Unit Tests**: Test individual functions, methods, and modules
2. **Integration Tests**: Test API endpoints with Supertest
3. **Property-Based Tests**: Test universal properties with fast-check

**Test Infrastructure**:

- **Real MongoDB Instance**: Use real MongoDB test database (NEVER MongoDB Memory Server due to timeout issues)
- **Global Setup**: Connect to MongoDB test instance, set test env vars (MONGODB_TEST_URI)
- **Global Teardown**: Disconnect from MongoDB, cleanup
- **Test Setup**: Connect to test DB, clean collections after each test, drop test DB after all tests

**Jest Configuration**:

```javascript
{
  testEnvironment: "node",
  transform: {},
  extensionsToTreatAsEsm: [".js"],
  testMatch: ["**/tests/**/*.test.js", "**/tests/**/*.property.test.js"],
  maxWorkers: 1,  // Sequential execution for DB isolation
  testTimeout: 60000,  // 60 seconds for DB operations
  globalSetup: "./tests/globalSetup.js",
  globalTeardown: "./tests/globalTeardown.js",
  setupFilesAfterEnv: ["./tests/setup.js"]
}
```

**CRITICAL**: NEVER use MongoDB Memory Server as it causes timeout issues. Always use a real MongoDB test database instance.

````

**Coverage Requirements**:

- **Statements**: 80%+ (focus on core logic)
- **Branches**: 75%+ (test main paths and error cases)
- **Functions**: 80%+ (test all exported functions)
- **Lines**: 80%+ (similar to statements)

**What to Test**:

- Business logic (controllers, services)
- Data models (validation, hooks, methods)
- Authorization logic
- Soft delete and cascade operations
- API endpoints (integration tests)
- Universal properties (property-based tests)

**What NOT to Test**:

- External libraries (Express, Mongoose, etc.)
- Node.js built-ins
- Configuration objects
- Simple pass-through functions

**Test Patterns**:

```javascript
// Unit test pattern
describe("Model Name", () => {
  describe("Method Name", () => {
    test("should do something specific", async () => {
      // Arrange
      const input = { field: "value" };

      // Act
      const result = await Model.create(input);

      // Assert
      expect(result).toBeDefined();
      expect(result.field).toBe("value");
    });
  });
});

// Property-based test pattern
test("Property: Soft delete preserves data", () => {
  fc.assert(
    fc.asyncProperty(
      fc.record({ name: fc.string(), description: fc.string() }),
      async (data) => {
        const doc = await Model.create(data);
        await doc.softDelete();
        const found = await Model.findById(doc._id).withDeleted();
        return found !== null && found.isDeleted === true;
      }
    ),
    { numRuns: 100 }
  );
});
````

### Frontend Testing

**Requirements Reference**: Requirement 27 (Frontend Testing)

**Testing Framework**: Vitest + React Testing Library (recommended for future)

**Test Types**:

1. **Component Tests**: Test rendering, props, events, accessibility
2. **Hook Tests**: Test custom hooks (useAuth, useSocket)
3. **Integration Tests**: Test user flows and interactions
4. **E2E Tests**: Test complete user journeys (Playwright/Cypress)

**What to Test**:

- Component rendering with different props
- Form validation and submission
- User interactions (clicks, inputs, navigation)
- Error states and loading states
- Accessibility (ARIA labels, keyboard navigation)
- Custom hooks (useAuth, useSocket)
- Redux state management
- API integration (mocked)

**Test Patterns**:

```javascript
// Component test
describe("TaskCard", () => {
  it("renders task information", () => {
    const task = { title: "Test Task", status: "To Do" };
    render(<TaskCard task={task} />);
    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(screen.getByText("To Do")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    const task = { title: "Test Task" };
    render(<TaskCard task={task} onClick={handleClick} />);
    fireEvent.click(screen.getByText("Test Task"));
    expect(handleClick).toHaveBeenCalledWith(task);
  });
});

// Hook test
describe("useAuth", () => {
  it("provides login and logout functions", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.login).toBeDefined();
    expect(result.current.logout).toBeDefined();
  });
});
```

## Deployment Architecture

**Requirements Reference**: Requirement 29 (Documentation and Deployment)

### Production Environment

**Requirements Reference**: Requirement 29.4 (Deployment Guide)

**System Requirements**:

- **Node.js**: v20.x LTS or higher
- **MongoDB**: v7.0 or higher
- **npm**: v10.x or higher
- **Operating System**: Linux (Ubuntu 20.04+), macOS, or Windows 10+
- **Memory**: Minimum 2GB RAM (4GB+ recommended)
- **Storage**: Minimum 10GB free space

**Server Requirements**:

- **HTTPS**: SSL/TLS certificate required
- **Domain**: Registered domain name
- **Firewall**: Ports 80 (HTTP), 443 (HTTPS), 27017 (MongoDB - internal only)
- **Process Manager**: PM2 or systemd for Node.js process management
- **Reverse Proxy**: Nginx or Apache (recommended)

### Deployment Steps

1. **Clone Repository and Install Dependencies**:

```bash
git clone <repository-url>
cd task-manager

# Backend
cd backend
npm ci --production

# Frontend
cd ../client
npm ci
```

2. **Configure Environment Variables**:

```bash
# Backend .env
MONGODB_URI=mongodb://username:password@host:27017/task-manager
JWT_ACCESS_SECRET=<strong-random-secret-min-32-chars>
JWT_REFRESH_SECRET=<strong-random-secret-min-32-chars>
PORT=4000
CLIENT_URL=https://yourdomain.com
NODE_ENV=production
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=<gmail-app-password>
INITIALIZE_SEED_DATA=false

# Frontend .env
VITE_API_URL=https://yourdomain.com/api
VITE_PLATFORM_ORG=<platform-organization-id>
```

3. **Build Frontend**:

```bash
cd client
npm run build:prod
# Output: client/dist/
```

4. **Start Production Server**:

**Option A: PM2 (Recommended)**:

```bash
cd backend
pm2 start server.js --name task-manager-api -i max
pm2 save
pm2 startup
```

**Option B: systemd Service**:

```ini
[Unit]
Description=Task Manager API
After=network.target mongodb.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/task-manager/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

5. **Configure Nginx Reverse Proxy**:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # API proxy
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO proxy
    location /socket.io {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
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
    gzip_types text/plain text/css application/javascript application/json;
}
```

### Monitoring and Logging

**Requirements Reference**: Requirement 2.5 (Winston Logger), Requirement 29.5 (Monitoring)

**Application Logs**:

- **Location**: `backend/logs/`
- **Files**: `error.log`, `combined.log`
- **Format**: JSON (structured logging)
- **Rotation**: Daily rotation with 14-day retention (recommended)

**Log Monitoring**:

```bash
# View real-time logs
tail -f backend/logs/combined.log

# PM2 logs
pm2 logs task-manager-api
```

**Health Checks**:

```bash
# API health check
curl https://yourdomain.com/api/health

# Database connection check
curl https://yourdomain.com/api/health/db
```

**Monitoring Tools (Recommended)**:

- **PM2 Monitoring**: Built-in process monitoring
- **MongoDB Atlas**: Database monitoring and alerts
- **New Relic / DataDog**: Application performance monitoring
- **Sentry**: Error tracking and reporting
- **Uptime Robot**: Uptime monitoring

### Backup and Recovery

**Database Backup**:

```bash
# Manual backup
mongodump --uri="mongodb://username:password@host:27017/task-manager" --out=/backup/$(date +%Y%m%d)

# Automated daily backup (cron)
0 2 * * * mongodump --uri="mongodb://..." --out=/backup/$(date +\%Y\%m\%d) && find /backup -type d -mtime +7 -exec rm -rf {} \;
```

**Restore from Backup**:

```bash
mongorestore --uri="mongodb://username:password@host:27017/task-manager" /backup/20240101
```

**Application Backup**:

- Source code: Git repository
- Environment variables: Secure vault (AWS Secrets Manager, HashiCorp Vault)
- Uploaded files: Cloudinary (automatic backup)

### Security Hardening

**Production Security Checklist**:

- [ ] HTTPS enforced (secure cookies, HSTS header)
- [ ] Strong JWT secrets (min 32 characters, random)
- [ ] MongoDB authentication enabled
- [ ] Firewall configured (only necessary ports open)
- [ ] Rate limiting enabled
- [ ] CORS restricted to production domain
- [ ] Security headers (Helmet: CSP, X-Frame-Options, etc.)
- [ ] Input sanitization (NoSQL injection prevention)
- [ ] Password hashing (bcrypt, ≥12 salt rounds)
- [ ] HTTP-only cookies (prevents XSS)
- [ ] SameSite cookies (prevents CSRF)
- [ ] Regular dependency updates (`npm audit`)
- [ ] Environment variables not in source code
- [ ] Error messages don't expose sensitive info
- [ ] Logging doesn't include passwords/tokens

**SSL/TLS Certificate**:

```bash
# Let's Encrypt (free)
sudo certbot --nginx -d yourdomain.com
sudo certbot renew --dry-run
```

### Scaling Considerations

**Horizontal Scaling**:

- **Load Balancer**: Nginx, HAProxy, or cloud load balancer
- **Multiple Instances**: PM2 cluster mode (`-i max`)
- **Session Affinity**: Not required (stateless JWT auth)
- **Shared Storage**: Cloudinary for file uploads

**Vertical Scaling**:

- **CPU**: 2+ cores recommended
- **Memory**: 4GB+ RAM for production
- **Storage**: SSD for database

**Database Scaling**:

- **Replica Set**: MongoDB replica set for high availability
- **Sharding**: For very large datasets (>100GB)
- **Read Replicas**: For read-heavy workloads

## Implementation Phases

### Critical Implementation Workflow (MUST FOLLOW FOR EVERY TASK)

**MANDATORY WORKFLOW - NO EXCEPTIONS**:

**Phase Start**:

1. **Checkout New Branch**: `git checkout -b phase-X-[descriptive-name]` (e.g., phase-1-backend-core-config)
2. **Never proceed without creating a new branch first**

**Before Writing ANY Single Line of Code**:

1. **Search Existing Codebase**:

   - Search entire `backend/*` and `client/*` directories for existing implementations
   - Use grepSearch, fileSearch, and readFile tools to find all related files

2. **Deep Analysis**:

   - Make super deep analysis on EACH identified file
   - Extract EVERY logic, pattern, implementation detail, function, class, method
   - Understand the complete context and relationships

3. **Validate Against Specs**:

   - Read requirements.md and design.md thoroughly
   - Compare existing code against requirements and design documents
   - Identify gaps, inconsistencies, or missing implementations

4. **Decision and Action**:

   - **If code exists and meets requirements**: Keep as is
   - **If code exists but doesn't meet requirements**: Correct it to match specs exactly
   - **If code doesn't exist**: Implement according to requirements and design
   - **Never create duplicate files** - always check if file already exists first

5. **Implementation**:

   - Follow requirements.md and design.md exactly
   - Use constants from utils/constants.js (never hardcode)
   - Match backend validator field names exactly in frontend
   - Follow established patterns and conventions

6. **Test Everything** (CRITICAL - NO SKIPPING):

   - Write unit tests for all functions and methods
   - Write integration tests for all API endpoints
   - Write property-based tests for universal properties
   - Run ALL tests without skipping until ALL pass
   - Achieve minimum 80% statement coverage, 75% branch coverage
   - **NEVER use MongoDB Memory Server** - always use real MongoDB test instance
   - Fix all failing tests before proceeding

7. **Validation Before Merge**:

   - All tests passing (100% pass rate)
   - Coverage requirements met (80%+ statements, 75%+ branches)
   - No linting errors
   - Ensure there is no any kind of errors
   - Code follows established patterns

8. **Merge to Main**:
   - Only merge when phase is 100% complete
   - All tests passing
   - All tasks in phase completed
   - Code reviewed and validated
   - `git checkout main && git merge phase-X-[name] && git push`

**Testing Rules (CRITICAL)**:

- **NEVER use MongoDB Memory Server** - it causes timeout issues
- **ALWAYS use real MongoDB test instance** - configure MONGODB_TEST_URI in test environment
- **NEVER skip tests** - all tests must pass before proceeding
- **NEVER commit failing tests** - fix all issues before committing

**Branch Naming Convention**:

**Backend Phases**:

- Phase 1: `phase-1-backend-core` (Configuration, Utilities, Models, Error Handling, Middleware, Services, Templates, Server, Test Setup)
- Phase 2: `phase-2-routes-validators-controllers` (Auth, Organization/Department/User, Material/Vendor/Attachment/Notification, Task/TaskActivity/TaskComment)
- Phase 3: `phase-3-complete-backend` (Integration Testing, Code Quality, Documentation, Final Validation)

**Frontend Phases** (To be implemented after backend completion):

- Phase 4: `phase-4-frontend-redux-routing` (Redux store, API setup, routing, layouts)
- Phase 5: `phase-5-frontend-common-components` (Forms, DataGrid, filters, dialogs, loading components)
- Phase 6: `phase-6-frontend-auth` (Authentication and authorization pages)
- Phase 7: `phase-7-frontend-resource-mgmt` (Organization, Department, User, Material, Vendor management pages)
- Phase 8: `phase-8-frontend-task-notifications` (Task management, notifications, real-time updates, dashboard)

### Phase 1: Backend Core Configuration and Utilities

**Branch**: `phase-1-backend-core`

**Requirements Reference**: Requirement 2 (Configuration and Utilities)

**Task 1: Configuration Layer (`config/`)**

**Files to Implement**:

1. **`config/allowedOrigins.js`**:

   - Export array of allowed CORS origins
   - Development: `http://localhost:3000`, `http://localhost:5173`
   - Production: `process.env.CLIENT_URL` + additional origins from `process.env.ALLOWED_ORIGINS` (comma-separated)
   - NO wildcard origins in production
   - Validate all origins are valid URLs

2. **`config/authorizationMatrix.json`**:

   - ONLY source of truth for all role-based permissions
   - Structure: `{ Resource: { Role: { operation: [scopes] } } }`
   - Resources: Organization, Department, User, Task, TaskActivity, TaskComment, Material, Vendor, Attachment, Notification
   - Roles: SuperAdmin, Admin, Manager, User (descending privileges)
   - Operations: create, read, update, delete
   - Scopes: own (user's resources), ownDept (same department), crossDept (other departments), crossOrg (other organizations)
   - Platform SuperAdmin: crossOrg scope for Organization resource only, crossDept for all others
   - Customer SuperAdmin/Admin: crossDept scope within organization
   - Manager/User: ownDept scope only
   - Complete matrix with all combinations

3. **`config/corsOptions.js`**:

   - Import allowedOrigins from `./allowedOrigins.js`
   - Origin validation function: check if origin in allowedOrigins or undefined (same-origin)
   - Log rejected origins with logger
   - Configuration: `credentials: true`, `methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']`
   - Allowed headers: `Content-Type`, `Authorization`, `X-Requested-With`
   - Exposed headers: `X-Request-ID`, `X-RateLimit-*`
   - Max age: 86400 (24 hours)

4. **`config/db.js`**:
   - MongoDB connection with Mongoose
   - Connection string from `process.env.MONGODB_URI`
   - Options: `serverSelectionTimeoutMS: 5000`, `socketTimeoutMS: 45000`
   - Connection pooling: `minPoolSize: 2`, `maxPoolSize: 10`
   - Retry logic: Exponential backoff (1s, 2s, 4s, 8s, 16s, 30s max), max 10 retries
   - Connection event handlers: connected, error, disconnected
   - Health check function: ping database every 30 seconds
   - Graceful shutdown: close connection on SIGINT/SIGTERM
   - Export `connectDB()` function

**Task 2: Utilities Layer (`utils/`)**

**Files to Implement**:

1. **`utils/constants.js`**:

   - ONLY source of truth for ALL enum values and limits
   - User roles: `['SuperAdmin', 'Admin', 'Manager', 'User']`
   - Task status: `['To Do', 'In Progress', 'Completed', 'Pending']`
   - Task priority: `['Low', 'Medium', 'High', 'Urgent']`
   - Task types: `['ProjectTask', 'RoutineTask', 'AssignedTask']`
   - Material categories: `['Electrical', 'Mechanical', 'Plumbing', 'Hardware', 'Cleaning', 'Textiles', 'Consumables', 'Construction', 'Other']`
   - Unit types: `['pcs', 'kg', 'g', 'l', 'ml', 'm', 'cm', 'mm', 'm2', 'm3', 'box', 'pack', 'roll', 'sheet', 'bag', 'bottle', 'can', 'jar', 'tube', 'set', 'pair', 'dozen', 'gross', 'carton', 'pallet', 'bundle', 'coil', 'reel', 'spool', 'drum']`
   - Attachment types: `['Image', 'Video', 'Document', 'Audio', 'Other']`
   - Notification types: `['Created', 'Updated', 'Deleted', 'Restored', 'Mention', 'Welcome', 'Announcement']`
   - User status: `['Online', 'Offline', 'Away']`
   - Industries: `['Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail', 'Construction', 'Transportation', 'Hospitality', 'Real Estate', 'Agriculture', 'Energy', 'Telecommunications', 'Media', 'Entertainment', 'Legal', 'Consulting', 'Non-Profit', 'Government', 'Automotive', 'Aerospace', 'Pharmaceutical', 'Food & Beverage', 'Other']`
   - Pagination defaults: `DEFAULT_PAGE: 1`, `DEFAULT_LIMIT: 10`, `MAX_LIMIT: 100`
   - Validation limits: `MAX_TAGS: 5`, `MAX_WATCHERS: 20`, `MAX_ASSIGNEES: 20`, `MAX_MATERIALS: 20`, `MAX_ATTACHMENTS: 10`, `MAX_SKILLS: 10`, `MAX_MENTIONS: 5`, `MAX_COMMENT_DEPTH: 3`, `MAX_COST_HISTORY: 200`, `MAX_BULK_NOTIFICATIONS: 500`
   - Length limits: `MAX_TITLE_LENGTH: 50`, `MAX_DESCRIPTION_LENGTH: 2000`, `MAX_NAME_LENGTH: 100`, `MAX_EMAIL_LENGTH: 50`, `MAX_PHONE_LENGTH: 20`, `MAX_ADDRESS_LENGTH: 500`, `MAX_POSITION_LENGTH: 100`, `MAX_SKILL_LENGTH: 50`, `MAX_TAG_LENGTH: 50`, `MAX_COMMENT_LENGTH: 1000`
   - File size limits (bytes): `MAX_IMAGE_SIZE: 10485760` (10MB), `MAX_VIDEO_SIZE: 104857600` (100MB), `MAX_DOCUMENT_SIZE: 26214400` (25MB), `MAX_AUDIO_SIZE: 20971520` (20MB), `MAX_OTHER_SIZE: 52428800` (50MB)
   - TTL values (days): `TTL_ORGANIZATION: null` (never), `TTL_DEPARTMENT: 365`, `TTL_USER: 365`, `TTL_TASK: 180`, `TTL_ACTIVITY: 90`, `TTL_COMMENT: 90`, `TTL_MATERIAL: 180`, `TTL_VENDOR: 180`, `TTL_ATTACHMENT: 90`, `TTL_NOTIFICATION: 30`
   - JWT expiry: `ACCESS_TOKEN_EXPIRY: '15m'`, `REFRESH_TOKEN_EXPIRY: '7d'`
   - Bcrypt salt rounds: `BCRYPT_SALT_ROUNDS: 12`, `BCRYPT_RESET_TOKEN_ROUNDS: 10`
   - Rate limiting: `RATE_LIMIT_WINDOW: 900000` (15 min), `RATE_LIMIT_MAX_GENERAL: 100`, `RATE_LIMIT_MAX_AUTH: 5`
   - Export all as named exports

2. **`utils/authorizationMatrix.js`**:

   - Import authorizationMatrix from `../config/authorizationMatrix.json`
   - `hasPermission(role, resource, operation, scope)`: Check if role has permission for operation on resource with scope
   - `getAllowedScopes(role, resource, operation)`: Get array of allowed scopes for role, resource, and operation
   - Return empty array if no permissions found
   - Export functions

3. **`utils/generateTokens.js`**:

   - Import jwt from `jsonwebtoken`
   - Import constants from `./constants.js`
   - `generateAccess_token(userId)`: Create JWT with payload `{ userId }`, secret `process.env.JWT_ACCESS_SECRET`, expiry from constants
   - `generateRefresh_token(userId)`: Create JWT with payload `{ userId }`, secret `process.env.JWT_REFRESH_SECRET`, expiry from constants
   - `setTokenCookies(res, access_token, refresh_token)`: Set HTTP-only cookies with proper security settings
   - Cookie options: `httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`, `sameSite: 'strict'`, `maxAge` from token expiry
   - Export functions

4. **`utils/logger.js`**:

   - Import winston from `winston`
   - Create logger with transports: Console (development only), File (error.log for errors, combined.log for all)
   - Format: JSON with timestamp, level, message, metadata
   - Log levels: error, warn, info, http, debug
   - File rotation: Daily rotation with 14-day retention (recommended)
   - Export logger instance

5. **`utils/validateEnv.js`**:

   - Validate required environment variables on startup
   - Required: `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `PORT`, `CLIENT_URL`, `NODE_ENV`, `EMAIL_USER`, `EMAIL_PASSWORD`
   - Optional: `ALLOWED_ORIGINS`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - Throw error if required variables missing
   - Validate JWT secrets are at least 32 characters
   - Validate PORT is a number
   - Validate NODE_ENV is 'development' or 'production'
   - Export `validateEnv()` function

6. **`utils/helpers.js`**:

   - `formatResponse(success, message, data)`: Standard success/error response format
   - `formatPaginatedResponse(data, pagination)`: Paginated list response with metadata
   - `calculatePagination(page, limit, totalCount)`: Calculate pagination metadata (totalPages, hasNext, hasPrev)
   - `sanitizeUser(user)`: Remove password and sensitive fields from user object
   - `generateEmployeeId()`: Generate random 4-digit employee ID (1000-9999)
   - `isValidObjectId(id)`: Check if string is valid MongoDB ObjectId
   - Export all functions

7. **`utils/validate.js`**:
   - Import validationResult from `express-validator`
   - `validate(req, res, next)`: Middleware to format validation errors
   - Extract errors from validationResult
   - Format errors: `{ field, message, value }`
   - Throw CustomError.badRequest with formatted errors if validation fails
   - Call next() if no errors
   - Export validate function

**Completion Criteria**:

- [ ] All 11 files implemented with complete functionality
- [ ] All functions exported and importable
- [ ] Constants file is comprehensive and complete (ONLY source of truth)
- [ ] Authorization matrix covers all resources, roles, operations, and scopes
- [ ] CORS configuration validates origins and logs rejections
- [ ] MongoDB connection with retry logic and health checks
- [ ] JWT token generation with proper expiry and cookie settings
- [ ] Winston logger with file transports and proper formatting
- [ ] Environment validation on startup
- [ ] Helper functions for response formatting and pagination
- [ ] Validation middleware for express-validator
- [ ] No hardcoded values - all constants imported from constants.js
- [ ] All code follows ES modules syntax (import/export)
- [ ] No linting errors
- [ ] Code is well-documented with JSDoc comments

### Phase 2: Mongoose Models with Soft Delete Plugin

**Branch**: `phase-2-mongoose-models`

**Requirements Reference**: Requirement 3 (Mongoose Models with Soft Delete Plugin)

**Task 1: Soft Delete Plugin (`models/plugins/softDelete.js`)**

**Implementation**:

- Universal soft delete plugin for all Mongoose schemas
- Add fields: `isDeleted` (Boolean, default: false, indexed), `deletedAt` (Date, default: null, indexed), `deletedBy` (ObjectId ref User, default: null), `restoredAt` (Date, default: null), `restoredBy` (ObjectId ref User, default: null), `restoreCount` (Number, default: 0)
- Query helpers: `withDeleted()` (include soft-deleted), `onlyDeleted()` (only soft-deleted)
- Instance methods: `softDelete(userId)` (set isDeleted: true, deletedAt: now, deletedBy: userId), `restore(userId)` (set isDeleted: false, deletedAt: null, restoredAt: now, restoredBy: userId, increment restoreCount)
- Static methods: `softDeleteById(id, userId)`, `restoreById(id, userId)`, `softDeleteMany(filter, userId)`, `restoreMany(filter, userId)`
- Pre-find hooks: Automatically filter out soft-deleted documents (unless withDeleted() or onlyDeleted() used)
- Hard delete protection: Override and block `deleteOne`, `deleteMany`, `findOneAndDelete`, `remove` methods (throw error)
- TTL index creation: `createTTLIndex(ttlDays)` method to create TTL index on deletedAt field
- Export plugin function

**Completion Criteria**:

- [ ] Plugin adds all soft delete fields to schema
- [ ] Query helpers work correctly (withDeleted, onlyDeleted)
- [ ] Instance methods work correctly (softDelete, restore)
- [ ] Static methods work correctly (softDeleteById, restoreById, softDeleteMany, restoreMany)
- [ ] Pre-find hooks automatically filter soft-deleted documents
- [ ] Hard delete methods are blocked and throw errors
- [ ] TTL index creation method works correctly
- [ ] Plugin is reusable across all models

**Task 2: Core Models**

**Files to Implement**:

1. **`models/Organization.js`**:

   - Schema fields: `name` (String, required, unique per non-deleted, lowercase, max 100), `description` (String, required, max 2000), `email` (String, required, unique per non-deleted, valid email, max 50), `phone` (String, required, unique per non-deleted, E.164 format), `address` (String, required, max 500), `industry` (String, required, enum from constants, max 100), `logo` (Object: url String, publicId String), `createdBy` (ObjectId ref User), `isPlatformOrg` (Boolean, default: false, immutable, indexed)
   - Apply softDelete plugin with TTL: null (never expires)
   - Unique indexes: `{ name: 1 }`, `{ email: 1 }`, `{ phone: 1 }` (all partial: isDeleted: false)
     -: `{ isPlatformOrg: 1 }`
   - Validation: Only ONE platform organization (isPlatformOrg: true)
   - Pre-save hook: Prevent changing isPlatformOrg after creation
   - Pre-delete hook: Prevent deleting platform organization
   - Timestamps: true
   - Export Organization model

2. **`models/Department.js`**:

   - Schema fields: `name` (String, required, max 100), `description` (String, required, max 2000), `organization` (ObjectId, required, ref Organization), `createdBy` (ObjectId ref User)
   - Apply softDelete plugin with TTL: 365 days
   - Unique index: `{ organization: 1, name: 1 }` (partial: isDeleted: false)
   - Indexes: `{ organization: 1 }`, `{ createdBy: 1 }`
   - Timestamps: true
   - Export Department model

3. **`models/User.js`**:

   - Schema fields: `firstName` (String, required, max 20), `lastName` (String, required, max 20), `position` (String, required, max 100), `role` (String, enum from constants, default: User), `email` (String, required, unique per org, valid email, lowercase, max 50), `password` (String, required, min 8, select: false), `organization` (ObjectId, required, ref Organization), `department` (ObjectId, required, ref Department), `profilePicture` (Object: url String, publicId String), `skills` (Array of Objects: skill String max 50, percentage Number 0-100, max 10 skills), `employeeId` (Number, 4-digit 1000-9999, unique per org), `dateOfBirth` (Date, not in future), `joinedAt` (Date, required, not in future), `emailPreferences` (Object: enabled Boolean default true, taskNotifications Boolean default true, taskReminders Boolean default true, mentions Boolean default true, announcements Boolean default true, welcomeEmails Boolean default true, passwordReset Boolean default true), `passwordResetToken` (String, select: false), `passwordResetExpires` (Date, select: false), `isPlatformUser` (Boolean, default: false, immutable, indexed), `isHod` (Boolean, default: false, indexed), `lastLogin` (Date, default: null), `status` (String, enum from constants, default: Offline)
   - Apply softDelete plugin with TTL: 365 days
   - Unique indexes: `{ organization: 1, email: 1 }` (partial: isDeleted: false), `{ organization: 1, employeeId: 1 }` (partial: isDeleted: false, employeeId exists)
   - Unique HOD index: `{ department: 1 }` (partial: role: SuperAdmin/Admin, isDeleted: false)
   - Indexes: `{ organization: 1 }`, `{ department: 1 }`, `{ isPlatformUser: 1 }`, `{ isHod: 1 }`
   - Pre-save hook: Hash password with bcrypt (12 rounds) if modified
   - Pre-save hook: Auto-set isPlatformUser from organization's isPlatformOrg
   - Pre-save hook: Auto-set isHod to true for SuperAdmin/Admin, false for Manager/User
   - Pre-save hook: Validate only ONE HOD per department
   - Pre-delete hook: Prevent deleting last SuperAdmin in organization
   - Pre-delete hook: Prevent deleting last HOD in department
   - Instance method: `comparePassword(candidatePassword)` - compare with bcrypt
   - Timestamps: true
   - Export User model

4. **`models/BaseTask.js`**:

   - Schema fields: `title` (String, required, max 50), `description` (String, required, max 2000), `status` (String, enum from constants, default: To Do), `priority` (String, enum from constants, default: Medium), `organization` (ObjectId, required, ref Organization), `department` (ObjectId, required, ref Department), `createdBy` (ObjectId, required, ref User), `attachments` (Array of ObjectId ref Attachment, max 10, unique), `watchers` (Array of ObjectId ref User, max 20, unique), `tags` (Array of String, max 5, max 50 chars each, unique case-insensitive)
   - Discriminator key: `taskType` (String, required)
   - Apply softDelete plugin with TTL: 180 days
   - Indexes: `{ organization: 1 }`, `{ department: 1 }`, `{ createdBy: 1 }`, `{ status: 1 }`, `{ priority: 1 }`, `{ taskType: 1 }`, `{ tags: 1 }`
   - Pre-save hook: Validate watchers are HOD (SuperAdmin/Admin) only
   - Pre-save hook: Normalize tags to lowercase for uniqueness check
   - Timestamps: true
   - Export BaseTask model

5. **`models/ProjectTask.js`**:

   - Discriminator of BaseTask with taskType: 'ProjectTask'
   - Additional fields: `vendor` (ObjectId, required, ref Vendor), `assignees` (Array of ObjectId ref User, max 20), `estimatedCost` (Number, min 0), `actualCost` (Number, min 0), `currency` (String, default: ETB), `costHistory` (Array of Objects: amount Number, type String enum [estimated, actual], updatedBy ObjectId ref User, updatedAt Date, max 200 entries), `startDate` (Date), `dueDate` (Date)
   - Pre-save hook: Add to costHistory when estimatedCost or actualCost changes
   - Validation: dueDate must be after startDate if both provided
   - Export ProjectTask model

6. **`models/RoutineTask.js`**:

   - Discriminator of BaseTask with taskType: 'RoutineTask'
   - Additional fields: `materials` (Array of Objects: material ObjectId ref Material, quantity Number min 0, max 20), `date` (Date, required)
   - Validation: status cannot be "To Do"
   - Validation: priority cannot be "Low"
   - Export RoutineTask model

7. **`models/AssignedTask.js`**:

   - Discriminator of BaseTask with taskType: 'AssignedTask'
   - Additional fields: `assignee` (Mixed: ObjectId or Array of ObjectId, required, ref User), `startDate` (Date), `dueDate` (Date)
   - Validation: dueDate must be after startDate if both provided
   - Pre-save hook: Convert single assignee to array for consistency
   - Export AssignedTask model

8. **`models/TaskActivity.js`**:

   - Schema fields: `task` (ObjectId, required, ref BaseTask), `description` (String, required, max 2000), `materials` (Array of Objects: material ObjectId ref Material, quantity Number min 0, attachments Array of ObjectId ref Attachment, max 20), `createdBy` (ObjectId, required, ref User), `organization` (ObjectId, required, ref Organization), `department` (ObjectId, required, ref Department)
   - Apply softDelete plugin with TTL: 90 days
   - Indexes: `{ task: 1 }`, `{ createdBy: 1 }`, `{ organization: 1 }`, `{ department: 1 }`
   - Validation: Parent task must be ProjectTask or AssignedTask (NOT RoutineTask)
   - Timestamps: true
   - Export TaskActivity model

9. **`models/TaskComment.js`**:

   - Schema fields: `parent` (ObjectId, required, refPath: parentModel), `parentModel` (String, required, enum: [BaseTask, TaskActivity, TaskComment]), `content` (String, required, max 1000), `mentions` (Array of ObjectId ref User, max 5), `attachments` (Array of ObjectId ref Attachment, max 10), `depth` (Number, default: 0, max: 3), `createdBy` (ObjectId, required, ref User), `organization` (ObjectId, required, ref Organization), `department` (ObjectId, required, ref Department)
   - Apply softDelete plugin with TTL: 90 days
   - Indexes: `{ parent: 1, parentModel: 1 }`, `{ createdBy: 1 }`, `{ organization: 1 }`, `{ department: 1 }`
   - Pre-save hook: Calculate depth from parent comment (max 3 levels)
   - Validation: Depth cannot exceed 3
   - Timestamps: true
   - Export TaskComment model

10. **`models/Material.js`**:

    - Schema fields: `name` (String, required, max 100), `description` (String, max 2000), `category` (String, required, enum from constants), `unit` (String, required, enum from constants), `quantity` (Number, required, min 0), `reorderLevel` (Number, min 0), `vendor` (ObjectId, ref Vendor), `department` (ObjectId, required, ref Department), `organization` (ObjectId, required, ref Organization), `addedBy` (ObjectId, required, ref User)
    - Apply softDelete plugin with TTL: 180 days
    - Indexes: `{ department: 1 }`, `{ organization: 1 }`, `{ category: 1 }`, `{ vendor: 1 }`
    - Timestamps: true
    - Export Material model

11. **`models/Vendor.js`**:

    - Schema fields: `name` (String, required, max 100), `contactPerson` (String, required, max 100), `email` (String, required, valid email, max 50), `phone` (String, required, E.164 format), `address` (String, required, max 500), `department` (ObjectId, required, ref Department), `organization` (ObjectId, required, ref Organization), `createdBy` (ObjectId, required, ref User)
    - Apply softDelete plugin with TTL: 180 days
    - Indexes: `{ department: 1 }`, `{ organization: 1 }`, `{ email: 1 }`
    - Pre-delete hook: Check if vendor has materials, require reassignment
    - Timestamps: true
    - Export Vendor model

12. **`models/Attachment.js`**:

    - Schema fields: `filename` (String, required), `url` (String, required), `publicId` (String, required), `type` (String, required, enum from constants), `size` (Number, required), `format` (String), `parent` (ObjectId, required, refPath: parentModel), `parentModel` (String, required, enum: [BaseTask, TaskActivity, TaskComment]), `uploadedBy` (ObjectId, required, ref User), `organization` (ObjectId, required, ref Organization), `department` (ObjectId, required, ref Department)
    - Apply softDelete plugin with TTL: 90 days
    - Indexes: `{ parent: 1, parentModel: 1 }`, `{ uploadedBy: 1 }`, `{ organization: 1 }`, `{ department: 1 }`
    - Validation: Size limits based on type (from constants)
    - Timestamps: true
    - Export Attachment model

13. **`models/Notification.js`**:
    - Schema fields: `recipient` (ObjectId, required, ref User), `type` (String, required, enum from constants), `title` (String, required, max 100), `message` (String, required, max 500), `relatedResource` (ObjectId, refPath: relatedModel), `relatedModel` (String, enum: [BaseTask, TaskActivity, TaskComment, User, Organization, Department]), `isRead` (Boolean, default: false), `readAt` (Date), `expiresAt` (Date), `createdBy` (ObjectId, ref User), `organization` (ObjectId, required, ref Organization)
    - Apply softDelete plugin with TTL: 30 days (or custom expiresAt)
    - Indexes: `{ recipient: 1, isRead: 1 }`, `{ organization: 1 }`, `{ expiresAt: 1 }` (TTL index)
    - Timestamps: true
    - Export Notification model

**Completion Criteria**:

- [ ] Soft delete plugin implemented and tested
- [ ] All 13 models implemented with complete schemas
- [ ] All models use softDelete plugin with appropriate TTL values
- [ ] All unique indexes created with partial filters (isDeleted: false)
- [ ] All regular indexes created for query optimization
- [ ] All validation rules implemented (length, enum, custom)
- [ ] All pre-save hooks implemented (password hashing, auto-set fields, validation)
- [ ] All pre-delete hooks implemented (prevent deletion of critical resources)
- [ ] Discriminator pattern working for BaseTask (ProjectTask, RoutineTask, AssignedTask)
- [ ] Polymorphic references working (TaskComment, Attachment)
- [ ] All constants imported from utils/constants.js (no hardcoded values)
- [ ] All models export correctly
- [ ] No linting errors
- [ ] Code is well-documented with JSDoc comments

### Phase 3: Error Handling and Middleware

**Branch**: `phase-3-error-handling-middleware`

**Requirements Reference**: Requirement 4 (Error Handling and Middleware)

**Task 1: Error Handling (`errorHandler/`)**

**Files to Implement**:

1. **`errorHandler/CustomError.js`**:

   - Custom error class extending Error
   - Constructor: `constructor(message, statusCode, errors = [])`
   - Properties: `message`, `statusCode`, `errors`, `isOperational: true`
   - Static factory methods:
     - `badRequest(message, errors = [])` - 400
     - `authenticated(message)` - 401
     - `unauthorized(message)` - 403
     - `notFound(message)` - 404
     - `conflict(message)` - 409
     - `unprocessableEntity(message, errors = [])` - 422
     - `tooManyRequests(message)` - 429
     - `internalServer(message)` - 500
   - Export CustomError class

2. **`errorHandler/ErrorController.js`**:
   - Global error handling middleware
   - Function signature: `errorHandler(err, req, res, next)`
   - Handle CustomError: Send statusCode, message, errors
   - Handle Mongoose ValidationError: Convert to CustomError.badRequest with formatted errors
   - Handle Mongoose CastError: Convert to CustomError.badRequest (invalid ID)
   - Handle Mongoose 11000 (duplicate key): Convert to CustomError.conflict
   - Handle JWT errors: Convert to CustomError.unauthorized
   - Handle Multer errors: Convert to CustomError.badRequest
   - Log all errors with logger (include request ID, user, stack trace)
   - Development: Include stack trace in response
   - Production: Generic error message for non-operational errors
   - Export errorHandler middleware

**Completion Criteria**:

- [ ] CustomError class with all factory methods
- [ ] Global error handler catches all error types
- [ ] Mongoose errors converted to CustomError
- [ ] JWT errors converted to CustomError
- [ ] All errors logged with logger
- [ ] Stack trace included in development only
- [ ] Generic error message in production for non-operational errors

**Task 2: Authentication Middleware (`middlewares/authMiddleware.js`)**

**Implementation**:

1. **`verifyJWT` middleware**:

   - Extract `access_token` from cookies
   - If no token: throw CustomError.unauthorized('Access token required')
   - Verify token with `JWT_ACCESS_SECRET`
   - If invalid/expired: throw CustomError.unauthorized('Invalid or expired access token')
   - Decode userId from token payload
   - Find user by userId with `User.findById(userId).select('+password')`
   - If user not found or soft-deleted: throw CustomError.unauthorized('User not found')
   - Attach user to `req.user` (without password)
   - Call next()

2. **`verifyRefresh_token` middleware**:
   - Extract `refresh_token` from cookies
   - If no token: throw CustomError.unauthorized('Refresh token required')
   - Verify token with `JWT_REFRESH_SECRET`
   - If invalid/expired: throw CustomError.unauthorized('Invalid or expired refresh token')
   - Decode userId from token payload
   - Find user by userId
   - If user not found or soft-deleted: throw CustomError.unauthorized('User not found')
   - Attach user to `req.user`
   - Call next()

**Completion Criteria**:

- [ ] verifyJWT middleware extracts and verifies access token
- [ ] verifyRefresh_token middleware extracts and verifies refresh token
- [ ] Both middlewares find user and attach to req.user
- [ ] Both middlewares throw CustomError.unauthorized for invalid/missing tokens
- [ ] Both middlewares check user exists and not soft-deleted
- [ ] Password field excluded from req.user

**Task 3: Authorization Middleware (`middlewares/authorization.js`)**

**Implementation**:

1. **`authorize(resource, operation)` middleware factory**:

   - Return middleware function: `(req, res, next)`
   - Extract user from `req.user` (set by verifyJWT)
   - Get allowed scopes from authorizationMatrix using `getAllowedScopes(user.role, resource, operation)`
   - If no allowed scopes: throw CustomError.forbidden('Insufficient permissions')
   - Determine request scope based on resource ownership and user context:
     - `own`: Resource belongs to user (createdBy === user.\_id)
     - `ownDept`: Resource belongs to user's department (department === user.department)
     - `crossDept`: Resource belongs to different department in same organization (organization === user.organization)
     - `crossOrg`: Resource belongs to different organization
   - Check if user's allowed scopes include request scope
   - If not authorized: throw CustomError.forbidden('Insufficient permissions for this scope')
   - Attach authorization info to `req.authorization` (allowedScopes, requestScope)
   - Call next()

2. **Scope determination logic**:
   - Extract resource from request (body, params, or query)
   - For create operations: Use req.body fields
   - For read/update/delete operations: Fetch resource from database first
   - Compare resource fields with user fields to determine scope
   - Platform SuperAdmin: crossOrg scope for Organization resource, crossDept for others
   - Customer SuperAdmin/Admin: crossDept scope within organization
   - Manager/User: ownDept scope only

**Completion Criteria**:

- [ ] authorize middleware factory creates middleware for resource and operation
- [ ] Middleware gets allowed scopes from authorization matrix
- [ ] Middleware determines request scope correctly
- [ ] Middleware checks if user has permission for scope
- [ ] Middleware throws CustomError.forbidden if not authorized
- [ ] Middleware attaches authorization info to req.authorization
- [ ] Platform vs Customer organization logic implemented correctly
- [ ] Scope determination logic handles all cases (own, ownDept, crossDept, crossOrg)

**Task 4: Rate Limiting Middleware (`middlewares/rateLimiter.js`)**

**Implementation**:

1. **General API rate limiter**:

   - Use `express-rate-limit` package
   - Window: 15 minutes (from constants)
   - Max requests: 100 (from constants)
   - Message: 'Too many requests, please try again later'
   - Headers: true (X-RateLimit-\*)
   - Skip: Development environment (NODE_ENV !== 'production')
   - Key generator: IP address
   - Handler: throw CustomError.tooManyRequests(message)

2. **Auth endpoints rate limiter**:

   - Window: 15 minutes (from constants)
   - Max requests: 5 (from constants)
   - Message: 'Too many authentication attempts, please try again later'
   - Headers: true
   - Skip: Development environment
   - Key generator: IP address
   - Handler: throw CustomError.tooManyRequests(message)

3. **Export both limiters**:
   - `generalLimiter`: For all /api/\* endpoints
   - `authLimiter`: For /api/auth/\* endpoints

**Completion Criteria**:

- [ ] General API rate limiter configured correctly
- [ ] Auth endpoints rate limiter configured correctly
- [ ] Both limiters skip in development environment
- [ ] Both limiters use IP address as key
- [ ] Both limiters throw CustomError.tooManyRequests when exceeded
- [ ] Both limiters set X-RateLimit-\* headers
- [ ] Constants imported from utils/constants.js

**Completion Criteria for Phase 3**:

- [ ] All error handling files implemented
- [ ] CustomError class with all factory methods
- [ ] Global error handler catches and formats all errors
- [ ] Authentication middleware (verifyJWT, verifyRefresh_token) implemented
- [ ] Authorization middleware (authorize) implemented with scope checking
- [ ] Rate limiting middleware implemented for general and auth endpoints
- [ ] All middlewares throw CustomError for consistency
- [ ] All middlewares log errors with logger
- [ ] All constants imported from utils/constants.js
- [ ] No linting errors
- [ ] Code is well-documented with JSDoc comments

### Phase 4: Services, Templates, and Server Setup

**Branch**: `phase-4-services-templates-server`

**Requirements Reference**: Requirement 5 (Services, Templates, and Server Setup), Requirement 14 (Email Notification System)

**Task 1: Email Service (`services/emailService.js`)**

**Implementation**:

- Import nodemailer, logger, and email templates
- Create transporter with Gmail SMTP configuration:
  - Host: `smtp.gmail.com`
  - Port: 587
  - Secure: false (use STARTTLS)
  - Auth: `{ user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD }`
- In-memory async queue for non-blocking email sending
- `sendEmail(to, subject, html)`: Send email with retry logic (max 3 attempts)
- `queueEmail(to, subject, html)`: Add email to queue for async sending
- Template-specific functions:
  - `sendWelcomeEmail(user)`: Welcome email with user details
  - `sendTaskNotification(user, task, action)`: Task created/updated/deleted notification
  - `sendMentionNotification(user, comment, task)`: Mention notification
  - `sendPasswordResetEmail(user, resetToken)`: Password reset email with token link
  - `sendAnnouncementEmail(users, announcement)`: Bulk announcement email
- Error handling: Log errors, don't throw (email failures shouldn't break app)
- Export all functions

**Completion Criteria**:

- [ ] Nodemailer transporter configured with Gmail SMTP
- [ ] Async queue for non-blocking email sending
- [ ] sendEmail function with retry logic
- [ ] All template-specific email functions implemented
- [ ] Error handling logs errors without throwing
- [ ] Email preferences checked before sending

**Task 2: Notification Service (`services/notificationService.js`)**

**Implementation**:

- Import Notification model, Socket.IO emitter, email service
- `createNotification(data)`: Create single notification document
  - Fields: recipient, type, title, message, relatedResource, relatedModel, organization, createdBy
  - Set expiresAt based on TTL (30 days default)
  - Save to database
  - Emit Socket.IO event to user room: `notification:created`
  - Send email if user preferences allow
  - Return created notification
- `createBulkNotifications(recipients, data)`: Create notifications for multiple users (max 500)
  - Use `Notification.insertMany()` for bulk insert
  - Emit Socket.IO events to all user rooms
  - Queue emails for all recipients (check preferences)
  - Return created notifications
- `markAsRead(notificationId, userId)`: Mark notification as read
  - Update isRead: true, readAt: now
  - Verify notification belongs to user
  - Return updated notification
- `markAllAsRead(userId)`: Mark all user notifications as read
  - Update all unread notifications for user
  - Return count of updated notifications
- Export all functions

**Completion Criteria**:

- [ ] createNotification function creates and emits notification
- [ ] createBulkNotifications handles bulk creation (max 500)
- [ ] markAsRead and markAllAsRead functions implemented
- [ ] Socket.IO events emitted for real-time updates
- [ ] Email notifications sent based on user preferences
- [ ] TTL-based expiry set correctly

**Task 3: Email Templates (`templates/`)**

**Files to Implement**:

1. **`templates/welcomeEmail.html`**:

   - HTML email template for welcome message
   - Variables: `{{firstName}}`, `{{lastName}}`, `{{organizationName}}`, `{{email}}`, `{{loginUrl}}`
   - Styling: Responsive, professional, branded
   - Content: Welcome message, account details, login link, support contact

2. **`templates/taskNotificationEmail.html`**:

   - HTML email template for task notifications
   - Variables: `{{firstName}}`, `{{taskTitle}}`, `{{action}}`, `{{taskUrl}}`, `{{description}}`, `{{priority}}`, `{{status}}`, `{{createdBy}}`
   - Actions: Created, Updated, Deleted, Restored
   - Content: Task details, action performed, view task link

3. **`templates/mentionEmail.html`**:

   - HTML email template for mention notifications
   - Variables: `{{firstName}}`, `{{mentionedBy}}`, `{{commentContent}}`, `{{taskTitle}}`, `{{taskUrl}}`
   - Content: Mention notification, comment preview, view task link

4. **`templates/passwordResetEmail.html`**:

   - HTML email template for password reset
   - Variables: `{{firstName}}`, `{{resetUrl}}`, `{{expiryTime}}`
   - Content: Reset instructions, reset link (expires in 1 hour), security warning

5. **`templates/announcementEmail.html`**:
   - HTML email template for announcements
   - Variables: `{{firstName}}`, `{{title}}`, `{{message}}`, `{{organizationName}}`
   - Content: Announcement title, message, organization branding

**Completion Criteria**:

- [ ] All 5 email templates created with HTML
- [ ] All templates are responsive and professional
- [ ] All templates use variables for dynamic content
- [ ] All templates include branding and styling
- [ ] All templates tested with sample data

**Task 4: Express App Configuration (`app.js`)**

**Implementation**:

- Import all required packages and middleware
- Create Express app instance
- Middleware stack (IN ORDER):
  1. Helmet (security headers: CSP, HSTS, X-Frame-Options)
  2. CORS (origin validation, credentials: true)
  3. Cookie Parser (extract JWT cookies)
  4. Body Parser (JSON/URL-encoded, 10MB limit)
  5. Mongo Sanitize (NoSQL injection prevention)
  6. Compression (gzip, threshold: 1KB)
  7. Request ID (UUID for tracing)
  8. Rate Limiter (production: generalLimiter for /api/_, authLimiter for /api/auth/_)
  9. Morgan (development logging only)
- Mount routes:
  - `/api/auth` - Authentication routes
  - `/api/users` - User routes
  - `/api/organizations` - Organization routes
  - `/api/departments` - Department routes
  - `/api/tasks` - Task routes
  - `/api/materials` - Material routes
  - `/api/vendors` - Vendor routes
  - `/api/notifications` - Notification routes
  - `/api/attachments` - Attachment routes
- Health check endpoint: `GET /api/health` (returns status: ok)
- 404 handler: Catch all unmatched routes, throw CustomError.notFound
- Global error handler: Use ErrorController.errorHandler
- Export app

**Completion Criteria**:

- [ ] Express app created with all middleware in correct order
- [ ] All security middleware configured (Helmet, CORS, Mongo Sanitize)
- [ ] Body parser with 10MB limit
- [ ] Rate limiting applied correctly (production only)
- [ ] All routes mounted
- [ ] Health check endpoint implemented
- [ ] 404 handler catches unmatched routes
- [ ] Global error handler applied

**Task 5: Server Startup and Socket.IO (`server.js`)**

**Implementation**:

- Import app, http, Socket.IO, database connection, logger, validateEnv
- Validate environment variables on startup
- Create HTTP server with app
- Initialize Socket.IO with CORS configuration:
  - Origin: allowedOrigins
  - Credentials: true
  - Methods: ['GET', 'POST']
- Socket.IO authentication middleware:
  - Extract JWT from cookies (same as HTTP)
  - Verify access_token
  - Find user by decoded userId
  - Check user exists and not soft-deleted
  - Attach user to `socket.data.user`
  - Call next() or next(error)
- Socket.IO connection handler:
  - On connection: Log user connection
  - Join user room: `user:${userId}`
  - Join department room: `department:${departmentId}`
  - Join organization room: `organization:${organizationId}`
  - Update user status to 'Online'
  - Emit `user:online` event to department and organization rooms
  - On disconnect: Update user status to 'Offline', emit `user:offline` event
- Connect to MongoDB
- Start server on PORT from environment
- Graceful shutdown: Close database connection and server on SIGINT/SIGTERM
- Export server and io (Socket.IO instance)

**Completion Criteria**:

- [ ] Environment variables validated on startup
- [ ] HTTP server created with Express app
- [ ] Socket.IO initialized with CORS configuration
- [ ] Socket.IO authentication middleware implemented
- [ ] Socket.IO connection handler with room joining
- [ ] User status updates (Online/Offline) with Socket.IO events
- [ ] MongoDB connection established
- [ ] Server starts on PORT from environment
- [ ] Graceful shutdown on SIGINT/SIGTERM
- [ ] Server and io exported

**Task 6: Socket.IO Utilities (`utils/socket.js`)**

**Implementation**:

- Import io from server.js
- `emitToRooms(rooms, event, data)`: Emit event to multiple rooms
  - Rooms: Array of room names
  - Event: Event name
  - Data: Event payload
  - Use `io.to(room).emit(event, data)` for each room
- `emitTaskEvent(task, event)`: Emit task event to department and organization rooms
  - Rooms: `department:${task.department}`, `organization:${task.organization}`
  - Event: `task:${event}` (created, updated, deleted, restored)
  - Data: Task object
- `emitUserEvent(user, event)`: Emit user event to user, department, and organization rooms
  - Rooms: `user:${user._id}`, `department:${user.department}`, `organization:${user.organization}`
  - Event: `user:${event}` (online, offline, away)
  - Data: User object
- `emitNotificationEvent(notification)`: Emit notification event to user room
  - Room: `user:${notification.recipient}`
  - Event: `notification:created`
  - Data: Notification object
- Export all functions

**Completion Criteria**:

- [ ] emitToRooms function emits to multiple rooms
- [ ] emitTaskEvent function emits task events
- [ ] emitUserEvent function emits user events
- [ ] emitNotificationEvent function emits notification events
- [ ] All functions use io instance from server.js

**Completion Criteria for Phase 4**:

- [ ] Email service implemented with Gmail SMTP and async queue
- [ ] Notification service implemented with Socket.IO integration
- [ ] All 5 email templates created and tested
- [ ] Express app configured with all middleware in correct order
- [ ] Server startup with Socket.IO initialization
- [ ] Socket.IO authentication and connection handling
- [ ] Socket.IO utilities for event emission
- [ ] Graceful shutdown implemented
- [ ] All constants imported from utils/constants.js
- [ ] No linting errors
- [ ] Code is well-documented with JSDoc comments

### Phase 5: Test Setup and Validation

**Branch**: `phase-5-test-setup`

**Requirements Reference**: Requirement 6 (Test Setup with Real MongoDB Instance)

**Task 1: Jest Configuration (`jest.config.js`)**

**Implementation**:

- Test environment: `node`
- Transform: `{}` (no transformation, native ES modules)
- Extensions to treat as ESM: `['.js']`
- Test match patterns: `['**/__tests__/**/*.test.js', '**/__tests__/**/*.property.test.js']`
- Max workers: 1 (sequential execution for database isolation)
- Test timeout: 60000ms (60 seconds for database operations)
- Global setup: `'./__tests__/globalSetup.js'`
- Global teardown: `'./__tests__/globalTeardown.js'`
- Setup files after env: `['./__tests__/setup.js']`
- Coverage configuration:
  - Collect coverage from: `['**/*.js']`
  - Exclude: `['node_modules/**', '__tests__/**', 'coverage/**', 'jest.config.js']`
  - Thresholds: statements 80%, branches 75%, functions 80%, lines 80%
- Export configuration

**Completion Criteria**:

- [ ] Jest configured for ES modules
- [ ] Test timeout set to 60 seconds
- [ ] Sequential execution (maxWorkers: 1)
- [ ] Coverage thresholds configured
- [ ] Global setup/teardown configured

**Task 2: Global Setup (`__tests__/globalSetup.js`)**

**Implementation**:

- Set test environment variables:
  - `NODE_ENV=test`
  - `MONGODB_TEST_URI` (from process.env or default test database)
  - `JWT_ACCESS_SECRET=test-access-secret-min-32-characters`
  - `JWT_REFRESH_SECRET=test-refresh-secret-min-32-characters`
  - `EMAIL_USER=test@example.com`
  - `EMAIL_PASSWORD=test-password`
  - `CLIENT_URL=http://localhost:3000`
- Connect to MongoDB test instance (NEVER MongoDB Memory Server)
- Verify connection successful
- Log setup completion
- Export async function

**CRITICAL**: NEVER use MongoDB Memory Server - always use real MongoDB test instance to avoid timeout issues

**Completion Criteria**:

- [ ] Test environment variables set
- [ ] MongoDB test connection established
- [ ] NEVER uses MongoDB Memory Server
- [ ] Connection verified before tests run

**Task 3: Global Teardown (`__tests__/globalTeardown.js`)**

**Implementation**:

- Disconnect from MongoDB test instance
- Drop test database (cleanup)
- Close all connections
- Log teardown completion
- Export async function

**Completion Criteria**:

- [ ] MongoDB test connection closed
- [ ] Test database dropped
- [ ] All connections closed

**Task 4: Test Setup (`__tests__/setup.js`)**

**Implementation**:

- Import mongoose and all models
- Before each test:
  - Connect to MongoDB test instance if not connected
  - Clear all collections (clean slate for each test)
- After each test:
  - Clear all collections (cleanup)
- After all tests:
  - Drop test database
  - Disconnect from MongoDB
- Export setup functions

**Completion Criteria**:

- [ ] Database connection managed per test
- [ ] Collections cleared before and after each test
- [ ] Test database dropped after all tests
- [ ] Clean slate for each test

**Task 5: Test Utilities (`__tests__/utils/testHelpers.js`)**

**Implementation**:

- `createTestOrganization(data)`: Create test organization with defaults
- `createTestDepartment(organizationId, data)`: Create test department
- `createTestUser(organizationId, departmentId, data)`: Create test user with hashed password
- `createTestTask(type, data)`: Create test task (ProjectTask, RoutineTask, AssignedTask)
- `createTestMaterial(departmentId, data)`: Create test material
- `createTestVendor(departmentId, data)`: Create test vendor
- `generateTestToken(userId)`: Generate test JWT access token
- `generateTestCookies(userId)`: Generate test cookies with access and refresh tokens
- `cleanupTestData()`: Delete all test data from database
- Export all helper functions

**Completion Criteria**:

- [ ] All test helper functions implemented
- [ ] Helpers create test data with sensible defaults
- [ ] Token generation helpers for authentication tests
- [ ] Cleanup helper for test data

**Task 6: Validate and Correct Existing Tests**

**Implementation**:

- Review all existing test files in `__tests__/` directory
- Validate tests follow correct patterns:
  - Use real MongoDB test instance (NEVER MongoDB Memory Server)
  - Use test helpers for data creation
  - Clean up test data after each test
  - Use proper assertions (expect, toBe, toEqual, etc.)
  - Test both success and error cases
  - Test edge cases and boundary conditions
- Correct any tests that don't meet requirements:
  - Replace MongoDB Memory Server with real MongoDB
  - Fix timeout issues (increase timeout if needed)
  - Fix flaky tests (ensure proper cleanup)
  - Fix incorrect assertions
  - Add missing test cases
- Ensure all tests pass before proceeding

**Completion Criteria**:

- [ ] All existing tests reviewed and validated
- [ ] No MongoDB Memory Server used anywhere
- [ ] All tests use real MongoDB test instance
- [ ] All tests pass without errors
- [ ] All tests follow correct patterns
- [ ] Test coverage meets thresholds (80%+ statements, 75%+ branches)

**Task 7: Complete Test Suite**

**Implementation**:

Write comprehensive tests for all implemented components:

1. **Configuration Tests** (`__tests__/config/`):

   - `allowedOrigins.test.js`: Test origin validation
   - `corsOptions.test.js`: Test CORS configuration
   - `db.test.js`: Test database connection and retry logic

2. **Utility Tests** (`__tests__/utils/`):

   - `constants.test.js`: Test all constants are defined
   - `authorizationMatrix.test.js`: Test permission checking
   - `generateTokens.test.js`: Test token generation and cookie setting
   - `logger.test.js`: Test logging functionality
   - `validateEnv.test.js`: Test environment validation
   - `helpers.test.js`: Test all helper functions

3. **Model Tests** (`__tests__/models/`):

   - `softDelete.plugin.test.js`: Test soft delete plugin functionality
   - `Organization.test.js`: Test Organization model (validation, hooks, methods)
   - `Department.test.js`: Test Department model
   - `User.test.js`: Test User model (password hashing, validation, hooks)
   - `BaseTask.test.js`: Test BaseTask model
   - `ProjectTask.test.js`: Test ProjectTask discriminator
   - `RoutineTask.test.js`: Test RoutineTask discriminator
   - `AssignedTask.test.js`: Test AssignedTask discriminator
   - `TaskActivity.test.js`: Test TaskActivity model
   - `TaskComment.test.js`: Test TaskComment model (threading, depth)
   - `Material.test.js`: Test Material model
   - `Vendor.test.js`: Test Vendor model
   - `Attachment.test.js`: Test Attachment model
   - `Notification.test.js`: Test Notification model

4. **Middleware Tests** (`__tests__/middlewares/`):

   - `authMiddleware.test.js`: Test JWT verification
   - `authorization.test.js`: Test role-based authorization
   - `rateLimiter.test.js`: Test rate limiting

5. **Error Handler Tests** (`__tests__/errorHandler/`):

   - `CustomError.test.js`: Test CustomError class and factory methods
   - `ErrorController.test.js`: Test global error handler

6. **Service Tests** (`__tests__/services/`):

   - `emailService.test.js`: Test email sending (mock nodemailer)
   - `notificationService.test.js`: Test notification creation and Socket.IO emission

7. **Property-Based Tests** (`__tests__/property/`):
   - `softDelete.property.test.js`: Test soft delete preserves data, restore works correctly
   - `pagination.property.test.js`: Test pagination calculations are correct
   - `authorization.property.test.js`: Test authorization matrix is consistent

**Test Coverage Requirements**:

- Statements: 80%+
- Branches: 75%+
- Functions: 80%+
- Lines: 80%+

**Completion Criteria**:

- [ ] All configuration tests written and passing
- [ ] All utility tests written and passing
- [ ] All model tests written and passing (validation, hooks, methods)
- [ ] All middleware tests written and passing
- [ ] All error handler tests written and passing
- [ ] All service tests written and passing
- [ ] Property-based tests written and passing
- [ ] Test coverage meets requirements (80%+ statements, 75%+ branches)
- [ ] All tests use real MongoDB test instance
- [ ] No flaky tests
- [ ] No timeout issues
- [ ] All tests pass consistently

**Completion Criteria for Phase 5**:

- [ ] Jest configuration complete with ES modules support
- [ ] Global setup/teardown implemented with real MongoDB
- [ ] Test setup with collection cleanup
- [ ] Test helpers for data creation
- [ ] All existing tests validated and corrected
- [ ] Complete test suite written for all components
- [ ] Test coverage meets requirements (80%+ statements, 75%+ branches)
- [ ] All tests pass consistently without errors
- [ ] NEVER uses MongoDB Memory Server anywhere
- [ ] No linting errors
- [ ] Code is well-documented with JSDoc comments

### Phase 2: Routes, Validators, and Controllers

**Branch**: `phase-2-routes-validators-controllers`

**Requirements Reference**: Requirements 7-10 (Authentication, Organization/Department/User, Material/Vendor/Attachment/Notification, Task/Activity/Comment Management)

**Task 1: Authentication (Auth)**

**Requirements Reference**: Requirement 7 (Authentication System)

**Files to Implement**:

1. **`middlewares/validators/authValidators.js`**:

   - `registerValidator`: Validate registration data (organization, department, user)
     - Organization: name (required, max 100), description (required, max 2000), industry (required, enum), email (required, valid email), phone (required, E.164), address (required, max 500)
     - Department: name (required, max 100), description (required, max 2000)
     - User: firstName (required, max 20), lastName (required, max 20), email (required, valid email), password (required, min 8), position (required, max 100)
   - `loginValidator`: Validate login data (email, password required)
   - `forgotPasswordValidator`: Validate email (required, valid email)
   - `resetPasswordValidator`: Validate token (required) and newPassword (required, min 8)
   - Export all validators as array of validation rules

2. **`routes/authRoutes.js`**:

   - `POST /api/auth/register`: Register new organization (public, authLimiter, registerValidator, validate, authControllers.register)
   - `POST /api/auth/login`: Login user (public, authLimiter, loginValidator, validate, authControllers.login)
   - `DELETE /api/auth/logout`: Logout user (verifyRefresh_token, authLimiter, authControllers.logout)
   - `POST /api/auth/refresh`: Refresh access token (verifyRefresh_token, authLimiter, authControllers.refresh)
   - `POST /api/auth/forgot-password`: Request password reset (public, authLimiter, forgotPasswordValidator, validate, authControllers.forgotPassword)
   - `POST /api/auth/reset-password`: Reset password with token (public, authLimiter, resetPasswordValidator, validate, authControllers.resetPassword)
   - Export router

3. **`controllers/authControllers.js`**:
   - `register`: Create organization, department, and SuperAdmin user in MongoDB transaction
     - Validate organization doesn't exist (email, phone)
     - Create organization (isPlatformOrg: false)
     - Create department
     - Create user (role: SuperAdmin, isHod: true)
     - Send welcome email
     - Emit organization:created event
     - Return 201 with organization, department, user
   - `login`: Authenticate user and set JWT cookies
     - Find user by email (include password)
     - Check user exists and not soft-deleted
     - Compare password with bcrypt
     - Generate access and refresh tokens
     - Set HTTP-only cookies
     - Update lastLogin and status to 'Online'
     - Return 200 with user (without password)
   - `logout`: Clear authentication cookies
     - Clear access_token and refresh_token cookies
     - Update user status to 'Offline'
     - Return 200 with success message
   - `refresh`: Generate new access token
     - User already verified by verifyRefresh_token middleware
     - Generate new access token
     - Generate new refresh token (token rotation)
     - Set new HTTP-only cookies
     - Return 200 with success message
   - `forgotPassword`: Send password reset email
     - Find user by email
     - Generate random reset token (32 bytes)
     - Hash token with bcrypt (10 rounds)
     - Save hashed token and expiry (1 hour) to user
     - Send password reset email with unhashed token
     - Always return success (prevent email enumeration)
   - `resetPassword`: Reset password with token
     - Hash provided token with bcrypt
     - Find user by hashed token and check expiry
     - If not found or expired: throw CustomError.badRequest
     - Hash new password with bcrypt (12 rounds)
     - Update password, clear reset token and expiry
     - Return 200 with success message
   - Export all controllers

**Completion Criteria**:

- [ ] Auth validators implemented with all validation rules
- [ ] Auth routes configured with proper middleware order
- [ ] Auth controllers implemented with complete business logic
- [ ] Registration creates organization, department, and user in transaction
- [ ] Login sets HTTP-only cookies with JWT tokens
- [ ] Logout clears cookies and updates user status
- [ ] Refresh implements token rotation
- [ ] Forgot password sends email and prevents enumeration
- [ ] Reset password validates token and updates password
- [ ] All controllers emit Socket.IO events where appropriate
- [ ] All controllers use CustomError for error handling
- [ ] All field names match validators exactly (ONLY source of truth)

**Task 2: Organization, Department, and User Management**

**Requirements Reference**: Requirement 8 (Organization, Department, and User Management)

**Files to Implement**:

1. **`middlewares/validators/organizationValidators.js`**:

   - `createOrganizationValidator`: name, description, industry, email, phone, address (all required)
   - `updateOrganizationValidator`: Partial fields (name, description, industry, email, phone, address, logo)
   - `getOrganizationsValidator`: Query params (page, limit, sortBy, sortOrder, search, includeDeleted)
   - Export all validators

2. **`middlewares/validators/departmentValidators.js`**:

   - `createDepartmentValidator`: name, description, organization (all required)
   - `updateDepartmentValidator`: Partial fields (name, description)
   - `getDepartmentsValidator`: Query params (page, limit, sortBy, sortOrder, search, organization, includeDeleted)
   - Export all validators

3. **`middlewares/validators/userValidators.js`**:

   - `createUserValidator`: firstName, lastName, position, role, email, password, organization, department (all required), skills (optional array), employeeId (optional), dateOfBirth (optional), joinedAt (optional)
   - `updateUserValidator`: Partial fields (firstName, lastName, position, role, email, department, profilePicture, skills, employeeId, dateOfBirth, joinedAt, emailPreferences)
   - `getUsersValidator`: Query params (page, limit, sortBy, sortOrder, search, organization, department, role, includeDeleted)
   - `updatePasswordValidator`: currentPassword, newPassword (both required)
   - `updateStatusValidator`: status (required, enum from constants)
   - Export all validators

4. **`routes/organizationRoutes.js`**:

   - `GET /api/organizations`: List organizations (verifyJWT, authorize('Organization', 'read'), getOrganizationsValidator, validate, organizationControllers.getOrganizations)
   - `GET /api/organizations/:id`: Get single organization (verifyJWT, authorize('Organization', 'read'), organizationControllers.getOrganization)
   - `POST /api/organizations`: Create organization (verifyJWT, authorize('Organization', 'create'), createOrganizationValidator, validate, organizationControllers.createOrganization)
   - `PUT /api/organizations/:id`: Update organization (verifyJWT, authorize('Organization', 'update'), updateOrganizationValidator, validate, organizationControllers.updateOrganization)
   - `DELETE /api/organizations/:id`: Delete organization (verifyJWT, authorize('Organization', 'delete'), organizationControllers.deleteOrganization)
   - `PATCH /api/organizations/:id/restore`: Restore organization (verifyJWT, authorize('Organization', 'update'), organizationControllers.restoreOrganization)
   - Export router

5. **`routes/departmentRoutes.js`**:

   - `GET /api/departments`: List departments (verifyJWT, authorize('Department', 'read'), getDepartmentsValidator, validate, departmentControllers.getDepartments)
   - `GET /api/departments/:id`: Get single department (verifyJWT, authorize('Department', 'read'), departmentControllers.getDepartment)
   - `POST /api/departments`: Create department (verifyJWT, authorize('Department', 'create'), createDepartmentValidator, validate, departmentControllers.createDepartment)
   - `PUT /api/departments/:id`: Update department (verifyJWT, authorize('Department', 'update'), updateDepartmentValidator, validate, departmentControllers.updateDepartment)
   - `DELETE /api/departments/:id`: Delete department (verifyJWT, authorize('Department', 'delete'), departmentControllers.deleteDepartment)
   - `PATCH /api/departments/:id/restore`: Restore department (verifyJWT, authorize('Department', 'update'), departmentControllers.restoreDepartment)
   - Export router

6. **`routes/userRoutes.js`**:

   - `GET /api/users`: List users (verifyJWT, authorize('User', 'read'), getUsersValidator, validate, userControllers.getUsers)
   - `GET /api/users/:id`: Get single user (verifyJWT, authorize('User', 'read'), userControllers.getUser)
   - `POST /api/users`: Create user (verifyJWT, authorize('User', 'create'), createUserValidator, validate, userControllers.createUser)
   - `PUT /api/users/:id`: Update user (verifyJWT, authorize('User', 'update'), updateUserValidator, validate, userControllers.updateUser)
   - `DELETE /api/users/:id`: Delete user (verifyJWT, authorize('User', 'delete'), userControllers.deleteUser)
   - `PATCH /api/users/:id/restore`: Restore user (verifyJWT, authorize('User', 'update'), userControllers.restoreUser)
   - `PUT /api/users/:id/password`: Update password (verifyJWT, authorize('User', 'update'), updatePasswordValidator, validate, userControllers.updatePassword)
   - `PUT /api/users/:id/status`: Update status (verifyJWT, authorize('User', 'update'), updateStatusValidator, validate, userControllers.updateStatus)
   - `GET /api/users/me`: Get current user profile (verifyJWT, userControllers.getProfile)
   - `PUT /api/users/me`: Update current user profile (verifyJWT, updateUserValidator, validate, userControllers.updateProfile)
   - Export router

7. **`controllers/organizationControllers.js`**:

   - `getOrganizations`: List organizations with pagination, filtering, sorting
     - Apply multi-tenancy scoping (Platform SuperAdmin: all, Customer: own only)
     - Apply includeDeleted filter (SuperAdmin only)
     - Apply search filter (name, email, industry)
     - Apply pagination (1-based page numbers)
     - Return paginated response
   - `getOrganization`: Get single organization by ID
     - Check authorization scope
     - Populate createdBy
     - Return organization
   - `createOrganization`: Create new organization (Platform SuperAdmin only)
     - Validate unique constraints (name, email, phone)
     - Create organization (isPlatformOrg: false)
     - Emit organization:created event
     - Return 201 with organization
   - `updateOrganization`: Update organization
     - Check authorization scope
     - Validate unique constraints if changed
     - Update organization
     - Emit organization:updated event
     - Return 200 with updated organization
   - `deleteOrganization`: Soft delete organization with cascade
     - Check authorization scope
     - Prevent deleting platform organization
     - Start MongoDB transaction
     - Soft delete organization
     - Cascade to departments → users → tasks → activities → comments → attachments
     - Commit transaction
     - Emit organization:deleted event
     - Return 200 with success message
   - `restoreOrganization`: Restore soft-deleted organization
     - Check authorization scope
     - Restore organization
     - Emit organization:restored event
     - Return 200 with restored organization
   - Export all controllers

8. **`controllers/departmentControllers.js`**:

   - `getDepartments`: List departments with pagination, filtering, sorting
     - Apply multi-tenancy scoping
     - Apply filters (organization, search)
     - Apply pagination
     - Return paginated response
   - `getDepartment`: Get single department by ID
     - Check authorization scope
     - Populate organization, createdBy
     - Return department
   - `createDepartment`: Create new department
     - Validate unique name per organization
     - Create department
     - Emit department:created event
     - Return 201 with department
   - `updateDepartment`: Update department
     - Check authorization scope
     - Validate unique name if changed
     - Update department
     - Emit department:updated event
     - Return 200 with updated department
   - `deleteDepartment`: Soft delete department with cascade
     - Check authorization scope
     - Start MongoDB transaction
     - Soft delete department
     - Cascade to users → tasks → materials → vendors
     - Commit transaction
     - Emit department:deleted event
     - Return 200 with success message
   - `restoreDepartment`: Restore soft-deleted department
     - Check authorization scope
     - Restore department
     - Emit department:restored event
     - Return 200 with restored department
   - Export all controllers

9. **`controllers/userControllers.js`**:
   - `getUsers`: List users with pagination, filtering, sorting
     - Apply multi-tenancy scoping
     - Apply filters (organization, department, role, search)
     - Apply pagination
     - Return paginated response (sanitize users - remove password)
   - `getUser`: Get single user by ID
     - Check authorization scope
     - Populate organization, department
     - Return user (sanitized)
   - `createUser`: Create new user
     - Validate unique email per organization
     - Validate unique HOD per department if role is SuperAdmin/Admin
     - Hash password with bcrypt (12 rounds)
     - Create user
     - Send welcome email
     - Emit user:created event
     - Return 201 with user (sanitized)
   - `updateUser`: Update user
     - Check authorization scope
     - Validate unique email if changed
     - Validate unique HOD if role changed to SuperAdmin/Admin
     - Update user
     - Emit user:updated event
     - Return 200 with updated user (sanitized)
   - `deleteUser`: Soft delete user with cascade
     - Check authorization scope
     - Prevent deleting last SuperAdmin in organization
     - Prevent deleting last HOD in department
     - Start MongoDB transaction
     - Soft delete user
     - Cascade to tasks → activities → comments → attachments → materials
     - Commit transaction
     - Emit user:deleted event
     - Return 200 with success message
   - `restoreUser`: Restore soft-deleted user
     - Check authorization scope
     - Restore user
     - Emit user:restored event
     - Return 200 with restored user (sanitized)
   - `updatePassword`: Update user password
     - Check authorization scope (own only)
     - Verify current password
     - Hash new password with bcrypt (12 rounds)
     - Update password
     - Return 200 with success message
   - `updateStatus`: Update user status (Online, Offline, Away)
     - Check authorization scope (own only)
     - Update status
     - Emit user:status event to department and organization rooms
     - Return 200 with success message
   - `getProfile`: Get current user profile
     - Return req.user (sanitized)
   - `updateProfile`: Update current user profile
     - Update allowed fields only (firstName, lastName, position, profilePicture, skills, emailPreferences)
     - Return 200 with updated user (sanitized)
   - Export all controllers

**Completion Criteria**:

- [ ] All validators implemented for Organization, Department, User
- [ ] All routes configured with proper middleware order
- [ ] All controllers implemented with complete business logic
- [ ] Multi-tenancy scoping applied correctly
- [ ] Pagination with 1-based page numbers
- [ ] Cascade delete with MongoDB transactions
- [ ] Socket.IO events emitted for all CRUD operations
- [ ] Email notifications sent where appropriate
- [ ] All unique constraints validated
- [ ] All authorization checks implemented
- [ ] All field names match validators exactly

**Task 3: Material, Vendor, Attachment, and Notification Management**

**Requirements Reference**: Requirement 9 (Material, Vendor, Attachment, and Notification Management)

**Files to Implement**:

1. **`middlewares/validators/materialValidators.js`**:

   - `createMaterialValidator`: name, description, category, unit, quantity, reorderLevel, vendor (optional), department, organization (all required except vendor)
   - `updateMaterialValidator`: Partial fields
   - `getMaterialsValidator`: Query params (page, limit, sortBy, sortOrder, search, department, organization, category, vendor, includeDeleted)
   - Export all validators

2. **`middlewares/validators/vendorValidators.js`**:

   - `createVendorValidator`: name, contactPerson, email, phone, address, department, organization (all required)
   - `updateVendorValidator`: Partial fields
   - `getVendorsValidator`: Query params (page, limit, sortBy, sortOrder, search, department, organization, includeDeleted)
   - Export all validators

3. **`middlewares/validators/attachmentValidators.js`**:

   - `uploadAttachmentValidator`: file (required), parent (required), parentModel (required, enum)
   - `getAttachmentsValidator`: Query params (parent, parentModel, type, includeDeleted)
   - Export all validators

4. **`middlewares/validators/notificationValidators.js`**:

   - `createNotificationValidator`: recipient, type, title, message, relatedResource (optional), relatedModel (optional), expiresAt (optional)
   - `getNotificationsValidator`: Query params (page, limit, isRead, type, includeDeleted)
   - `markAsReadValidator`: notificationIds (array of IDs)
   - Export all validators

5. **`routes/materialRoutes.js`**, **`routes/vendorRoutes.js`**, **`routes/attachmentRoutes.js`**, **`routes/notificationRoutes.js`**:

   - Standard CRUD routes with proper middleware (verifyJWT, authorize, validators, validate)
   - Additional routes:
     - `DELETE /api/vendors/:id/reassign`: Reassign materials before deleting vendor
     - `POST /api/attachments/upload`: Upload attachment to Cloudinary
     - `PATCH /api/notifications/mark-read`: Mark notifications as read
     - `PATCH /api/notifications/mark-all-read`: Mark all notifications as read
   - Export routers

6. **`controllers/materialControllers.js`**, **`controllers/vendorControllers.js`**, **`controllers/attachmentControllers.js`**, **`controllers/notificationControllers.js`**:
   - Standard CRUD operations with multi-tenancy scoping
   - Vendor delete: Require material reassignment to another vendor
   - Attachment upload: Upload to Cloudinary, create attachment document
   - Notification mark as read: Update isRead and readAt fields
   - All controllers emit Socket.IO events
   - Export all controllers

**Completion Criteria**:

- [ ] All validators implemented
- [ ] All routes configured
- [ ] All controllers implemented
- [ ] Vendor deletion requires material reassignment
- [ ] Attachment upload to Cloudinary working
- [ ] Notification mark as read functionality
- [ ] All CRUD operations with multi-tenancy scoping
- [ ] Socket.IO events emitted

**Task 4: Task, TaskActivity, and TaskComment Management**

**Requirements Reference**: Requirement 10 (Task, TaskActivity, and TaskComment Management)

**Files to Implement**:

1. **`middlewares/validators/taskValidators.js`**:

   - `createTaskValidator`: Validate based on taskType (ProjectTask, RoutineTask, AssignedTask)
     - Common: title, description, status, priority, organization, department, tags, attachments, watchers
     - ProjectTask: vendor (required), assignees, estimatedCost, actualCost, currency, startDate, dueDate
     - RoutineTask: materials (required), date (required), status cannot be "To Do", priority cannot be "Low"
     - AssignedTask: assignee (required), startDate, dueDate
   - `updateTaskValidator`: Partial fields based on taskType
   - `getTasksValidator`: Query params (page, limit, sortBy, sortOrder, search, department, organization, taskType, status, priority, createdBy, includeDeleted)
   - Export all validators

2. **`middlewares/validators/taskActivityValidators.js`**:

   - `createTaskActivityValidator`: task, description, materials (optional), createdBy, organization, department (all required except materials)
   - `updateTaskActivityValidator`: Partial fields (description, materials)
   - `getTaskActivitiesValidator`: Query params (task, page, limit, sortBy, sortOrder, includeDeleted)
   - Export all validators

3. **`middlewares/validators/taskCommentValidators.js`**:

   - `createTaskCommentValidator`: parent, parentModel, content, mentions (optional), attachments (optional), organization, department (all required except mentions/attachments)
   - `updateTaskCommentValidator`: Partial fields (content, mentions, attachments)
   - `getTaskCommentsValidator`: Query params (parent, parentModel, page, limit, sortBy, sortOrder, includeDeleted)
   - Export all validators

4. **`routes/taskRoutes.js`**, **`routes/taskActivityRoutes.js`**, **`routes/taskCommentRoutes.js`**:

   - Standard CRUD routes with proper middleware
   - Task routes include taskType-specific validation
   - TaskActivity routes validate parent task is ProjectTask or AssignedTask (NOT RoutineTask)
   - TaskComment routes support threading (max depth 3)
   - Export routers

5. **`controllers/taskControllers.js`**:

   - `getTasks`: List tasks with pagination, filtering, sorting
     - Apply multi-tenancy scoping
     - Apply filters (taskType, status, priority, createdBy, search)
     - Apply pagination
     - Return paginated response
   - `getTask`: Get single task by ID
     - Check authorization scope
     - Populate all references (vendor, assignees, materials, attachments, watchers, createdBy)
     - Return task
   - `createTask`: Create new task based on taskType
     - Validate taskType-specific fields
     - ProjectTask: Validate vendor exists, assignees are department users
     - RoutineTask: Validate materials exist, status not "To Do", priority not "Low"
     - AssignedTask: Validate assignee(s) exist
     - Create task
     - Send notifications to assignees/watchers
     - Emit task:created event to department and organization rooms
     - Return 201 with task
   - `updateTask`: Update task
     - Check authorization scope
     - Validate taskType-specific fields
     - Update task
     - Send notifications if assignees/watchers changed
     - Emit task:updated event
     - Return 200 with updated task
   - `deleteTask`: Soft delete task with cascade
     - Check authorization scope
     - Start MongoDB transaction
     - Soft delete task
     - Cascade to activities → comments → attachments → notifications
     - Commit transaction
     - Emit task:deleted event
     - Return 200 with success message
   - `restoreTask`: Restore soft-deleted task
     - Check authorization scope
     - Restore task
     - Emit task:restored event
     - Return 200 with restored task
   - Export all controllers

6. **`controllers/taskActivityControllers.js`**:

   - Standard CRUD operations
   - Validate parent task is ProjectTask or AssignedTask (NOT RoutineTask)
   - ProjectTask: Department users log vendor's work progress
   - AssignedTask: Assigned users log their own work progress
   - Cascade delete to comments → attachments
   - Emit events to task watchers
   - Export all controllers

7. **`controllers/taskCommentControllers.js`**:
   - Standard CRUD operations
   - Support threading (max depth 3)
   - Calculate depth from parent comment
   - Send mention notifications to mentioned users
   - Cascade delete to child comments (recursive) → attachments
   - Emit events to task watchers
   - Export all controllers

**Completion Criteria**:

- [ ] All validators implemented for Task, TaskActivity, TaskComment
- [ ] All routes configured with taskType-specific validation
- [ ] All controllers implemented with complete business logic
- [ ] TaskType-specific validation (ProjectTask, RoutineTask, AssignedTask)
- [ ] TaskActivity validates parent task type
- [ ] TaskComment supports threading (max depth 3)
- [ ] Cascade delete with MongoDB transactions
- [ ] Mention notifications sent
- [ ] Socket.IO events emitted to appropriate rooms
- [ ] All field names match validators exactly

**Task 5: Complete Test Suite for Phase 2**

**Implementation**:

Write comprehensive integration tests for all API endpoints:

1. **Auth Integration Tests** (`__tests__/integration/auth.test.js`):

   - Test registration (success, duplicate email, invalid data)
   - Test login (success, wrong password, non-existent user)
   - Test logout (success, no token)
   - Test refresh (success, invalid token)
   - Test forgot password (success, non-existent email)
   - Test reset password (success, invalid token, expired token)

2. **Organization Integration Tests** (`__tests__/integration/organization.test.js`):

   - Test CRUD operations with different roles
   - Test authorization scopes (Platform SuperAdmin, Customer SuperAdmin)
   - Test cascade delete
   - Test restore

3. **Department Integration Tests** (`__tests__/integration/department.test.js`):

   - Test CRUD operations with different roles
   - Test authorization scopes
   - Test cascade delete
   - Test restore

4. **User Integration Tests** (`__tests__/integration/user.test.js`):

   - Test CRUD operations with different roles
   - Test unique HOD per department
   - Test password update
   - Test status update
   - Test profile operations
   - Test cascade delete
   - Test restore

5. **Material, Vendor, Attachment, Notification Integration Tests**:

   - Test CRUD operations
   - Test vendor material reassignment
   - Test attachment upload to Cloudinary
   - Test notification mark as read

6. **Task Integration Tests** (`__tests__/integration/task.test.js`):

   - Test CRUD operations for all task types
   - Test taskType-specific validation
   - Test cascade delete
   - Test restore

7. **TaskActivity and TaskComment Integration Tests**:
   - Test CRUD operations
   - Test parent task type validation (TaskActivity)
   - Test threading and depth (TaskComment)
   - Test mention notifications

**Test Coverage Requirements**:

- All API endpoints tested (success and error cases)
- All authorization scopes tested
- All validation rules tested
- All cascade operations tested
- Coverage: 80%+ statements, 75%+ branches

**Completion Criteria for Phase 2**:

- [ ] All validators implemented for all resources
- [ ] All routes configured with proper middleware order
- [ ] All controllers implemented with complete business logic
- [ ] All CRUD operations with multi-tenancy scoping
- [ ] All cascade delete operations with MongoDB transactions
- [ ] All Socket.IO events emitted correctly
- [ ] All email notifications sent where appropriate
- [ ] All authorization checks implemented
- [ ] All unique constraints validated
- [ ] All field names match validators exactly (ONLY source of truth)
- [ ] Complete integration test suite written and passing
- [ ] Test coverage meets requirements (80%+ statements, 75%+ branches)
- [ ] All tests pass consistently without errors
- [ ] No linting errors
- [ ] Code is well-documented with JSDoc comments

### Phase 3: Complete Backend Validation and Documentation

**Branch**: `phase-3-complete-backend`

**Requirements Reference**: Requirements 1-15 (All Backend Requirements), Requirement 29 (Documentation)

**Task 1: Complete Backend Integration Testing**

**Implementation**:

1. **End-to-End Workflow Tests** (`__tests__/e2e/`):

   - `organizationWorkflow.test.js`: Test complete organization lifecycle (create → departments → users → tasks → delete with cascade)
   - `taskWorkflow.test.js`: Test complete task lifecycle for all types (create → activities → comments → complete → delete)
   - `authWorkflow.test.js`: Test complete auth flow (register → login → refresh → logout → forgot password → reset)
   - `multiTenancyWorkflow.test.js`: Test multi-tenancy isolation (create multiple orgs, verify data isolation)
   - `socketWorkflow.test.js`: Test Socket.IO real-time updates (connect → join rooms → emit events → receive events)

2. **Performance Tests** (`__tests__/performance/`):

   - `pagination.test.js`: Test pagination with large datasets (1000+ records)
   - `cascadeDelete.test.js`: Test cascade delete performance with deep hierarchies
   - `concurrency.test.js`: Test concurrent requests (multiple users, same resource)
   - `queryOptimization.test.js`: Test query performance with indexes

3. **Security Tests** (`__tests__/security/`):

   - `authentication.test.js`: Test JWT security (expired tokens, invalid tokens, missing tokens)
   - `authorization.test.js`: Test authorization matrix (all roles, all resources, all operations, all scopes)
   - `injection.test.js`: Test NoSQL injection prevention (malicious queries)
   - `xss.test.js`: Test XSS prevention (malicious input)
   - `csrf.test.js`: Test CSRF protection (SameSite cookies)
   - `rateLimiting.test.js`: Test rate limiting (exceed limits, verify headers)

4. **Edge Case Tests** (`__tests__/edgeCases/`):
   - `softDelete.test.js`: Test soft delete edge cases (restore after TTL, multiple restores, cascade restore)
   - `uniqueConstraints.test.js`: Test unique constraints (case sensitivity, soft-deleted records)
   - `validation.test.js`: Test validation edge cases (boundary values, special characters, unicode)
   - `errorHandling.test.js`: Test error handling (all error types, error messages, stack traces)

**Completion Criteria**:

- [ ] All E2E workflow tests written and passing
- [ ] All performance tests written and passing
- [ ] All security tests written and passing
- [ ] All edge case tests written and passing
- [ ] Test coverage meets requirements (80%+ statements, 75%+ branches)
- [ ] All tests pass consistently without errors
- [ ] No flaky tests
- [ ] No timeout issues

**Task 2: Code Quality and Linting**

**Implementation**:

1. **ESLint Configuration** (`.eslintrc.json`):

   - Extends: `eslint:recommended`
   - Parser options: ES modules, Node.js environment
   - Rules: No unused vars, no console (warn), consistent return, no var, prefer const
   - Run: `npm run lint` to check all files
   - Fix: `npm run lint:fix` to auto-fix issues

2. **Prettier Configuration** (`.prettierrc.json`):

   - Single quotes, trailing commas, 2 spaces, 80 char line width
   - Run: `npm run format` to format all files

3. **Code Review Checklist**:
   - [ ] All files follow ES modules syntax (import/export)
   - [ ] All constants imported from utils/constants.js (no hardcoded values)
   - [ ] All field names match validators exactly
   - [ ] All functions have JSDoc comments
   - [ ] All error handling uses CustomError
   - [ ] All database operations use soft delete
   - [ ] All cascade operations use MongoDB transactions
   - [ ] All Socket.IO events emitted correctly
   - [ ] All email notifications sent where appropriate
   - [ ] All authorization checks implemented
   - [ ] All validation rules implemented
   - [ ] All unique constraints validated
   - [ ] No linting errors
   - [ ] No console.log statements (use logger)
   - [ ] No TODO comments (resolve or create issues)

**Completion Criteria**:

- [ ] ESLint configured and all files pass
- [ ] Prettier configured and all files formatted
- [ ] Code review checklist completed
- [ ] No linting errors
- [ ] No formatting issues
- [ ] Code follows established patterns

**Task 3: API Documentation**

**Implementation**:

1. **API Documentation** (`docs/API.md`):

   - Overview: System architecture, authentication, authorization
   - Base URL: Development and production URLs
   - Authentication: JWT tokens in HTTP-only cookies
   - Authorization: Role-based access control with scopes
   - Error Handling: Error response format, status codes
   - Pagination: 1-based page numbers, pagination metadata
   - Rate Limiting: Limits, headers, error responses
   - Endpoints: All endpoints with:
     - Method and path
     - Description
     - Authentication required
     - Authorization scope
     - Request parameters (path, query, body)
     - Request examples
     - Response examples (success and error)
     - Status codes
   - Socket.IO Events: All events with payload examples
   - Email Notifications: All email types with triggers

2. **Database Schema Documentation** (`docs/DATABASE.md`):

   - Overview: MongoDB collections, relationships
   - Models: All models with:
     - Schema fields with types, constraints, defaults
     - Indexes (unique, regular, TTL)
     - Relationships (references, discriminators, polymorphic)
     - Validation rules
     - Pre/post hooks
     - Instance methods
     - Static methods
   - Soft Delete: Plugin functionality, TTL values
   - Cascade Operations: Cascade delete hierarchies
   - Multi-Tenancy: Data isolation, scoping

3. **Testing Documentation** (`docs/TESTING.md`):

   - Overview: Testing strategy, frameworks, tools
   - Test Types: Unit, integration, property-based, E2E
   - Test Setup: Jest configuration, global setup/teardown
   - Test Patterns: Examples for each test type
   - Coverage Requirements: Thresholds, how to run coverage
   - Running Tests: Commands for all tests, specific tests, watch mode
   - Writing Tests: Best practices, common pitfalls
   - CRITICAL: NEVER use MongoDB Memory Server

4. **Deployment Documentation** (`docs/DEPLOYMENT.md`):
   - System Requirements: Node.js, MongoDB, npm versions
   - Environment Variables: All required and optional variables
   - Installation: Step-by-step installation instructions
   - Configuration: CORS, JWT secrets, email, Cloudinary
   - Database Setup: MongoDB connection, indexes, seed data
   - Build: Production build commands
   - Deployment: PM2, systemd, Docker options
   - Nginx Configuration: Reverse proxy, SSL, static files
   - Monitoring: Logging, health checks, alerts
   - Backup: Database backup, restore procedures
   - Security: Hardening checklist, SSL setup

**Completion Criteria**:

- [ ] API documentation complete with all endpoints
- [ ] Database schema documentation complete with all models
- [ ] Testing documentation complete with examples
- [ ] Deployment documentation complete with step-by-step guide
- [ ] All documentation is accurate and up-to-date
- [ ] All examples are tested and working

**Task 4: README and Project Documentation**

**Implementation**:

1. **README.md**:

   - Project title and description
   - Features: List all major features
   - Technology stack: Backend and frontend technologies
   - Prerequisites: Node.js, MongoDB, npm versions
   - Installation: Quick start guide
   - Configuration: Environment variables
   - Running: Development and production commands
   - Testing: How to run tests
   - Documentation: Links to detailed docs
   - Contributing: Guidelines for contributors
   - License: Project license

2. **CHANGELOG.md**:

   - Version history with dates
   - Changes: Added, changed, fixed, removed
   - Breaking changes highlighted

3. **CONTRIBUTING.md**:
   - Code of conduct
   - How to contribute: Fork, branch, commit, PR
   - Code style: ESLint, Prettier
   - Testing: Write tests for all changes
   - Documentation: Update docs for changes

**Completion Criteria**:

- [ ] README.md complete with quick start guide
- [ ] CHANGELOG.md with version history
- [ ] CONTRIBUTING.md with guidelines
- [ ] All documentation is clear and helpful

**Task 5: Final Backend Validation**

**Implementation**:

1. **Functionality Checklist**:

   - [ ] All Phase 1 tasks completed (config, utils, models)
   - [ ] All Phase 2 tasks completed (routes, validators, controllers)
   - [ ] All models with soft delete and cascade operations
   - [ ] All API endpoints with authentication and authorization
   - [ ] All validation rules implemented
   - [ ] All unique constraints validated
   - [ ] All cascade delete operations use MongoDB transactions
   - [ ] All Socket.IO events emitted correctly
   - [ ] All email notifications sent where appropriate
   - [ ] All constants imported from utils/constants.js
   - [ ] All field names match validators exactly

2. **Testing Checklist**:

   - [ ] All unit tests passing
   - [ ] All integration tests passing
   - [ ] All property-based tests passing
   - [ ] All E2E tests passing
   - [ ] All performance tests passing
   - [ ] All security tests passing
   - [ ] All edge case tests passing
   - [ ] Test coverage meets requirements (80%+ statements, 75%+ branches)
   - [ ] No flaky tests
   - [ ] No timeout issues
   - [ ] NEVER uses MongoDB Memory Server

3. **Code Quality Checklist**:

   - [ ] No linting errors
   - [ ] No formatting issues
   - [ ] All files follow ES modules syntax
   - [ ] All functions have JSDoc comments
   - [ ] No console.log statements (use logger)
   - [ ] No TODO comments
   - [ ] Code follows established patterns

4. **Documentation Checklist**:

   - [ ] API documentation complete
   - [ ] Database schema documentation complete
   - [ ] Testing documentation complete
   - [ ] Deployment documentation complete
   - [ ] README.md complete
   - [ ] CHANGELOG.md complete
   - [ ] CONTRIBUTING.md complete

5. **Security Checklist**:

   - [ ] JWT tokens in HTTP-only cookies
   - [ ] Password hashing with bcrypt (12 rounds)
   - [ ] Rate limiting enabled (production)
   - [ ] CORS restricted to allowed origins
   - [ ] Security headers configured (Helmet)
   - [ ] NoSQL injection prevention (Mongo Sanitize)
   - [ ] XSS prevention (HTTP-only cookies, CSP)
   - [ ] CSRF protection (SameSite cookies)
   - [ ] Input validation and sanitization
   - [ ] Error messages don't expose sensitive info

6. **Performance Checklist**:
   - [ ] Database indexes created for all queries
   - [ ] Pagination implemented for all list endpoints
   - [ ] Connection pooling configured
   - [ ] Query optimization (select only needed fields)
   - [ ] Caching strategy (Redis recommended for production)
   - [ ] Compression enabled (gzip)
   - [ ] Response times < 500ms for most endpoints

**Completion Criteria**:

- [ ] All functionality checklist items completed
- [ ] All testing checklist items completed
- [ ] All code quality checklist items completed
- [ ] All documentation checklist items completed
- [ ] All security checklist items completed
- [ ] All performance checklist items completed
- [ ] Backend is 100% complete and ready for frontend development

**Completion Criteria for Phase 3**:

- [ ] All E2E, performance, security, and edge case tests written and passing
- [ ] Code quality validated (ESLint, Prettier, code review)
- [ ] Complete API documentation written
- [ ] Complete database schema documentation written
- [ ] Complete testing documentation written
- [ ] Complete deployment documentation written
- [ ] README, CHANGELOG, CONTRIBUTING written
- [ ] All functionality, testing, code quality, documentation, security, and performance checklists completed
- [ ] Backend is 100% complete, tested, documented, and ready for production
- [ ] No critical bugs or security vulnerabilities
- [ ] Test coverage meets requirements (80%+ statements, 75%+ branches)
- [ ] All tests pass consistently without errors
- [ ] No linting errors
- [ ] Code is well-documented with JSDoc comments
- [ ] Ready to proceed to frontend development phases

## Success Criteria

### Completion Checklist

**Backend**:

- [ ] All 15 phases completed with every task implemented
- [ ] All backend tests passing with 80%+ coverage (statements), 75%+ (branches)
- [ ] All models with soft delete and cascade operations using MongoDB transactions
- [ ] All API endpoints with authentication (JWT HTTP-only cookies) and authorization (matrix-based)
- [ ] Socket.IO real-time updates working with room-based broadcasting
- [ ] Email notifications working with Gmail SMTP and async queue
- [ ] MongoDB transactions for all cascade delete operations
- [ ] TTL-based auto-cleanup configured for all soft-deleted resources
- [ ] NEVER used MongoDB Memory Server - all tests use real MongoDB instance

**Frontend**:

- [ ] All pages and components implemented following DataGrid and three-layer patterns
- [ ] Redux store with RTK Query and persistence (auth slice only)
- [ ] Routing with protected routes and lazy loading
- [ ] Socket.IO real-time updates working with cache invalidation
- [ ] All forms with validation matching backend validators exactly
- [ ] DataGrid pattern for admin views, three-layer pattern for user views
- [ ] Constants mirroring backend utils/constants.js exactly (ONLY source of truth)
- [ ] MUI v7 syntax (size prop, NOT item prop for Grid)
- [ ] NEVER used watch() method from react-hook-form

**Integration**:

- [ ] Backend and frontend working together seamlessly
- [ ] Authentication with HTTP-only cookies (access_token 15min, refresh_token 7days)
- [ ] Real-time updates via Socket.IO with automatic cache invalidation
- [ ] File uploads to Cloudinary with direct upload
- [ ] Email notifications sent successfully with HTML templates
- [ ] Pagination conversion (0-based frontend ↔ 1-based backend) handled automatically

**Production**:

- [ ] Deployed to production environment with PM2 or systemd
- [ ] HTTPS configured with SSL certificate (Let's Encrypt or commercial)
- [ ] Rate limiting enabled (100 req/15min general, 5 req/15min auth)
- [ ] Monitoring and logging configured (Winston, PM2, MongoDB Atlas)
- [ ] Backups configured (MongoDB daily backups with 7-day retention)
- [ ] No critical bugs or security vulnerabilities (npm audit clean)
- [ ] Acceptable performance under load (response times < 500ms)
- [ ] Security headers configured (Helmet: CSP, HSTS, X-Frame-Options)

**Documentation**:

- [ ] README with installation and deployment instructions
- [ ] API documentation with all endpoints and examples
- [ ] Database schema documentation with relationships and indexes
- [ ] Testing documentation with coverage requirements and patterns
- [ ] Deployment guide with Nginx configuration and SSL setup

**Critical Validations**:

- [ ] Every phase started with new branch checkout
- [ ] Every task searched existing codebase before implementation
- [ ] Every task validated against requirements.md and design.md
- [ ] Every test passed before merging to main
- [ ] No MongoDB Memory Server used anywhere in tests
- [ ] All constants imported from utils/constants.js (never hardcoded)
- [ ] All frontend field names match backend validators exactly
- [ ] All dialogs include accessibility props
- [ ] All cards wrapped with React.memo
- [ ] All cascade deletes use MongoDB transactions
