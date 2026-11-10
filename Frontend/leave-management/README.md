# Leave Management System – Frontend

A modern, responsive, role-based Single Page Application (SPA) for managing enterprise employee leaves, approvals, quotas, and organizational workflows. Built with **React 19**, **Vite**, **Tailwind CSS v4**, and **DaisyUI**.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
  - [Public Portal](#1-public-portal)
  - [Employee Portal](#2-employee-portal)
  - [HR Portal](#3-hr-portal)
  - [Admin Portal](#4-admin-portal)
- [Tech Stack](#tech-stack)
- [Project Architecture & Structure](#project-architecture--structure)
- [Routing & Access Control (RBAC)](#routing--access-control-rbac)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running Development Server](#running-development-server)
  - [Building for Production](#building-for-production)
- [Available Scripts](#available-scripts)
- [API Integration & Authentication](#api-integration--authentication)
- [UI Components Guide](#ui-components-guide)
- [Design System & Styling](#design-system--styling)

---


## Key Features

### 1. Public Portal
- **Landing Page (`/`):** Clean, modern landing page with product overview, feature highlights, leave policy highlights, and interactive mock dashboards.
- **Authentication Portal (`/login`):**
  - Secure credential login with email and password.
  - Password visibility toggle.
  - Dynamic role detection with automatic redirection to role-specific dashboards.
  - Error and validation handling with responsive feedback.

### 2. Employee Portal
- **Employee Dashboard (`/employee/dashboard`):** Real-time summary of annual leave quota, used days, available days, and pending request statuses.
- **My Leaves (`/employee/leaves`):**
  - Real-time leave quota breakdown (Annual, Sick, Casual, Leave Without Pay).
  - Leave application modal with auto-calculation of duration, date pickers, reason, and supporting document uploads.
  - Interactive search and filterable leave request history (Filter by: All, Pending, Approved, Rejected).
  - Detailed request modal inspection with reviewer remarks.
- **Profile (`/employee/profile`):** View personal information, department designation, contact information, joined date, and assigned role.

### 3. HR Portal
- **HR Dashboard (`/hr/dashboard`):** Aggregated metrics of team leaves, pending approvals, approved leaves, and calendar presence.
- **Manage Leaves (`/hr/manage`):**
  - Queue of pending and historical leave applications across departments.
  - Review modal to **Approve** or **Reject** leave requests with custom reviewer comments.
  - Automatic balance deduction validation upon transactional approval.
- **Employee Directory (`/hr/employees`):** Searchable list of all employees with quick access to their leave records and profile details.
- **Leave Balances (`/hr/leave-balances`):**
  - Allocate and adjust annual leave quotas per employee per leave category.
  - Filter and inspect yearly balances (`allocated_days`, `used_days`, `remaining`).
- **Leave Types (`/hr/leave-types`):** View and inspect organizational leave types, descriptions, and allocation limits.
- **Reports & Export (`/hr/reports`):** Comprehensive report generation with status filters, date ranges, and export capabilities.

### 4. Admin Portal
- **Admin Dashboard (`/admin/dashboard`):** High-level organization analytics (total employees, HR accounts, departments, leave volume, and system activity logs).
- **Employee Management (`/admin/employees`):** Full CRUD overview of organization personnel.
- **Create Employee (`/admin/create-employee`):** Modal/form interface to onboard new employees with credential assignment.
- **HR Accounts (`/admin/hr-accounts`):** Dedicated provisioning and tracking of HR manager accounts.
- **Department Management (`/admin/departments`):** Add, update, and manage organizational departments and track headcounts.
- **Leave Configuration (`/admin/leave-configuration`):** Configure organizational leave policies, default yearly allocations, paid vs. unpaid types, and active statuses.
- **Permissions Matrix (`/admin/permissions`):** Role-based access permission overview and toggles.
- **Activity Logs (`/admin/activity-logs`):** Audit trail of actions performed across the platform (employee creation, policy updates, approvals).
- **Settings (`/admin/settings`):** Global organization profiles, company information, and notification preferences.

---

## Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [React 19](https://react.dev/) | Modern UI library with concurrent features and optimal performance |
| **Build Tool** | [Vite 8](https://vite.dev/) | Next-generation frontend tooling with lightning-fast HMR |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first CSS engine via `@tailwindcss/vite` |
| **UI Components** | [DaisyUI v5](https://daisyui.com/) | Accessible, customizable Tailwind component library |
| **Routing** | [React Router v7](https://reactrouter.com/) | Client-side routing with nested layouts and route guards |
| **HTTP Client** | [Axios](https://axios-http.com/) | Promise-based HTTP client with credentialed requests |
| **Iconography** | [React Icons](https://react-icons.github.io/react-icons/) & [FontAwesome](https://fontawesome.com/) | Feather Icons (`fi`), FontAwesome (`fa`), and BoxIcons (`bi`) |
| **Code Quality** | [ESLint](https://eslint.org/) | Code quality and linting configuration |

---

## Project Architecture & Structure

```text
Frontend/leave-management/
├── public/                    # Static assets & public favicon
├── src/
│   ├── assets/                # Images, SVG illustrations, and icons
│   │   ├── hero.png           # Landing page hero graphic
│   │   ├── react.svg
│   │   └── vite.svg
│   │
│   ├── components/            # Reusable UI component library
│   │   ├── admin/             # Admin-specific components & forms
│   │   │   ├── DepartmentForm.jsx
│   │   │   ├── EmployeeDetails.jsx
│   │   │   ├── EmployeeForm.jsx
│   │   │   └── HrAccountForm.jsx
│   │   ├── common/            # Shared cross-role UI components
│   │   │   ├── ConfirmationModel.jsx
│   │   │   ├── DataTable.jsx
│   │   │   ├── DetailItem.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   └── SummaryCard.jsx
│   │   ├── employee/          # Employee-specific widgets
│   │   │   ├── LeaveBalanceDetails.jsx
│   │   │   └── LeaveHistoryTable.jsx
│   │   └── hr/                # HR review and management components
│   │       ├── LeaveRequestDetails.jsx
│   │       ├── LeaveRequestTable.jsx
│   │       └── LeaveReviewModel.jsx
│   │
│   ├── layouts/               # Role-specific master layouts
│   │   ├── AdminLayout.jsx        # Admin dashboard layout with sidebar & header
│   │   └── EmployeeHrLayout.jsx   # Shared layout for Employee and HR portals
│   │
│   ├── pages/                 # Route page views
│   │   ├── admin/             # Admin views (Dashboard, Departments, Logs, Settings)
│   │   ├── employee/          # Employee views (Dashboard, Leaves, Profile)
│   │   ├── hr/                # HR views (Dashboard, Manage, Balances, Reports)
│   │   └── public/            # Public views (LandingPage, Login)
│   │
│   ├── routes/                # Route security and protection
│   │   └── ProtectedRoutes.jsx # Role-based authentication guard
│   │
│   ├── utils/                 # Configuration and utilities
│   │   └── constants.js       # Base API URL and environment constants
│   │
│   ├── App.jsx                # Application routes and route tree
│   ├── index.css              # Global styles, Tailwind imports & DaisyUI theme
│   └── main.jsx               # Application entry point
│
├── eslint.config.js           # ESLint configuration
├── index.html                 # HTML root template
├── package.json               # Dependencies and scripts
├── vite.config.js             # Vite configuration with Tailwind CSS plugin
└── README.md                  # Project documentation
```

---

## Routing & Access Control (RBAC)

The application enforces client-side role validation using `ProtectedRoutes.jsx`.

### Route Breakdown

| Path | Allowed Roles | Layout | Description |
| :--- | :--- | :--- | :--- |
| `/` | Public | None | Product landing page |
| `/login` | Public | None | User authentication portal |
| `/admin/*` | `admin` | `AdminLayout` | Organization administration & setup |
| `/admin/dashboard` | `admin` | `AdminLayout` | Organization metrics & system summary |
| `/admin/employees` | `admin` | `AdminLayout` | Employee directory |
| `/admin/create-employee` | `admin` | `AdminLayout` | Create a new employee |
| `/admin/hr-accounts` | `admin` | `AdminLayout` | Manage HR manager accounts |
| `/admin/departments` | `admin` | `AdminLayout` | Department configuration |
| `/admin/leave-configuration`| `admin`| `AdminLayout`| Leave type and quota policy setup |
| `/admin/permissions` | `admin` | `AdminLayout` | Access control settings |
| `/admin/activity-logs` | `admin` | `AdminLayout` | Audit and activity logs |
| `/admin/settings` | `admin` | `AdminLayout` | System & company settings |
| `/hr/*` | `hr` | `EmployeeHrLayout` | HR management portal |
| `/hr/dashboard` | `hr` | `EmployeeHrLayout` | HR metrics and approval queues |
| `/hr/manage` | `hr` | `EmployeeHrLayout` | Review & approve/reject leave requests |
| `/hr/employees` | `hr` | `EmployeeHrLayout` | Employee records and profiles |
| `/hr/leave-balances` | `hr` | `EmployeeHrLayout` | Quota allocation per employee |
| `/hr/leave-types` | `hr` | `EmployeeHrLayout` | Leave categories list |
| `/hr/reports` | `hr` | `EmployeeHrLayout` | Leave analytics and export |
| `/employee/*` | `employee` | `EmployeeHrLayout` | Employee portal |
| `/employee/dashboard` | `employee` | `EmployeeHrLayout` | Personal balance & leave summary |
| `/employee/leaves` | `employee` | `EmployeeHrLayout` | Apply for leave & view history |
| `/employee/profile` | `employee` | `EmployeeHrLayout` | User personal details |

### Authentication Guard Logic
- **Session Check:** User session details are read from `sessionStorage.getItem("user")`.
- **Unauthenticated Redirect:** Users attempting to access protected routes without a valid session are redirected to `/login`.
- **Role Verification:** If a logged-in user attempts to access a route outside their permitted role, they are redirected to their designated dashboard (`/admin/dashboard`, `/hr/dashboard`, or `/employee/dashboard`).

---

## Getting Started

### Prerequisites

Ensure the following tools are installed on your machine:
- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **Package Manager**: `npm` (v9+) or `pnpm` / `yarn`
- **Backend Service**: Running Leave Management Backend (default: `http://localhost:7777`)

### Installation

1. Navigate to the frontend project directory:
   ```bash
   cd "Frontend/leave-management"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Configuration

The frontend communicates with the backend via the `BASE_URL` defined in `src/utils/constants.js`:

```javascript
// src/utils/constants.js
const BASE_URL = "http://localhost:7777";
export default BASE_URL;
```

To configure dynamic environment variables, you can create a `.env` file in the root of `leave-management`:

```env
VITE_API_URL=http://localhost:7777
```

And update `src/utils/constants.js`:

```javascript
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:7777";
export default BASE_URL;
```

### Running Development Server

Start the Vite development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will be accessible at:
```text
http://localhost:5173
```

### Building for Production

Compile and optimize the project for production deployment:

```bash
npm run build
```

The compiled assets will be output to the `dist/` folder, ready for deployment on static hosting platforms such as Vercel, Netlify, Nginx, or AWS S3.

To preview the production build locally:

```bash
npm run preview
```

---

## Available Scripts

In the project directory, you can run:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server with HMR at `http://localhost:5173` |
| `npm run build` | Compiles and bundles production-ready assets into the `dist/` directory |
| `npm run preview` | Spawns a local web server to preview the production build |
| `npm run lint` | Runs ESLint across all `.js` and `.jsx` files to detect syntax and code style issues |

---

## API Integration & Authentication

### Cookie & Session Handling
All API requests using Axios are configured with credentials enabled to support secure, HTTP-only cookie-based authentication:

```javascript
import axios from "axios";
import BASE_URL from "../utils/constants";

const response = await axios.get(`${BASE_URL}/getemployee`, {
  withCredentials: true,
});
```

### Primary Backend Endpoints Consumed

- **Authentication:**
  - `POST /login` – Authenticates user credentials and returns role & session.
  - `POST /logout` – Clears session cookies and terminates session.
- **Employees:**
  - `POST /signup` – Registers new employee records (Admin).
  - `GET /getemployee` – Fetches profile details for the authenticated user.
  - `GET /getAllEmployees` – Fetches all employees for management & allocation.
  - `PATCH /updateEmployee/:id` – Updates employee details.
  - `DELETE /deleteEmployee/:id` – Removes an employee.
- **Leave Balances & Types:**
  - `GET /getLeaveTypes` – Retrieves active leave categories.
  - `POST /createLeaveType` – Creates a new leave category.
  - `GET /getLeaveBalance/:employee_id` – Retrieves quota balances for an employee.
  - `POST /allocateLeave` – Allocates annual leave quota per leave type.
- **Leave Requests & Workflow:**
  - `POST /applyLeave` – Submits a leave request with dates, reason, and duration.
  - `GET /getLeaveRequests` – Retrieves submitted leave applications.
  - `PATCH /approveLeave/:id` – Atomically approves a leave request and updates balance.
  - `PATCH /rejectLeave/:id` – Rejects a leave request with optional comments.
- **Admin Dashboard:**
  - `GET /getAdminDashboard` – Retrieves system statistics, KPI counters, and audit activity.

---

## UI Components Guide

The project utilizes a modular component architecture:

### Common Components (`src/components/common/`)
- **`SummaryCard.jsx`**: Responsive stat card displaying icons, metric titles, quantitative values, and trend indicators.
- **`DataTable.jsx`**: Generic, styled table component supporting empty states, loading indicators, and action buttons.
- **`StatusBadge.jsx`**: Dynamic badge rendering color-coded statuses (`Pending` = yellow/amber, `Approved` = green, `Rejected` = red).
- **`LoadingSpinner.jsx`**: Centered loading spinner for asynchronous network requests.
- **`ConfirmationModel.jsx`**: Reusable modal for destructive actions (e.g., delete confirmation).
- **`DetailItem.jsx`**: Clean label-value pair component for profile and inspection drawers.

### Role-Specific Components
- **`LeaveReviewModel.jsx`**: Modal dialog used by HR managers to evaluate, approve, or reject leave requests with comments.
- **`LeaveBalanceDetails.jsx`**: Card group showing an employee's leave balance quotas and remaining days.
- **`LeaveHistoryTable.jsx`**: Table listing an employee's submitted leave applications with status tags.
- **`DepartmentForm.jsx` / `EmployeeForm.jsx` / `HrAccountForm.jsx`**: Validated modal forms for admin resource management.

---

## Design System & Styling

- **Tailwind CSS v4 Engine:** Utilizes the `@tailwindcss/vite` plugin with CSS-first configuration in `src/index.css`.
- **DaisyUI v5 Component Kit:** Provides accessible button primitives, modals, dropdowns, badges, and alerts.
- **Responsive Layout:**
  - Collapsible side navigation on mobile and tablet screens.
  - Sticky top navigation bar with profile dropdown and notifications.
  - Scrollable table containers and grid-based responsive dashboard cards.
- **Theme:** Configured with a clean, professional corporate light theme.

---

## Contributing & Development Guidelines

1. **Component Modularity:** Place reusable widgets in `src/components/common/` and domain-specific components in their respective subdirectories (`admin/`, `hr/`, `employee/`).
2. **Path Aliasing & Imports:** Maintain consistent relative import paths and verify casing across Windows and Linux environments.
3. **Linting:** Ensure all code adheres to ESLint rules before committing (`npm run lint`).
4. **State Management:** Use localized React state (`useState`, `useMemo`, `useEffect`) and lift state to parent pages or layouts where appropriate.

---

## License

This project is proprietary and intended for internal corporate leave management. All rights reserved.

