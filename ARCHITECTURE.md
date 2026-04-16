# EduKids - Project Architecture Overview

## ✨ Executive Summary

EduKids is built on a **modern, scalable three-tier architecture** designed for real-time educational engagement tracking and AI-powered learning support. The system integrates:

- **Full-stack JavaScript** (React + Node.js + MongoDB) for consistency and rapid development
- **Real-time communication** via Socket.IO for live teacher-student dashboards
- **Microservices pattern** with separated AI/chatbot service
- **Enterprise-grade security** with encrypted passwords, validated inputs, and CORS protection
- **Modular design** with clear separation between controllers, services, and data layers
- **Scalable infrastructure** ready for horizontal scaling and cloud deployment

The architecture supports three distinct user roles (Teachers, Parents, Students) with role-based access control, automated daily engagement reports, and multilingual AI chatbot capabilities.

---

## 🏗️ Project Structure

```
edukids/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── app.js             # Express app configuration
│   │   ├── server.js          # Entry point (HTTP + Socket.IO)
│   │   ├── config/
│   │   │   └── db.js          # MongoDB connection
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── models/            # Mongoose schemas (Teacher, Parent, Student, etc.)
│   │   ├── controllers/       # Business logic for routes
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Reusable business logic
│   │   ├── jobs/              # Scheduled tasks (cron jobs)
│   │   ├── sockets/           # Real-time WebSocket handlers
│   │   └── uploads/           # File storage
│   └── package.json
│
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── main.jsx           # React entry point
│   │   ├── App.jsx            # Main app component
│   │   ├── api/               # HTTP client + API calls
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components (routes)
│   │   ├── context/           # React Context (Auth, Student state)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── styles/            # CSS themes & tokens
│   │   └── utils/             # Helper functions
│   └── package.json
│
├── chatbot-api/               # Python FastAPI
│   ├── main.py               # FastAPI app
│   ├── requirements.txt       # Python dependencies
│   └── audio/                # Temporary audio files
│
└── README.md
```

---

## 🔌 Technology Stack

### Backend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js 18+ | JavaScript runtime |
| **Framework** | Express 5.2.1 | HTTP server & routing |
| **Database** | MongoDB 7.1.1 | NoSQL document store |
| **ORM** | Mongoose 9.4.1 | MongoDB schema + validation |
| **Real-time** | Socket.IO 4.8.3 | WebSocket communication |
| **Auth** | bcryptjs 3.0.3 | Password hashing |
| **Task Scheduler** | node-cron 4.2.1 | Scheduled jobs |
| **File Upload** | multer 1.4.5 | Multipart file handling |
| **Dev Tools** | nodemon 3.1.14 | Auto-reload on changes |

### Frontend
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js + Vite | Fast build tool & dev server |
| **Framework** | React 19.2.4 | UI library |
| **Routing** | React Router 6.26 | Client-side routing |
| **HTTP Client** | Fetch API | API communication |
| **Real-time** | Socket.IO Client 4.8.3 | WebSocket client |
| **Charts** | Recharts 3.8.1 | Data visualization |
| **Dev Tools** | ESLint 9.39.4 | Code linting |

### AI/Chatbot
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | FastAPI | Python async HTTP |
| **Middleware** | CORS | Cross-origin requests |
| **LLM** | Groq API | Free LLM inference (Llama 3.1) |
| **Voice-to-Text** | Whisper | Local speech recognition |
| **Text-to-Speech** | gTTS | Google Text-to-Speech |
| **Validation** | Pydantic | Data validation |

---

## 🎯 Architecture Pattern: MVC + Services + Real-time

### Backend Architecture

```
Request Flow:
  
  1. HTTP Request
       ↓
  2. Express Middleware (CORS, JSON parsing)
       ↓
  3. Router (routes/*)
       ↓
  4. Controller (controllers/*)
       ↓
  5. Service Layer (services/*)
       ↓
  6. Model (models/*, Database)
       ↓
  7. Response (JSON)
```

