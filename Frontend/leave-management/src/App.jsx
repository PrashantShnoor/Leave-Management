import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoutes from "./routes/ProtectedRoutes";
import AdminLayout from "./layouts/AdminLayout";
import EmployeeHrLayout from "./layouts/EmployeeHrLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployeeManagement from "./pages/admin/EmployeeManagement";

import HRDashboard from "./pages/hr/Dashboard";
import Manage from "./pages/hr/Manage";
import Employees from "./pages/hr/Employee";
import LeaveBalances from "./pages/hr/LeaveBalances";
import LeaveTypes from "./pages/hr/LeaveTypes";
import Reports from "./pages/hr/Reports";

import EmployeeDashboard from "./pages/employee/Dashboard";
import Leaves from "./pages/employee/Leaves";
import Profile from "./pages/employee/Profile";

import Login from "./pages/public/Login";
import LandingPage from "./pages/public/LandingPage"
import CreateEmployee from "./pages/admin/CreateEmployee";
import HrAccounts from "./pages/admin/HrAccounts";
import LeaveRequests from "./pages/admin/LeaveRequests";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />}/>
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route element={<ProtectedRoutes allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="employees" element={<EmployeeManagement />} />
            <Route path="create-employee" element={<CreateEmployee />}/>
            <Route path="hr-accounts" element={<HrAccounts />}/>
            <Route path="leaveRequests" element={<LeaveRequests />}/>
          </Route>
        </Route>

        {/* HR Routes */}
        <Route element={<ProtectedRoutes allowedRoles={["hr"]} />}>
          <Route path="/hr" element={<EmployeeHrLayout />}>
            <Route path="dashboard" element={<HRDashboard />} />
            <Route path="manage" element={<Manage />} />
            <Route path="employees" element={<Employees />} />
            <Route path="leave-balances" element={<LeaveBalances />} />
            <Route path="leave-types" element={<LeaveTypes />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Route>

        {/* Employee Routes */}
        <Route element={<ProtectedRoutes allowedRoles={["employee"]} />}>
          <Route path="/employee" element={<EmployeeHrLayout />}>
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="leaves" element={<Leaves />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;