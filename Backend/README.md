# Leave Management System – Backend

A robust, enterprise-grade RESTful API backend for managing employees, leave categories, annual quota allocations, and leave review workflows. Built using **Node.js**, **Express.js 5**, **PostgreSQL**, **JWT Authentication**, and **ACID-compliant transactions**.

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
  - [6. Admin & HR Analytics](#6-admin--hr-analytics)
- [Project Structure](#project-structure)
- [Database Architecture & Schema](#database-architecture--schema)
  - [Tables Overview](#tables-overview)
  - [SQL Initialization Script](#sql-initialization-script)
- [API Reference](#api-reference)
  - [1. Authentication APIs](#1-authentication-apis)
  - [2. Employee APIs](#2-employee-apis)
  - [3. Leave Type APIs](#3-leave-type-apis)
  - [4. Leave Balance APIs](#4-leave-balance-apis)
  - [5. Leave Request & Review APIs](#5-leave-request--review-apis)
  - [6. Administrative & Dashboard APIs](#6-administrative--dashboard-apis)
- [Setup & Run Guide](#setup--run-guide)
  - [Prerequisites](#prerequisites)
  - [Step 1: Clone & Install Dependencies](#step-1-clone--install-dependencies)
  - [Step 2: Environment Configuration](#step-2-environment-configuration)
  - [Step 3: Database Initialization](#step-3-database-initialization)
  - [Step 4: Start the Server](#step-4-start-the-server)
- [Security & Concurrency Handling](#security--concurrency-handling)

---

## Overview

The Leave Management System Backend provides the business logic and persistence layer for an enterprise leave management portal. It connects with a PostgreSQL relational database using connection pooling via `pg` and serves client applications (such as React SPAs) with CORS support and HTTP-only cookie-based JWT authentication.

---

## Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Runtime** | Node.js | Asynchronous, event-driven JavaScript runtime |
| **Framework** | Express.js 5 | Modern web framework with native async error handling |
| **Database** | PostgreSQL | Relational database supporting ACID transactions and row locks |
| **Database Driver** | `pg` (node-postgres) | High-performance PostgreSQL client connection pool |
| **Authentication** | `jsonwebtoken` & `bcrypt` | Secure password hashing (10 salt rounds) and JWT tokens |
| **Cookie Parsing** | `cookie-parser` | Extraction and handling of HTTP-only session cookies |
| **CORS** | `cors` | Configured for credentialed cross-origin requests (`http://localhost:5173`) |
| **Validation** | `validator` | String validation and password complexity enforcement |
| **Environment** | `dotenv` | Secure loading of environment variables from `.env` |
| **Dev Tool** | `nodemon` | Hot reload and automatic server restarts during development |

---

## Key Features

### 1. Authentication & Security
- **Registration (`/signup`):** Validates required employee fields, strong password constraints, and unique email addresses with bcrypt hashing.
- **Login (`/login`):** Validates credentials, creates a signed JSON Web Token (containing employee `id` and `role`), and attaches it via HTTP-only cookie (`token`).
- **Logout (`/logout`):** Clears the session cookie safely.
- **JWT Auth Middleware (`authMiddleware`):** Extracts and verifies the token from incoming cookies, attaching decoded user details to `req.user`.

### 2. Employee Management
- Create, view, update, and remove employees.
- Authenticated user profile retrieval (`/getemployee`).
- Role assignment supporting `employee`, `hr`, and `admin`.

### 3. Leave Type Management
- Define custom organization leave categories (e.g., Annual Leave, Sick Leave, Casual Leave, Unpaid Leave).
- Maintain active/inactive flags and descriptions per leave category.
- List all categories sorted alphabetically for dropdown selections.

### 4. Leave Quota & Balance Tracking
- Allocate yearly leave day quotas to employees per leave category (`employee_leave_balance`).
- Real-time balance calculations: `available_days = allocated_days - used_days`.
- Endpoint to retrieve individual balances or all employee balances with joined profile metadata.

### 5. Transactional Leave Workflow
- **Application Submission (`POST /createLeave`):**
  - Enforces mandatory date ranges, requested days, and justification reasons.
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

### 6. Admin & HR Analytics
- **Admin Dashboard API (`GET /getAdminDashboard`):** Aggregates organizational metrics (total employees, HR accounts, total leave requests, pending/approved/rejected counts, and employees currently on leave today).
- **HR Dashboard KPI API (`GET /hrDashboardSummary`):** Summarizes pending approvals, approved counts, rejected counts, and workforce numbers for HR review.

---

## Project Structure

```text
Backend/
├── src/
│   ├── config/
│   │   └── database.js        # PostgreSQL pool initialization and ping check
│   │
│   ├── middleware/
│   │   └── auth.js            # JWT verification & req.user injection middleware
│   │
│   ├── routes/
│   │   ├── auth.js            # Signup, Login, and Logout routes
│   │   ├── employee.js        # Profile fetch, name updates, employee deletion
│   │   ├── leavetype.js       # Leave category creation and listing
│   │   ├── leavebalance.js    # Yearly balance allocation and quota queries
│   │   └── request.js         # Applications, approvals/rejections, and dashboard metrics
│   │
│   ├── utils/
│   │   └── validator.js       # Input validation (email, strong password, role)
│   │
│   └── app.js                 # Express server configuration, middleware, and route mounting
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

---

### SQL Initialization Script

Run the following SQL commands in your PostgreSQL database (e.g., `leave-managementdb`):

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

-- 5. Helpful index for active leave checks
CREATE INDEX IF NOT EXISTS idx_leave_request_status_dates 
ON leave_request (status, start_date, end_date);
```

---

## API Reference

### 1. Authentication APIs

| Method | Endpoint | Auth Required | Description | Request Body |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/signup` | No | Register a new user account | `{ "first_name", "last_name", "email", "password_hash", "role" }` |
| `POST` | `/login` | No | Authenticate user & issue JWT cookie | `{ "email", "password_hash" }` |
| `POST` | `/logout` | No | Clear authentication cookie | _None_ |

#### Login Response Example:
```json
{
  "message": "Login successful",
  "data": {
    "id": 1,
    "first_name": "Admin",
    "last_name": "User",
    "email": "admin@company.com",
    "role": "admin"
  }
}
```

---

### 2. Employee APIs

| Method | Endpoint | Auth Required | Description | Request Body / Params |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/getemployee` | **Yes** | Fetch current logged-in employee profile | _None (reads JWT cookie)_ |
| `GET` | `/getAllEmployees` | No | Fetch all registered employees | _None_ |
| `PATCH` | `/updateEmployee/:id` | No | Update first and last name of employee | **Params:** `:id`<br>**Body:** `{ "first_name", "last_name" }` |
| `DELETE`| `/deleteEmployee/:id` | No | Delete an employee record | **Params:** `:id` |

---

### 3. Leave Type APIs

| Method | Endpoint | Auth Required | Description | Request Body |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/createLeaveType` | No | Create a new leave category | `{ "type": "Annual Leave", "description": "Yearly paid leave" }` |
| `GET` | `/getLeaveTypes` | No | Fetch all leave categories (sorted A-Z) | _None_ |

---

### 4. Leave Balance APIs

| Method | Endpoint | Auth Required | Description | Request Body |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/createLeavebalance` | No | Allocate annual leave days to an employee | `{ "employee_id", "leave_type_id", "leave_year", "allocated_days" }` |
| `GET` | `/getLeavebalance` | **Yes** | Get leave balances for the logged-in employee | _None (reads JWT cookie)_ |
| `GET` | `/getAllLeaveBalances`| No | Get all employee balances with names & computed available days | _None_ |

---

### 5. Leave Request & Review APIs

| Method | Endpoint | Auth Required | Description | Request Body / Params |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/createLeave` | **Yes** | Submit a leave request (verifies balance first) | `{ "leave_type_id", "start_date", "end_date", "requested_days", "reason" }` |
| `GET` | `/getLeaveRequests` | **Yes** | Fetch all leave requests submitted by logged-in employee | _None (reads JWT cookie)_ |
| `GET` | `/getAllrequest` | No | Fetch all leave requests across organization with summary counts | _None_ |
| `PATCH`| `/approveLeave/:id` | No | Atomically approve request & deduct `used_days` balance | **Params:** `:id`<br>**Body:** `{ "reviewer_comment" }` *(optional)* |
| `PATCH`| `/rejectLeave/:id` | No | Atomically reject request without deducting balance | **Params:** `:id`<br>**Body:** `{ "reviewer_comment" }` *(optional)* |

---

### 6. Administrative & Dashboard APIs

| Method | Endpoint | Auth Required | Allowed Roles | Description |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/getAdminDashboard` | **Yes** | `admin` | Organization stats (employees, HR count, pending/approved/rejected, employees on leave) |
| `GET` | `/getAllHrAccounts` | **Yes** | `admin` | Retrieve all accounts with role `hr` |
| `POST` | `/createHrAccount` | **Yes** | `admin` | Register a new HR account with password validation |
| `GET` | `/hrDashboardSummary`| **Yes** | `hr`, `admin` | Aggregated pending, approved, and rejected counters for HR portal |

---

## Setup & Run Guide

### Prerequisites

Ensure you have the following installed:
- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **npm**: `v9.0.0` or higher
- **PostgreSQL**: `v14.0` or higher running locally or in Docker

---

### Step 1: Clone & Install Dependencies

1. Open your terminal and navigate to the `Backend` directory:
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

#### Variable Descriptions:
- `DB_USER`: PostgreSQL database username (e.g., `postgres`).
- `DB_HOST`: Host where PostgreSQL is running (e.g., `localhost` or `127.0.0.1`).
- `DB_NAME`: Database name (e.g., `leave-managementdb`).
- `DB_PASSWORD`: Password for the PostgreSQL user.
- `DB_PORT`: PostgreSQL port (default: `5432`).
- `PORT`: Port on which the Express server listens (default: `7777`).
- `CLIENT_URL`: Allowed frontend origin for CORS (e.g., `http://localhost:5173`).
- `JWT_SECRET_KEY`: Private cryptographic secret used to sign and verify JSON Web Tokens.

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

4. Run the SQL schema script provided in [SQL Initialization Script](#sql-initialization-script) to create all tables and indexes.

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

## Security & Concurrency Handling

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

### 2. Cookie Security & CORS
- Cookies are transmitted with `credentials: true`.
- Sensitive passwords are never sent in API responses (`delete user.password_hash`).
- Strong passwords require uppercase, lowercase, numbers, and symbols validated by `validator.isStrongPassword`.

---

