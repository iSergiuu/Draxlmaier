# AssetComplaintHub - Backend

A comprehensive Spring Boot 3.3.5 backend application for managing company assets and complaint workflows. This application provides robust API endpoints for asset management, complaint handling, employee administration, and reporting capabilities.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Technologies](#technologies)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Usage](#api-usage)
- [Project Structure](#project-structure)

---

## Overview

**AssetComplaintHub** is an enterprise-grade asset management and complaint tracking system built with Spring Boot. It enables organizations to:

- Manage company assets (equipment, devices, etc.)
- Track and resolve employee complaints and support tickets
- Generate comprehensive reports in multiple formats (PDF, Excel, CSV, XML)
- Control employee access through role-based authorization (SUPER_ADMIN, ADMIN, DEPT_RESPONSIBLE, USER)
- Monitor dashboard statistics and department performance
- Send notifications and reset passwords via email

---

## Prerequisites

Before running the application, ensure you have:

- **Java 21** or higher
- **Maven 3.8.0** or higher
- **PostgreSQL 12** or higher (production database)
- **Git**

### Optional Tools
- **Docker** (for containerization)
- **Postman** or **curl** (for API testing)

---

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/iSergiuu/Draxlmaier.git
cd Draxlmaier/backend
```

### 2. Install Dependencies

```bash
mvn clean install
```

### 3. Configure Database

Ensure PostgreSQL is running and accessible. The application uses Flyway for database migrations (currently disabled in properties).

### 4. Set Environment Variables

Create a `.env` file in the `backend` directory (see [Environment Variables](#environment-variables) section below).

---

## Technologies

### Core Framework
- **Spring Boot 3.3.5** - Web framework and application foundation
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - ORM and database abstraction
- **Spring Validation** - Input validation framework
- **Spring WebSocket** - Real-time communication support
- **Spring Mail** - Email sending capabilities

### Database & Migration
- **PostgreSQL** - Primary relational database
- **H2** - In-memory database for testing
- **Flyway** - Database schema version control and migration

### API & Documentation
- **SpringDoc OpenAPI 2.6.0** - REST API documentation and Swagger UI
- **Jackson** - JSON/XML serialization and deserialization
- **MapStruct 1.5.5** - DTO mapping framework

### Security & Authentication
- **JJWT (JWT) 0.11.5** - JSON Web Token handling
- **Spring Security** - Role-based access control (RBAC)

### Data Export
- **Apache POI 5.2.3** - Excel file generation (XLSX)
- **OpenPDF 1.3.32** - PDF document generation
- **Apache Commons CSV 1.10.0** - CSV file handling
- **Jackson DataFormat XML** - XML serialization

### Utilities
- **Lombok** - Reduce boilerplate code with annotations
- **JUnit 5** - Unit testing framework

---

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```properties
# Server Configuration
SERVER_PORT=8080

# Database Configuration
DB_URL=jdbc:postgresql://localhost:5432/draxlmaier
DB_USERNAME=postgres
DB_PASSWORD=your_db_password
DB_DRIVER=org.postgresql.Driver

# JPA/Hibernate Configuration
HIBERNATE_DIALECT=org.hibernate.dialect.PostgreSQLDialect
HIBERNATE_DDL_AUTO=validate
HIBERNATE_SHOW_SQL=true

# JWT Configuration
JWT_SECRET=your_very_long_and_complex_secret_key_here_that_nobody_should_know

# Email Configuration (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_specific_password
MAIL_SMTP_AUTH=true
MAIL_SMTP_STARTTLS_ENABLE=true

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### Important Security Notes

- **Never commit the `.env` file** to version control
- Store sensitive values like `JWT_SECRET` and `MAIL_PASSWORD` securely
- For production, use environment-specific configuration management tools (AWS Secrets Manager, Azure Key Vault, etc.)
- Rotate JWT secrets regularly
- Use App Passwords for Gmail instead of your main password

---

## Running the Application

### Development Environment

```bash
# From the backend directory
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

### Production Build

```bash
# Create an executable JAR
mvn clean package

# Run the JAR file
java -jar target/assethub-0.0.1-SNAPSHOT.jar
```

### With Docker

```bash
# Build Docker image
docker build -t assethub:latest .

# Run container
docker run -p 8080:8080 --env-file .env assethub:latest
```

---

## API Usage

The API is fully documented via Swagger UI. Access it at:

```
http://localhost:8080/swagger-ui/index.html
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "departmentId": "uuid-here"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "USER"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john.doe@example.com"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePassword123!"
}
```

### Asset Management Endpoints

#### Create Asset
```http
POST /api/assets
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Laptop Dell XPS 13",
  "serialNumber": "SN12345678",
  "category": "EQUIPMENT",
  "purchaseDate": "2023-01-15",
  "value": 1299.99,
  "departmentId": "uuid-here"
}
```

#### Get All Assets
```http
GET /api/assets
Authorization: Bearer {token}
```

#### Get My Assets
```http
GET /api/assets/me
Authorization: Bearer {token}
```

#### Get Asset by ID
```http
GET /api/assets/{id}
Authorization: Bearer {token}
```

#### Update Asset
```http
PUT /api/assets/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Asset Name",
  "serialNumber": "SN99999999",
  "status": "ACTIVE"
}
```

#### Assign Asset to Employee
```http
POST /api/assets/{id}/assign
Authorization: Bearer {token}
Content-Type: application/json

