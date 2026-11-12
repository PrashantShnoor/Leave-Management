import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FaCalendarDay, FaHome } from "react-icons/fa";
import { BiBuoy, BiCalendarCheck } from "react-icons/bi";
import { FaUsers, FaCalendarAlt, FaChartBar } from "react-icons/fa";
import { MdAccountBalance } from "react-icons/md";
import axios from "axios";
import NotificationBell from "../components/common/Notificationbell";
import useNotifications from "../hooks/notifications";
import BASE_URL from "../utils/constants";

const EmployeeHrLayout = () => {
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const role = user.role?.toLowerCase();

  const employeeLinks = [
    {
      name: "Dashboard",
      path: "/employee/dashboard",
      icon: <FaHome className="size-6" />,
    },
    {
      name: "My Leaves",
      path: "/employee/leaves",
      icon: <BiBuoy className="size-6" />,
    },
    {
      name: "My Profile",
      path: "/employee/profile",
      icon: <FaUsers className="size-6" />,
    },
  ];

  const hrLinks = [
    {
      name: "Dashboard",
      path: "/hr/dashboard",
      icon: <FaHome className="size-6" />,
    },
    {
      name: "Manage Leaves",
      path: "/hr/manage",
      icon: <BiCalendarCheck className="size-6" />,
    },
    {
      name: "Employees",
      path: "/hr/employees",
      icon: <FaUsers className="size-6" />,
    },
    {
      name: "Leave Balances",
      path: "/hr/leave-balances",
      icon: <MdAccountBalance  className="size-6"/>,
    },
    {
      name: "Leave Types",
      path: "/hr/leave-types",
      icon: <BiBuoy className="size-6" />,
    },
    {
      name: "Leave Availability",
      path: "/hr/leave-availability",
      icon: <FaCalendarAlt className="size-6"/>
    },
    {
      name: "Reports",
      path: "/hr/reports",
      icon: <FaChartBar className="size-6" />,
    },
  ];

  const navLinks = role === "hr" ? hrLinks : employeeLinks;

  const handleLogout = async () => {
    try {
      await axios.post(
        `${BASE_URL}/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      sessionStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  };
    const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // We can add navigation to the related leave request here.
  };

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content">
        <nav className="navbar flex justify-between w-full bg-green-50">
          <div className="flex items-center">
            <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square btn-ghost drawer-button" >
              <FaCalendarDay className="size-7 text-green-600" />
            </label>

            <div className="font-bold text-xl px-2 text-blue-700">
              Leave Management System
            </div>
          </div>

          <div className="flex items-center gap-3">
            
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                loading={loading}
                onNotificationClick={handleNotificationClick}
                onMarkAllRead={markAllAsRead}
              />
            
            <span className="text-sm font-semibold text-green-700 hidden sm:block">
              {user.first_name} ({role?.toUpperCase()})
            </span>

            <button onClick={handleLogout} className="btn btn-soft btn-secondary" >
              Logout
            </button>
          </div>
        </nav>

        <div className="p-4">
          <Outlet />
        </div>
      </div>

      <div className="drawer-side is-drawer-close:overflow-visible">
        <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay" ></label>

        <div className="flex min-h-full flex-col items-start bg-green-50 is-drawer-close:w-16 is-drawer-open:w-64">
          <ul className="menu w-full grow gap-2">
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  end
                  className={({ isActive }) =>
                    `${
                      isActive
                        ? "bg-green-700 text-white hover:bg-green-700"
                        : "text-gray-700"
                    } is-drawer-close:tooltip is-drawer-close:tooltip-right`
                  }
                  data-tip={link.name}
                >
                  {link.icon}
                  <span className="is-drawer-close:hidden font-semibold text-lg">
                    {link.name}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHrLayout;