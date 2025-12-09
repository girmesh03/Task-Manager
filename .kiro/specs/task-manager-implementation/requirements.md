# Requirements Document

## Introduction

This document outlines the comprehensive requirements for a Multi-Tenant SaaS Task Manager with role-based access control, real-time updates, and comprehensive task management capabilities. The system follows a strict 15-phase sequential development approach where backend must be completed before frontend development begins. Each phase must be 100% complete with all tests passing before proceeding to the next phase.

## Glossary

- **Platform Organization**: The service provider organization that manages the entire system and all customer organizations (isPlatformOrg: true)
- **Customer Organization**: Regular tenant organizations that use the platform's services (isPlatformOrg: false)
- **Platform SuperAdmin**: User from platform organization with crossOrg access to all organizations
- **Customer SuperAdmin**: User from customer organization with crossDept access within own organization only
- **HOD (Head of Department)**: Users with SuperAdmin or Admin roles (isHod: true), only HOD can be watchers on ProjectTasks
- **ProjectTask**: Department task outsourced to external vendor due to complexity or resource limitation, materials added via TaskActivity
- **RoutineTask**: Daily routine task received from organization outlets, materials added directly (no TaskActivity)
- **AssignedTask**: Task assigned to single user or group of users within department, materials added via TaskActivity
- **TaskActivity**: Work progress logs on ProjectTask/AssignedTask only (NOT RoutineTask), department users log vendor work or own work
- **Soft Delete**: Marking resources as deleted (isDeleted: true) without physical deletion, with TTL-based auto-cleanup
- **Cascade Delete**: Soft deleting parent resources affects all children using MongoDB transactions
- **Multi-tenancy**: Data isolation where organizations cannot access other organizations' data
- **Vendor**: External client/vendor who takes and completes outsourced ProjectTasks, communicates orally with department users

## Requirements

### Requirement 1: Sequential Development Process

**User Story:** As a development team, I want a strict sequential development process, so that we build a solid foundation before adding complexity.

#### Acceptance Criteria

1. WHEN starting development THEN the system SHALL complete all backend phases (1-3) before starting any frontend work
2. WHEN completing a phase THEN the system SHALL ensure all tests pass with 80%+ coverage before proceeding
3. WHEN starting a new phase THEN the system SHALL checkout a new branch following naming convention phase-X-[name]
4. WHEN implementing a task THEN the system SHALL follow this exact sequence:
   - Search entire codebase (backend/_ and client/_) for existing implementations
   - Make super deep analysis on each identified file and extract every logic
   - Validate existing code against requirements and design documents
   - If code exists and meets requirements: keep as is, otherwise correct it
   - If code doesn't exist: implement according to requirements and design
   - Test everything (all test types) without skipping until all tests pass
5. WHEN completing a phase THEN the system SHALL merge to main only when 100% complete with all tests passing
6. WHEN testing THEN the system SHALL NEVER use MongoDB Memory Server due to timeout issues, instead use real MongoDB instance for all tests

### Requirement 2: Backend Core Configuration and Utilities

**User Story:** As a backend developer, I want foundational configuration and utility modules, so that I have a solid base for all backend features.

#### Acceptance Criteria

1. WHEN configuring CORS THEN the system SHALL validate origins with logging and never use wildcards in production
2. WHEN checking permissions THEN the system SHALL use authorizationMatrix.json as the ONLY source of truth
3. WHEN connecting to MongoDB THEN the system SHALL implement retry logic with exponential backoff and health checks
4. WHEN generating tokens THEN the system SHALL create access tokens (15 min) and refresh tokens (7 days) with proper cookie settings
5. WHEN logging THEN the system SHALL use Winston with file transports (error.log, combined.log) and console in development
6. WHEN validating environment THEN the system SHALL check all required variables (MONGODB_URI, JWT secrets) on startup
7. WHEN using constants THEN the system SHALL import from utils/constants.js and never hardcode enum values
8. WHEN formatting responses THEN the system SHALL use helper functions for consistent API response structure

### Requirement 3: Mongoose Models with Soft Delete Plugin

**User Story:** As a backend developer, I want all Mongoose models with universal soft delete functionality, so that data can be recovered and referential integrity maintained.

#### Acceptance Criteria

1. WHEN creating the soft delete plugin THEN the system SHALL add fields: isDeleted, deletedAt, deletedBy, restoredAt, restoredBy, restoreCount
2. WHEN querying models THEN the system SHALL automatically exclude soft-deleted documents unless withDeleted() is used
3. WHEN attempting hard delete THEN the system SHALL block the operation and throw an error
4. WHEN soft deleting THEN the system SHALL set isDeleted=true, deletedAt=now, deletedBy=userId
5. WHEN restoring THEN the system SHALL set isDeleted=false, deletedAt=null, increment restoreCount
6. WHEN creating Organization model THEN the system SHALL enforce unique name/email/phone, isPlatformOrg immutability, and platform org deletion protection
7. WHEN creating Department model THEN the system SHALL enforce unique name per organization
8. WHEN creating User model THEN the system SHALL auto-set isPlatformUser based on organization, auto-set isHod for SuperAdmin/Admin, enforce unique email per org, unique HOD per dept
9. WHEN creating BaseTask model THEN the system SHALL use discriminator pattern with taskType key for ProjectTask/RoutineTask/AssignedTask
10. WHEN creating ProjectTask THEN the system SHALL require vendorId, allow cost tracking with history (max 200), allow assignees (max 20) and watchers (max 20, HOD only)
11. WHEN creating RoutineTask THEN the system SHALL require startDate and dueDate, prevent status "To Do", prevent priority "Low", allow direct materials (max 20)
12. WHEN creating AssignedTask THEN the system SHALL require assignedTo field (single or array)
13. WHEN creating TaskActivity THEN the system SHALL only allow parent to be ProjectTask or AssignedTask (NOT RoutineTask)
14. WHEN creating TaskComment THEN the system SHALL allow threading with max depth 3, mentions (max 5), attachments (max 10)
15. WHEN creating Material THEN the system SHALL require category (9 options) and unitType (30+ options)
16. WHEN creating Vendor THEN the system SHALL require contactPerson, email, phone, address for external clients taking ProjectTasks
17. WHEN creating Attachment THEN the system SHALL enforce file type limits (Image 10MB, Video 100MB, Document 25MB, Audio 20MB, Other 50MB)
18. WHEN creating Notification THEN the system SHALL support types (Created, Updated, Deleted, Restored, Mention, Welcome, Announcement) with TTL

### Requirement 4: Error Handling and Middleware

**User Story:** As a backend developer, I want comprehensive error handling and middleware, so that requests are properly authenticated, authorized, and validated.

#### Acceptance Criteria

1. WHEN creating CustomError class THEN the system SHALL provide static methods for all HTTP error codes (badRequest, unauthorized, forbidden, notFound, conflict, gone, internalServer)
2. WHEN handling errors globally THEN the system SHALL format Mongoose errors, JWT errors, and custom errors consistently
3. WHEN verifying JWT THEN the system SHALL extract access_token from cookies, verify with JWT_ACCESS_SECRET, find user, attach to req.user
4. WHEN verifying refresh token THEN the system SHALL extract refresh_token from cookies, verify with JWT_REFRESH_SECRET
5. WHEN authorizing requests THEN the system SHALL get allowed scopes from matrix, determine request scope, check permission, attach authz info to req
6. WHEN rate limiting THEN the system SHALL enforce 100 req/15min for general API and 5 req/15min for auth endpoints in production only
7. WHEN validating input THEN the system SHALL use express-validator with validate middleware to format errors

### Requirement 5: Services, Templates, and Server Setup

**User Story:** As a backend developer, I want email services, Socket.IO setup, and proper server lifecycle management, so that the application can send notifications and handle real-time updates.

#### Acceptance Criteria

1. WHEN initializing email service THEN the system SHALL create nodemailer transporter with Gmail SMTP, verify connection, use async queue
2. WHEN creating notifications THEN the system SHALL create notification document, emit Socket.IO event, send email if preferences allow
3. WHEN rendering email templates THEN the system SHALL provide HTML templates for task events, mentions, welcome, password reset, announcements
4. WHEN configuring Express app THEN the system SHALL apply middleware in order: helmet, cors, cookieParser, bodyParser, mongoSanitize, compression, requestID, rateLimiter, morgan
5. WHEN starting server THEN the system SHALL validate env vars, connect MongoDB, create HTTP server, initialize Socket.IO, initialize email service, handle graceful shutdown
6. WHEN initializing Socket.IO THEN the system SHALL create singleton instance with CORS options, setup event handlers
7. WHEN user connects via Socket.IO THEN the system SHALL authenticate via cookies, join user/department/organization rooms, emit user:online
8. WHEN emitting events THEN the system SHALL provide helpers for task, user, activity, comment, notification events to appropriate rooms

### Requirement 6: Test Setup with Real MongoDB Instance

**User Story:** As a backend developer, I want comprehensive test infrastructure, so that I can write reliable tests with proper isolation.

#### Acceptance Criteria

1. WHEN configuring Jest THEN the system SHALL use ES modules, node environment, sequential execution (maxWorkers: 1), 60s timeout
2. WHEN setting up tests globally THEN the system SHALL connect to real MongoDB test database, set test env vars (NODE_ENV=test, JWT secrets, MONGODB_TEST_URI)
3. WHEN tearing down tests globally THEN the system SHALL disconnect from MongoDB and clean up
4. WHEN setting up each test file THEN the system SHALL connect to test database, clean collections after each test, drop test database after all tests
5. WHEN running tests THEN the system SHALL achieve minimum 80% statement coverage, 75% branch coverage, 80% function coverage
6. WHEN testing THEN the system SHALL NEVER use MongoDB Memory Server due to timeout issues, instead use real MongoDB test instance
7. WHEN implementing any task THEN the system SHALL follow this exact workflow:
   - Checkout to new branch: git checkout -b phase-X-[descriptive-name]
   - Search entire codebase (backend/_ and client/_) for existing implementations
   - Make super deep analysis on each identified file and extract every logic
   - Get requirements and design documents and validate existing code
   - If code exists and meets requirements: keep as is
   - If code exists but doesn't meet requirements: correct it
   - If code doesn't exist: implement according to requirements and design
   - Test everything (all test types) without skipping until all tests pass
   - Merge to main only when phase is 100% complete with all tests passing