{
  "employeeId": "uuid-here",
  "assignmentDate": "2024-05-20"
}
```

#### Delete Asset (Admin only)
```http
DELETE /api/assets/{id}
Authorization: Bearer {token}
```

### Complaint Management Endpoints

#### Create Complaint
```http
POST /api/complaints
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Laptop Screen Broken",
  "description": "The laptop screen is cracked after accidental drop",
  "assetId": "uuid-here",
  "priority": "HIGH"
}
```

#### Get My Complaints
```http
GET /api/complaints/me
Authorization: Bearer {token}
```

#### Get All Complaints (Admin only)
```http
GET /api/complaints
Authorization: Bearer {token}
```

#### Get Complaint Details
```http
GET /api/complaints/{id}
Authorization: Bearer {token}
```

#### Update Complaint Status (Admin only)
```http
PATCH /api/complaints/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "notes": "Currently being repaired"
}
```

#### Add Comment to Complaint
```http
POST /api/complaints/{id}/comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "Repair parts have been ordered"
}
```

### Employee Management Endpoints

#### Get My Profile
```http
GET /api/employees/me
Authorization: Bearer {token}
```

#### Get All Employees (Super Admin only)
```http
GET /api/employees
Authorization: Bearer {token}
```

#### Update Employee
```http
PUT /api/employees/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "department": "IT"
}
```

#### Change Employee Role (Super Admin only)
```http
PATCH /api/employees/{id}/role
Authorization: Bearer {token}
Content-Type: application/json

{
  "roleCode": "DEPT_RESPONSIBLE"
}
```

### Report Generation Endpoints

#### Generate Report
```http
POST /api/reports/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "entityType": "ASSETS",
  "format": "EXCEL",
  "filters": {
    "department": "IT",
    "status": "ACTIVE"
  }
}
```

**Supported Formats:** `PDF`, `EXCEL`, `CSV`, `XML`

### Department Management Endpoints

#### Get All Departments
```http
GET /api/departments
Authorization: Bearer {token}
```

#### Create Department (Super Admin only)
```http
POST /api/departments
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Information Technology",
  "code": "IT"
}
```

#### Get Department Statistics (Super Admin only)
```http
GET /api/departments/{id}/stats
Authorization: Bearer {token}
```

### Dashboard Endpoints

#### Get Dashboard Statistics
```http
GET /api/dashboard/stats
Authorization: Bearer {token}
```

### Notification Endpoints

#### Get My Notifications
```http
GET /api/notifications
Authorization: Bearer {token}
```

#### Mark Notification as Read
```http
PATCH /api/notifications/{id}/read
Authorization: Bearer {token}
```

#### Clear All Notifications
```http
DELETE /api/notifications/clear-all
Authorization: Bearer {token}
```

---

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/draxlmaier/assethub/
│   │   │   ├── AssetComplaintHubApplication.java          # Application entry point
│   │   │   └── module/
│   │   │       ├── auth/
│   │   │       │   ├── controller/
│   │   │       │   │   └── AuthController.java            # Authentication endpoints
│   │   │       │   ├── service/
│   │   │       │   │   ├── AuthService.java               # Authentication logic
│   │   │       │   │   └── PasswordResetService.java      # Password reset logic
│   │   │       │   ├── dto/                               # Data Transfer Objects
│   │   │       │   ├── model/                             # JPA entities
│   │   │       │   └── repository/                        # Database access
│   │   │       │
│   │   │       ├── asset/
│   │   │       │   ├── controller/
│   │   │       │   │   └── AssetController.java           # Asset management endpoints
│   │   │       │   ├── service/
│   │   │       │   │   └── AssetService.java              # Asset business logic
│   │   │       │   ├── dto/
│   │   │       │   ├── model/
│   │   │       │   └── repository/
│   │   │       │
│   │   │       ├── complaint/
│   │   │       │   ├── controller/
│   │   │       │   │   └── ComplaintController.java       # Complaint management endpoints
│   │   │       │   ├── service/
│   │   │       │   │   ├── ComplaintService.java          # Complaint workflow logic
│   │   │       │   │   └── CommentService.java            # Comment management logic
│   │   │       │   ├── dto/
│   │   │       │   ├── model/
│   │   │       │   └── repository/
│   │   │       │
│   │   │       ├── employee/
│   │   │       │   ├── controller/
│   │   │       │   │   └── EmployeeController.java        # Employee management endpoints
│   │   │       │   ├── service/
│   │   │       │   │   └── EmployeeService.java           # Employee business logic
│   │   │       │   ├── dto/
│   │   │       │   ├── model/
│   │   │       │   └── repository/
│   │   │       │
│   │   │       ├── department/
│   │   │       │   ├── controller/
│   │   │       │   │   └── DepartmentController.java      # Department endpoints
│   │   │       │   ├── service/
│   │   │       │   │   └── DepartmentService.java         # Department logic
│   │   │       │   ├── dto/
│   │   │       │   ├── model/
│   │   │       │   └── repository/
│   │   │       │
│   │   │       ├── report/
│   │   │       │   ├── controller/
│   │   │       │   │   └── ReportController.java          # Report generation endpoints
│   │   │       │   ├── service/
│   │   │       │   │   └── ReportService.java             # Multi-format report generation
│   │   │       │   └── dto/
│   │   │       │
│   │   │       ├── notification/
│   │   │       │   ├── controller/
│   │   │       │   │   └── NotificationController.java    # Notification endpoints
│   │   │       │   ├── repository/
│   │   │       │   ├── model/
│   │   │       │   └── dto/
│   │   │       │
│   │   │       ├── dashboard/
│   │   │       │   ├── controller/
│   │   │       │   │   └── DashboardController.java       # Dashboard statistics endpoints
│   │   │       │   ├── service/
│   │   │       │   │   └── DashboardService.java          # Dashboard analytics logic
│   │   │       │   └── dto/
│   │   │       │
│   │   │       └── common/
│   │   │           ├── config/                            # Global Spring configuration
│   │   │           ├── exception/                         # Custom exception handling
│   │   │           ├── security/                          # Security configurations & JWT
│   │   │           └── utils/                             # Utility classes
│   │   │
│   │   └── resources/
│   │       ├── application.properties                     # Application configuration
│   │       └── db/migration/                              # Flyway database migrations
│   │
│   └── test/
│       └── java/com/draxlmaier/assethub/
│           └── AssetComplaintHubApplicationTests.java    # Integration tests
│
├── pom.xml                                                # Maven dependencies & build config
└── README.md                                              # This file
```

