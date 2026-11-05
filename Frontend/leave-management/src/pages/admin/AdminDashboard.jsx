import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  FiUsers,
  FiUserCheck,
  FiBriefcase,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiActivity,
} from "react-icons/fi";

import SummaryCard from "../../components/common/SummaryCard";
import DataTable from "../../components/common/DataTable";
import BASE_URL  from "../../utils/constants";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    organization: {
      totalEmployees: 0,
      hrAccounts: 0,
      departments: 0,
      leaveRequests: 0,
    },
    leaveStatistics: {
      pendingRequests: 0,
      approvedRequests: 0,
      rejectedRequests: 0,
      employeesOnLeave: 0,
    },
    recentActivities: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${BASE_URL}/getAdminDashboard`,
        { withCredentials: true }
      );

      setDashboardData(response.data.data);
    } catch (error) {
      console.error("Admin dashboard API error:", error.response?.data || error);

      setError(
        error.response?.data?.message ||
        "Unable to fetch dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  const organization = dashboardData.organization;
  const leaveStats = dashboardData.leaveStatistics;

  const statistics = [
    {
      title: "Total Employees",
      count: organization.totalEmployees,
      icon: <FiUsers size={20} />,
      color: "green",
    },
    {
      title: "HR Accounts",
      count: organization.hrAccounts,
      icon: <FiUserCheck size={20} />,
      color: "blue",
    },
    {
      title: "Departments",
      count: organization.departments,
      icon: <FiBriefcase size={20} />,
      color: "orange",
    },
    {
      title: "Leave Requests",
      count: organization.leaveRequests,
      icon: <FiCalendar size={20} />,
      color: "red",
    },
  ];

  const leaveStatistics = [
    {
      title: "Pending Requests",
      count: leaveStats.pendingRequests,
      icon: <FiClock size={20} />,
      color: "orange",
    },
    {
      title: "Approved Requests",
      count: leaveStats.approvedRequests,
      icon: <FiCheckCircle size={20} />,
      color: "green",
    },
    {
      title: "Rejected Requests",
      count: leaveStats.rejectedRequests,
      icon: <FiXCircle size={20} />,
      color: "red",
    },
    {
      title: "Employees on Leave",
      count: leaveStats.employeesOnLeave,
      icon: <FiUsers size={20} />,
      color: "blue",
    },
  ];

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };


  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <span className="loading loading-spinner loading-lg text-green-700"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <p className="font-medium text-red-700">{error}</p>

        <button
          onClick={fetchDashboardData}
          className="btn btn-sm mt-3 bg-green-700 text-white hover:bg-green-800"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-green-900">
          Admin Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Overview of your organization's leave management system.
        </p>
      </div>

      {/* Organization Overview */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Organization Overview
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statistics.map((item) => (
            <SummaryCard key={item.title} {...item} />
          ))}
        </div>
      </section>

      {/* Leave Overview */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Leave Overview
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {leaveStatistics.map((item) => (
            <SummaryCard key={item.title} {...item} />
          ))}
        </div>
      </section>

      {/* Recent Activities */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FiActivity className="text-green-700" size={20} />

          <h2 className="text-lg font-semibold text-gray-800">
            Recent Activities
          </h2>
        </div>

        
      </section>

      {/* System Overview */}
      <div className="rounded-xl border border-green-100 bg-green-50 p-5">
        <h3 className="font-semibold text-green-900">
          System Overview
        </h3>

        <p className="mt-1 text-sm text-green-800">
          Manage employees, HR accounts, departments, leave policies,
          and system permissions from your administration panel.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