### Requirement 7: Authentication System

**User Story:** As a user, I want secure authentication with registration, login, logout, token refresh, and password reset, so that I can access the system securely.

#### Acceptance Criteria

1. WHEN registering THEN the system SHALL create organization (isPlatformOrg: false), department, and SuperAdmin user in single transaction
2. WHEN registering THEN the system SHALL send welcome email and emit organization:created event
3. WHEN logging in THEN the system SHALL verify credentials, generate tokens, set HTTP-only cookies, update status to Online, emit user:online
4. WHEN logging out THEN the system SHALL clear cookies, update status to Offline, emit user:offline
5. WHEN refreshing token THEN the system SHALL verify refresh token, generate new tokens (rotation), set new cookies
6. WHEN requesting password reset THEN the system SHALL generate hashed reset token (1 hour expiry), send reset email, always return success
7. WHEN resetting password THEN the system SHALL verify token, hash new password with bcrypt (12 rounds), clear reset token, send confirmation email
8. WHEN validating auth requests THEN the system SHALL use authValidators with express-validator matching backend field names exactly

### Requirement 8: Organization, Department, and User Management

**User Story:** As an administrator, I want to manage organizations, departments, and users with proper CRUD operations and authorization, so that I can organize the system effectively.

#### Acceptance Criteria

1. WHEN creating organization THEN the system SHALL allow Platform SuperAdmin only, validate all fields, emit organization:created event
2. WHEN listing organizations THEN the system SHALL scope to Platform SuperAdmin (all orgs) or Customer SuperAdmin (own org only), support pagination and filters
3. WHEN updating organization THEN the system SHALL prevent isPlatformOrg changes, validate fields, emit organization:updated event
4. WHEN deleting organization THEN the system SHALL prevent platform org deletion, cascade to all children using transaction, emit organization:deleted event
5. WHEN restoring organization THEN the system SHALL restore organization only (children restored separately), emit organization:restored event
6. WHEN creating department THEN the system SHALL ensure unique name per organization, validate organization exists, emit department:created event
7. WHEN deleting department THEN the system SHALL cascade to users and tasks, emit department:deleted event
8. WHEN creating user THEN the system SHALL auto-set isPlatformUser from organization, auto-set isHod for SuperAdmin/Admin, enforce unique email per org, unique HOD per dept
9. WHEN creating user THEN the system SHALL hash password with bcrypt (12 rounds), send welcome email, emit user:created event
10. WHEN updating user THEN the system SHALL allow SuperAdmin to change role/department, prevent users from changing own role/department
11. WHEN deleting user THEN the system SHALL prevent deletion of last SuperAdmin in org, last HOD in dept, cascade to tasks/activities/comments, emit user:deleted event
12. WHEN getting user profile THEN the system SHALL return user data with dashboard statistics (task counts, notifications)

### Requirement 9: Material, Vendor, Attachment, and Notification Management

**User Story:** As a user, I want to manage materials, vendors, attachments, and notifications, so that I can track resources and stay informed.

#### Acceptance Criteria

1. WHEN creating material THEN the system SHALL require category (9 options), unitType (30+ options), validate positive quantity/cost/price, emit material:created event
2. WHEN deleting material THEN the system SHALL soft delete, emit material:deleted event
3. WHEN creating vendor THEN the system SHALL require contactPerson, email, phone, address for external clients, emit vendor:created event
4. WHEN deleting vendor THEN the system SHALL require material reassignment to another vendor, emit vendor:deleted event
5. WHEN creating attachment THEN the system SHALL validate file type and size limits, store Cloudinary URL and publicId, emit attachment:created event
6. WHEN listing attachments THEN the system SHALL scope to user's organization and department, support pagination
7. WHEN creating notification THEN the system SHALL create document, emit notification:created to user room, send email if preferences allow
8. WHEN marking notification as read THEN the system SHALL update isRead flag, emit notification:updated event
9. WHEN marking all notifications as read THEN the system SHALL update all user's notifications, emit notification:updated events

### Requirement 10: Task, TaskActivity, and TaskComment Management

**User Story:** As a user, I want to manage tasks with activities and comments, so that I can track work progress and communicate effectively.

#### Acceptance Criteria

1. WHEN creating ProjectTask THEN the system SHALL require vendorId, allow cost tracking with history (max 200), allow assignees (max 20) and watchers (max 20, HOD only), emit task:created event
2. WHEN creating RoutineTask THEN the system SHALL require startDate and dueDate, prevent status "To Do", prevent priority "Low", allow direct materials (max 20), emit task:created event
3. WHEN creating AssignedTask THEN the system SHALL require assignedTo (single or array), allow materials via TaskActivity, emit task:created event
4. WHEN listing tasks THEN the system SHALL scope to user's department (Manager/User) or organization (Admin/SuperAdmin), support pagination and filters (status, priority, type, assignee, date range)
5. WHEN getting task details THEN the system SHALL populate activities and comments, return complete task info
6. WHEN updating task THEN the system SHALL validate type-specific fields, emit task:updated event
7. WHEN deleting task THEN the system SHALL cascade to activities, comments, attachments using transaction, emit task:deleted event
8. WHEN creating TaskActivity THEN the system SHALL only allow parent to be ProjectTask or AssignedTask (NOT RoutineTask), allow materials (max 20) with quantities, emit activity:created event
9. WHEN creating TaskComment THEN the system SHALL allow threading with max depth 3, mentions (max 5), attachments (max 10), emit comment:created event
10. WHEN mentioning user in comment THEN the system SHALL create notification for mentioned user, send email if preferences allow
11. WHEN deleting comment THEN the system SHALL cascade to child comments recursively, emit comment:deleted event

### Requirement 11: Cascade Delete Operations with Transactions

**User Story:** As a system administrator, I want cascade delete operations to use MongoDB transactions, so that data integrity is maintained.

#### Acceptance Criteria

1. WHEN cascade deleting organization THEN the system SHALL use transaction to delete departments, users, tasks, activities, comments, attachments, materials, vendors, notifications
2. WHEN cascade deleting department THEN the system SHALL use transaction to delete users, tasks, materials, vendors
3. WHEN cascade deleting user THEN the system SHALL use transaction to delete tasks (createdBy), activities, comments, attachments, materials, remove from task watchers
4. WHEN cascade deleting task THEN the system SHALL use transaction to delete activities, comments, attachments, notifications
5. WHEN cascade deleting activity THEN the system SHALL use transaction to delete comments, attachments
6. WHEN cascade deleting comment THEN the system SHALL use transaction to recursively delete child comments and attachments
7. WHEN transaction fails THEN the system SHALL rollback all changes and throw error

### Requirement 12: TTL-Based Auto-Cleanup

**User Story:** As a system administrator, I want automatic cleanup of old soft-deleted data, so that storage is managed efficiently.

#### Acceptance Criteria

1. WHEN a user is soft-deleted THEN the system SHALL create TTL index for 365 days auto-expiry
2. WHEN a task is soft-deleted THEN the system SHALL create TTL index for 180 days auto-expiry
3. WHEN a department is soft-deleted THEN the system SHALL create TTL index for 365 days auto-expiry
4. WHEN an activity or comment is soft-deleted THEN the system SHALL create TTL index for 90 days auto-expiry
5. WHEN an attachment is soft-deleted THEN the system SHALL create TTL index for 90 days auto-expiry
6. WHEN a material or vendor is soft-deleted THEN the system SHALL create TTL index for 180 days auto-expiry
7. WHEN a notification is soft-deleted THEN the system SHALL create TTL index for 30 days or custom expiresAt
8. WHEN an organization is soft-deleted THEN the system SHALL never auto-expire (TTL = null)

### Requirement 13: Real-Time Updates via Socket.IO

**User Story:** As a user, I want real-time updates for tasks and notifications, so that I see changes immediately without refreshing.

#### Acceptance Criteria

1. WHEN user connects THEN the system SHALL authenticate via HTTP-only cookies, join user/department/organization rooms, emit user:online event
2. WHEN user disconnects THEN the system SHALL update status to Offline, emit user:offline event
3. WHEN task is created/updated/deleted/restored THEN the system SHALL emit event to department and organization rooms
4. WHEN activity is created/updated THEN the system SHALL emit event to department and organization rooms
5. WHEN comment is created/updated/deleted THEN the system SHALL emit event to department and organization rooms
6. WHEN notification is created THEN the system SHALL emit event to recipient's user room
7. WHEN user status changes THEN the system SHALL emit status event to department and organization rooms

### Requirement 14: Email Notification System

**User Story:** As a user, I want email notifications for important events, so that I stay informed even when not using the application.

#### Acceptance Criteria

1. WHEN task is created THEN the system SHALL send email to assigned users if emailPreferences.taskNotifications is true
2. WHEN user is mentioned in comment THEN the system SHALL send email if emailPreferences.mentions is true
3. WHEN new user is created THEN the system SHALL send welcome email if emailPreferences.welcomeEmails is true
4. WHEN password reset is requested THEN the system SHALL send reset email with token link
5. WHEN announcement is made THEN the system SHALL send email if emailPreferences.announcements is true
6. WHEN sending emails THEN the system SHALL use async queue to prevent blocking, retry on failure, log success/failure

### Requirement 15: Seed Data for Development

**User Story:** As a developer, I want seed data for development and testing, so that I can work with realistic data.

#### Acceptance Criteria

1. WHEN INITIALIZE_SEED_DATA is true THEN the system SHALL create platform organization with isPlatformOrg: true
2. WHEN seeding THEN the system SHALL create platform department and platform SuperAdmin user
3. WHEN seeding THEN the system SHALL create 2-3 customer organizations with departments and users (all roles)
4. WHEN seeding THEN the system SHALL create sample tasks (all types), materials, vendors, notifications
5. WHEN seeding THEN the system SHALL log success messages for each created resource

### Requirement 16: Frontend Redux Store and API Setup

