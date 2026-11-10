import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoutes = ({ allowedRoles = [] }) => {
  const storedUser = sessionStorage.getItem("user");

  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(storedUser);
  } catch (error) {
    sessionStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  // Validate user role
  if (!user || !user.role) {
    sessionStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role.toLowerCase();

  // Check role permissions
  if (!allowedRoles.includes(userRole)) {
    const dashboardRoutes = {
      admin: "/admin/dashboard",
      manager: "/manager/dashboard",
      hr: "/hr/dashboard",
      employee: "/employee/dashboard",
    };

    return (
      <Navigate
        to={dashboardRoutes[userRole] || "/login"}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoutes;