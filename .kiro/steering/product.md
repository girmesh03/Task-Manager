# Product Overview

Task Manager is a full-stack web application for organizational task and project management. The system supports multi-tenant architecture with organizations, departments, and role-based access control.

## Core Features

- Multi-tenant organization management with departments
- User authentication and authorization (JWT-based)
- Role-based access control (Super Admin, Admin, Manager, User)
- Task management with assignments and tracking
- Real-time updates via Socket.IO
- Email notifications for task events
- Soft delete functionality for data retention
- File attachments and document management

## User Roles

- **Super Admin**: Organization-level administrator, at least one required per organization
- **Admin**: Department-level administrator
- **Manager**: Team lead with elevated permissions
- **User**: Standard user with basic task access
- **HOD (Head of Department)**: Special designation, one per department

## Key Business Rules

- Each organization must have at least one Super Admin
- Each department can have only one HOD
- Users are scoped to a single organization and department
- Soft deletes preserve data integrity with cascade protection
- Email preferences are configurable per user