**User Story:** As a frontend developer, I want Redux store with RTK Query and persistence, so that I can manage state and API calls efficiently.

#### Acceptance Criteria

1. WHEN configuring store THEN the system SHALL use configureStore with api reducer and persisted auth reducer
2. WHEN persisting state THEN the system SHALL persist only auth slice to localStorage
3. WHEN creating base API THEN the system SHALL use fetchBaseQuery with baseUrl from env, credentials: 'include' for cookies
4. WHEN defining tag types THEN the system SHALL include Task, TaskActivity, TaskComment, User, Organization, Department, Material, Vendor, Notification, Attachment
5. WHEN mirroring constants THEN the system SHALL ensure client/src/utils/constants.js matches backend/utils/constants.js EXACTLY

### Requirement 17: Frontend Routing and Layouts

**User Story:** As a frontend developer, I want routing with layouts and route protection, so that users can navigate securely.

#### Acceptance Criteria

1. WHEN configuring routes THEN the system SHALL use createBrowserRouter with lazy loading for code splitting
2. WHEN accessing protected routes THEN the system SHALL check isAuthenticated and redirect to /login if not authenticated
3. WHEN accessing public routes while authenticated THEN the system SHALL redirect to /dashboard
4. WHEN rendering layouts THEN the system SHALL use RootLayout for error boundary, PublicLayout for public pages, DashboardLayout for protected pages
5. WHEN handling route errors THEN the system SHALL display RouteError component with error message and home button

### Requirement 18: Frontend Common Components

**User Story:** As a frontend developer, I want reusable common components, so that I can build consistent UIs efficiently.

#### Acceptance Criteria

1. WHEN creating form components THEN the system SHALL use react-hook-form with Controller, NEVER use watch() method
2. WHEN creating MuiDataGrid THEN the system SHALL auto-convert pagination (0-based MUI ↔ 1-based backend), use server-side pagination
3. WHEN creating MuiActionColumn THEN the system SHALL auto-detect soft delete (isDeleted field), show View/Edit/Delete for active, Restore for deleted
4. WHEN creating filter components THEN the system SHALL use debouncing (300ms) for text inputs
5. WHEN creating dialogs THEN the system SHALL include accessibility props (disableEnforceFocus, disableRestoreFocus, aria-labelledby, aria-describedby)
6. WHEN using MUI v7 Grid THEN the system SHALL use size prop (NOT item prop)
7. WHEN creating cards THEN the system SHALL wrap with React.memo, use useCallback for event handlers, useMemo for computed values

### Requirement 19: Frontend Authentication and Authorization

**User Story:** As a frontend user, I want authentication with login, registration, and password reset, so that I can access the system securely.

#### Acceptance Criteria

1. WHEN creating auth slice THEN the system SHALL manage user, isAuthenticated, isLoading state
2. WHEN creating auth API THEN the system SHALL inject endpoints for register, login, logout, refreshToken, forgotPassword, resetPassword
3. WHEN creating useAuth hook THEN the system SHALL provide user, isAuthenticated, login, logout functions
4. WHEN creating login page THEN the system SHALL use LoginForm with email and password fields, validation matching backend
5. WHEN creating registration page THEN the system SHALL use multi-step wizard (4 steps: user details, organization details, upload attachments, review)
6. WHEN creating forgot password page THEN the system SHALL use form with email field, show success message
7. WHEN creating reset password page THEN the system SHALL use form with token (from URL) and new password, redirect to login on success

### Requirement 20: Frontend Resource Management (Organization, Department, User)

**User Story:** As a frontend user, I want to manage organizations, departments, and users, so that I can organize the system effectively.

#### Acceptance Criteria

1. WHEN creating organization pages THEN the system SHALL use DataGrid pattern with pagination, filters, MuiActionColumn
2. WHEN creating organization form THEN the system SHALL validate fields matching backend, use MuiDialog wrapper
3. WHEN creating department pages THEN the system SHALL use DataGrid pattern, scope to user's organization
4. WHEN creating user pages THEN the system SHALL use DataGrid for admin view, three-layer pattern for user view
5. WHEN creating user form THEN the system SHALL include skills array with add/remove, validate matching backend
6. WHEN creating profile page THEN the system SHALL display user info, edit profile button, dashboard statistics

### Requirement 21: Frontend Material and Vendor Management

**User Story:** As a frontend user, I want to manage materials and vendors, so that I can track resources and external partners.

#### Acceptance Criteria

1. WHEN creating material pages THEN the system SHALL use DataGrid pattern with filters (category, vendor, quantity range)
2. WHEN creating material form THEN the system SHALL use category and unitType from constants, validate matching backend
3. WHEN creating vendor pages THEN the system SHALL use DataGrid pattern with filters (search)
4. WHEN creating vendor form THEN the system SHALL validate contactPerson, email, phone, address matching backend
5. WHEN deleting vendor THEN the system SHALL show confirmation dialog about material reassignment

### Requirement 22: Frontend Task Management

**User Story:** As a frontend user, I want to manage tasks with activities and comments, so that I can track work progress and communicate effectively.

#### Acceptance Criteria

1. WHEN creating task pages THEN the system SHALL use three-layer pattern (Page → List → Card) with filters (status, priority, type, assignee, date range)
2. WHEN creating task form THEN the system SHALL show type selection, conditional fields based on type (ProjectTask: vendorId, costs, assignees, watchers; RoutineTask: direct materials, required dates; AssignedTask: assignedTo)
3. WHEN creating task detail page THEN the system SHALL display complete task info, TaskActivity list (ProjectTask/AssignedTask only), TaskComment list, Attachment list
4. WHEN creating TaskActivity component THEN the system SHALL only show for ProjectTask/AssignedTask, allow materials with quantities, attachments
5. WHEN creating TaskComment component THEN the system SHALL support threading (max depth 3), mentions with autocomplete, attachments

### Requirement 23: Frontend Notifications and Real-Time

**User Story:** As a frontend user, I want notifications and real-time updates, so that I stay informed of changes immediately.

#### Acceptance Criteria

1. WHEN creating notification API THEN the system SHALL inject endpoints for getNotifications, markAsRead, markAllAsRead, deleteNotification
2. WHEN creating NotificationMenu THEN the system SHALL show bell icon with unread count badge, dropdown with recent notifications, mark as read on click
3. WHEN creating notification pages THEN the system SHALL list all notifications, filter by read/unread, navigate to related resource on click
4. WHEN setting up Socket.IO THEN the system SHALL connect on mount, disconnect on unmount, setup event handlers
5. WHEN receiving Socket.IO events THEN the system SHALL invalidate RTK Query cache, show toast notifications, update UI in real-time

### Requirement 24: Frontend Dashboard and Analytics

**User Story:** As a frontend user, I want a dashboard with widgets and statistics, so that I can see an overview of my work.

#### Acceptance Criteria

1. WHEN creating dashboard page THEN the system SHALL display widgets for total tasks by status, tasks by priority, recent tasks, upcoming deadlines
2. WHEN creating dashboard page THEN the system SHALL show user statistics, department statistics (Admin+)
3. WHEN creating charts THEN the system SHALL use MUI X Charts for pie chart (task status), bar chart (task priority)
4. WHEN creating recent tasks list THEN the system SHALL show recent tasks with click to view details
5. WHEN creating upcoming deadlines THEN the system SHALL show tasks with upcoming deadlines sorted by due date

### Requirement 25: Frontend File Upload and Attachments

**User Story:** As a frontend user, I want to upload files as attachments, so that I can provide supporting documentation.

#### Acceptance Criteria

1. WHEN creating cloudinaryService THEN the system SHALL implement uploadToCloudinary function for direct upload
2. WHEN creating MuiFileUpload THEN the system SHALL show image preview, validate file size and type, upload to Cloudinary, return URL
3. WHEN creating attachment API THEN the system SHALL inject endpoints for getAttachments, createAttachment, deleteAttachment
4. WHEN creating AttachmentList THEN the system SHALL display attachments with download button, delete button (own attachments), image preview

### Requirement 26: Frontend Global Search

**User Story:** As a frontend user, I want global search across all resources, so that I can find information quickly.

#### Acceptance Criteria

1. WHEN creating GlobalSearch THEN the system SHALL search across users, tasks, materials, vendors, departments with debouncing (300ms)
2. WHEN displaying search results THEN the system SHALL group by resource type, navigate to resource on click
3. WHEN opening GlobalSearch THEN the system SHALL support keyboard shortcut Ctrl+K or Cmd+K
4. WHEN adding to layout THEN the system SHALL show global search button in header

### Requirement 27: Frontend Testing

**User Story:** As a frontend developer, I want comprehensive tests, so that I can ensure code quality.

#### Acceptance Criteria

1. WHEN testing components THEN the system SHALL test dialog open/close, accessibility props, form submission
2. WHEN testing forms THEN the system SHALL test validation, submission, error display
3. WHEN testing pages THEN the system SHALL test rendering, filtering, CRUD operations
4. WHEN testing hooks THEN the system SHALL test login, logout, auth state
5. WHEN testing services THEN the system SHALL test socket connection, event emission, event listening

### Requirement 28: Production Optimization

**User Story:** As a developer, I want production optimizations, so that the application performs well under load.

#### Acceptance Criteria

1. WHEN optimizing backend THEN the system SHALL add database indexes for frequently queried fields, use lean queries for read-only operations
2. WHEN optimizing frontend THEN the system SHALL configure code splitting, chunk size limits, terser minification in vite.config.js
3. WHEN optimizing components THEN the system SHALL wrap cards with React.memo, use useCallback for event handlers, useMemo for computed values
4. WHEN building for production THEN the system SHALL achieve minimum 80% test coverage, no critical bugs, acceptable performance under load

### Requirement 29: Documentation and Deployment

**User Story:** As a developer, I want complete documentation and deployment guides, so that the application can be deployed and maintained effectively.

#### Acceptance Criteria

