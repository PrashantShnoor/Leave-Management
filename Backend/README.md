# Leave Management System – Backend

A robust, enterprise-grade RESTful API and real-time WebSocket backend for managing employees, leave categories, annual quota allocations, activity auditing, and leave approval workflows. Built using **Node.js**, **Express.js 5**, **PostgreSQL**, **Socket.IO**, **JWT Authentication**, and **ACID-compliant transactions**.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
  - [1. Authentication & Security](#1-authentication--security)
  - [2. Employee Management](#2-employee-management)
  - [3. Leave Type Management](#3-leave-type-management)
  - [4. Leave Quota & Balance Tracking](#4-leave-quota--balance-tracking)
  - [5. Transactional Leave Workflow](#5-transactional-leave-workflow)
  - [6. Real-Time WebSockets & Notifications](#6-real-time-websockets--notifications)
  - [7. Comprehensive Activity Audit Logs](#7-comprehensive-activity-audit-logs)
  - [8. Admin & HR Analytics](#8-admin--hr-analytics)
  
- [Project Structure](#project-structure)
- [Database Architecture & Schema](#database-architecture--schema)
  - [Tables Overview](#tables-overview)
  - [SQL Initialization Script](#sql-initialization-script)


- [API Reference](#api-reference)
  - [1. Authentication APIs](#1-authentication-apis)
  - [2. Employee APIs](#2-employee-apis)
  - [3. Leave Type APIs](#3-leave-type-apis)
  - [4. Leave Balance APIs](#4-leave-balance-apis)
  - [5. Leave Request & Workflow APIs](#5-leave-request--workflow-apis)
  - [6. Admin & HR Dashboard APIs](#6-admin--hr-dashboard-apis)
  - [7. Notification APIs](#7-notification-apis)
  - [8. Activity Log APIs](#8-activity-log-apis)
- [WebSocket Events Reference](#websocket-events-reference)


- [Setup & Run Guide](#setup--run-guide)
  - [Prerequisites](#prerequisites)
  - [Step 1: Clone & Install Dependencies](#step-1-clone--install-dependencies)
  - [Step 2: Environment Configuration](#step-2-environment-configuration)
  - [Step 3: Database Initialization](#step-3-database-initialization)
  - [Step 4: Start the Server](#step-4-start-the-server)
- [Security, Rate Limiting & Concurrency](#security-rate-limiting--concurrency)

---

## Overview

The Leave Management System Backend provides the business logic, security layer, real-time messaging, and persistence layer for an enterprise leave management portal. It connects with a PostgreSQL relational database using connection pooling via `pg` and serves client applications with CORS support, Helmet security headers, rate limiting, and HTTP-only cookie-based JWT authentication.

---

## Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Runtime** | Node.js | Asynchronous, event-driven JavaScript runtime |
| **Framework** | Express.js 5 | Modern web framework with native async error handling |
| **Database** | PostgreSQL | Relational database supporting ACID transactions and row locks |
| **Database Driver** | `pg` (node-postgres) | High-performance PostgreSQL client connection pool |
| **Real-Time Communication** | [Socket.IO](https://socket.io/) | Bi-directional WebSocket server for live notification dispatch |
| **Authentication** | `jsonwebtoken` & `bcrypt` | Secure password hashing (10 salt rounds) and JWT tokens |
| **Security Headers** | `helmet` | HTTP header protection against well-known web vulnerabilities |
| **Rate Limiting** | `express-rate-limit` | Brute-force and DoS mitigation on sensitive endpoints |
| **Cookie Parsing** | `cookie-parser` | Extraction and handling of HTTP-only session cookies |
| **CORS** | `cors` | Configured for credentialed cross-origin requests (`http://localhost:5173`) |
| **Validation** | `validator` | String validation and password complexity enforcement |
| **Environment** | `dotenv` | Secure loading of environment variables from `.env` |
| **Dev Tool** | `nodemon` | Hot reload and automatic server restarts during development |

---

## Key Features

### 1. Authentication & Security
- **Registration (`/signup`):** Enforces strong password constraints, valid email format, and unique email addresses with bcrypt hashing.
- **Login (`/login`):** Validates credentials, issues signed JWTs with user id and role, sets HTTP-only cookies, and enforces rate limiting.
- **Logout (`/logout`):** Clears the session cookie safely.
- **Role-Based Access Control (`requireRole`):** Reusable middleware enforcing fine-grained role privileges (`admin`, `hr`, `employee`).

### 2. Employee Management
- Complete employee directory management.
- Authenticated user profile retrieval (`/getemployee`).
- Role assignment supporting `employee`, `hr`, and `admin`.

### 3. Leave Type Management
- Define custom organization leave categories (e.g., Annual Leave, Sick Leave, Casual Leave, Unpaid Leave).
- Maintain active/inactive flags and descriptions per leave category.
- List all categories sorted alphabetically for dropdown selections.

### 4. Leave Quota & Balance Tracking
- Allocate yearly leave day quotas to employees per leave category (`employee_leave_balance`).
- Real-time balance calculations: `available_days = allocated_days - used_days`.
- Endpoints to retrieve individual balances or all employee balances with joined profile metadata.

### 5. Transactional Leave Workflow
- **Application Submission (`POST /createLeave`):**
  - Enforces mandatory date ranges, positive requested days (`days > 0`), valid date sequences (`start_date <= end_date`), and justification reasons.
  - Automatically checks `allocated_days - used_days` in the database.
  - Rejects applications if requested days exceed available quota.
- **Transactional Approval (`PATCH /approveLeave/:id`):**
  - Wrapped in a database transaction (`BEGIN ... COMMIT`).
  - Employs **row-level locking** (`SELECT ... FOR UPDATE`) on both `leave_request` and `employee_leave_balance` to prevent race conditions.
  - Verifies the request is in `pending` status.
  - Deducts balance by incrementing `used_days` in `employee_leave_balance`.
  - Marks status as `approved` and records optional reviewer feedback.
- **Transactional Rejection (`PATCH /rejectLeave/:id`):**
  - Wrapped in a transaction with row-level locks.
  - Verifies `pending` status and transitions record to `rejected` without balance deduction.

### 6. Real-Time WebSockets & Notifications
- Connected users join private user rooms (`user:${userId}`) and role rooms (`role:${role}`).
- Real-time notification dispatch via Socket.IO upon leave application, approval, rejection, and quota assignment.
- Dedicated endpoints to list notifications, get unread counts, and mark individual or all notifications as read.

### 7. Comprehensive Activity Audit Logs
- Automatically logs platform actions (`LEAVE_APPLIED`, `LEAVE_APPROVED`, `LEAVE_REJECTED`, `BALANCE_ASSIGNED`, `ACCOUNT_CREATED`) into `activity_logs`.
- Supports pagination, filtering by employee, action type, and date ranges (`start_date`, `end_date`).

### 8. Admin & HR Analytics
- **Admin Dashboard API (`GET /getAdminDashboard`):** Aggregates organizational metrics (total employees, HR accounts, total leave requests, pending/approved/rejected counts, and employees currently on leave today).
- **HR Dashboard KPI API (`GET /hrDashboardSummary`):** Summarizes pending approvals, approved counts, rejected counts, and workforce numbers for HR review.

---

## Project Structure

```text
Backend/
├── src/
│   ├── config/
│   │   ├── database.js        # PostgreSQL pool configuration with connection limits & error handlers
│   │   └── socket.js          # Socket.IO initialization with JWT cookie authentication
│   │
│   ├── middleware/
│   │   ├── auth.js            # JWT verification & req.user injection middleware
│   │   └── role.js            # Role-based access control (RBAC) middleware factory
│   │
│   ├── routes/
│   │   ├── activityLog.js     # Activity audit logs query with pagination & filters
│   │   ├── auth.js            # Signup, Login, and Logout routes with rate limiting
│   │   ├── dashboard.js       # Admin & HR analytics summary endpoints
│   │   ├── employee.js        # Profile fetch, name updates, employee deletion, and directory
│   │   ├── hr.js              # HR account provisioning and retrieval
│   │   ├── leavebalance.js    # Yearly balance allocation and quota queries
│   │   ├── leaverequest.js    # Applications, approvals/rejections, and batch notifications
│   │   ├── leavetype.js       # Leave category creation and listing
│   │   └── notifications.js   # Notification queries and mark-read mutations
│   │
│   ├── utils/
│   │   ├── activitylogger.js  # Activity logging helper function
│   │   ├── notifications.js   # Notification database persistence and socket emit helpers
│   │   └── validator.js       # Input validation (email, strong password, role, IDs, dates)
│   │
│   └── app.js                 # Express server configuration, Helmet, rate limiting, and route mounting
│
├── .env                       # Environment variables (DB credentials, JWT secret, ports)
├── .gitignore
├── package.json
└── README.md
```

---

## Database Architecture & Schema

### Tables Overview

| Table | Description |
| :--- | :--- |
| **`employees`** | Stores personnel profiles, credentials, assigned roles, and registration timestamps. |
| **`leave_type`** | Stores company leave categories (Annual, Sick, Casual, etc.) and active statuses. |
| **`employee_leave_balance`** | Tracks annual quota allocation, used days, and year per employee and leave type. |
| **`leave_request`** | Records submitted leave applications, date intervals, status, and reviewer comments. |
| **`notifications`** | Stores individual user notifications, read states, and linked leave requests. |
| **`activity_logs`** | Stores immutable audit log trail of state changes, actors, and JSON diffs. |

---

### SQL Initialization Script

Run the following SQL commands in your PostgreSQL database (`leave-managementdb`):

```sql
-- 1. Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create leave_type table
CREATE TABLE IF NOT EXISTS leave_type (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create employee_leave_balance table
CREATE TABLE IF NOT EXISTS employee_leave_balance (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id INTEGER NOT NULL REFERENCES leave_type(id) ON DELETE RESTRICT,
    leave_year INTEGER NOT NULL,
    allocated_days NUMERIC(5, 2) NOT NULL DEFAULT 0,
    used_days NUMERIC(5, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_employee_leave_year UNIQUE (employee_id, leave_type_id, leave_year)
);

-- 4. Create leave_request table
CREATE TABLE IF NOT EXISTS leave_request (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type_id INTEGER NOT NULL REFERENCES leave_type(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    requested_days NUMERIC(5, 2) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    reviewer_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    reviewer_comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    recipient_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_request_id INTEGER REFERENCES leave_request(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    performed_by INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    entity_type VARCHAR(100),
    entity_id INTEGER,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. High-performance composite indexes
CREATE INDEX IF NOT EXISTS idx_leave_request_status_dates 
ON leave_request (status, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_elb_emp_type 
ON employee_leave_balance (employee_id, leave_type_id);

CREATE INDEX IF NOT EXISTS idx_notif_recipient_unread 
ON notifications (recipient_id, is_read);

CREATE INDEX IF NOT EXISTS idx_activity_logs_date 
ON activity_logs (created_at DESC);
```

---

## API Reference

### 1. Authentication APIs

| Method | Endpoint | Auth Required | Allowed Roles | Description | Request Body |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `POST` | `/signup` | **Yes** | `admin` | Register a new user account | `{ "first_name", "last_name", "email", "password_hash", "role" }` |
| `POST` | `/login` | No | _Public_ | Authenticate credentials & issue JWT cookie (Rate limited) | `{ "email", "password_hash" }` |
| `POST` | `/logout` | **Yes** | Any | Clear authentication cookie | _None_ |

---

### 2. Employee APIs

| Method | Endpoint | Auth Required | Allowed Roles | Description | Request Body / Params |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `GET` | `/getemployee` | **Yes** | Any | Fetch profile of current logged-in employee | _None (reads JWT cookie)_ |
| `GET` | `/getAllEmployees` | **Yes** | Any | Fetch all registered employees | _None_ |
| `PATCH` | `/updateEmployee/:id` | **Yes** | Any | Update first and last name of employee | **Params:** `:id`<br>**Body:** `{ "first_name", "last_name" }` |
| `DELETE`| `/deleteEmployee/:id` | **Yes** | `admin` | Delete an employee record | **Params:** `:id` |

---

### 3. Leave Type APIs

| Method | Endpoint | Auth Required | Allowed Roles | Description | Request Body |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `POST` | `/createLeaveType` | No | _Public_ | Create a new leave category | `{ "type": "Annual Leave", "description": "Yearly paid leave" }` |
| `GET` | `/getLeaveTypes` | No | _Public_ | Fetch all leave categories (sorted A-Z) | _None_ |

---

### 4. Leave Balance APIs

| Method | Endpoint | Auth Required | Allowed Roles | Description | Request Body |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `POST` | `/createLeavebalance` | **Yes** | Any | Allocate annual leave days to an employee | `{ "employee_id", "leave_type_id", "leave_year", "allocated_days" }` |
| `GET` | `/getLeavebalance` | **Yes** | Any | Get leave balances for the logged-in employee | _None (reads JWT cookie)_ |
| `GET` | `/getAllLeaveBalances`| **Yes** | Any | Get all employee balances with names & computed available days | _None_ |

---

### 5. Leave Request & Workflow APIs

| Method | Endpoint | Auth Required | Allowed Roles | Description | Request Body / Params |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `POST` | `/createLeave` | **Yes** | Any | Submit a leave request (validates balance, dates, positive days) | `{ "leave_type_id", "start_date", "end_date", "requested_days", "reason" }` |
| `GET` | `/getLeaveRequests` | **Yes** | Any | Fetch all leave requests submitted by logged-in employee | _None (reads JWT cookie)_ |
| `GET` | `/getAllrequest` | **Yes** | Any | Fetch all leave requests across organization with summary counts | _None_ |
| `PATCH`| `/approveLeave/:id` | **Yes** | Any | Atomically approve request & deduct `used_days` balance | **Params:** `:id`<br>**Body:** `{ "reviewer_comment" }` *(optional)* |
| `PATCH`| `/rejectLeave/:id` | **Yes** | Any | Atomically reject request without deducting balance | **Params:** `:id`<br>**Body:** `{ "reviewer_comment" }` *(optional)* |

---

### 6. Admin & HR Dashboard APIs

| Method | Endpoint | Auth Required | Allowed Roles | Description |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/getAdminDashboard` | **Yes** | Any | Organization stats (employees, HR count, pending/approved/rejected, employees on leave) |
| `GET` | `/getAllHrAccounts` | **Yes** | Any | Retrieve all accounts with role `hr` |
| `POST` | `/createHrAccount` | **Yes** | `admin` | Register a new HR account with password validation |
| `GET` | `/hrDashboardSummary`| **Yes** | `hr`, `admin` | Aggregated pending, approved, and rejected counters for HR portal |

---

### 7. Notification APIs

| Method | Endpoint | Auth Required | Allowed Roles | Description | Request Body / Params |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `GET` | `/notifications` | **Yes** | Any | Fetch notifications for logged-in user (ordered newest first) | _None_ |
| `GET` | `/notifications/unread-count` | **Yes** | Any | Get count of unread notifications | _None_ |
| `PATCH` | `/notifications/:id/read` | **Yes** | Any | Mark a single notification as read | **Params:** `:id` |
| `PATCH` | `/notifications/read-all` | **Yes** | Any | Mark all unread notifications as read for logged-in user | _None_ |

---

### 8. Activity Log APIs

| Method | Endpoint | Auth Required | Allowed Roles | Description | Query Parameters |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `GET` | `/getActivityLogs` | **Yes** | `hr`, `admin` | Paginated activity logs with actor joins and filters | `page`, `limit`, `employee_id`, `action`, `start_date`, `end_date` |

#### Activity Logs Sample Response:
```json
{
  "message": "Activity logs fetched successfully",
  "data": [
    {
      "id": 1,
      "action": "LEAVE_APPLIED",
      "description": "John Doe applied for 3 day(s) of leave.",
      "entity_type": "leave_request",
      "entity_id": 4,
      "employee_name": "John Doe",
      "performed_by_name": "John Doe",
      "created_at": "2026-11-26T10:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "limit": 10,
    "totalRecords": 45,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## WebSocket Events Reference

The Socket.IO server initializes in [`src/config/socket.js`](file:///e:/company/Leave%20Management/Backend/src/config/socket.js) and verifies the JWT cookie upon handshake connection.

- **Handshake Authentication:** Reads `token` from `socket.handshake.headers.cookie`.
- **Connected Rooms:**
  - `user:${userId}` – Receives personal notifications (e.g., approval, rejection, balance assignment).
  - `role:${role}` – Receives broadcast role events (e.g., all HRs receive new leave request alerts).
- **Emitted Events:**
  - `notification:new` – Dispatched immediately when a leave request is created, reviewed, or quota is allocated.

---

## Setup & Run Guide

### Prerequisites

Ensure you have the following installed:
- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **npm**: `v9.0.0` or higher
- **PostgreSQL**: `v14.0` or higher running locally or in Docker

---

### Step 1: Clone & Install Dependencies

1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```

2. Install all npm dependencies:
   ```bash
   npm install
   ```

---

### Step 2: Environment Configuration

Create a `.env` file in the root of the `Backend/` directory:

```env
# Database Credentials
DB_USER=postgres
DB_HOST=localhost
DB_NAME=leave-managementdb
DB_PASSWORD=your_postgres_password
DB_PORT=5432

# Application Settings
PORT=7777
CLIENT_URL=http://localhost:5173

# Authentication
JWT_SECRET_KEY=your_super_secret_jwt_key
```

---

### Step 3: Database Initialization

1. Connect to PostgreSQL via `psql` or pgAdmin:
   ```bash
   psql -U postgres
   ```

2. Create the application database:
   ```sql
   CREATE DATABASE "leave-managementdb";
   ```

3. Connect to the database:
   ```sql
   \c leave-managementdb
   ```

4. Run the SQL schema script provided in [SQL Initialization Script](#sql-initialization-script) to create all 6 tables and indexes.

---

### Step 4: Start the Server

- **Development Mode (with auto-reload on file changes via nodemon):**
  ```bash
  npm run dev
  ```

- **Production Mode:**
  ```bash
  npm start
  ```

Once connected, you will see the confirmation logs:
```text
Database connected successfully
Server is successfully listening on port 7777...
```

---

## Security, Rate Limiting & Concurrency

### 1. Row-Level Locking on Approval
When multiple approvals or requests happen concurrently, standard updates can lead to race conditions where an employee exceeds their allocated quota. This backend prevents race conditions by acquiring row-level locks within a transaction:

```sql
BEGIN;

-- Lock the request row
SELECT employee_id, leave_type_id, requested_days, status
FROM leave_request
WHERE id = $1
FOR UPDATE;

-- Lock the balance row
SELECT allocated_days, used_days
FROM employee_leave_balance
WHERE employee_id = $1 AND leave_type_id = $2
FOR UPDATE;

-- Increment used days
UPDATE employee_leave_balance
SET used_days = used_days + $1, updated_at = CURRENT_TIMESTAMP
WHERE employee_id = $2 AND leave_type_id = $3;

-- Update request status
UPDATE leave_request
SET status = 'approved', reviewer_comment = $1, updated_at = CURRENT_TIMESTAMP
WHERE id = $2;

COMMIT;
```

### 2. Rate Limiting & Helmet Protection
- Sensitive authentication routes (`/login`) are protected with `express-rate-limit` to mitigate brute-force credential stuffing.
- `helmet()` automatically injects security headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, Strict-Transport-Security) and disables `X-Powered-By`.

### 3. Cookie Security & CORS
- Cookies are transmitted with `credentials: true`.
- Passwords are encrypted with bcrypt (10 salt rounds) and stripped from all responses (`delete user.password_hash`).

---

## License

This project is licensed under the ISC License.
