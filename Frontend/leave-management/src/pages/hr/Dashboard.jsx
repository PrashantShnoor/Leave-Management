import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiArrowRight,
} from "react-icons/fi";

import BASE_URL from "../../utils/constants";

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    pendingRequests: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch dashboard summary from backend
  const fetchDashboardSummary = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${BASE_URL}/hrDashboardSummary`, {
        withCredentials: true,
      });

      setSummary(response.data.data);
    } catch (error) {
      console.error("Dashboard API Error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to fetch dashboard information.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardSummary();
  }, []);


  const summaryCards = [
    {
      title: "Total Employees",
      value: summary.totalEmployees,
      icon: <FiUsers />,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Pending Requests",
      value: summary.pendingRequests,
      icon: <FiClock />,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      title: "Approved Leaves",
      value: summary.approvedLeaves,
      icon: <FiCheckCircle />,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Rejected Leaves",
      value: summary.rejectedLeaves,
      icon: <FiXCircle />,
      color: "text-red-600",
      bg: "bg-red-100",
    },
  ];

  const quickActions = [
    {
      title: "Manage Leave Requests",
      description: "Review pending employee applications",
      path: "/hr/manage",
    },
    {
      title: "Manage Employees",
      description: "View employee information",
      path: "/hr/employees",
    },
    {
      title: "Leave Balances",
      description: "Check employee leave balances",
      path: "/hr/leave-balances",
    },
    {
      title: "Leave Types",
      description: "Manage available leave categories",
      path: "/hr/leave-types",
    },
  ];
 
  const totalLeaveRequests =
    summary.pendingRequests + summary.approvedLeaves + summary.rejectedLeaves;

  const getPercentage = (value) => {
    if (totalLeaveRequests === 0) return 0;

    return Math.round((value / totalLeaveRequests) * 100);
  };

  const leaveOverview = [
    {
      label: "Approved",
      value: summary.approvedLeaves,
      width: getPercentage(summary.approvedLeaves),
      color: "bg-green-500",
    },
    {
      label: "Pending",
      value: summary.pendingRequests,
      width: getPercentage(summary.pendingRequests),
      color: "bg-yellow-400",
    },
    {
      label: "Rejected",
      value: summary.rejectedLeaves,
      width: getPercentage(summary.rejectedLeaves),
      color: "bg-red-500",
    },
  ];


  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";

      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (

    <div className="space-y-6">
      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">HR Dashboard</h1>

        <p className="mt-1 text-sm text-gray-500">
          Overview of employees and leave activities.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center rounded-xl bg-white p-10">
          <span className="loading loading-spinner loading-lg text-green-600"></span>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-600">{error}</p>

          <button
            onClick={fetchDashboardSummary}
            className="btn btn-sm mt-3 bg-green-600 text-white hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{item.title}</p>

                    <h2 className="mt-2 text-2xl font-bold text-gray-800"> {item.value} </h2>
                  </div>

                  <div className={`rounded-xl p-3 text-xl ${item.bg} ${item.color}`} >
                    {item.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-gray-800">Leave Overview</h2>

              <p className="mt-1 text-sm text-gray-500">
                Current leave request distribution.
              </p>

              <div className="mt-6 space-y-5">
                {leaveOverview.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-gray-600">{item.label}</span>

                      <span className="font-semibold text-gray-800">
                        {item.value} ({item.width}%)
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${item.width}%` }}
                      />
                    </div>
                  </div>
                ))}

                {totalLeaveRequests === 0 && (
                  <p className="text-sm text-gray-400">
                    No leave requests available.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-gray-800">Quick Actions</h2>

              <p className="mt-1 text-sm text-gray-500">
                Common HR operations.
              </p>

              <div className="mt-5 space-y-3">
                {quickActions.map(({ title, description, path }) => (
                  <div
                    key={title}
                    onClick={() => navigate(path)}
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-100 p-3 transition hover:border-green-200 hover:bg-green-50"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {title}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {description}
                      </p>
                    </div>

                    <FiArrowRight className="text-gray-400 transition-transform group-hover:translate-x-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default Dashboard;