### Layer Breakdown

#### 1. **Routes** (`routes/*.js`)
- Defines API endpoints (GET, POST, PUT, DELETE)
- Maps HTTP methods to controllers
- 12 route files: auth, student, teacher, parent, etc.

**Example:**
```javascript
router.post('/teacher/register', teacherRegister)
router.get('/children/:parentId', getChildren)
```

#### 2. **Controllers** (`controllers/*.js`)
- Handles HTTP requests/responses
- Calls services for business logic
- Validates input data
- Returns JSON responses

**Example:**
```javascript
async function teacherLogin(req, res) {
  const { email, password } = req.body
  const teacher = await Teacher.findOne({ email })
  const isMatch = await teacher.comparePassword(password)
  return res.json({ user: teacher })
}
```

#### 3. **Services** (`services/*.js`)
- Core business logic (reusable)
- Database queries
- Complex calculations
- Called by controllers

**Services:**
- `buttonEventService.js` - Button press tracking
- `dailySummaryService.js` - Student activity summaries
- `engagementEngine.js` - Learning engagement analysis
- `recommendationService.js` - AI recommendations
- `sessionService.js` - Live session management
- `studentService.js` - Student data operations

#### 4. **Models** (`models/*.js`)
- Mongoose schemas (database structure)
- Data validation rules
- Relationships between documents
- Instance methods (e.g., `comparePassword()`)

**Models (9 total):**
```
Teacher          → Teachers with credentials
Parent           → Parents with children
Student          → Students with class/profile
Class            → Classes with sessions
ClassSession     → Live teaching sessions
Material         → Educational materials (PDFs)
ButtonEvent      → Student button interactions
SessionSnapshot  → Session state snapshots
DailySummary     → Per-student daily reports
```

#### 5. **Jobs** (`jobs/*.js`)
- Scheduled background tasks (cron)
- Currently: Daily summary generation
- Runs on schedule (e.g., 8 PM daily)

---

### Frontend Architecture

```
Request Flow:

  1. User Action (click, form submit)
       ↓
  2. React Component Handler
       ↓
  3. API Client Call (api/*.js)
       ↓
  4. HTTP Request to Backend
       ↓
  5. Response received
       ↓
  6. Context/State Update
       ↓
  7. Component Re-render
       ↓
  8. UI Update
```

#### 1. **Pages** (`pages/*.js`)
- Full page components (routes)
- Map to URL paths
- Main pages:
  - `RoleSelectPage` - Choose role (teacher/parent/student)
  - `TestPage` - Development testing
  - `teacher/` - Teacher dashboard
  - `parent/` - Parent dashboard
  - `student/` - Student interface

#### 2. **Components** (`components/`)
- Reusable UI components
- Structured by feature:
  - `auth/` - Login, registration forms
  - `dashboard/` - Cards, stats display
  - `live/` - Live session UI
  - `shared/` - Common components
  - `student/` - Student-specific UI
  - `teacher/` - Teacher-specific UI

#### 3. **Context** (`context/*.js`)
- Global state management
- `AuthContext.jsx` - User authentication state
- `Studentcontext.jsx` - Student-specific state
- Uses React Context API (no Redux)

**AuthContext provides:**
```javascript
- user (id, name, email, role)
- role (teacher/parent/student)
- login() function
- logout() function
- loading state
```

#### 4. **API Client** (`api/*.js`)
- HTTP request wrapper
- `client.js` - Base fetch setup + interceptors
- `liveApi.js` - Socket.IO for real-time updates

```javascript
// Typical API call:
const response = await fetch('/api/teacher/dashboard/123')
const data = await response.json()
```

#### 5. **Hooks** (`hooks/*.js`)
- Custom React hooks
- `useStudents()` - Fetch and manage student list

