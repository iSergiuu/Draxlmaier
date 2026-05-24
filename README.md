# AssetHub - Asset & Complaint Management System 🏢

A comprehensive enterprise-grade Java Spring Boot backend system for managing company assets and handling employee complaints with real-time notifications and reporting capabilities.

[![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=java&logoColor=white)](https://www.java.com)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-6DB33F?logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Maven](https://img.shields.io/badge/Maven-4.0.0-C71A36?logo=apache-maven&logoColor=white)](https://maven.apache.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Authentication & Authorization](#authentication--authorization)
- [Database](#database)
- [Configuration](#configuration)
- [Installation & Setup](#installation--setup)
- [Running with Docker](#running-with-docker)
- [Build Commands](#build-commands)
- [API Examples](#api-examples)
- [Validation & Error Handling](#validation--error-handling)
- [Security Best Practices](#security-best-practices)
- [Testing](#testing)
- [Performance & Scalability](#performance--scalability)
- [Future Improvements](#future-improvements)

## 🎯 Project Overview

**AssetHub** is an enterprise asset and complaint management platform designed for large organizations. It provides:

- **Asset Management**: Track, allocate, and monitor company equipment across departments
- **Complaint System**: Create, manage, and resolve employee complaints with workflow tracking
- **Role-Based Access Control**: Granular permission system with multiple user roles
- **Real-Time Notifications**: WebSocket-powered instant notifications for users
- **Advanced Reporting**: Generate reports in multiple formats (PDF, Excel, CSV, XML)
- **Department Management**: Organize assets and employees by departments
- **Feedback & Quality Assurance**: Collect feedback on resolved complaints

The system is built for organizations like **Draxlmaier** that require robust IT asset management and internal complaint handling capabilities.

## ✨ Features

### Asset Management
- ✅ Create, read, update, and delete company assets
- ✅ Assign assets to employees
- ✅ Track asset status (AVAILABLE, ASSIGNED, BROKEN, DELETED)
- ✅ Serial number validation with duplicate prevention
- ✅ Asset categorization
- ✅ Personal asset inventory per employee

### Complaint & Ticket System
- ✅ Employee complaint creation and tracking
- ✅ Ticket number auto-generation
- ✅ Complaint status workflow (NEW, IN_PROGRESS, RESOLVED, CLOSED)
- ✅ Priority levels (LOW, MEDIUM, HIGH, CRITICAL)
- ✅ Due date management
- ✅ Escalation tracking
- ✅ Internal and external comments
- ✅ Complaint assignment to administrators
- ✅ Customer feedback submission and rating system
- ✅ Global and department-specific complaint views

### Authentication & Security
- ✅ JWT-based authentication (24-hour token expiration)
- ✅ User registration with temporary account codes
- ✅ Password reset flow with email verification
- ✅ BCrypt password encryption
- ✅ CORS configuration for frontend integration
- ✅ Stateless session management

### Authorization & Role Management
- ✅ Multi-role system (SUPER_ADMIN, ADMIN, DEPT_RESPONSIBLE, USER)
- ✅ Method-level security with @PreAuthorize annotations
- ✅ Role-based endpoint access control
- ✅ Department-scoped permissions

### Notification System
- ✅ Real-time WebSocket notifications
- ✅ Email notifications (password reset, system alerts)
- ✅ Notification history with read/unread tracking
- ✅ User session management
- ✅ Bulk notification operations

### Reporting & Analytics
- ✅ Multi-format report generation (PDF, Excel, CSV, XML)
- ✅ Dynamic filtering and sorting
- ✅ Department-level analytics
- ✅ Dashboard statistics (assets, tickets, employees per department)
- ✅ Export compliance data

### Employee Management
- ✅ Employee profile management
- ✅ Role assignment and modification
- ✅ Account status toggling (active/inactive)
- ✅ Temporary account generation for bulk onboarding
- ✅ Department assignment

### Department Management
- ✅ Department CRUD operations
- ✅ Department-specific statistics
- ✅ Employee and asset distribution tracking

## 🛠️ Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Language** | Java | 21 |
| **Framework** | Spring Boot | 3.3.5 |
| **Security** | Spring Security | 6.x |
| **ORM** | Spring Data JPA / Hibernate | Latest |
| **Database** | PostgreSQL | 15 |
| **Authentication** | JWT (JJWT) | 0.11.5 |
| **Mapping** | MapStruct | 1.5.5 |
| **Validation** | Jakarta Validation | Latest |
| **Mail** | Spring Mail (JavaMailSender) | Latest |
| **WebSocket** | Spring WebSocket | Latest |
| **API Documentation** | SpringDoc OpenAPI (Swagger) | 2.6.0 |
| **Export Formats** | Apache POI, OpenPDF, Apache Commons CSV | Various |
| **XML Processing** | Jackson XML | Latest |
| **Build Tool** | Maven | 4.0.0 |
| **Testing** | JUnit 5, Spring Security Test | Latest |
| **Lombok** | Project Lombok | Latest |
| **Database Migrations** | Flyway | Latest |
| **Container** | Docker | - |

## 🏗️ Architecture

### Layered Architecture

AssetHub follows a **classic 4-layer architecture** pattern:

```
┌─────────────────────────────┐
│   Controller Layer          │  @RestController - API endpoints
├─────────────────────────────┤
│   Service Layer             │  @Service - Business logic
├─────────────────────────────┤
│   Repository Layer          │  @Repository - Data access
├─────────────────────────────┤
│   Entity/Domain Layer       │  @Entity - JPA entities
└─────────────────────────────┘
```

### Key Architectural Components

#### **Controller Layer** (`module.*.controller`)
- Handles HTTP requests and responses
- Input validation via @Valid annotation
- Endpoint authorization with @PreAuthorize
- CORS configuration per module
- Returns DTOs to clients

#### **Service Layer** (`module.*.service`)
- Implements business logic
- Manages transactions (@Transactional)
- Coordinates between repositories
- Handles domain-specific operations
- Raises domain exceptions

#### **Repository Layer** (`module.*.repository`)
- Extends `JpaRepository<Entity, ID>`
- Custom query methods with Spring Data
- Database abstraction
- Lazy and eager loading configuration

#### **Entity/Domain Layer** (`module.*.model`)
- JPA-annotated domain entities
- Relationships (OneToMany, ManyToOne)
- Temporal data with OffsetDateTime
- UUID primary keys (database-generated)

#### **DTO Layer** (`module.*.dto`)
- Request/Response mapping objects
- Input validation annotations
- Decoupling from entity structure
- Records for immutability (Java records)

#### **Configuration Layer** (`core.security`, `core.config`)
- Spring Security configuration
- JWT token generation and validation
- CORS setup
- Exception handling

#### **Security Layer** (`core.security`)
- JWT filter chain
- Custom UserDetailsService
- Password encoding (BCrypt)
- Token expiration management

#### **Exception Handling** (`core.exceptions`)
- Global exception handler with @RestControllerAdvice
- Custom exceptions (ResourceNotFoundException, BusinessException, UnauthorizedException)
- Standardized error response format

## 📁 Project Structure

```
backend/
├── src/main/java/com/draxlmaier/assethub/
│   ├── core/                          # Core infrastructure
│   │   ├── security/                  # Security configuration
│   │   │   ├── SecurityConfig.java    # Spring Security bean configuration
│   │   │   ├── JwtUtil.java           # JWT token generation/validation
│   │   │   ├── JwtAuthenticationFilter.java  # JWT filter chain
│   │   │   └── CustomUserDetailsService.java # User details loading
│   │   └── exceptions/                # Exception handling
│   │       ├── GlobalExceptionHandler.java
│   │       ├── ResourceNotFoundException.java
│   │       ├── BusinessException.java
│   │       └── UnauthorizedException.java
│   │
│   ├── module/                        # Feature modules
│   │   ├── auth/                      # Authentication
│   │   │   ├── controller/            # Auth endpoints
│   │   │   ├── service/               # Auth logic
│   │   │   ├── dto/                   # Request/Response objects
│   │   │   ├── model/                 # Password reset token entity
│   │   │   └── repository/            # Token persistence
│   │   │
│   │   ├── employee/                  # Employee management
│   │   │   ├── controller/            # Employee endpoints
│   │   │   ├── service/               # Business logic
│   │   │   ├── dto/                   # Employee DTOs
│   │   │   ├── model/                 # Employee, Role entities
│   │   │   └── repository/            # Data access
│   │   │
│   │   ├── department/                # Department management
│   │   │   ├── controller/            # Department endpoints
│   │   │   ├── service/               # Department logic
│   │   │   ├── dto/                   # Department DTOs
│   │   │   ├── model/                 # Department entity
│   │   │   └── repository/            # Department access
│   │   │
│   │   ├── asset/                     # Asset management
│   │   │   ├── controller/            # Asset CRUD endpoints
│   │   │   ├── service/               # Asset business logic
│   │   │   ├── dto/                   # Asset DTOs
│   │   │   ├── model/                 # Asset entity
│   │   │   ├── repository/            # Asset persistence
│   │   │   └── mapper/                # MapStruct mapper
│   │   │
│   │   ├── complaint/                 # Complaint/Ticket system
│   │   │   ├── controller/            # Complaint endpoints
│   │   │   ├── service/               # Complaint logic
│   │   │   ├── dto/                   # Complaint DTOs
│   │   │   ├── model/                 # Complaint entities
│   │   │   └── repository/            # Complaint persistence
│   │   │
│   │   ├── notification/              # Notification system
│   │   │   ├── controller/            # Notification endpoints
│   │   │   ├── service/               # Notification logic
│   │   │   ├── dto/                   # Notification DTOs
│   │   │   ├── model/                 # Notification entity
│   │   │   └── repository/            # Notification access
│   │   │
│   │   ├── report/                    # Reporting system
│   │   │   ├── controller/            # Report generation endpoints
│   │   │   ├── service/               # Report logic
│   │   │   ├── dto/                   # Report DTOs
│   │   │   └── service/format/        # Export formatters (PDF, Excel, CSV, XML)
│   │   │
│   │   └── dashboard/                 # Analytics dashboard
│   │       ├── controller/            # Dashboard endpoints
│   │       ├── service/               # Dashboard logic
│   │       ├── dto/                   # Dashboard DTOs
│   │       ├── model/                 # Dashboard view entity
│   │       └── repository/            # Dashboard queries
│   │
│   └── AssethubApplication.java       # Spring Boot main class
│
├── src/main/resources/
│   ├── application.properties         # Application configuration
│   └── db/migration/                  # Flyway database migrations
│
├── pom.xml                            # Maven configuration
├── Dockerfile                         # Docker containerization
└── docker-compose.yml                 # PostgreSQL + Spring Boot compose
```

## 🔌 API Documentation

### Base URL
- **Development**: `http://localhost:8080`
- **CORS Origins**: `http://localhost:5173` (frontend), `http://localhost:3000`

### Authentication Endpoints

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "employeeNumber": "EMP001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "john.doe@example.com",
  "role": "USER",
  "id": "uuid-string"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "john.doe@example.com",
  "role": "USER",
  "id": "uuid-string"
}
```

#### Forgot Password
```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john.doe@example.com"
}

Response: 200 OK
{
  "message": "If the email exists, a password reset link will be sent."
}
```

#### Reset Password
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "uuid-reset-token",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}

Response: 200 OK
{
  "message": "Password reset successfully."
}
```

### Employee Endpoints (Requires Authentication)

#### Get Current User Profile
```
GET /api/employees/me
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "uuid",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "employeeNumber": "EMP001",
  "role": "USER",
  "department": "IT",
  "isActive": true
}
```

#### Get All Employees
```
GET /api/employees
Authorization: Bearer {token}
Requires: SUPER_ADMIN, ADMIN, or DEPT_RESPONSIBLE

Response: 200 OK
[
  { "id": "uuid", "email": "employee@example.com", ... },
  ...
]
```

#### Update Employee
```
PUT /api/employees/{id}
Authorization: Bearer {token}
Requires: SUPER_ADMIN
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com"
}

Response: 200 OK
{ ... updated employee ... }
```

#### Change Employee Role
```
PATCH /api/employees/{id}/role
Authorization: Bearer {token}
Requires: SUPER_ADMIN
Content-Type: application/json

{
  "roleCode": "ADMIN"
}

Response: 200 OK
{ ... employee with new role ... }
```

#### Generate Temporary Accounts
```
POST /api/employees/generate-temp-account?departmentId={deptId}&count=10
Authorization: Bearer {token}
Requires: SUPER_ADMIN, ADMIN, or DEPT_RESPONSIBLE

Response: 200 OK
[ ... list of generated temporary employees ... ]
```

### Asset Endpoints

#### Create Asset
```
POST /api/assets
Authorization: Bearer {token}
Requires: SUPER_ADMIN, ADMIN, or DEPT_RESPONSIBLE
Content-Type: application/json

{
  "name": "Dell Laptop",
  "serialNumber": "SN12345",
  "category": "Computer",
  "status": "AVAILABLE"
}

Response: 201 CREATED
{
  "id": "uuid",
  "name": "Dell Laptop",
  "serialNumber": "SN12345",
  "category": "Computer",
  "status": "AVAILABLE",
  "createdAt": "2026-05-24T16:57:52Z"
}
```

#### Get All Assets
```
GET /api/assets
Authorization: Bearer {token}

Response: 200 OK
[ ... list of all assets ... ]
```

#### Get My Assets
```
GET /api/assets/me
Authorization: Bearer {token}

Response: 200 OK
[ ... assets assigned to current user ... ]
```

#### Get Asset by ID
```
GET /api/assets/{id}
Authorization: Bearer {token}

Response: 200 OK
{ ... asset details ... }
```

#### Update Asset
```
PUT /api/assets/{id}
Authorization: Bearer {token}
Requires: SUPER_ADMIN, ADMIN, or DEPT_RESPONSIBLE
Content-Type: application/json

{
  "name": "Dell Laptop Pro",
  "serialNumber": "SN12345",
  "category": "Computer",
  "status": "AVAILABLE"
}

Response: 200 OK
{ ... updated asset ... }
```

#### Assign Asset
```
POST /api/assets/{id}/assign
Authorization: Bearer {token}
Requires: SUPER_ADMIN, ADMIN, or DEPT_RESPONSIBLE
Content-Type: application/json

{
  "assignedToEmail": "john.doe@example.com"
}

Response: 200 OK
{ ... asset with assignment ... }
```

#### Delete Asset
```
DELETE /api/assets/{id}
Authorization: Bearer {token}
Requires: SUPER_ADMIN or ADMIN

Response: 204 NO CONTENT
```

### Complaint/Ticket Endpoints

#### Create Complaint
```
POST /api/complaints
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Laptop not charging",
  "description": "My Dell laptop is not charging properly",
  "assetId": "uuid",
  "priority": "HIGH",
  "dueDate": "2026-06-01T17:00:00Z"
}

Response: 201 CREATED
{
  "id": "uuid",
  "ticketNumber": 1,
  "title": "Laptop not charging",
  "status": "NEW",
  "priority": "HIGH",
  "createdAt": "2026-05-24T16:57:52Z"
}
```

#### Get My Complaints
```
GET /api/complaints/me
Authorization: Bearer {token}

Response: 200 OK
[ ... user's complaints ... ]
```

#### Get All Complaints
```
GET /api/complaints
Authorization: Bearer {token}
Requires: SUPER_ADMIN, ADMIN, or DEPT_RESPONSIBLE

Response: 200 OK
[ ... all complaints ... ]
```

#### Get Assigned Tickets
```
GET /api/complaints/assigned
Authorization: Bearer {token}
Requires: SUPER_ADMIN or ADMIN

Response: 200 OK
[ ... tickets assigned to current user ... ]
```

#### Update Complaint Status
```
PATCH /api/complaints/{id}/status
Authorization: Bearer {token}
Requires: SUPER_ADMIN or ADMIN
Content-Type: application/json

{
  "statusCode": "IN_PROGRESS"
}

Response: 200 OK
{ ... updated complaint ... }
```

#### Add Comment
```
POST /api/complaints/{id}/comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "This will be fixed by end of week",
  "isInternal": false
}

Response: 201 CREATED
{
  "id": "uuid",
  "complaintId": "uuid",
  "author": "admin@example.com",
  "message": "This will be fixed by end of week",
  "createdAt": "2026-05-24T16:57:52Z"
}
```

#### Submit Feedback
```
POST /api/complaints/{id}/feedback
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 5,
  "comment": "Great service! Problem was resolved quickly."
}

Response: 201 CREATED
{
  "id": "uuid",
  "complaintId": "uuid",
  "rating": 5,
  "comment": "Great service!",
  "createdAt": "2026-05-24T16:57:52Z"
}
```

### Department Endpoints

#### Get All Departments
```
GET /api/departments
Authorization: Bearer {token}

Response: 200 OK
[ ... list of departments ... ]
```

#### Create Department
```
POST /api/departments
Authorization: Bearer {token}
Requires: SUPER_ADMIN
Content-Type: application/json

{
  "name": "Information Technology",
  "description": "IT Department"
}

Response: 201 CREATED
{ ... created department ... }
```

#### Get Department Statistics
```
GET /api/departments/{id}/stats
Authorization: Bearer {token}
Requires: SUPER_ADMIN

Response: 200 OK
{
  "totalEmployees": 25,
  "totalAssets": 45,
  "totalComplaints": 8
}
```

### Notification Endpoints

#### Get My Notifications
```
GET /api/notifications
Authorization: Bearer {token}

Response: 200 OK
[
  {
    "id": "uuid",
    "title": "Complaint Status Updated",
    "message": "Your complaint #1 has been assigned",
    "read": false,
    "referenceId": "complaint-uuid",
    "createdAt": "2026-05-24T16:57:52Z"
  },
  ...
]
```

#### Mark Notification as Read
```
PATCH /api/notifications/{id}/read
Authorization: Bearer {token}

Response: 200 OK
```

#### Clear All Notifications
```
DELETE /api/notifications/clear-all
Authorization: Bearer {token}

Response: 204 NO CONTENT
```

### Report Endpoints

#### Generate Report
```
POST /api/reports/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "entityType": "ASSET",
  "format": "PDF",
  "columns": ["name", "serialNumber", "category", "status"],
  "filters": {
    "status": "AVAILABLE",
    "departmentName": "IT"
  },
  "sortBy": "createdAt",
  "sortDirection": "DESC"
}

Response: 200 OK
[Binary PDF Content]
Content-Disposition: attachment; filename="raport_asset.pdf"
```

Supported formats: `PDF`, `EXCEL`, `CSV`, `XML`

### Dashboard Endpoints

#### Get Dashboard Statistics
```
GET /api/dashboard/stats
Authorization: Bearer {token}

Response: 200 OK
{
  "assets": {
    "total": 150,
    "allocated": 120,
    "available": 25,
    "broken": 3,
    "deleted": 2
  },
  "tickets": {
    "total": 45,
    "newTickets": 5,
    "inProgress": 12,
    "resolved": 28,
    "deleted": 0
  },
  "employeesPerDepartment": [
    { "departmentName": "IT", "count": 25 },
    { "departmentName": "HR", "count": 15 }
  ],
  "assetsPerDepartment": [
    { "departmentName": "IT", "count": 85 },
    { "departmentName": "HR", "count": 30 }
  ]
}
```

## 🔐 Authentication & Authorization

### JWT Authentication Flow

1. **User Registration/Login** → System generates JWT token
2. **Client stores token** → Typically in localStorage
3. **Client sends token** → In `Authorization: Bearer {token}` header
4. **JwtAuthenticationFilter intercepts** → Extracts and validates token
5. **Token validation** → Checks signature, expiration, username match
6. **Security context set** → User authenticated for the request
7. **Token expiration** → 24 hours from generation

### JWT Token Structure
```
Header.Payload.Signature

Header: { "alg": "HS256", "typ": "JWT" }
Payload: { "sub": "user@example.com", "iat": 1234567890, "exp": 1234654290 }
Signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **USER** | View own assets, create complaints, view own tickets, submit feedback, manage own notifications |
| **DEPT_RESPONSIBLE** | All USER permissions + create assets, assign assets, view department data, generate temp accounts, view global tickets |
| **ADMIN** | All USER/DEPT_RESPONSIBLE permissions + manage all employees, change roles, manage all complaints, assign tickets |
| **SUPER_ADMIN** | Full system access - all operations unrestricted |

### Security Features
- ✅ **BCrypt Password Encoding**: Passwords hashed with strength 12
- ✅ **Stateless Authentication**: No server-side session storage
- ✅ **JWT Secret Management**: Configured via environment variables
- ✅ **CORS Configuration**: Restricted to known origins
- ✅ **CSRF Protection**: Disabled for stateless API (safe)
- ✅ **Method-Level Security**: @PreAuthorize on sensitive endpoints
- ✅ **Session Management**: STATELESS policy enforced

## 🗄️ Database

### Database System
- **Engine**: PostgreSQL 15
- **Connection**: Neon Cloud Database (URL in application.properties)
- **ORM**: Hibernate with Spring Data JPA
- **Migrations**: Flyway (currently disabled)

### Key Entities

| Entity | Purpose | Relationships |
|--------|---------|---------------|
| **Employee** | User account | 1:N with Complaint (author), 1:N with Asset (assignedTo) |
| **Role** | User role | 1:N with Employee |
| **Department** | Organizational unit | 1:N with Employee, 1:N with Asset (via Employee) |
| **Asset** | Equipment/Resource | N:1 with Employee (assignedTo) |
| **Complaint** | Support ticket | N:1 Employee (author/assignedTo), N:1 Asset, 1:N Comment |
| **ComplaintStatus** | Ticket status | 1:N Complaint |
| **Comment** | Ticket discussion | N:1 Complaint, N:1 Employee (author) |
| **ComplaintWorkflow** | Status history | N:1 Complaint, N:1 Employee (changedBy) |
| **ComplaintFeedback** | Customer feedback | 1:1 Complaint |
| **Notification** | User alert | N:1 Employee (user) |
| **PasswordResetToken** | Reset token | 1:1 Employee |
| **DashboardStat** | Analytics view | Database view |

### Key Relationships
- **One-to-Many**: Employee → Assets, Employees → Complaints, Complaints → Comments
- **Many-to-One**: Asset → Employee, Complaint → Employee, Comment → Employee
- **Many-to-Many**: Employee → Role (via foreign key), Department → Employee

### Temporal Data
- All entities use `OffsetDateTime` for timezone-aware timestamps
- Soft deletes with `deletedAt` column (data not physically removed)
- `createdAt` (immutable) and `updatedAt` (audit trail)

## ⚙️ Configuration

### Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `spring.datasource.url` | Database URL | `jdbc:postgresql://host:port/dbname` |
| `spring.datasource.username` | DB user | `neondb_owner` |
| `spring.datasource.password` | DB password | `***hidden***` |
| `spring.mail.host` | SMTP server | `smtp.gmail.com` |
| `spring.mail.port` | SMTP port | `587` |
| `spring.mail.username` | Email account | `app@example.com` |
| `spring.mail.password` | Email password/token | `***hidden***` |
| `app.jwt.secret` | JWT signing key | `long-complex-secret-key` |

**⚠️ Security Note**: All sensitive credentials must be externalized via environment variables or secure vaults in production. Never commit to version control.

### Application Properties

```properties
# Server Configuration
server.port=8080

# Database
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Flyway (Database Migrations)
spring.flyway.enabled=false  # Currently disabled; enable when migrations are ready

# Mail (Gmail SMTP example)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# JWT
app.jwt.secret=your-secret-key-here
```

## 📦 Installation & Setup

### Prerequisites

- **Java**: OpenJDK 21 or later
  - Download: https://adoptopenjdk.net/ or https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html
  - Verify: `java -version`

- **Maven**: 3.8.1 or later
  - Download: https://maven.apache.org/download.cgi
  - Verify: `mvn -version`

- **PostgreSQL**: 15 or later
  - Download: https://www.postgresql.org/download/
  - Or use Docker: `docker run -d -p 5432:5432 postgres:15`

- **Docker** (optional): For containerized deployment
  - Download: https://www.docker.com/products/docker-desktop

- **Git**: For version control
  - Download: https://git-scm.com/

### Local Setup

#### Step 1: Clone Repository
```bash
git clone https://github.com/iSergiuu/Draxlmaier.git
cd Draxlmaier/backend
```

#### Step 2: Configure Environment Variables

Create a `.env` file or set system variables:
```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/assethub_db
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=password
export SPRING_MAIL_HOST=smtp.gmail.com
export SPRING_MAIL_PORT=587
export SPRING_MAIL_USERNAME=your-email@gmail.com
export SPRING_MAIL_PASSWORD=your-app-password
export APP_JWT_SECRET=your-super-secret-jwt-key-min-32-chars
```

#### Step 3: Start PostgreSQL Database

**Option A: Docker**
```bash
docker run -d \
  --name assethub-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=assethub_db \
  -p 5432:5432 \
  postgres:15
```

**Option B: Local PostgreSQL**
```bash
# Create database
createdb assethub_db

# Create user
createuser postgres
psql -U postgres -d assethub_db
```

#### Step 4: Install Dependencies
```bash
mvn clean install
```

#### Step 5: Run Migrations (if enabled)
```bash
mvn flyway:migrate
```

#### Step 6: Start Application
```bash
# Development mode with auto-reload
mvn spring-boot:run

# Or build first
mvn clean package
java -jar target/assethub-0.0.1-SNAPSHOT.jar
```

The application will start on `http://localhost:8080`

#### Step 7: Access Swagger UI
```
http://localhost:8080/swagger-ui/index.html
```

## 🐳 Running with Docker

### Using Docker Compose (Recommended)

```bash
# Start both database and application
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Manual Docker Build

```bash
# Build image
docker build -t assethub-backend:latest .

# Run container with database link
docker run -d \
  --name assethub-app \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://assethub-db:5432/assethub_db \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=password \
  -e APP_JWT_SECRET=your-secret-key \
  assethub-backend:latest
```

## 🔨 Build Commands

### Maven Commands

```bash
# Clean build
mvn clean build

# Compile
mvn compile

# Run tests
mvn test

# Package (creates JAR)
mvn clean package

# Skip tests during build
mvn clean package -DskipTests

# Run application
mvn spring-boot:run

# Show dependency tree
mvn dependency:tree

# Run specific test
mvn test -Dtest=EmployeeServiceTest

# Format code
mvn formatter:format
```

### Docker Commands

```bash
# Build Docker image
docker build -t assethub-backend:1.0.0 .

# Run Docker container
docker run -p 8080:8080 assethub-backend:1.0.0

# Push to registry
docker push your-registry/assethub-backend:1.0.0

# View container logs
docker logs -f container-id

# Stop container
docker stop container-id
```

## 📝 API Examples

### Complete Example: Create Asset and Complaint

#### 1. Login to Get Token
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'

# Response:
# {
#   "token": "eyJhbGciOiJIUzI1NiJ9...",
#   "email": "admin@example.com",
#   "role": "ADMIN",
#   "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
# }
```

#### 2. Create Asset
```bash
curl -X POST http://localhost:8080/api/assets \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MacBook Pro 16",
    "serialNumber": "C02RM6AEMD6R",
    "category": "Laptop",
    "status": "AVAILABLE"
  }'

# Response:
# {
#   "id": "d4e5f6a7-b8c9-1234-5678-90abcdef0123",
#   "name": "MacBook Pro 16",
#   "serialNumber": "C02RM6AEMD6R",
#   "category": "Laptop",
#   "status": "AVAILABLE",
#   "createdAt": "2026-05-24T16:57:52Z"
# }
```

#### 3. Create Complaint About Asset
```bash
curl -X POST http://localhost:8080/api/complaints \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "MacBook Battery Not Charging",
    "description": "The battery indicator shows the device is not charging despite being connected",
    "assetId": "d4e5f6a7-b8c9-1234-5678-90abcdef0123",
    "priority": "HIGH",
    "dueDate": "2026-05-31T17:00:00Z"
  }'

# Response:
# {
#   "id": "e5f6a7b8-c9d0-1234-5678-90abcdef0124",
#   "ticketNumber": 1,
#   "title": "MacBook Battery Not Charging",
#   "status": "NEW",
#   "priority": "HIGH",
#   "createdAt": "2026-05-24T16:57:52Z"
# }
```

#### 4. Add Comment to Complaint
```bash
curl -X POST http://localhost:8080/api/complaints/e5f6a7b8-c9d0-1234-5678-90abcdef0124/comments \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Battery service required. Will schedule appointment.",
    "isInternal": false
  }'
```

## ✅ Validation & Error Handling

### Request Validation

Validation annotations used:
- `@NotNull`: Field cannot be null
- `@NotBlank`: String cannot be empty or whitespace
- `@Email`: Valid email format
- `@Min/@Max`: Numeric range
- `@Size`: String/collection length
- `@Pattern`: Regex pattern matching

Example:
```java
@PostMapping("/register")
public ResponseEntity<AuthResponseDTO> register(
    @Valid @RequestBody RegisterRequestDTO request) {
    return ResponseEntity.ok(authService.register(request));
}

public record RegisterRequestDTO(
    @NotBlank(message = "Employee number is required")
    String employeeNumber,
    
    @NotBlank(message = "First name is required")
    String firstName,
    
    @Email(message = "Invalid email format")
    String email,
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    String password
) {}
```

### Global Exception Handling

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse(timestamp, 404, "NOT_FOUND", ex.getMessage()));
    }
    
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessRule(BusinessException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse(timestamp, 400, "BAD_REQUEST", ex.getMessage()));
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors()
            .stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining(", "));
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponse(timestamp, 400, "VALIDATION_ERROR", errors));
    }
}
```

### HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| **200 OK** | Successful GET/POST/PUT | Retrieve user, create complaint |
| **201 Created** | Resource created successfully | Asset created |
| **204 No Content** | Successful DELETE/PATCH (no response body) | Delete notification |
| **400 Bad Request** | Validation error | Missing required field |
| **401 Unauthorized** | Missing/invalid authentication | No JWT token |
| **403 Forbidden** | Insufficient permissions | User tries admin operation |
| **404 Not Found** | Resource doesn't exist | Asset ID not found |
| **500 Internal Server Error** | Server error | Database connection failure |

### Error Response Format

```json
{
  "timestamp": "2026-05-24T16:57:52Z",
  "status": 400,
  "error": "Eroare de validare a datelor",
  "message": "email: Invalid email format, password: Password must be at least 8 characters"
}
```

## 🔒 Security Best Practices

### Implemented Security Measures

1. **Password Security**
   - BCrypt hashing with strength 12
   - No plaintext password storage
   - Password reset via secure token link

2. **JWT Token Security**
   - HMAC-SHA256 signature algorithm
   - 24-hour expiration
   - Token validation on every request
   - Secret key in environment variables

3. **Database Security**
   - parameterized queries (JPA prevents SQL injection)
   - Connection pooling
   - SSL/TLS for remote connections

4. **Network Security**
   - CORS restricted to known origins
   - CSRF disabled for stateless API (safe)
   - HTTPS recommended in production

5. **Authorization**
   - Method-level security with @PreAuthorize
   - Role-based access control (RBAC)
   - Principle of least privilege

6. **Audit Trail**
   - CreatedAt/UpdatedAt timestamps
   - User tracking in Complaint Workflow
   - Soft deletes with DeletedAt column

### Production Recommendations

```bash
# Use environment variables for secrets
export APP_JWT_SECRET=$(openssl rand -base64 32)
export SPRING_DATASOURCE_PASSWORD=$(openssl rand -base64 16)
export SPRING_MAIL_PASSWORD=$(openssl rand -base64 16)

# Enable HTTPS
server.ssl.key-store=classpath:keystore.jks
server.ssl.key-store-password=${SSL_KEYSTORE_PASSWORD}

# Set restrictive CORS
spring.web.cors.allowed-origins=https://yourdomain.com
spring.web.cors.allowed-methods=GET,POST,PUT,PATCH,DELETE
spring.web.cors.allow-credentials=true
```

## 🧪 Testing

### Testing Setup

Dependencies:
- **JUnit 5**: Test framework
- **Spring Boot Test**: Spring integration testing
- **Spring Security Test**: Authentication/authorization testing

### Test Structure

```bash
src/test/java/
├── controller/
│   └── EmployeeControllerTest.java
├── service/
│   ├── AssetServiceTest.java
│   ├── ComplaintServiceTest.java
│   └── AuthServiceTest.java
└── repository/
    └── EmployeeRepositoryTest.java
```

### Running Tests

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=AssetServiceTest

# Run specific test method
mvn test -Dtest=AssetServiceTest#testCreateAsset

# Run with code coverage
mvn test jacoco:report
# Report: target/site/jacoco/index.html

# Run tests without building
mvn test -DskipBuild
```

### Example Test

```java
@SpringBootTest
class AssetServiceTest {
    
    @MockBean
    private AssetRepository assetRepository;
    
    @Autowired
    private AssetService assetService;
    
    @Test
    void testCreateAssetSuccess() {
        // Arrange
        AssetRequestDTO request = new AssetRequestDTO("Dell", "SN123", "Laptop", "AVAILABLE");
        Asset asset = Asset.builder().id(UUID.randomUUID()).build();
        when(assetRepository.findBySerialNumber("SN123")).thenReturn(Optional.empty());
        when(assetRepository.save(any())).thenReturn(asset);
        
        // Act
        AssetResponseDTO result = assetService.createAsset(request);
        
        // Assert
        assertNotNull(result);
        verify(assetRepository).save(any());
    }
}
```

## 📈 Performance & Scalability

### Performance Optimizations

1. **Database Indexing**
   - Indexes on foreign keys (Employee.email, Asset.serialNumber)
   - Composite indexes for frequent queries
   - PostgreSQL query planning

2. **Lazy Loading**
   - JPA relationships use FetchType.LAZY
   - Prevents N+1 query problem

3. **Connection Pooling**
   - HikariCP default connection pool
   - Configured pool size: default 10 connections

4. **Caching Potential** (Future)
   - Redis for notification cache
   - Session-level caching for user data

### Scalability Considerations

1. **Horizontal Scaling**
   - Stateless design enables easy load balancing
   - Multiple instances share PostgreSQL database
   - Session-free JWT authentication

2. **Database Scaling**
   - PostgreSQL read replicas for reporting
   - Connection pooling optimization
   - Query optimization with indexes

3. **Async Processing** (Future)
   - Implement Spring @Async for email sending
   - Message queue for report generation
   - Background job scheduling with Quartz

## 🚀 Future Improvements

### Feature Enhancements
- [ ] **Advanced Search & Filtering**: Full-text search on complaints/assets
- [ ] **Bulk Operations**: Bulk asset assignment, bulk complaint status update
- [ ] **Audit Logging**: Detailed audit trail with rollback capability
- [ ] **Two-Factor Authentication**: TOTP/SMS-based 2FA
- [ ] **API Rate Limiting**: Prevent abuse, DDoS protection
- [ ] **Webhooks**: External system integration via webhooks
- [ ] **Advanced Analytics**: Time series data, predictive maintenance

### Technical Improvements
- [ ] **Async Processing**: Non-blocking email/report generation
- [ ] **Caching Layer**: Redis integration for performance
- [ ] **Message Queue**: RabbitMQ/Kafka for event-driven architecture
- [ ] **Service Mesh**: Istio for microservices (if splitting)
- [ ] **API Versioning**: v1/, v2/ endpoint strategy
- [ ] **GraphQL**: Alternative query API
- [ ] **Monitoring**: Prometheus metrics, ELK stack logging

### Testing & Quality
- [ ] **Integration Tests**: Full API workflow testing
- [ ] **Load Testing**: JMeter/Gatling performance tests
- [ ] **Security Testing**: OWASP vulnerability scanning
- [ ] **Code Coverage**: Increase to >80% coverage
- [ ] **API Contract Testing**: Pact framework

### DevOps & Infrastructure
- [ ] **CI/CD Pipeline**: GitHub Actions automation
- [ ] **Blue-Green Deployment**: Zero-downtime releases
- [ ] **Infrastructure as Code**: Terraform/Ansible
- [ ] **Container Orchestration**: Kubernetes deployment
- [ ] **Observability**: Distributed tracing with Jaeger
- [ ] **Cost Optimization**: Auto-scaling policies

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ Liability
- ❌ Warranty

---

## 📞 Support & Contact

For issues, questions, or contributions:
- **GitHub Issues**: https://github.com/iSergiuu/Draxlmaier/issues
- **Pull Requests**: Contributions welcome!

## 🙏 Acknowledgments

- Spring Boot & Spring Security teams
- PostgreSQL community
- JWT (JJWT) maintainers
- All open-source contributors

---

**Last Updated**: May 24, 2026  
**Version**: 0.0.1-SNAPSHOT  
**Author**: Development Team
