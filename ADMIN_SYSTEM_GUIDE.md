# FitProFinder Admin Dashboard System

## Overview

A comprehensive admin dashboard system has been successfully implemented for FitProFinder with role-based access control, user management, system analytics, and audit logging.

## Features

### 🔐 Authentication & Authorization

- **Three-tier permission system**: super_admin, admin, moderator
- **Role-based access control** with granular permissions
- **JWT token-based authentication** with admin-specific claims
- **Session management** with activity logging

### 📊 Admin Dashboard

- **Real-time analytics** (users, trainers, conversations, messages)
- **System health monitoring** (database status, uptime, memory usage)
- **Recent user activity** and growth statistics
- **Admin activity feed** with detailed logs

### 👥 User Management

- **Complete CRUD operations** for users
- **Search and filtering** capabilities
- **Role management** (client, trainer, admin)
- **User status control** (active/inactive)
- **Bulk operations** support

### 🛡️ Admin Management

- **Promote users to admin** with specific permission levels
- **Admin role management** (super_admin, admin, moderator)
- **Permission level hierarchy** enforcement
- **Admin activity tracking**

### 📝 Activity Logging

- **Comprehensive audit trail** of all admin actions
- **IP address and user agent tracking**
- **Detailed action logging** with context
- **Filterable activity logs** by date, admin, action type

### 📈 System Analytics

- **User growth tracking**
- **Conversation and messaging statistics**
- **Trainer activity metrics**
- **System performance monitoring**

## Access Levels

### Super Admin (Level 3)

- **Full system access**
- **User management**: create, read, update, delete
- **Admin management**: create, read, update, delete
- **System settings**: read, update, delete
- **Analytics**: read
- **Logs**: read, delete

### Admin (Level 2)

- **User management**: create, read, update, delete
- **Admin viewing**: read only
- **System monitoring**: read only
- **Analytics**: read
- **Logs**: read

### Moderator (Level 1)

- **User management**: read, update only
- **Limited system access**: read only
- **Analytics**: read
- **Logs**: read

## Default Master Admin Account

```
Email: admin@fitprofinder.com
Password: admin123456
Level: super_admin
```

## API Endpoints

### Dashboard

- `GET /api/admin/dashboard` - Main dashboard with analytics and system health

### User Management

- `GET /api/admin/users` - List users with pagination and filters
- `GET /api/admin/users/:id` - Get specific user details
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### Admin Management

- `GET /api/admin/admins` - List all admin users
- `POST /api/admin/admins/:userId/promote` - Promote user to admin
- `PUT /api/admin/admins/:userId/level` - Update admin level
- `DELETE /api/admin/admins/:userId/revoke` - Revoke admin privileges

### Activity Logs

- `GET /api/admin/logs` - Get admin activity logs with pagination

### System Health

- `GET /api/admin/system` - System health and performance metrics

## Database Schema

### Admin Permissions Table

```sql
admin_permissions:
- id (UUID, primary key)
- user_id (UUID, foreign key to users)
- permission_level (enum: super_admin, admin, moderator)
- permissions (JSON)
- granted_by (UUID, foreign key to users)
- expires_at (timestamp, nullable)
- is_active (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)
```

### Admin Activity Log Table

```sql
admin_activity_log:
- id (UUID, primary key)
- admin_id (UUID, foreign key to users)
- action (string)
- target_type (string)
- target_id (UUID, nullable)
- details (JSON)
- ip_address (string)
- user_agent (text)
- created_at (timestamp)
```

### Users Table Extensions

```sql
users table additions:
- admin_level (enum: super_admin, admin, moderator, nullable)
- admin_since (timestamp, nullable)
- last_login_at (timestamp, nullable)
```

## Frontend Integration

### Admin Dashboard UI

- **Tab-based interface** for easy navigation
- **Real-time data updates** with refresh functionality
- **Responsive design** for mobile and desktop
- **Intuitive user management** with search and filters
- **Visual analytics** with charts and metrics
- **Admin action forms** with validation

### Access Control

- **Route protection** based on admin level
- **Dynamic navigation** showing only accessible features
- **Permission-based UI** hiding unauthorized actions
- **Automatic redirects** for unauthorized access

## Security Features

### Authentication

- **JWT token verification** for all admin endpoints
- **Permission checking** on every admin action
- **Session timeout** and token expiration
- **IP address logging** for security audit

### Authorization

- **Hierarchical permission system** preventing privilege escalation
- **Action-based permissions** (create, read, update, delete)
- **Resource-specific controls** for different data types
- **Audit logging** of all administrative actions

### Data Protection

- **Input validation** on all admin endpoints
- **SQL injection prevention** with parameterized queries
- **XSS protection** with proper data sanitization
- **CSRF protection** with token validation

## Usage Examples

### Login as Admin

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@fitprofinder.com", "password": "admin123456"}'
```

### Get Dashboard Data

```bash
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer <admin_token>"
```

### List Users

```bash
curl -X GET "http://localhost:5000/api/admin/users?page=1&limit=10&role=trainer" \
  -H "Authorization: Bearer <admin_token>"
```

### Promote User to Admin

```bash
curl -X POST http://localhost:5000/api/admin/admins/USER_ID/promote \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"level": "admin"}'
```

## Deployment Notes

### Environment Variables

```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fitprofinder
DB_USER=postgres
DB_PASSWORD=password
```

### Database Setup

1. Run migrations: `npm run migrate`
2. Seed admin account: `npm run seed`
3. Verify admin permissions in database

### Production Considerations

- **Change default admin password** immediately
- **Use strong JWT secret** (minimum 32 characters)
- **Enable SSL/HTTPS** for all admin communications
- **Set up monitoring** for admin activity
- **Regular security audits** of admin actions
- **Backup admin activity logs** regularly

## Maintenance

### Regular Tasks

- **Monitor admin activity logs** for suspicious behavior
- **Review user permissions** periodically
- **Update admin passwords** regularly
- **Clean up old activity logs** (optional)
- **Monitor system performance** metrics

### Troubleshooting

- **Check admin permissions** in database if access denied
- **Verify JWT token** expiration and format
- **Review activity logs** for failed admin actions
- **Monitor server logs** for authentication errors

## Support

The admin system is fully integrated with the existing FitProFinder application and provides comprehensive management capabilities for:

- **User lifecycle management**
- **System monitoring and analytics**
- **Security and audit compliance**
- **Multi-level administrative access**

All admin functionality is accessible through both API endpoints and the web-based dashboard interface.
