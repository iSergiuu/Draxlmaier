# 🏢 Draxlmaier - Asset & Complaint Management System

O platformă de management integrat a activelor și reclamațiilor pentru organizații mari, construită cu Java Spring Boot backend și JavaScript frontend.

## 📋 Cuprins

- [Descriere Proiect](#-descriere-proiect)
- [Caracteristici Principale](#-caracteristici-principale)
- [Tech Stack](#️-tech-stack)
- [Cerințe Preliminare](#-cerințe-preliminare)
- [Instalare și Setup](#-instalare-și-setup)
- [Pornirea Aplicației](#-pornirea-aplicației)
- [Configurare Variabile Mediu](#️-configurare-variabile-mediu)
- [Structura Proiectului](#-structura-proiectului)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Descriere Proiect

**Draxlmaier AssetHub** este o platformă enterprise de management integrat care permite organizațiilor mari să:

- **Gestioneze Activele**: Urmărirea, alocarea și monitorizarea echipamentelor companiei
- **Administreze Reclamații**: Crearea, gestionarea și rezolvarea reclamațiilor angajaților cu sistem de ticketing
- **Control Acces pe Roluri**: Sistem granular de permisiuni cu 4 niveluri de acces (SUPER_ADMIN, ADMIN, DEPT_RESPONSIBLE, USER)
- **Notificări Real-Time**: WebSocket pentru notificări instantanee
- **Rapoarte Avansate**: Export în format PDF, Excel, CSV, XML
- **Analitica Dashboard**: Statistici și metrici departamentale

---

## ✨ Caracteristici Principale

### 📦 Management Activi
- ✅ CRUD pentru active
- ✅ Asignare active angajaților
- ✅ Urmărire status (AVAILABLE, ASSIGNED, BROKEN, DELETED)
- ✅ Validare serial unic
- ✅ Inventar personal per angajat

### 🎟️ Sistem Reclamații & Ticketing
- ✅ Crearea și urmărirea reclamațiilor
- ✅ Generare automată numere ticket
- ✅ Workflow status (NEW, IN_PROGRESS, RESOLVED, CLOSED)
- ✅ Niveluri prioritate (LOW, MEDIUM, HIGH, CRITICAL)
- ✅ Atribuire administrator
- ✅ Comentarii interne/externe
- ✅ Sistem feedback și rating pentru reclamații rezolvate

### 🔐 Securitate & Autentificare
- ✅ JWT-based authentication (expirare 24 ore)
- ✅ BCrypt password hashing
- ✅ Password reset cu email verification
- ✅ CORS configuration
- ✅ Sesiuni stateless

### 👥 Management Angajați
- ✅ Profil angajat
- ✅ Asignare roluri
- ✅ Toggle status activ/inactiv
- ✅ Generare conturi temporare bulk

### 🏢 Management Departamente
- ✅ CRUD Departamente
- ✅ Statistici departament
- ✅ Distribuție angajați și active

### 📊 Rapoarte & Analitica
- ✅ Export multi-format (PDF, Excel, CSV, XML)
- ✅ Filtrare și sortare dinamică
- ✅ Statistici departament
- ✅ Dashboard cu metrice

### 🔔 Sistem Notificații
- ✅ WebSocket notificări real-time
- ✅ Email notifications
- ✅ Istoricul notificărilor (read/unread)

---

## 🛠️ Tech Stack

| Componenta | Tehnologie | Versiune |
|-----------|-----------|----------|
| **Backend** | Java | 21 |
| **Framework Backend** | Spring Boot | 3.3.5 |
| **Frontend** | JavaScript | Latest |
| **Database** | PostgreSQL | 15 |
| **Hosting Database** | Neon Cloud | - |
| **Security** | Spring Security + JWT | 6.x / 0.11.5 |
| **Build Tool** | Maven | 4.0.0 |
| **ORM** | Spring Data JPA / Hibernate | Latest |
| **API Docs** | SpringDoc OpenAPI/Swagger | 2.6.0 |
| **Export** | Apache POI, OpenPDF, Commons CSV | Latest |
| **Email** | Spring Mail | Latest |
| **WebSocket** | Spring WebSocket | Latest |

---

## 📋 Cerințe Preliminare

### Backend (Java)
- **Java 21** sau mai nouă
  - Download: [OpenJDK 21](https://adoptopenjdk.net/) sau [Oracle JDK 21](https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html)
  - Verificare: `java -version`

- **Maven 3.8.1** sau mai nouă
  - Download: [Maven Official](https://maven.apache.org/download.cgi)
  - Verificare: `mvn -version`

- **Git**
  - Download: [Git Official](https://git-scm.com/)

### Frontend (JavaScript)
- **Node.js 16+** și **npm**
  - Download: [Node.js Official](https://nodejs.org/)
  - Verificare: `node --version` și `npm --version`

### Database
- **PostgreSQL 15** este hostat pe **Neon Cloud** (URL și credențiale în variabilele de mediu)
- Nu mai este nevoie de Docker pentru baza de date

---

## 🚀 Instalare și Setup

### 1️⃣ Clonare Repository
```bash
git clone https://github.com/iSergiuu/Draxlmaier.git
cd Draxlmaier
```

### 2️⃣ Setup Backend (Java Spring Boot)

#### Navigare în director backend
```bash
cd backend
```

#### Instalare dependențe
```bash
mvn clean install
```

#### Configurare variabile mediu
```bash
# Linux/Mac - creează fișierul .env sau exportă variabilele
export SPRING_DATASOURCE_URL="jdbc:postgresql://host:port/dbname"
export SPRING_DATASOURCE_USERNAME="username"
export SPRING_DATASOURCE_PASSWORD="password"
export APP_JWT_SECRET="your-secret-key-min-32-chars"
export SPRING_MAIL_HOST="smtp.gmail.com"
export SPRING_MAIL_PORT="587"
export SPRING_MAIL_USERNAME="your-email@gmail.com"
export SPRING_MAIL_PASSWORD="your-app-password"

# Windows - CMD
set SPRING_DATASOURCE_URL=jdbc:postgresql://host:port/dbname
set SPRING_DATASOURCE_USERNAME=username
set SPRING_DATASOURCE_PASSWORD=password
set APP_JWT_SECRET=your-secret-key-min-32-chars
set SPRING_MAIL_HOST=smtp.gmail.com
set SPRING_MAIL_PORT=587
set SPRING_MAIL_USERNAME=your-email@gmail.com
set SPRING_MAIL_PASSWORD=your-app-password
```

#### Pornire Backend
```bash
# Mod development (cu auto-reload)
mvn spring-boot:run

# Sau build și rulare JAR
mvn clean package
java -jar target/assethub-0.0.1-SNAPSHOT.jar
```

Backend va fi accesibil pe: **http://localhost:8080**

Swagger UI Documentation: **http://localhost:8080/swagger-ui/index.html**

---

### 3️⃣ Setup Frontend (JavaScript)

#### Navigare în director frontend
```bash
cd frontend
```

#### Instalare dependențe
```bash
npm install
```

#### Configurare variabile mediu
Creează fișierul `.env.local` în directorul frontend:
```
VITE_API_BASE_URL=http://localhost:8080
VITE_API_TIMEOUT=30000
```

#### Pornire Frontend
```bash
# Mod development (cu hot-reload)
npm run dev

# Build pentru production
npm run build

# Preview production build
npm run preview
```

Frontend va fi accesibil pe: **http://localhost:5173**

---

### 4️⃣ Configurare Database

Baza de date este **hostată pe Neon Cloud** (https://neon.tech/)

**⚠️ Nicio acțiune necesară pentru Docker!**

- Connection String este deja configurat în variabilele de mediu
- Migrations sunt gestionate automat de Flyway

Structura bazei de date se poate viziona în fișierul `/database/int_db.sql`

---

## 🔧️ Configurare Variabile Mediu

### Backend - Variabile Obligatorii

| Variabilă | Descriere | Exemplu |
|-----------|-----------|---------|
| `SPRING_DATASOURCE_URL` | URL conexiune PostgreSQL | `jdbc:postgresql://neon-host:5432/dbname` |
| `SPRING_DATASOURCE_USERNAME` | Utilizator BD | `neondb_owner` |
| `SPRING_DATASOURCE_PASSWORD` | Parolă BD | `***` |
| `APP_JWT_SECRET` | Secret JWT (min 32 caractere) | `your-super-secret-key-here` |
| `SPRING_MAIL_HOST` | SMTP Server | `smtp.gmail.com` |
| `SPRING_MAIL_PORT` | SMTP Port | `587` |
| `SPRING_MAIL_USERNAME` | Email de trimitere | `app@example.com` |
| `SPRING_MAIL_PASSWORD` | App password (nu parola Gmail) | `***` |

### Frontend - Variabile Opționale

| Variabilă | Descriere | Exemplu |
|-----------|-----------|---------|
| `VITE_API_BASE_URL` | URL Backend API | `http://localhost:8080` |
| `VITE_API_TIMEOUT` | Timeout request (ms) | `30000` |

---

## 🏃 Pornirea Aplicației

### Command Cheat Sheet

#### Backend
```bash
cd backend

# Development mode
mvn spring-boot:run

# Production build
mvn clean package
java -jar target/assethub-0.0.1-SNAPSHOT.jar

# Run tests
mvn test

# Build with coverage
mvn clean test jacoco:report
```

#### Frontend
```bash
cd frontend

# Development server
npm run dev

# Production build
npm run build

# Run tests
npm test

# Preview build
npm run preview
```

#### Database (Neon Cloud)
```bash
# Nu sunt comenzi necesare - baza este hostată
# Connection via application.properties este suficient
```

### ✅ Verificare Status

1. **Backend health check**
   ```bash
   curl http://localhost:8080/swagger-ui/index.html
   ```

2. **Frontend verificare**
   ```bash
   curl http://localhost:5173
   ```

3. **API health**
   ```bash
   curl http://localhost:8080/actuator/health
   ```

---

## 📁 Structura Proiectului

```
Draxlmaier/
├── backend/                          # Spring Boot Java Application
│   ├── src/
│   │   ├── main/java/com/draxlmaier/assethub/
│   │   │   ├── core/                 # Security, Config, Exceptions
│   │   │   └── module/               # Feature modules
│   │   │       ├── auth/             # Authentication
│   │   │       ├── asset/            # Asset Management
│   │   │       ├── complaint/        # Complaint System
│   │   │       ├── employee/         # Employee Management
│   │   │       ├── department/       # Department Management
│   │   │       ├── notification/     # Notifications
│   │   │       ├── report/           # Report Generation
│   │   │       └── dashboard/        # Analytics Dashboard
│   │   └── resources/
│   │       ├── application.properties
│   │       └── db/migration/         # Flyway migrations
│   ├── pom.xml                       # Maven configuration
│   ├── docker-compose.yml            # Docker config (pentru alte servicii)
│   └── README.md
│
├── frontend/                         # JavaScript Frontend Application
│   ├── src/
│   │   ├── components/               # React/Vue components
│   │   ├── pages/                    # Page components
│   │   ├── services/                 # API services
│   │   ├── stores/                   # State management
│   │   ├── styles/                   # CSS/SCSS
│   │   └── App.js                    # Main app component
│   ├── package.json                  # npm dependencies
│   ├── vite.config.js                # Vite configuration
│   └── README.md
│
├── database/                         # Database files
│   └── int_db.sql                    # Schema snapshot (informativ)
│
└── README.md                         # This file
```

---

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:8080/api`
- **Production**: `https://your-domain.com/api`

### Swagger UI
```
http://localhost:8080/swagger-ui/index.html
```

### Autentificare

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "john@example.com",
  "role": "USER"
}
```

### Utilizare Token
```bash
# Header format pentru orice request autentificat
Authorization: Bearer {token}
```

### Endpoint Exemple

#### Assets
```bash
# Get all assets
GET /api/assets
Authorization: Bearer {token}

# Create asset
POST /api/assets
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Dell Laptop",
  "serialNumber": "SN12345",
  "category": "Computer",
  "status": "AVAILABLE"
}

# Get my assets
GET /api/assets/me
Authorization: Bearer {token}
```

#### Complaints
```bash
# Create complaint
POST /api/complaints
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Laptop not charging",
  "description": "My laptop is not charging",
  "priority": "HIGH"
}

# Get my complaints
GET /api/complaints/me
Authorization: Bearer {token}

# Update status (admin only)
PATCH /api/complaints/{id}/status
Authorization: Bearer {token}

{
  "statusCode": "IN_PROGRESS"
}
```

#### Reports
```bash
# Generate report
POST /api/reports/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "entityType": "ASSET",
  "format": "PDF",
  "columns": ["name", "serialNumber", "status"],
  "filters": { "status": "AVAILABLE" }
}

# Supported formats: PDF, EXCEL, CSV, XML
```

---

## 🔐 Roller și Permisiuni

| Rol | Permisiuni |
|-----|-----------|
| **USER** | Vizualizare active proprii, creare reclamații, submit feedback |
| **DEPT_RESPONSIBLE** | USER + creare/asignare active, statistici departament |
| **ADMIN** | DEPT_RESPONSIBLE + management angajați, gestionare reclamații, rapoarte |
| **SUPER_ADMIN** | Acces complet sistem - toate operațiunile |

---

## 🐛 Troubleshooting

### Backend Issues

#### Eroare: "Connection refused" la baza de date
```
Soluție:
1. Verifică variabilele de mediu SPRING_DATASOURCE_URL, USERNAME, PASSWORD
2. Asigură-te că datele de conectare la Neon Cloud sunt corecte
3. Testează connection: psql -h neon-host -U user -d dbname
```

#### Eroare: "Port 8080 already in use"
```bash
# Linux/Mac - Kill process pe port 8080
lsof -i :8080
kill -9 <PID>

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Sau schimbă port în application.properties
server.port=8081
```

#### Eroare: JWT Token Expired
```
Soluție: Re-autentifică-te cu /api/auth/login pentru a obține token nou
```

### Frontend Issues

#### Eroare: "Cannot connect to backend"
```
Soluție:
1. Verifică că backend rulează pe http://localhost:8080
2. Verifică VITE_API_BASE_URL în .env.local
3. Verifică CORS configuration în backend
```

#### Eroare: "npm install" eșuează
```bash
# Șterge node_modules și package-lock.json
rm -rf node_modules package-lock.json

# Reinstalează
npm install

# Sau folosește yarn
yarn install
```

### Database Issues

#### Eroare: "Database migration failed"
```
Soluție:
1. Verifică int_db.sql structure în /database
2. Verifică Flyway migrations în src/main/resources/db/migration/
3. Resetează migrations (cu grijă): DELETE FROM flyway_schema_history
```

---

## 📞 Support & Contribuire

### Raportare Bug
1. Deschide o issue pe GitHub
2. Descrie pas cu pas cum să reproduci bug-ul
3. Include logs relevante

### Contribuire
1. Fork repository
2. Creează branch feature: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add feature'`
4. Push: `git push origin feature/my-feature`
5. Deschide Pull Request

---

## 📄 Licență

Proprietate - Draxlmaier GmbH

---

## 👨‍💻 Informații Versiune

| Detail | Valoare |
|--------|---------|
| **Java Version** | 21 |
| **Spring Boot** | 3.3.5 |
| **Node.js** | 16+ |
| **PostgreSQL** | 15 (Neon Cloud) |
| **Database Host** | neon.tech |
| **API Base** | http://localhost:8080 |
| **Frontend Base** | http://localhost:5173 |

---

**Última actualizar**: Mai 2026  
**Status**: ✅ Production Ready  
**Database**: ☁️ Neon Cloud Hosted

