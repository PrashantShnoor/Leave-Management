
import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FiGrid,
  FiUsers,
  FiUserPlus,
  FiBriefcase,
  FiLayers,
  FiCalendar,
  FiShield,
  FiActivity,
  FiSettings,
  FiMenu,
  FiX,
  FiLogOut,
  FiUser,
  FiBell,
} from "react-icons/fi";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const adminName = localStorage.getItem("first_name") || "Admin";

  const navigationGroups = [
    {
      title: "OVERVIEW",
      items: [
        {
          name: "Dashboard",
          path: "/admin/dashboard",
          icon: FiGrid,
        },
      ],
    },
    {
      title: "EMPLOYEE MANAGEMENT",
      items: [
        {
          name: "Employees",
          path: "/admin/employees",
          icon: FiUsers,
        },
        {
          name: "Create Employee",
          path: "/admin/create-employee",
          icon: FiUserPlus,
        },
        {
          name: "HR Accounts",
          path: "/admin/hr-accounts",
          icon: FiBriefcase,
        },
        {
          name: "Departments",
          path: "/admin/departments",
          icon: FiLayers,
        },
      ],
    },
    {
      title: "CONFIGURATION",
      items: [
        {
          name: "Leave Configuration",
          path: "/admin/leave-configuration",
          icon: FiCalendar,
        },
        {
          name: "Roles & Permissions",
          path: "/admin/permissions",
          icon: FiShield,
        },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        {
          name: "Activity Logs",
          path: "/admin/activity-logs",
          icon: FiActivity,
        },
        {
          name: "Settings",
          path: "/admin/settings",
          icon: FiSettings,
        },
      ],
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("first_name");
    navigate("/login");
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-base-200 lg:flex">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-72 flex-col
          border-r border-base-300 bg-base-100
          transition-transform duration-300
          lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-base-300 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 text-success">
              <FiBriefcase size={23} />
            </div>

            <div>
              <h1 className="text-lg font-bold text-base-content">
                Leave<span className="text-success">Flow</span>
              </h1>
              <p className="text-xs text-base-content/50">
                Administration
              </p>
            </div>
          </div>

          <button
            className="btn btn-ghost btn-sm lg:hidden"
            onClick={closeSidebar}
          >
            <FiX size={21} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          {navigationGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-3 px-3 text-[11px] font-bold tracking-widest text-base-content/40">
                {group.title}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end
                      onClick={closeSidebar}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                          isActive
                            ? "bg-success/10 text-success"
                            : "text-base-content/65 hover:bg-base-200 hover:text-base-content"
                        }`
                      }
                    >
                      <Icon size={19} />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Bottom */}
        <div className="border-t border-base-300 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-base-200 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 text-success">
              <FiUser size={20} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-base-content">
                {adminName}
              </p>
              <p className="text-xs text-base-content/50">
                System Administrator
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-error transition-colors hover:bg-error/10"
          >
            <FiLogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Section */}
      <div className="min-w-0 flex-1">

        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-base-300 bg-base-100 px-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="btn btn-ghost btn-square lg:hidden"
            >
              <FiMenu size={22} />
            </button>

            <div>
              <h2 className="text-lg font-bold text-base-content sm:text-xl">
                Admin Panel
              </h2>
              <p className="hidden text-xs text-base-content/50 sm:block">
                Manage your organization's leave system
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="btn btn-ghost btn-circle btn-sm">
              <FiBell size={19} />
            </button>

            <div className="hidden items-center gap-2 border-l border-base-300 pl-4 sm:flex">
              <div className="text-right">
                <p className="text-sm font-semibold text-base-content">
                  {adminName}
                </p>
                <p className="text-xs text-base-content/50">
                  Administrator
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10 font-bold text-success">
                {adminName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