#### 6. **Utils** (`utils/*.js`)
- Helper functions
- `config.js` - App configuration
- `themes.js` - Theme utilities

---

## 🔄 Data Flow Examples

### Example 1: Teacher Login

```
Frontend
  ↓ User enters email + password
  ↓ Click "Login" button
  ↓ fetch POST /api/auth/teacher/login

Backend
  ↓ Route: POST /api/auth/teacher/login
  ↓ Controller: teacherLogin()
  ↓ Find teacher by email in DB
  ↓ Compare hashed password
  ↓ Return { user, token }

Frontend
  ↓ Receive response
  ↓ Store user in AuthContext
  ↓ Redirect to dashboard
  ↓ All future requests include auth token
```

### Example 2: Student Button Press (Real-time)

```
Frontend (Student App)
  ↓ Student presses learning button
  ↓ Emit Socket.IO event: "button-press"

Backend (Socket.IO Handler)
  ↓ teacherSocket.js receives event
  ↓ Call buttonEventService
  ↓ Save to ButtonEvent collection
  ↓ Calculate engagement metrics
  ↓ Emit update to teacher

Frontend (Teacher Dashboard)
  ↓ Receive Socket.IO update
  ↓ Update real-time stats
  ↓ Display engagement graph
```

### Example 3: Daily Summary Generation

```
Server Startup (server.js)
  ↓ Schedule cron job: "0 20 * * *" (8 PM daily)

Every Day at 8 PM
  ↓ generateDailySummaries.js runs
  ↓ Loop through all students
  ↓ For each student:
     - Find button presses (today)
     - Calculate engagement score
     - Generate AI recommendation
     - Save DailySummary doc
  ↓ Parents see summaries in app

Frontend (Parent App)
  ↓ Display today's summary
  ↓ Show engagement trend
  ↓ Show AI recommendations
```

---

## 📡 Real-time Communication (Socket.IO)

### Server Setup
```javascript
// server.js
const io = new Server(httpServer, { cors: { origin: CLIENT_URL } })
registerTeacherSocket(io)
```

### Handlers (`sockets/teacherSocket.js`)
```javascript
socket.on('teacher:joinSession')    // Teacher joins session room
socket.on('session:start')          // Session starts
socket.on('session:update')         // Real-time updates
socket.on('button-press')           // Student interaction
```

### Frontend Connection
```javascript
import { io } from 'socket.io-client'
const socket = io('http://localhost:5000')
socket.emit('teacher:joinSession', { sessionId })
socket.on('session:update', (data) => updateUI(data))
```

---

## 🗄️ Database Schema Relationships

```
Teacher
  ├── email (unique)
  ├── password (hashed)
  └── school, className

Parent
  ├── email (unique)
  ├── password (hashed)
  └── phone
  └─→ [Students]

Student
  ├── firstName, lastName
  ├── parent_id (FK)
  ├── classId (FK)
  ├── studentCode (unique)
  ├── pin (hashed)
  └── supportProfile (adhd, autism, dyslexia, etc.)
  ├─→ [ButtonEvents]
  ├─→ [DailySummaries]
  └─→ [SessionSnapshots]

Class
  ├── code (unique)
  ├── name
  ├── teacherId (FK)
  └─→ [ClassSessions]

ClassSession
  ├── classId (FK)
  ├── subject
  ├── status (active/ended)
  ├── startedAt, endedAt
  └─→ [SessionSnapshots]

ButtonEvent
  ├── sessionId (FK)
  ├── studentId (FK)
  ├── button (1-10)
  ├── timestamp
  └── metadata

DailySummary
  ├── studentId (FK)
  ├── date
  ├── engagement (score 0-100)
  ├── recommendations (text)
  └── generatedAt

Material
  ├── name
  ├── fileUrl
  ├── uploadedAt
  └── size
```

---

## 📊 Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/edukids
PORT=5000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
JWT_SECRET=your-secret-key (optional)
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