1. WHEN creating README THEN the system SHALL include project overview, features, tech stack, prerequisites, installation, development setup, production deployment, env vars
2. WHEN creating backend README THEN the system SHALL document API endpoints, database schema, authentication flow, authorization matrix, testing
3. WHEN creating frontend README THEN the system SHALL document component library, state management, routing, testing
4. WHEN creating DEPLOYMENT.md THEN the system SHALL document server requirements, env configuration, database setup, SSL/HTTPS, monitoring, backups
5. WHEN deploying to production THEN the system SHALL use strong JWT secrets (min 32 chars), enable HTTPS, configure rate limiting, setup logging, monitoring, backups

### Requirement 30: Success Criteria and Completion

**User Story:** As a project stakeholder, I want clear success criteria, so that I know when the project is complete.

#### Acceptance Criteria

1. WHEN checking completion THEN the system SHALL have all 15 phases completed with every task implemented and tested
2. WHEN checking tests THEN the system SHALL have all backend and frontend tests passing with required coverage (80%+ statements, 75%+ branches)
3. WHEN checking integration THEN the system SHALL have backend and frontend working together seamlessly
4. WHEN checking production THEN the system SHALL be deployed and running in production environment
5. WHEN checking documentation THEN the system SHALL have all documentation written and up-to-date
6. WHEN checking bugs THEN the system SHALL have no critical bugs or security vulnerabilities
7. WHEN checking performance THEN the system SHALL perform well under load with acceptable response times
8. WHEN checking acceptance THEN the system SHALL meet all requirements and user needs

### Requirement 31: Controller Architecture and Patterns

**User Story:** As a backend developer, I want standardized controller patterns, so that all controllers follow consistent structure and error handling.

#### Acceptance Criteria

1. WHEN creating read-only controllers THEN the system SHALL extract from req.user and req.validated, perform business logic, populate data, and return response
2. WHEN creating write controllers THEN the system SHALL use MongoDB sessions and transactions, handle errors with abort/rollback, and ensure session cleanup in finally block
3. WHEN validating in controllers THEN the system SHALL only validate business logic (NOT existence or uniqueness which must be in validators layer)
4. WHEN extracting user data THEN the system SHALL destructure organization, department, role, \_id, isHod, isPlatformUser from req.user
5. WHEN extracting validated data THEN the system SHALL use req.validated.body, req.validated.params, or req.validated.query (already converted from Id/Ids postfix to schema field names)
6. WHEN handling transactions THEN the system SHALL create session, start transaction, execute operations with {session}, commit on success, abort on error, end session in finally
7. WHEN responding THEN the system SHALL use formatResponse or formatPaginatedResponse helper functions for consistency

### Requirement 32: Validator Field Name Conversion

**User Story:** As a backend developer, I want validators to handle field name conversion, so that frontend can use intuitive Id/Ids postfix while backend uses schema field names.

#### Acceptance Criteria

1. WHEN frontend sends organizationId THEN the validator SHALL convert to organization before attaching to req.validated.body
2. WHEN frontend sends departmentId THEN the validator SHALL convert to department before attaching to req.validated.body
3. WHEN frontend sends vendorId THEN the validator SHALL convert to vendor before attaching to req.validated.body
4. WHEN frontend sends materialIds THEN the validator SHALL convert to materials before attaching to req.validated.body
5. WHEN frontend sends assignedToIds THEN the validator SHALL convert to assignedTo before attaching to req.validated.body
6. WHEN frontend sends watcherIds THEN the validator SHALL convert to watchers before attaching to req.validated.body
7. WHEN frontend sends assigneeIds THEN the validator SHALL convert to assignees before attaching to req.validated.body
8. WHEN frontend sends attachmentIds THEN the validator SHALL convert to attachments before attaching to req.validated.body
9. WHEN frontend sends mentionIds THEN the validator SHALL convert to mentions before attaching to req.validated.body
10. WHEN frontend sends parentId THEN the validator SHALL convert to parent before attaching to req.validated.body
11. WHEN controllers access validated data THEN the system SHALL use schema field names (organization, department, vendor, materials, etc.) NOT Id/Ids postfix

### Requirement 33: Existing Frontend Components Usage

**User Story:** As a frontend developer, I want to use validated existing components, so that I maintain consistency and avoid recreating functionality.

#### Acceptance Criteria

1. WHEN creating dialogs THEN the system SHALL use MuiDialog.jsx with props (open, onClose, title, children, actions, fullScreen, maxWidth, isLoading)
2. WHEN creating confirmation dialogs THEN the system SHALL use MuiDialogConfirm.jsx with props (open, onClose, onConfirm, title, message, confirmText, cancelText, severity, isLoading)
3. WHEN creating autocomplete selects THEN the system SHALL use MuiSelectAutocomplete.jsx with Controller from react-hook-form (NEVER watch())
4. WHEN creating text inputs THEN the system SHALL use MuiTextField.jsx with Controller from react-hook-form (NEVER watch())
5. WHEN using platform branding THEN the system SHALL use CustomIcons.jsx PlatformIconLogo component
6. WHEN creating new components THEN the system SHALL NEVER recreate functionality that exists in validated common components
7. WHEN using existing components THEN the system SHALL follow MUI v7 syntax (size prop for Grid, NOT item prop)

### Requirement 34: Date and Time Validation Rules

**User Story:** As a backend developer, I want specific date validation rules for different task types, so that business logic is enforced correctly.

#### Acceptance Criteria

1. WHEN creating ProjectTask THEN the system SHALL require startDate and dueDate, prevent both from being in past, ensure startDate < dueDate
2. WHEN creating RoutineTask THEN the system SHALL require startDate and dueDate, allow startDate in past, prevent dueDate in future, ensure startDate < dueDate
3. WHEN creating AssignedTask THEN the system SHALL require startDate and dueDate, prevent both from being in past, ensure startDate < dueDate
4. WHEN validating dates THEN the system SHALL use UTC timezone for all comparisons
5. WHEN storing dates THEN the system SHALL store in UTC format in database
6. WHEN returning dates THEN the system SHALL return in ISO 8601 format

### Requirement 35: Resource Ownership Validation

**User Story:** As a backend developer, I want comprehensive ownership validation, so that authorization checks all applicable ownership fields.

#### Acceptance Criteria

1. WHEN checking Organization ownership THEN the system SHALL verify createdBy field
2. WHEN checking Department ownership THEN the system SHALL verify createdBy field
3. WHEN checking User ownership THEN the system SHALL verify deletedBy and restoredBy fields
4. WHEN checking Material ownership THEN the system SHALL verify addedBy, deletedBy, and restoredBy fields
5. WHEN checking Vendor ownership THEN the system SHALL verify createdBy, deletedBy, and restoredBy fields
6. WHEN checking BaseTask ownership THEN the system SHALL verify createdBy, watchers, deletedBy, and restoredBy fields
7. WHEN checking ProjectTask ownership THEN the system SHALL verify createdBy, watchers, vendor, assignees, modifiedBy, costHistory.changedBy, deletedBy, and restoredBy fields
8. WHEN checking AssignedTask ownership THEN the system SHALL verify createdBy, watchers, assignees, deletedBy, and restoredBy fields
9. WHEN checking TaskActivity ownership THEN the system SHALL verify createdBy, deletedBy, and restoredBy fields
10. WHEN checking TaskComment ownership THEN the system SHALL verify createdBy, mentions, deletedBy, and restoredBy fields
11. WHEN checking Attachment ownership THEN the system SHALL verify uploadedBy, deletedBy, and restoredBy fields
12. WHEN checking Notification ownership THEN the system SHALL verify createdBy, recipients, readBy.user, deletedBy, and restoredBy fields
13. WHEN authorizing requests THEN the system SHALL combine scope authorization AND ownership authorization (both must pass)

### Requirement 36: Industry Options

**User Story:** As a system administrator, I want comprehensive industry options, so that organizations can accurately categorize themselves.

#### Acceptance Criteria

1. WHEN creating organization THEN the system SHALL provide 24 industry options: Technology, Healthcare, Finance, Education, Retail, Manufacturing, Hospitality, Real Estate, Transportation, Energy, Agriculture, Construction, Media, Telecommunications, Automotive, Aerospace, Pharmaceutical, Legal, Consulting, Non-Profit, Government, Entertainment, Food & Beverage, Other
2. WHEN validating industry THEN the system SHALL enforce selection from predefined list
3. WHEN displaying industry THEN the system SHALL show human-readable industry name

### Requirement 37: Git Workflow and Branch Management

**User Story:** As a developer, I want standardized git workflow, so that development is organized and traceable.

#### Acceptance Criteria

1. WHEN starting a phase THEN the system SHALL create branch with naming convention phase-X-[descriptive-name]
2. WHEN committing THEN the system SHALL use format "Phase X: [Component] - [Brief description]"
3. WHEN completing a phase THEN the system SHALL run all tests and ensure 100% pass before merging
4. WHEN merging THEN the system SHALL merge to main only when phase is 100% complete
5. WHEN cleaning up THEN the system SHALL optionally delete phase branch after successful merge
6. WHEN working on phases THEN the system SHALL develop backend and frontend synchronously (not backend-first)

### Requirement 38: Email Preferences and User Settings

**User Story:** As a user, I want granular email notification preferences, so that I control which notifications I receive.

#### Acceptance Criteria

1. WHEN creating user THEN the system SHALL initialize emailPreferences with default values (all true)
2. WHEN user updates preferences THEN the system SHALL respect enabled, taskNotifications, taskReminders, mentions, announcements, welcomeEmails, passwordReset settings
3. WHEN sending task notification THEN the system SHALL check emailPreferences.taskNotifications before sending
4. WHEN sending mention notification THEN the system SHALL check emailPreferences.mentions before sending
5. WHEN sending welcome email THEN the system SHALL check emailPreferences.welcomeEmails before sending
6. WHEN sending password reset THEN the system SHALL check emailPreferences.passwordReset before sending
7. WHEN sending announcement THEN the system SHALL check emailPreferences.announcements before sending

### Requirement 39: Skills Management

**User Story:** As a user, I want to manage my skills with proficiency levels, so that my capabilities are accurately represented.

#### Acceptance Criteria

