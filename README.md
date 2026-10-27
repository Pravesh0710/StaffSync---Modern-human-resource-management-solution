# StaffSync — Modern Human Resource Management System (HRM)

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![Tests](https://img.shields.io/badge/Tests-18%20Passed-success.svg)]()

StaffSync is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) Human Resource Management System engineered for enterprise workforce operations. It delivers role-based dashboards, secure JWT authentication, employee administration, leave approval workflows, daily time & attendance tracking, training programs, and company-wide announcements.

---

## Table of Contents

1. [Features by User Role](#features-by-user-role)
2. [Technology Stack](#technology-stack)
3. [Architecture & Project Structure](#architecture--project-structure)
4. [Data Models & Schema Design](#data-models--schema-design)
5. [Role-Based Access Control (RBAC) Matrix](#role-based-access-control-rbac-matrix)
6. [API Endpoints Reference](#api-endpoints-reference)
7. [Getting Started & Installation](#getting-started--installation)
8. [Environment Variables](#environment-variables)
9. [Database Seeding & Demo Accounts](#database-seeding--demo-accounts)
10. [Automated Testing](#automated-testing)
11. [Production Build](#production-build)
12. [Business Rules & Design Assumptions](#business-rules--design-assumptions)

---

## Features by User Role

### 1. HR Administrator (`HR`)
- **Executive Metrics:** Real-time visibility into total workforce headcounts, active vs deactivated employees, today's attendance rate, pending leaves, and department distribution.
- **Employee Directory (CRUD):** Provision new employee profiles and user accounts, search by name/code, filter by department and status, edit employee organizational data, toggle active/inactive status.
- **Safe Record Deletion:** Automatically checks for historical records (leave requests, attendance logs) before allowing deletion; if historical records exist, safely deactivates the record to preserve audit compliance.
- **Leave Oversight:** Review all organizational leave applications; approve or reject with custom administrative comments.
- **Attendance Oversight & Reports:** Inspect company-wide clock-in/out timestamps and total hours worked; manually record or adjust attendance logs.
- **Broadcast Announcements:** Publish organization-wide or department-targeted announcements with customizable urgency levels (`LOW`, `NORMAL`, `HIGH`, `URGENT`).

### 2. Team Manager (`MANAGER`)
- **Team Dashboard:** Overview of direct reports, today's team attendance, active training tracks, and pending team requests.
- **Team Directory:** Access contact details and job assignments for engineers and staff reporting to the manager.
- **Team Leave Approvals:** Review leave applications exclusively for team members; approve or reject with manager comments.
- **Training & Development:** Create technical training tracks, assign team members or departments, and manage lifecycle status (`UPCOMING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
- **Team Communications:** Publish team-targeted announcements.

### 3. Employee Self-Service (`EMPLOYEE`)
- **Live Digital Punch Clock:** One-click Check-In and Check-Out with live digital clock, current shift state, and auto-calculated daily work hours.
- **Leave Management:** Submit leave applications (`ANNUAL`, `SICK`, `CASUAL`, `MATERNITY`, `PATERNITY`, `UNPAID`) with automatic date-validation and overlap checks; monitor review status; cancel pending requests.
- **Attendance Timesheets:** Access monthly attendance history with clock-in/out timestamps, hours worked, and status indicators.
- **Personal Profile Management:** Review official organizational details; update permitted personal information (phone number, home address, emergency contacts); secure password change.
- **Announcements & Training:** Read company news updates and view assigned training curricula.

---

## Technology Stack

- **Frontend:** React 18, Vite 5, React Router v6, Axios, Bootstrap 5, Lucide React (Icons).
- **Backend:** Node.js, Express.js, Mongoose 8.
- **Database:** MongoDB (Local installation or MongoDB Atlas).
- **Authentication:** JSON Web Tokens (JWT) signed with HMAC-SHA256, bcryptjs for password hashing (10 salt rounds).
- **Security:** Helmet HTTP headers, CORS origin whitelist, Express-Validator input sanitization, centralized error handling.
- **Testing:** Jest, Supertest, MongoMemoryServer for automated in-memory testing.

---

## Architecture & Project Structure

```
StaffSync/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection handler
│   │   ├── controllers/
│   │   │   ├── authController.js       # Auth, registration, password change
│   │   │   ├── employeeController.js   # Employee CRUD, status toggle, safe delete
│   │   │   ├── leaveController.js      # Leave requests & review workflows
│   │   │   ├── attendanceController.js # Punch in/out, history, manual logs
│   │   │   ├── announcementController.js
│   │   │   ├── trainingController.js   # Training curricula & assignment
│   │   │   └── reportController.js     # HR & Manager aggregated metrics
│   │   ├── middleware/
│   │   │   ├── auth.js                 # JWT verification & req.user/req.employee attachment
│   │   │   ├── rbac.js                 # Role-based route authorization
│   │   │   ├── validate.js             # Express-validator error handler
│   │   │   └── errorHandler.js         # Centralized error formatter
│   │   ├── models/
│   │   │   ├── User.js                 # User credentials & system role
│   │   │   ├── Employee.js             # Detailed employee profile
│   │   │   ├── LeaveRequest.js         # Time-off requests & reviews
│   │   │   ├── Attendance.js           # Daily attendance & work hours
│   │   │   ├── Announcement.js         # Internal communications
│   │   │   └── TrainingProgram.js      # Learning & development curricula
│   │   ├── routes/                     # REST route definitions
│   │   └── seed/
│   │       └── seedData.js             # Demo data population script
│   ├── tests/
│   │   ├── auth.test.js                # Auth integration tests
│   │   ├── employee.test.js            # Employee & RBAC tests
│   │   ├── leave.test.js               # Leave workflow tests
│   │   ├── attendance.test.js          # Punch in/out calculation tests
│   │   └── setup.js                    # In-memory test environment config
│   ├── .env.example
│   ├── package.json
│   └── server.js                       # Express app bootstrap
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Responsive header with user & date badges
│   │   │   ├── Sidebar.jsx             # Role-specific navigation menu
│   │   │   └── ProtectedRoute.jsx      # Client-side authentication & role guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Global auth state & token management
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx           # Login with 1-click demo credential fillers
│   │   │   ├── hr/                     # HR dashboard & management pages
│   │   │   ├── manager/                # Manager team & training pages
│   │   │   └── employee/               # Employee punch, leaves, profile pages
│   │   ├── services/
│   │   │   └── api.js                  # Axios instance with interceptors
│   │   ├── App.jsx                     # Route definitions & layouts
│   │   ├── index.css                   # Custom HRM styling & tokens
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js                  # Dev server proxy configuration
├── .gitignore
└── README.md
```

---

## Data Models & Schema Design

| Model | Primary Fields | Key Constraints & Indexes |
|---|---|---|
| **User** | `name`, `email`, `passwordHash`, `role` (`HR`, `MANAGER`, `EMPLOYEE`), `isActive` | Unique lowercase index on `email`, password excluded from JSON output |
| **Employee** | `userId`, `employeeCode`, `firstName`, `lastName`, `department`, `jobTitle`, `managerId`, `phone`, `dateOfJoining`, `address`, `emergencyContact`, `isActive` | Unique compound index on `employeeCode`, unique on `userId`, index on `department` & `managerId` |
| **LeaveRequest** | `employeeId`, `leaveType`, `startDate`, `endDate`, `reason`, `status` (`PENDING`, `APPROVED`, `REJECTED`), `reviewedBy`, `reviewedAt`, `reviewComments` | Indexes on `employeeId`, `status`, and date ranges |
| **Attendance** | `employeeId`, `date`, `status` (`PRESENT`, `ABSENT`, `HALF_DAY`, `ON_LEAVE`), `checkIn`, `checkOut`, `workHours`, `notes` | Compound unique index on `{ employeeId: 1, date: 1 }` (ensures 1 record per employee/day) |
| **Announcement** | `title`, `content`, `createdBy`, `audience`, `priority`, `isPublished`, `publishedAt` | Index on `audience`, `publishedAt: -1` |
| **TrainingProgram** | `title`, `description`, `department`, `assignedEmployees`, `startDate`, `endDate`, `status`, `createdBy` | Index on `assignedEmployees`, `status` |

---

## Role-Based Access Control (RBAC) Matrix

| Resource & Action | HR | Manager | Employee |
|---|:---:|:---:|:---:|
| **Authentication & Profile Self-Inspection** | Yes | Yes | Yes |
| **Update Personal Permitted Profile (Phone/Address)** | Yes | Yes | Yes |
| **Create Employee Account & Profile** | Yes | No | No |
| **View Full Employee Directory** | Yes | Team Only | No |
| **Edit Employee Job/Department/Status** | Yes | No | No |
| **Safe Deactivate / Delete Employee** | Yes | No | No |
| **Submit Leave Request** | Self | Self | Self |
| **Review / Approve Leave Requests** | All | Team Only | No |
| **Cancel Own Pending Leave** | Yes | Yes | Yes |
| **Clock-In / Clock-Out (Attendance)** | Yes | Yes | Yes |
| **View Personal Attendance History** | Yes | Yes | Yes |
| **View Organization Attendance Reports** | Yes | Team Only | No |
| **Record Manual Attendance Correction** | Yes | No | No |
| **Publish Announcement** | All / Any Dept | Team / Dept | No |
| **Create / Manage Training Programs** | Yes | Yes | View Assigned |

---

## API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Account provisioning / registration.
- `POST /api/auth/login` — Login with credentials, returns JWT.
- `GET /api/auth/me` — Retrieve active user session & linked employee record.
- `POST /api/auth/change-password` — Change password for authenticated user.

### Employees (`/api/employees`)
- `GET /api/employees` — List employees (HR: all, Manager: team) with pagination & filters.
- `POST /api/employees` — Create user and employee profile (HR only).
- `GET /api/employees/:id` — Get single employee profile.
- `PUT /api/employees/:id` — Update employee (HR: full update; Employee: permitted personal fields).
- `PATCH /api/employees/:id/toggle-status` — Toggle active/inactive state (HR only).
- `DELETE /api/employees/:id` — Delete employee or safely deactivate if historical data exists (HR only).

### Leaves (`/api/leaves`)
- `POST /api/leaves` — Apply for leave with date validation.
- `GET /api/leaves/my-leaves` — View personal leave requests & statuses.
- `GET /api/leaves` — List leave requests (HR: all, Manager: team).
- `PATCH /api/leaves/:id/review` — Approve or reject leave with reviewer comments.
- `DELETE /api/leaves/:id` — Cancel a pending leave request.

### Attendance (`/api/attendance`)
- `POST /api/attendance/check-in` — Clock in for the current day.
- `POST /api/attendance/check-out` — Clock out and compute total work hours.
- `GET /api/attendance/today` — Check today's punch state.
- `GET /api/attendance/my-history` — Attendance history with date range filtering.
- `GET /api/attendance` — Organization-wide attendance (HR: all, Manager: team).
- `POST /api/attendance/manual` — Record/adjust manual attendance (HR only).

### Announcements (`/api/announcements`)
- `GET /api/announcements` — List announcements targeted to user's audience or department.
- `POST /api/announcements` — Publish announcement (HR, Manager).
- `PUT /api/announcements/:id` — Edit announcement.
- `DELETE /api/announcements/:id` — Delete announcement.

### Training & Development (`/api/trainings`)
- `GET /api/trainings/my-trainings` — List trainings assigned to employee.
- `GET /api/trainings` — List all training tracks (HR, Manager).
- `POST /api/trainings` — Create training track (HR, Manager).
- `PUT /api/trainings/:id` — Update training track (HR, Manager).
- `DELETE /api/trainings/:id` — Delete training track (HR, Manager).

### Reports (`/api/reports`)
- `GET /api/reports/hr-metrics` — Aggregated workforce KPIs for HR dashboard.
- `GET /api/reports/manager-metrics` — Team capacity and training stats for Manager dashboard.
- `GET /api/reports/attendance-report` — Date-range attendance analytics.

---

## Getting Started & Installation

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v8.0.0 or higher
- **MongoDB:** Local MongoDB instance running on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI

### 1. Clone & Set Up Backend

```bash
cd StaffSync/backend
npm install
```

Create `backend/.env` using the provided template:

```bash
cp .env.example .env
```

Ensure MongoDB is running locally, then seed initial demo data:

```bash
npm run seed
```

Start the backend API server:

```bash
npm run dev
# Server will listen on http://localhost:5000
```

### 2. Set Up Frontend

In a second terminal window:

```bash
cd StaffSync/frontend
npm install
npm run dev
# Frontend will be live on http://localhost:5173
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/staffsync

# Security & JWT
JWT_SECRET=staffsync_super_secret_jwt_key_2026_secure_hrm_token
JWT_EXPIRES_IN=7d

# Cross-Origin Resource Sharing
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=/api
```

---

## Database Seeding & Demo Accounts

Run `npm run seed` inside the `backend` folder to populate initial accounts and demo data. All demo accounts use the default password: **`Password123!`**.

| Role | Name | Email | Password |
|---|---|---|---|
| **HR Administrator** | Sarah Connor | `hr@staffsync.com` | `Password123!` |
| **Team Manager** | Michael Scott | `manager@staffsync.com` | `Password123!` |
| **Employee (Senior Dev)** | Jim Halpert | `employee@staffsync.com` | `Password123!` |
| **Employee (Designer)** | Pam Beesly | `pam@staffsync.com` | `Password123!` |
| **Employee (Sales)** | Dwight Schrute | `dwight@staffsync.com` | `Password123!` |

> **Pro-Tip:** The login screen includes quick **1-Click Demo Buttons** to automatically fill credentials for any of the three roles.

---

## Automated Testing

StaffSync features automated integration tests using **Jest**, **Supertest**, and **MongoMemoryServer** for end-to-end endpoint verification without requiring an external database setup.

To run the automated test suite:

```bash
cd backend
npm test
```

### Test Suite Summary:
- **Authentication:** `tests/auth.test.js` — Registration, duplicate email rejection, invalid password rejection, JWT protection, and credential leak prevention.
- **Employee Management:** `tests/employee.test.js` — HR employee provisioning, RBAC role restrictions, employee directory access control.
- **Leave Requests:** `tests/leave.test.js` — Submitting leave, date validation (preventing invalid date ranges), manager/HR approval workflows.
- **Attendance Calculation:** `tests/attendance.test.js` — Daily check-in, duplicate check-in prevention, check-out with automatic work hours computation.

```
PASS  tests/auth.test.js
PASS  tests/leave.test.js
PASS  tests/employee.test.js
PASS  tests/attendance.test.js

Test Suites: 4 passed, 4 total
Tests:       18 passed, 18 total
```

---

## Production Build

To build the optimized static production bundle for the frontend:

```bash
cd frontend
npm run build
```

This compiles optimized assets into `frontend/dist/`. The output can be served with any static web host or directly integrated with Express via `express.static()`.

---

## Business Rules & Design Assumptions

1. **Leave Approval Authority:** Both HR administrators and direct team managers have authority to review and approve/reject leave requests. Managers are strictly scoped to review only employees within their assigned reporting line or department, whereas HR has organization-wide authority.
2. **Attendance Normalization:** Each employee has at most one attendance record per calendar date (`{ employeeId: 1, date: 1 }` unique compound index). Shifts with fewer than 4 hours logged are categorized as `HALF_DAY`, while shifts meeting or exceeding 4 hours are marked `PRESENT`.
3. **Safe Deactivation over Hard Deletion:** When an HR administrator initiates a deletion of an employee record, the system audits for existing historical records (leave requests or attendance logs). If historical records exist, the employee is safely deactivated (`isActive: false`) rather than deleted, guaranteeing regulatory compliance and audit trail preservation.
4. **Permitted Profile Fields:** Employees can freely update their personal phone number, residential address, and emergency contact details. Organizational fields (`jobTitle`, `department`, `employeeCode`, `role`, `managerId`) remain strictly locked and editable only by HR administrators.