### Key Design Patterns

- **Layered Architecture**: Controllers → Services → Repositories
- **Data Transfer Objects (DTOs)**: Decoupled request/response models
- **MapStruct Mappers**: Efficient entity-to-DTO conversion
- **Spring Data JPA**: Repository pattern for data access
- **Spring Security**: JWT-based stateless authentication
- **Aspect-Oriented Programming (AOP)**: Cross-cutting concerns

---

## Role-Based Access Control (RBAC)

The application implements role-based authorization with the following roles:

| Role | Permissions |
|------|-------------|
| **SUPER_ADMIN** | Full system access, employee management, department management, all reporting |
| **ADMIN** | Asset management, complaint resolution, report generation |
| **DEPT_RESPONSIBLE** | Asset allocation, department statistics, complaint handling |
| **USER** | Submit complaints, view own assets, profile management |

---

## API Response Format

All API responses follow a consistent structure:

### Success Response (200 OK)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "department": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "IT Department"
  }
}
```

### Error Response (4xx, 5xx)
```json
{
  "timestamp": "2024-05-20T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Email already exists",
  "path": "/api/auth/register"
}
```

---

## Testing

Run the test suite:

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=AssetComplaintHubApplicationTests

# Run with coverage report
mvn clean test jacoco:report
```

---

## Database Schema

The application uses PostgreSQL with the following main tables:

- `employees` - User accounts and authentication
- `assets` - Company equipment and resources
- `complaints` - Support tickets and issues
- `comments` - Complaint discussion threads
- `departments` - Organizational units
- `notifications` - User notifications
- `password_resets` - Password recovery tokens

---

## Logging

The application uses Spring's built-in logging framework (SLF4J with Logback).

Configure logging levels in `application.properties`:

```properties
logging.level.com.draxlmaier.assethub=DEBUG
logging.level.org.springframework.security=INFO
logging.level.org.hibernate=WARN
```

---

## Deployment

### Docker Deployment

1. **Build Docker image:**
   ```bash
   docker build -t assethub:latest .
   ```

2. **Push to registry:**
   ```bash
   docker tag assethub:latest your-registry/assethub:latest
   docker push your-registry/assethub:latest
   ```

3. **Deploy to Kubernetes:**
   ```bash
   kubectl apply -f k8s/deployment.yaml
   ```

### Cloud Deployment

- **AWS**: Deploy using Elastic Beanstalk or ECS
- **Azure**: Use App Service or Container Instances
- **GCP**: Deploy on Cloud Run or App Engine

---

## Troubleshooting

### Database Connection Issues
```
Error: Connection refused
Solution: Ensure PostgreSQL is running and credentials in .env are correct
```

### JWT Token Expired
```
Error: Token validation failed
Solution: Re-authenticate to get a new token from /api/auth/login
```

### Port Already in Use
```bash
# Kill process on port 8080
lsof -i :8080
kill -9 <PID>

# Or change port in application.properties
server.port=8081
```

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a Pull Request

---

## License

Proprietary - Draxlmaier GmbH

---

## Support

For issues, bug reports, or feature requests, please contact the development team or open an issue in the repository.

---

**Last Updated**: May 2024  
**Version**: 0.0.1-SNAPSHOT  
**Java Version**: 21  
**Spring Boot Version**: 3.3.5