1. WHEN adding skills THEN the system SHALL allow maximum 10 skills per user
2. WHEN defining skill THEN the system SHALL require name (max 50 chars) and proficiency (0-100)
3. WHEN validating proficiency THEN the system SHALL ensure value is between 0 and 100 inclusive
4. WHEN displaying skills THEN the system SHALL show name and proficiency level
5. WHEN updating skills THEN the system SHALL allow add, remove, and update operations

### Requirement 40: Employee ID Management

**User Story:** As an administrator, I want unique employee IDs, so that users can be identified within their organization.

#### Acceptance Criteria

1. WHEN creating user THEN the system SHALL generate or accept employeeId (4-digit, 1000-9999)
2. WHEN validating employeeId THEN the system SHALL ensure uniqueness within organization
3. WHEN displaying user THEN the system SHALL show employeeId for identification
4. WHEN searching users THEN the system SHALL allow search by employeeId

### Requirement 41: Test Configuration with Real MongoDB

**User Story:** As a backend developer, I want test configuration using real MongoDB instance, so that tests run reliably without timeout issues.

#### Acceptance Criteria

1. WHEN configuring Jest THEN the system SHALL use testEnvironment: 'node', transform: {}, extensionsToTreatAsEsm: ['.js']
2. WHEN configuring Jest THEN the system SHALL set testTimeout: 30000 (60 seconds) and maxWorkers: 1 for sequential execution
3. WHEN setting up global test environment THEN the system SHALL connect to real MongoDB test database (e.g., mongodb://localhost:27017/task-manager-test)
4. WHEN setting up global test environment THEN the system SHALL set NODE_ENV='test', JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
5. WHEN tearing down tests THEN the system SHALL disconnect from MongoDB and optionally drop test database
6. WHEN setting up each test file THEN the system SHALL connect to test database, clean collections after each test
7. WHEN testing THEN the system SHALL NEVER use MongoDB Memory Server due to timeout issues
8. WHEN running tests THEN the system SHALL achieve minimum 80% statement coverage, 75% branch coverage, 80% function coverage

### Requirement 42: Express Middleware Stack Order

**User Story:** As a backend developer, I want correct middleware stack order, so that security and functionality work properly.

#### Acceptance Criteria

1. WHEN configuring Express app THEN the system SHALL apply middleware in this exact order:
   - helmet (security headers with CSP, HSTS in production)
   - cors (corsOptions)
   - cookieParser
   - express.json({ limit: '10mb' })
   - express.urlencoded({ extended: true, limit: '10mb' })
   - mongoSanitize
   - compression({ threshold: 1024 })
   - Request ID middleware (randomUUID)
   - morgan (development only)
   - Rate limiting (production only)
2. WHEN mounting routes THEN the system SHALL use app.use('/api', routes)
3. WHEN serving frontend THEN the system SHALL serve static files from client/dist in production only
4. WHEN handling errors THEN the system SHALL use 404 handler before global error handler

### Requirement 43: MongoDB Connection Configuration

**User Story:** As a backend developer, I want robust MongoDB connection, so that the application handles connection issues gracefully.

#### Acceptance Criteria

1. WHEN connecting to MongoDB THEN the system SHALL use connection options: serverSelectionTimeoutMS: 5000, socketTimeoutMS: 45000, maxPoolSize: 10, minPoolSize: 2
2. WHEN connecting THEN the system SHALL implement retry logic with exponential backoff (max 30s delay)
3. WHEN monitoring connection THEN the system SHALL check health every 30 seconds
4. WHEN monitoring connection state THEN the system SHALL track: 0 (disconnected), 1 (connected), 2 (connecting), 3 (disconnecting)
5. WHEN shutting down THEN the system SHALL handle graceful shutdown and close MongoDB connection

### Requirement 44: CORS Configuration Details

**User Story:** As a backend developer, I want detailed CORS configuration, so that cross-origin requests work securely.

#### Acceptance Criteria

1. WHEN configuring CORS THEN the system SHALL validate origins with logging
2. WHEN configuring CORS THEN the system SHALL enable credentials: true for cookies
3. WHEN configuring CORS THEN the system SHALL allow methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
4. WHEN configuring CORS THEN the system SHALL allow headers: Content-Type, Authorization, X-Requested-With
5. WHEN configuring CORS THEN the system SHALL expose headers: X-Request-ID, X-RateLimit-Limit, X-RateLimit-Remaining
6. WHEN configuring CORS THEN the system SHALL set maxAge: 86400 (24 hours) for preflight cache
7. WHEN configuring CORS THEN the system SHALL set optionsSuccessStatus: 200
8. WHEN in production THEN the system SHALL never use wildcard origins

### Requirement 45: Winston Logger Configuration

**User Story:** As a backend developer, I want comprehensive logging, so that I can debug and monitor the application.

#### Acceptance Criteria

1. WHEN configuring Winston THEN the system SHALL use log levels: error, warn, info, http, verbose, debug, silly
2. WHEN configuring Winston THEN the system SHALL create file transports: logs/error.log (error level), logs/combined.log (all levels)
3. WHEN configuring Winston THEN the system SHALL use console transport: colorized in development, JSON in production
4. WHEN configuring Winston THEN the system SHALL format logs with: timestamp, level, message, metadata
5. WHEN configuring Winston THEN the system SHALL set max file size: 5MB, max files: 5
6. WHEN logging THEN the system SHALL log: startup, database, socket, email, shutdown, errors with stack traces

### Requirement 46: Security Headers with Helmet

**User Story:** As a backend developer, I want comprehensive security headers, so that the application is protected from common attacks.

#### Acceptance Criteria

1. WHEN configuring Helmet THEN the system SHALL set Content Security Policy (CSP)
2. WHEN configuring Helmet THEN the system SHALL set HTTP Strict Transport Security (HSTS): 1 year, includeSubDomains, preload
3. WHEN configuring Helmet THEN the system SHALL set X-Frame-Options: deny
4. WHEN configuring Helmet THEN the system SHALL set X-Content-Type-Options: nosniff
5. WHEN configuring Helmet THEN the system SHALL set X-XSS-Protection: 1; mode=block
6. WHEN configuring Helmet THEN the system SHALL set Referrer-Policy: strict-origin-when-cross-origin
7. WHEN configuring Helmet THEN the system SHALL hide X-Powered-By header

### Requirement 47: Rate Limiting Configuration

**User Story:** As a backend developer, I want rate limiting, so that the API is protected from abuse.

#### Acceptance Criteria

1. WHEN configuring rate limiting THEN the system SHALL enforce 100 requests per 15 minutes for general API
2. WHEN configuring rate limiting THEN the system SHALL enforce 5 requests per 15 minutes for auth endpoints
3. WHEN configuring rate limiting THEN the system SHALL use req.ip as key generator
4. WHEN configuring rate limiting THEN the system SHALL set standardHeaders: true
5. WHEN configuring rate limiting THEN the system SHALL skip in development (NODE_ENV !== 'production')
6. WHEN rate limiting THEN the system SHALL return headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

### Requirement 48: Constants Synchronization

**User Story:** As a developer, I want synchronized constants between backend and frontend, so that enum values are consistent.

#### Acceptance Criteria

1. WHEN defining constants THEN the system SHALL ensure backend/utils/constants.js and client/src/utils/constants.js are EXACTLY identical
2. WHEN defining USER_ROLES THEN the system SHALL use: { SUPER_ADMIN: 'SuperAdmin', ADMIN: 'Admin', MANAGER: 'Manager', USER: 'User' }
3. WHEN defining TASK_STATUS THEN the system SHALL use: ['To Do', 'In Progress', 'Completed', 'Pending']
4. WHEN defining TASK_PRIORITY THEN the system SHALL use: ['Low', 'Medium', 'High', 'Urgent']
5. WHEN defining TASK_TYPES THEN the system SHALL use: ['ProjectTask', 'RoutineTask', 'AssignedTask']
6. WHEN defining USER_STATUS THEN the system SHALL use: ['Online', 'Offline', 'Away']
7. WHEN defining MATERIAL_CATEGORIES THEN the system SHALL use 9 categories: Electrical, Mechanical, Plumbing, Hardware, Cleaning, Textiles, Consumables, Construction, Other
8. WHEN defining UNIT_TYPES THEN the system SHALL use 30+ types: pcs, kg, g, l, ml, m, cm, mm, m2, m3, box, pack, roll, sheet, bag, bottle, can, carton, dozen, gallon, jar, pair, ream, set, tube, unit, yard, ton, barrel, bundle
9. WHEN defining PAGINATION THEN the system SHALL use: DEFAULT_PAGE: 1, DEFAULT_LIMIT: 10, DEFAULT_SORT_BY: 'createdAt', DEFAULT_SORT_ORDER: 'desc', PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100], MAX_LIMIT: 100
10. WHEN defining LIMITS THEN the system SHALL use: MAX_ATTACHMENTS: 10, MAX_WATCHERS: 20, MAX_ASSIGNEES: 20, MAX_MATERIALS: 20, MAX_TAGS: 5, MAX_MENTIONS: 5, MAX_SKILLS: 10, MAX_COMMENT_DEPTH: 3, MAX_COST_HISTORY: 200, MAX_NOTIFICATION_RECIPIENTS: 500
11. WHEN defining LENGTH_LIMITS THEN the system SHALL use: TITLE_MAX: 50, DESCRIPTION_MAX: 2000, COMMENT_MAX: 2000, ORG_NAME_MAX: 100, DEPT_NAME_MAX: 100, USER_NAME_MAX: 20, EMAIL_MAX: 50, PASSWORD_MIN: 8, POSITION_MAX: 100, ADDRESS_MAX: 500, PHONE_MAX: 20, SKILL_NAME_MAX: 50, TAG_MAX: 50
12. WHEN using constants THEN the system SHALL ALWAYS import from utils/constants.js and NEVER hardcode values

### Requirement 49: Helper Utilities

**User Story:** As a backend developer, I want helper utilities, so that I can standardize common operations.

#### Acceptance Criteria