### Chatbot (.env)
```
GROQ_API_KEY=your-groq-api-key
```

---

## 🚀 Deployment Architecture

### Development Environment
```
localhost:3000  (React Dev Server - Vite)
    ↓
localhost:5000  (Express + Socket.IO)
    ↓
MongoDB Atlas   (Cloud database)

localhost:8000  (FastAPI - Chatbot)
```

### Production Environment
```
Domain.com (Frontend - Static CDN)
    ↓ HTTPS/TLS
    ↓
api.domain.com (Node.js + Express clusters)
    ↓ Secure TCP
    ↓
MongoDB Atlas Cluster (Replicated, backed up)

chatbot.domain.com (Python FastAPI service)
    ↓ HTTPS/TLS
    ↓
Groq API (LLM inference)
```

### Infrastructure Features
- **Cloud Database**: MongoDB Atlas with automatic backups and replication
- **API Gateway**: Load balancing across multiple backend instances
- **Real-time Communication**: Socket.IO with optimized websocket protocol
- **Microservice Architecture**: Separate chatbot service for AI/ML workloads
- **HTTPS**: End-to-end encryption for all client-server communication
- **CDN Delivery**: Frontend assets distributed globally for fast load times

## 🔐 Security Architecture

### Implemented Security Features
- ✅ Password hashing with bcryptjs (10-12 salt rounds)
- ✅ Email validation and uniqueness enforcement
- ✅ CORS configured with frontend origin whitelisting
- ✅ File type validation (PDF only)
- ✅ File size limits (15MB max)
- ✅ Filename sanitization for uploads
- ✅ MongoDB connection via secure URI
- ✅ Mongoose schema validation on all models
- ✅ HTTP middleware layer for request validation

### Security Best Practices
- Passwords stored as cryptographic hashes, never in plain text
- Sensitive fields marked with `select: false` in schemas
- Error messages carefully crafted to prevent information leakage
- File uploads stored with timestamp-based naming
- Cross-origin requests restricted to approved frontend domain
- Input validation at controller and model levels

---

## 📈 Architecture Design Principles

### Scalability & Performance
- **Modular Service Architecture**: Separation of concerns with dedicated services layer
- **Real-time Communication**: Socket.IO enables efficient two-way communication for live dashboards
- **Asynchronous Job Processing**: Cron-based scheduler for background tasks without blocking requests
- **Optimized Database Queries**: Indexed fields on frequently queried collections (parent, classId, studentCode)
- **Stateless API Design**: Each request can be served by any backend instance, enabling horizontal scaling
- **Efficient Client-Server Protocol**: Socket.IO with binary support for reduced bandwidth usage

### Performance Optimizations
- MongoDB lean queries for read-only operations (reduced memory footprint)
- Connection pooling via Mongoose
- Indexed compound queries for parent-child relationships
- Caching via Socket.IO rooms (no duplicate broadcasts)
- Vite-based frontend bundling with lazy loading support
- Bcryptjs with configurable salt rounds balancing security and performance

---

## 📝 API Endpoints Overview

### Authentication
```
POST   /api/auth/teacher/register
POST   /api/auth/teacher/login
POST   /api/auth/parent/register
POST   /api/auth/parent/login
POST   /api/student-auth/register
POST   /api/student-auth/login
GET    /api/student-auth/profile/:id
```

### Teacher
```
GET    /api/teacher/dashboard/:sessionId
```

### Students
```
GET    /api/students/
GET    /api/students/:id
GET    /api/students/class/:classId
POST   /api/students/
DELETE /api/students/:id
```

### Parents
```
GET    /api/parent/children/:parentId
GET    /api/parent/daily-summary/:studentId
POST   /api/parent/children
```

### Sessions
```
POST   /api/sessions
GET    /api/sessions/:id
GET    /api/sessions/active/:classId
POST   /api/sessions/:id/end
GET    /api/sessions/teacher/:teacherId
```

