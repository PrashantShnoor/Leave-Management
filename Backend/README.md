# Leave Management System – Backend

A robust RESTful backend API for managing employees, leave types, leave allocations, and leave approval workflows, built using Node.js, Express.js, and PostgreSQL.

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js 5
- **Database:** PostgreSQL
- **Database Client:** `pg` (node-postgres)
- **Environment Management:** `dotenv`
- **Development Tool:** `nodemon`

---

## Features Implemented

### 1. Employee Management
- Register new employees with role assignment.
- Fetch employee profiles by email.
- Update employee personal details (first and last name).
- Remove employee records with ID validation.

### 2. Leave Type Management
- Define distinct leave categories (e.g., Casual Leave, Sick Leave, Paid Leave).
- Store detailed leave descriptions and active status.
- Track creation and update timestamps.

### 3. Leave Balance Allocation
- Allocate yearly leave quotas to employees per leave type.
- Track total allocated days and utilized days (`used_days`).
- Enforce employee and leave type validation.

### 4. Leave Request & Review Workflow
- **Application Submission:** Apply for leave with start date, end date, requested days, and reason.
- **Balance Verification:** Automatically check available balance (`allocated_days - used_days`) before allowing application submission; blocks request if balance is insufficient.

- **Transactional Approval (`PATCH /approveLeave/:id`):**
  - ACID-compliant transaction with row-level locking (`FOR UPDATE`).
  - Verifies pending status.
  - Automatically deducts leave by incrementing `used_days` in `employee_leave_balance`.
  - Marks status as `approved` and records optional reviewer comments.
  
- **Transactional Rejection (`PATCH /rejectLeave/:id`):**
  - Verifies pending status.
  - Marks status as `rejected` without modifying leave balances.

---

## Project Structure

```text
Backend/
├── src/
│   ├── config/
│   │   └── database.js        # PostgreSQL pool connection configuration
│   ├── routes/
│   │   ├── employee.js        # Employee CRUD routes
│   │   ├── leavetype.js       # Leave category management routes
│   │   ├── leavebalance.js    # Employee leave quota allocation routes
│   │   └── request.js         # Leave application and approval/rejection routes
│   └── app.js                 # Express app initialization and route registration
├── package.json
└── README.md
```

---

## Database Tables

| Table                     | Description 
|---                        |
| `employees`               | Stores employee profiles, credentials, and roles. |
| `leave_type`              | Stores available leave categories and their active status. |
| `employee_leave_balance`  | Stores allocated vs used leave days per employee and leave type for a given year. |
| `leave_request`           | Stores leave applications, requested durations, approval status (`pending`, `approved`, `rejected`) and reviewer note

---

## API Endpoints

### 1. Employee APIs

| Method   | Endpoint              | Description              | Request Body 
|          |                       |                          |                                               
| `POST`   | `/signup`             | Register a new employee  | `{ "first_name", "last_name", "email", "password_hash" }` 
| `GET`    | `/getemployee`        | Fetch employee by email  | `{ "email" }` 
| `PATCH`  | `/updateEmployee/:id` | Update employee names    | `{ "first_name", "last_name" }` 
| `DELETE` | `/deleteEmployee/:id` | Delete an employee by ID | _None_ 

### 2. Leave Type APIs

| Method | Endpoint           | Description                 | Request Body 
|        |                    |                             |
| `POST` | `/createLeaveType` | Create a new leave category | `{ "type", "description" }` 

### 3. Leave Balance APIs

| Method | Endpoint              | Description                                | Request Body 
|---     |---                    |---                                         |
| `POST` | `/createLeavebalance` | Allocate yearly leave quota to an employee | `{ "employee_id", "leave_type_id", "leave_year", "allocated_days" }` |

### 4. Leave Request & Review APIs

| Method  | Endpoint            | Description                                    | Request Body 
|---      |---                  |---                                             |
| `POST`  | `/createLeave`      | Submit a leave application (validates balance) | `{ "employee_id", "leave_type_id", "start_date", "end_date", "requested_days", "reason" }` |
| `PATCH` | `/approveLeave/:id` | Approve leave request & deduct leave balance   | `{ "reviewer_comment" }` *(optional)* 
| `PATCH` | `/rejectLeave/:id`  | Reject leave request                           | `{ "reviewer_comment" }` *(optional)* 

---

## Setup & Run

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd Backend
npm install
```

### 3. Start the Server

- **Development mode (with nodemon):**
  ```bash
  npm run dev
  ```

- **Production mode:**
  ```bash
  npm start
  ```

The server listens on port `7777` by default.