1. WHEN creating helpers THEN the system SHALL provide formatResponse(success, message, data) for standardized API responses
2. WHEN creating helpers THEN the system SHALL provide formatPaginatedResponse(success, message, resourceName, docs, pagination) for paginated responses
3. WHEN creating helpers THEN the system SHALL provide validateObjectId(id) to check if valid MongoDB ObjectId
4. WHEN creating helpers THEN the system SHALL provide sanitizeUser(user) to remove password and sensitive fields
5. WHEN creating helpers THEN the system SHALL provide generateRandomToken() to generate random token for password reset

### Requirement 50: Environment Variable Validation

**User Story:** As a backend developer, I want environment variable validation, so that missing configuration is caught early.

#### Acceptance Criteria

1. WHEN validating environment THEN the system SHALL check required variables: MONGODB_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
2. WHEN validating environment THEN the system SHALL check optional variables: PORT, CLIENT_URL, NODE_ENV, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM
3. WHEN required variables missing THEN the system SHALL throw error and prevent startup
4. WHEN optional variables missing THEN the system SHALL log warnings
5. WHEN validating THEN the system SHALL run validation on server startup before connecting to database

### Requirement 51: Redux Store Configuration

**User Story:** As a frontend developer, I want Redux store with persistence, so that auth state survives page refreshes.

#### Acceptance Criteria

1. WHEN configuring store THEN the system SHALL use configureStore with api reducer and persisted auth reducer
2. WHEN persisting state THEN the system SHALL persist only auth slice to localStorage with key: 'root', whitelist: ['auth']
3. WHEN configuring middleware THEN the system SHALL use getDefaultMiddleware with serializableCheck ignoring persist actions (FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER)
4. WHEN configuring middleware THEN the system SHALL concat api.middleware
5. WHEN configuring store THEN the system SHALL export store, persistor
6. WHEN configuring store THEN the system SHALL call setupListeners(store.dispatch)

### Requirement 52: React Router v7 Configuration

**User Story:** As a frontend developer, I want React Router v7 with lazy loading, so that the application loads efficiently.

#### Acceptance Criteria

1. WHEN configuring routes THEN the system SHALL use createBrowserRouter with lazy loading for code splitting
2. WHEN configuring routes THEN the system SHALL use RootLayout with LoadingFallback and ErrorBoundary
3. WHEN configuring routes THEN the system SHALL use PublicLayout for public routes with PublicMiddleware
4. WHEN configuring routes THEN the system SHALL use DashboardLayout for protected routes with ProtectedMiddleware
5. WHEN configuring routes THEN the system SHALL lazy load pages: Home, Login, Register, Dashboard, NotFound
6. WHEN handling route errors THEN the system SHALL display RouteError component with error message and home button

### Requirement 53: MUI v7 Component Usage

**User Story:** As a frontend developer, I want to use MUI v7 correctly, so that components work without errors.

#### Acceptance Criteria

1. WHEN using Grid THEN the system SHALL use size prop (e.g., size={{ xs: 12, md: 6 }}), NOT item prop
2. WHEN using Autocomplete THEN the system SHALL use slots API, NOT renderTags
3. WHEN using Dialog THEN the system SHALL include accessibility props: disableEnforceFocus, disableRestoreFocus, aria-labelledby, aria-describedby
4. WHEN creating forms THEN the system SHALL use react-hook-form with Controller, NEVER use watch() method
5. WHEN creating cards THEN the system SHALL wrap with React.memo, use useCallback for event handlers, useMemo for computed values

### Requirement 54: Socket.IO Configuration

**User Story:** As a developer, I want Socket.IO for real-time updates, so that users see changes immediately.

#### Acceptance Criteria

1. WHEN configuring Socket.IO backend THEN the system SHALL create singleton instance in utils/socketInstance.js
2. WHEN configuring Socket.IO backend THEN the system SHALL use CORS options matching HTTP CORS
3. WHEN configuring Socket.IO frontend THEN the system SHALL create service in services/socketService.js
4. WHEN authenticating Socket.IO THEN the system SHALL use HTTP-only cookies (same JWT as HTTP)
5. WHEN connecting THEN the system SHALL join rooms: user:${userId}, department:${departmentId}, organization:${organizationId}
6. WHEN emitting events THEN the system SHALL use events: task:created/updated/deleted/restored, activity:created/updated, comment:created/updated/deleted, notification:created, user:online/offline/away
7. WHEN disconnecting THEN the system SHALL implement auto-reconnect with exponential backoff (1s to 5s, max 5 attempts)

### Requirement 55: Email Service Configuration

**User Story:** As a backend developer, I want email service, so that users receive notifications.

#### Acceptance Criteria

1. WHEN configuring email service THEN the system SHALL use Gmail SMTP (smtp.gmail.com:587)
2. WHEN configuring email service THEN the system SHALL use app-specific passwords for authentication
3. WHEN sending emails THEN the system SHALL use in-memory async queue to prevent blocking
4. WHEN creating templates THEN the system SHALL provide HTML templates for: task notifications, mentions, welcome, password reset, announcements
5. WHEN sending emails THEN the system SHALL check user preferences: enabled, taskNotifications, taskReminders, mentions, announcements, welcomeEmails, passwordReset
6. WHEN sending emails THEN the system SHALL retry on failure and log success/failure

### Requirement 56: Pagination Conversion

**User Story:** As a developer, I want automatic pagination conversion, so that backend and frontend pagination work together.

#### Acceptance Criteria

1. WHEN backend paginates THEN the system SHALL use 1-based page numbers
2. WHEN backend responds THEN the system SHALL return: { page: 1, limit: 10, totalCount: 100, totalPages: 10, hasNext: true, hasPrev: false }
3. WHEN frontend paginates THEN the system SHALL use MUI DataGrid with 0-based page numbers
4. WHEN converting pagination THEN the system SHALL convert: Frontend → Backend (page + 1), Backend → Frontend (page - 1)
5. WHEN using MuiDataGrid THEN the system SHALL automatically handle pagination conversion
6. WHEN configuring page sizes THEN the system SHALL use options: [5, 10, 25, 50, 100], default: 10, max: 100

### Requirement 57: Timezone Management

**User Story:** As a developer, I want timezone management, so that dates display correctly for all users.

#### Acceptance Criteria

1. WHEN configuring backend THEN the system SHALL set server timezone to UTC (process.env.TZ = 'UTC')
2. WHEN configuring backend THEN the system SHALL use dayjs with UTC and timezone plugins
3. WHEN storing dates THEN the system SHALL store all dates in UTC format
4. WHEN returning dates THEN the system SHALL return in ISO 8601 format
5. WHEN configuring frontend THEN the system SHALL automatically detect local timezone
6. WHEN displaying dates THEN the system SHALL convert UTC to local timezone
7. WHEN submitting dates THEN the system SHALL convert local to UTC
8. WHEN using DateTimePicker THEN the system SHALL handle timezone automatically
9. WHEN creating date utilities THEN the system SHALL provide: formatDate, utcToLocal, localToUtc

### Requirement 58: Property-Based Testing

**User Story:** As a backend developer, I want property-based testing, so that I can test universal properties.

#### Acceptance Criteria

1. WHEN creating property-based tests THEN the system SHALL use fast-check library
2. WHEN creating property-based tests THEN the system SHALL run minimum 100 runs per property
3. WHEN creating property-based tests THEN the system SHALL test real functionality without mocks
4. WHEN creating property-based tests THEN the system SHALL include comment header: feature, property number, requirements
5. WHEN creating property-based tests THEN the system SHALL use descriptive names explaining what is being tested
6. WHEN testing soft delete THEN the system SHALL verify: soft delete preserves data, soft deleted documents excluded from queries, withDeleted includes soft deleted, restore sets isDeleted to false
7. WHEN testing authorization THEN the system SHALL verify: role hierarchy, scope hierarchy, platform rules
8. WHEN testing cascade THEN the system SHALL verify: cascade operations are transactional, all-or-nothing behavior

### Requirement 59: Git Workflow

**User Story:** As a developer, I want standardized git workflow, so that development is organized.

#### Acceptance Criteria

1. WHEN starting a phase THEN the system SHALL create branch: git checkout -b phase-X-[phase-name]
2. WHEN committing THEN the system SHALL use format: "Phase X: [Component] - [Brief description]"
3. WHEN completing a phase THEN the system SHALL run all tests and ensure 100% pass before merging
4. WHEN merging THEN the system SHALL: git checkout main, git merge phase-X-[phase-name], git push origin main
5. WHEN cleaning up THEN the system SHALL optionally delete phase branch: git branch -d phase-X-[phase-name]
6. WHEN developing THEN the system SHALL develop backend and frontend synchronously (not backend-first)

### Requirement 60: Production Deployment

**User Story:** As a developer, I want production deployment configuration, so that the application runs in production.

#### Acceptance Criteria

1. WHEN building frontend THEN the system SHALL run: npm run build:prod → client/dist/
2. WHEN serving frontend THEN the system SHALL use express.static(client/dist) in production
3. WHEN deploying THEN the system SHALL use single server: backend serves both API and frontend
4. WHEN configuring environment THEN the system SHALL use different env vars for dev/prod
5. WHEN in production THEN the system SHALL enforce HTTPS (secure cookies, HSTS)
6. WHEN managing process THEN the system SHALL use PM2 or systemd with cluster mode
7. WHEN shutting down THEN the system SHALL handle graceful shutdown: close connections, stop accepting requests
8. WHEN monitoring THEN the system SHALL provide /api/health endpoint
9. WHEN logging THEN the system SHALL use Winston logs: logs/error.log, logs/combined.log
10. WHEN monitoring THEN the system SHALL use PM2 monitoring, MongoDB Atlas monitoring, uptime monitoring

### Requirement 61: Implementation Phase Structure

**User Story:** As a development team, I want clearly defined implementation phases with specific tasks, so that development follows a structured approach.

#### Acceptance Criteria