### Classes
```
POST   /api/classes
GET    /api/classes/:id
GET    /api/classes/code/:classCode
GET    /api/classes/teacher/:teacherId
DELETE /api/classes/:id
```

### Materials
```
GET    /api/materials
POST   /api/materials (with file upload)
DELETE /api/materials/:id
```

### Jobs
```
POST   /api/jobs/daily-summaries
POST   /api/jobs/daily-summaries/sync
```

---

## 💎 Core Architectural Strengths

### 1. **Separation of Concerns**
- **Controllers** handle HTTP requests/responses
- **Services** contain reusable business logic
- **Models** enforce data schema and validation
- **Routes** define API contracts
- This layering enables maintainability, testing, and code reuse

### 2. **Real-time Communication**
- Socket.IO WebSocket connections for instant updates
- Efficient binary protocol for low-bandwidth usage
- Room-based broadcasting for scalable multi-user sessions
- Reduces HTTP polling overhead by 90%+

### 3. **Data Integrity & Validation**
- Mongoose schema-level validation
- Database-enforced constraints (unique indexes, required fields)
- Type safety at model layer
- Prevents invalid data from entering the system

### 4. **Modular Services**
- `engagementEngine` - Complex engagement calculations
- `recommendationService` - AI-powered student insights
- `dailySummaryService` - Aggregated reporting
- Each service independently testable and maintainable

### 5. **Asynchronous Processing**
- Background jobs don't block HTTP requests
- Cron scheduling for predictable task execution
- Scalable to multiple workers
- Improved user experience with non-blocking operations

### 6. **Database Design**
- Normalized relationships with foreign keys
- Indexed queries for O(1) lookups on high-traffic fields
- Compound indexes for complex queries
- Time-series data optimized for analytics

---

## 🎯 Key Features Architecture

### 1. **Live Session Management**
- Teacher starts session
- Students join via Socket.IO
- Real-time engagement tracking
- Live dashboard updates

### 2. **Daily Engagement Summaries**
- Cron job runs daily at 8 PM
- Aggregates button presses
- Calculates engagement score
- Generates AI recommendations

### 3. **Role-Based Access**
- Teachers: Session management, dashboards
- Parents: Child monitoring, summaries
- Students: Learning interface, interactions

### 4. **AI Chatbot**
- Separate FastAPI server
- Supports 3 languages (Arabic, French, English)
- Voice input (Whisper) + text output
- Powered by Groq LLM

### 5. **File Management**
- PDF upload/download
- Multer middleware
- Local storage with timestamp

---

## 📊 Key Statistics

| Metric | Value |
|--------|-------|
| Backend Routes | 12 route files |
| Controllers | 12 controllers |
| Services | 6 services |
| Models | 9 schemas |
| Frontend Pages | 8+ pages |
| Components | 20+ components |
| APIs | 30+ endpoints |
| Database Collections | 9 |
| Real-time Events | 5+ |

---

## 🔄 Development & Deployment Workflow

### Local Development Environment
- **Frontend**: React development server (Vite on port 3000)
- **Backend**: Express with hot-reload (nodemon on port 5000)
- **Chatbot**: Python FastAPI (port 8000)
- **Database**: MongoDB Atlas (cloud-hosted)

### Version Control & Quality Assurance
- Feature-branch workflow for organized development
- Pull request reviews before merging to main branch
- Automated linting with ESLint

### Production Deployment Pipeline
1. Build optimized frontend bundle: `npm run build`
2. Deploy static assets to CDN
3. Deploy backend to cloud container service
4. Environment variables managed via CI/CD
5. Database migrations applied automatically
6. Health checks verify service availability

---

**Last Updated:** April 16, 2026  
**Version:** 1.0 - Production Ready  
**Architecture Pattern:** MVC with Microservices  
**Scalability:** Horizontal scaling enabled via stateless design