1. WHEN implementing Phase 1 THEN the system SHALL complete Backend Core Configuration and Utilities (config/, utils/, models/plugins/)
2. WHEN implementing Phase 2 THEN the system SHALL complete Mongoose Models with Soft Delete Plugin (all 13 models)
3. WHEN implementing Phase 3 THEN the system SHALL complete Error Handling and Middleware (CustomError, authMiddleware, authorization, rateLimiter)
4. WHEN implementing Phase 4 THEN the system SHALL complete Services, Templates, and Server Setup (emailService, notificationService, templates, app.js, server.js)
5. WHEN implementing Phase 5 THEN the system SHALL complete Test Setup and Validation (Jest config, global setup/teardown, test helpers, complete test suite)
6. WHEN implementing Phase 6 (Routes/Validators/Controllers) THEN the system SHALL complete Auth, Organization/Department/User, Material/Vendor/Attachment/Notification, Task/TaskActivity/TaskComment
7. WHEN implementing Phase 7 (Complete Backend) THEN the system SHALL complete Integration Testing, Code Quality, Documentation, Final Validation
8. WHEN implementing frontend phases THEN the system SHALL complete Redux/Routing, Common Components, Auth, Resource Management, Task/Notifications in sequence

### Requirement 62: Model Relationship Hierarchy

**User Story:** As a backend developer, I want clear model relationships, so that data integrity is maintained through proper references.

#### Acceptance Criteria

1. WHEN defining Organization model THEN the system SHALL establish one-to-many relationship with Department
2. WHEN defining Department model THEN the system SHALL establish one-to-many relationships with User, Task, Material, Vendor
3. WHEN defining User model THEN the system SHALL establish one-to-many relationships with Task (createdBy), TaskActivity, TaskComment, Attachment, Material, Notification
4. WHEN defining BaseTask model THEN the system SHALL establish one-to-many relationships with TaskActivity, TaskComment, Attachment
5. WHEN defining TaskActivity model THEN the system SHALL establish one-to-many relationships with TaskComment, Attachment
6. WHEN defining TaskComment model THEN the system SHALL establish recursive one-to-many relationship with itself (max depth 3) and one-to-many with Attachment
7. WHEN defining polymorphic relationships THEN the system SHALL use refPath for TaskComment parent and Attachment parent
8. WHEN cascading deletes THEN the system SHALL follow relationship hierarchy: Organization → Department → User → Task → TaskActivity/TaskComment → Attachment

### Requirement 63: Socket.IO Room Management

**User Story:** As a backend developer, I want structured Socket.IO room management, so that real-time events reach the correct users.

#### Acceptance Criteria

1. WHEN user connects via Socket.IO THEN the system SHALL join three rooms: user:${userId}, department:${departmentId}, organization:${organizationId}
2. WHEN emitting task events THEN the system SHALL emit to department:${departmentId} and organization:${organizationId} rooms
3. WHEN emitting notification events THEN the system SHALL emit to user:${userId} room only
4. WHEN emitting user status events THEN the system SHALL emit to department:${departmentId} and organization:${organizationId} rooms
5. WHEN user disconnects THEN the system SHALL automatically leave all rooms
6. WHEN implementing room naming THEN the system SHALL use format: resourceType:${resourceId}

### Requirement 64: Email Template Variables

**User Story:** As a backend developer, I want standardized email template variables, so that emails are consistent and maintainable.

#### Acceptance Criteria

1. WHEN creating welcome email template THEN the system SHALL use variables: firstName, lastName, organizationName, email, loginUrl
2. WHEN creating task notification template THEN the system SHALL use variables: firstName, taskTitle, action, taskUrl, description, priority, status, createdBy
3. WHEN creating mention email template THEN the system SHALL use variables: firstName, mentionedBy, commentContent, taskTitle, taskUrl
4. WHEN creating password reset template THEN the system SHALL use variables: firstName, resetUrl, expiryTime
5. WHEN creating announcement template THEN the system SHALL use variables: firstName, title, message, organizationName
6. WHEN rendering templates THEN the system SHALL replace all {{variable}} placeholders with actual values

### Requirement 65: Nginx Reverse Proxy Configuration

**User Story:** As a DevOps engineer, I want complete Nginx configuration, so that the application is properly proxied in production.

#### Acceptance Criteria

1. WHEN configuring Nginx THEN the system SHALL listen on port 443 with SSL/TLS
2. WHEN proxying API requests THEN the system SHALL proxy /api to http://localhost:4000 with proper headers
3. WHEN proxying Socket.IO THEN the system SHALL proxy /socket.io with WebSocket upgrade support
4. WHEN serving frontend THEN the system SHALL serve static files from client/dist with try_files fallback to index.html
5. WHEN configuring SSL THEN the system SHALL use TLSv1.2 and TLSv1.3 protocols only
6. WHEN enabling compression THEN the system SHALL gzip text/plain, text/css, application/javascript, application/json
7. WHEN setting cache headers THEN the system SHALL set 1 year expiry for static files with Cache-Control: public, immutable

### Requirement 66: Health Check Endpoints

**User Story:** As a DevOps engineer, I want health check endpoints, so that I can monitor application status.

#### Acceptance Criteria

1. WHEN implementing health check THEN the system SHALL provide GET /api/health endpoint returning {status: 'ok'}
2. WHEN implementing database health check THEN the system SHALL provide GET /api/health/db endpoint checking MongoDB connection
3. WHEN database is connected THEN the system SHALL return {status: 'ok', database: 'connected'}
4. WHEN database is disconnected THEN the system SHALL return {status: 'error', database: 'disconnected'} with 503 status
5. WHEN monitoring THEN the system SHALL log health check requests at debug level only

### Requirement 67: Backup and Recovery Procedures

**User Story:** As a system administrator, I want documented backup procedures, so that data can be recovered in case of failure.

#### Acceptance Criteria

1. WHEN performing manual backup THEN the system SHALL use mongodump with --uri and --out parameters
2. WHEN scheduling automated backups THEN the system SHALL run daily at 2 AM via cron job
3. WHEN retaining backups THEN the system SHALL keep backups for 7 days minimum
4. WHEN restoring from backup THEN the system SHALL use mongorestore with --uri and backup directory path
5. WHEN backing up application THEN the system SHALL backup source code (Git), environment variables (secure vault), uploaded files (Cloudinary automatic)

### Requirement 68: Security Hardening Checklist

**User Story:** As a security engineer, I want a comprehensive security checklist, so that all security measures are verified before production.

#### Acceptance Criteria

1. WHEN deploying to production THEN the system SHALL enforce HTTPS with secure cookies and HSTS header
2. WHEN configuring JWT THEN the system SHALL use strong secrets (min 32 characters, random)
3. WHEN configuring MongoDB THEN the system SHALL enable authentication
4. WHEN configuring firewall THEN the system SHALL open only necessary ports (80, 443, 27017 internal only)
5. WHEN enabling rate limiting THEN the system SHALL enforce limits in production only
6. WHEN configuring CORS THEN the system SHALL restrict to production domain only
7. WHEN setting security headers THEN the system SHALL configure Helmet with CSP, X-Frame-Options, etc.
8. WHEN sanitizing input THEN the system SHALL use Mongo Sanitize for NoSQL injection prevention
9. WHEN hashing passwords THEN the system SHALL use bcrypt with ≥12 salt rounds
10. WHEN using cookies THEN the system SHALL set httpOnly, secure, sameSite: strict
11. WHEN updating dependencies THEN the system SHALL run npm audit regularly
12. WHEN storing secrets THEN the system SHALL never commit environment variables to source code
13. WHEN logging errors THEN the system SHALL not include passwords or tokens
14. WHEN displaying errors THEN the system SHALL not expose sensitive information

### Requirement 69: Scaling Strategies

**User Story:** As a system architect, I want documented scaling strategies, so that the application can handle growth.

#### Acceptance Criteria

1. WHEN scaling horizontally THEN the system SHALL use load balancer (Nginx, HAProxy, or cloud)
2. WHEN running multiple instances THEN the system SHALL use PM2 cluster mode with -i max
3. WHEN implementing session management THEN the system SHALL use stateless JWT auth (no session affinity required)
4. WHEN storing files THEN the system SHALL use Cloudinary for shared storage across instances
5. WHEN scaling vertically THEN the system SHALL use 2+ CPU cores and 4GB+ RAM minimum
6. WHEN scaling database THEN the system SHALL implement MongoDB replica set for high availability
7. WHEN handling large datasets THEN the system SHALL implement sharding for datasets >100GB
8. WHEN optimizing reads THEN the system SHALL use read replicas for read-heavy workloads

### Requirement 70: Monitoring Tools Integration

**User Story:** As a DevOps engineer, I want monitoring tools integration, so that I can track application performance and errors.

#### Acceptance Criteria

1. WHEN monitoring processes THEN the system SHALL use PM2 built-in monitoring
2. WHEN monitoring database THEN the system SHALL use MongoDB Atlas monitoring and alerts
3. WHEN monitoring application performance THEN the system SHALL integrate New Relic or DataDog
4. WHEN tracking errors THEN the system SHALL integrate Sentry for error tracking and reporting
5. WHEN monitoring uptime THEN the system SHALL use Uptime Robot or similar service
6. WHEN logging THEN the system SHALL use Winston with file transports (error.log, combined.log)
7. WHEN viewing logs THEN the system SHALL provide tail -f or PM2 logs commands

### Requirement 71: Test Pattern Standards

**User Story:** As a backend developer, I want standardized test patterns, so that all tests follow consistent structure.

#### Acceptance Criteria

1. WHEN writing unit tests THEN the system SHALL use Arrange-Act-Assert pattern
2. WHEN writing property-based tests THEN the system SHALL use fast-check with minimum 100 runs
3. WHEN writing integration tests THEN the system SHALL use Supertest for API endpoint testing
4. WHEN organizing tests THEN the system SHALL use describe blocks for grouping related tests
5. WHEN naming tests THEN the system SHALL use "should do something specific" format
6. WHEN testing async code THEN the system SHALL use async/await pattern
7. WHEN cleaning up tests THEN the system SHALL clear collections after each test
8. WHEN testing errors THEN the system SHALL test both success and error cases

### Requirement 72: Frontend UI Pattern Standards

**User Story:** As a frontend developer, I want standardized UI patterns, so that components are consistent and maintainable.

#### Acceptance Criteria

1. WHEN implementing admin views THEN the system SHALL use DataGrid pattern (Page → DataGrid with filters)
2. WHEN implementing user views THEN the system SHALL use three-layer pattern (Page → List → Card)
3. WHEN creating cards THEN the system SHALL wrap with React.memo
4. WHEN handling events in cards THEN the system SHALL use useCallback
5. WHEN computing values in cards THEN the system SHALL use useMemo
6. WHEN creating forms THEN the system SHALL use react-hook-form with Controller (NEVER watch())
7. WHEN creating dialogs THEN the system SHALL include accessibility props (disableEnforceFocus, disableRestoreFocus, aria-labelledby, aria-describedby)
8. WHEN using MUI v7 Grid THEN the system SHALL use size prop (NOT item prop)

### Requirement 73: Code Documentation Standards

**User Story:** As a developer, I want code documentation standards, so that code is self-documenting and maintainable.

#### Acceptance Criteria

1. WHEN documenting functions THEN the system SHALL use JSDoc comments with @param, @returns, @throws
2. WHEN documenting classes THEN the system SHALL use JSDoc comments with @class, @constructor, @property
3. WHEN documenting complex logic THEN the system SHALL add inline comments explaining why, not what
4. WHEN documenting API endpoints THEN the system SHALL include method, path, description, auth, params, response
5. WHEN documenting models THEN the system SHALL include schema fields, indexes, validation rules, hooks
6. WHEN documenting configuration THEN the system SHALL include all options with descriptions and defaults
7. WHEN documenting environment variables THEN the system SHALL include name, description, required/optional, default value

### Requirement 74: Error Message Standards

**User Story:** As a developer, I want standardized error messages, so that errors are clear and actionable.

#### Acceptance Criteria

1. WHEN throwing validation errors THEN the system SHALL include field name, error message, and invalid value
2. WHEN throwing authentication errors THEN the system SHALL use generic messages to prevent enumeration
3. WHEN throwing authorization errors THEN the system SHALL indicate insufficient permissions without exposing details
4. WHEN throwing not found errors THEN the system SHALL indicate resource type and ID
5. WHEN throwing conflict errors THEN the system SHALL indicate which unique constraint was violated
6. WHEN logging errors THEN the system SHALL include request ID, user ID, stack trace, and context
7. WHEN returning errors to client THEN the system SHALL use consistent format: {success: false, message: string, errors: array}

### Requirement 75: Performance Optimization Standards

**User Story:** As a developer, I want performance optimization standards, so that the application performs well under load.

#### Acceptance Criteria

1. WHEN querying database THEN the system SHALL create indexes for frequently queried fields
2. WHEN returning read-only data THEN the system SHALL use lean() queries
3. WHEN paginating THEN the system SHALL limit page size to MAX_LIMIT (100)
4. WHEN populating references THEN the system SHALL select only needed fields
5. WHEN implementing frontend THEN the system SHALL use code splitting with lazy loading
6. WHEN bundling frontend THEN the system SHALL configure chunk size limits in vite.config.js
7. WHEN rendering lists THEN the system SHALL use virtualization for large lists (>100 items)
8. WHEN caching THEN the system SHALL implement Redis for production (recommended)

### Requirement 76: Accessibility Standards

**User Story:** As a frontend developer, I want accessibility standards, so that the application is usable by everyone.

#### Acceptance Criteria

1. WHEN creating dialogs THEN the system SHALL include aria-labelledby and aria-describedby
2. WHEN creating forms THEN the system SHALL include labels for all inputs
3. WHEN creating buttons THEN the system SHALL include aria-label for icon-only buttons
4. WHEN creating navigation THEN the system SHALL support keyboard navigation
5. WHEN displaying errors THEN the system SHALL use aria-live regions for screen readers
6. WHEN using colors THEN the system SHALL ensure sufficient contrast ratios (WCAG AA minimum)
7. WHEN creating interactive elements THEN the system SHALL provide focus indicators

### Requirement 77: Internationalization Preparation

**User Story:** As a product manager, I want internationalization preparation, so that the application can be localized in the future.

#### Acceptance Criteria

1. WHEN storing dates THEN the system SHALL store in UTC format
2. WHEN displaying dates THEN the system SHALL convert to user's local timezone
3. WHEN formatting numbers THEN the system SHALL use locale-aware formatting
4. WHEN storing text THEN the system SHALL use UTF-8 encoding
5. WHEN designing UI THEN the system SHALL avoid hardcoded text in components
6. WHEN implementing currency THEN the system SHALL store currency code with amounts
7. WHEN preparing for i18n THEN the system SHALL structure code to support future translation libraries

### Requirement 78: Audit Trail Requirements

**User Story:** As a compliance officer, I want audit trails, so that all changes are tracked for compliance.

#### Acceptance Criteria

1. WHEN soft deleting THEN the system SHALL record deletedBy and deletedAt
2. WHEN restoring THEN the system SHALL record restoredBy, restoredAt, and increment restoreCount
3. WHEN creating resources THEN the system SHALL record createdBy and createdAt
4. WHEN updating resources THEN the system SHALL record updatedAt (automatic via timestamps)
5. WHEN tracking cost changes THEN the system SHALL maintain costHistory with updatedBy and updatedAt
6. WHEN logging actions THEN the system SHALL include user ID, action, resource type, resource ID, timestamp
7. WHEN querying audit trail THEN the system SHALL support filtering by user, date range, action type, resource type

### Requirement 79: Data Retention Policies

**User Story:** As a data protection officer, I want data retention policies, so that data is managed according to regulations.

#### Acceptance Criteria

1. WHEN soft deleting Organization THEN the system SHALL never auto-expire (TTL: null)
2. WHEN soft deleting Department THEN the system SHALL auto-expire after 365 days
3. WHEN soft deleting User THEN the system SHALL auto-expire after 365 days
4. WHEN soft deleting Task THEN the system SHALL auto-expire after 180 days
5. WHEN soft deleting TaskActivity THEN the system SHALL auto-expire after 90 days
6. WHEN soft deleting TaskComment THEN the system SHALL auto-expire after 90 days
7. WHEN soft deleting Material THEN the system SHALL auto-expire after 180 days
8. WHEN soft deleting Vendor THEN the system SHALL auto-expire after 180 days
9. WHEN soft deleting Attachment THEN the system SHALL auto-expire after 90 days
10. WHEN soft deleting Notification THEN the system SHALL auto-expire after 30 days or custom expiresAt
11. WHEN implementing TTL THEN the system SHALL create TTL indexes on deletedAt field with appropriate expiry

### Requirement 80: API Versioning Strategy

**User Story:** As an API developer, I want versioning strategy, so that API changes don't break existing clients.

#### Acceptance Criteria

1. WHEN implementing initial API THEN the system SHALL use /api prefix without version number
2. WHEN making breaking changes THEN the system SHALL create new version with /api/v2 prefix
3. WHEN deprecating endpoints THEN the system SHALL provide 6-month deprecation notice
4. WHEN documenting API THEN the system SHALL clearly indicate version and changes
5. WHEN supporting multiple versions THEN the system SHALL maintain backward compatibility for at least one previous version

### Requirement 81: Terminal Command Compatibility

**User Story:** As a developer, I want all terminal commands tocompatible with my development environment, so that I can execute them without modification.

#### Acceptance Criteria

1. WHEN providing terminal commands THEN the system SHALL ensure compatibility with Git Bash
2. WHEN providing terminal commands THEN the system SHALL ensure compatibility with WSL (Windows Subsystem for Linux)
3. WHEN providing terminal commands THEN the system SHALL ensure compatibility with VS Code integrated terminal
4. WHEN using path separators THEN the system SHALL use forward slashes (/) for cross-platform compatibility
5. WHEN using environment variables THEN the system SHALL use syntax compatible with bash/sh shells
6. WHEN providing npm scripts THEN the system SHALL use cross-platform compatible commands
7. WHEN documenting commands THEN the system SHALL avoid Windows-specific commands (cmd.exe, PowerShell-only)
8. WHEN using file operations THEN the system SHALL use Node.js scripts or cross-platform tools instead of OS-specific commands

### Requirement 82: Development Phase Tracking

**User Story:** As a development team, I want to track development phase progress, so that I can see what has been completed and what remains.

#### Acceptance Criteria

1. WHEN starting development THEN the system SHALL create docs/dev-phase-tracker.md file with all phases listed
2. WHEN listing phases THEN the system SHALL include checkboxes for each phase and sub-task
3. WHEN completing a phase THEN the system SHALL update dev-phase-tracker.md by checking the corresponding checkbox
4. WHEN completing a sub-task THEN the system SHALL update dev-phase-tracker.md by checking the corresponding sub-task checkbox
5. WHEN viewing tracker THEN the system SHALL show phase number, phase name, description, and completion status
6. WHEN organizing tracker THEN the system SHALL group tasks by phase (Phase 1-7 for backend, Phase 8+ for frontend)
7. WHEN updating tracker THEN the system SHALL include date of completion for each checked item
8. WHEN tracking progress THEN the system SHALL calculate and display overall completion percentage

### Requirement 83: Documentation Updates on Phase Completion

**User Story:** As a development team, I want project documentation updated after each phase, so that documentation stays current with implementation.

#### Acceptance Criteria

1. WHEN completing a phase THEN the system SHALL update .kiro/steering/product.md with implemented features and capabilities
2. WHEN completing a phase THEN the system SHALL update .kiro/steering/tech.md with technical decisions, architecture changes, and implementation details
3. WHEN completing a phase THEN the system SHALL update .kiro/steering/structure.md with new files, directories, and code organization
4. WHEN updating product.md THEN the system SHALL document user-facing features, functionality, and business value
5. WHEN updating tech.md THEN the system SHALL document technology stack, design patterns, architectural decisions, and technical constraints
6. WHEN updating structure.md THEN the system SHALL document project structure, file organization, module dependencies, and code layout
7. WHEN updating documentation THEN the system SHALL include phase number and completion date
8. WHEN updating documentation THEN the system SHALL maintain consistency with requirements.md and design.md
9. WHEN creating documentation files THEN the system SHALL create .kiro/steering/ directory if it doesn't exist
10. WHEN updating documentation THEN the system SHALL use markdown format with proper headings, lists, and code blocks
