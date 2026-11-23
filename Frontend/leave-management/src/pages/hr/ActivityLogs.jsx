import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiActivity,
  FiCalendar,
  FiFilter,
  FiRefreshCw,
  FiSearch,
  FiUser,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
  FiAlertCircle,
} from "react-icons/fi";

import BASE_URL from "../../utils/constants";

const ActivityLogs = () => {

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalRecords: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [filters, setFilters] = useState({
    employee_id: "",
    action: "",
    start_date: "",
    end_date: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    employee_id: "",
    action: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    let isMounted = true;

    const fetchActivityLogs = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {
          page,
          limit,
          ...appliedFilters,
        };
        Object.keys(params).forEach((key) => {
          if (params[key] === "") {
            delete params[key];
          }
        });
        const response = await axios.get(`${BASE_URL}/getActivityLogs`,{params,withCredentials: true,});
        if (!isMounted) return;

        const responseData = response.data;

        setActivities(Array.isArray(responseData.data) ? responseData.data : []);
        setPagination(
          responseData.pagination || {
            currentPage: page,
            totalPages: 0,
            totalRecords: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          }
        );
      } catch (err) {
        if (!isMounted) return;
        console.error("Activity logs error:", err);
        setActivities([]);
        setPagination({
          currentPage: 1,
          totalPages: 0,
          totalRecords: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        });
        setError(
          err.response?.data?.message ||
            "Unable to load activity logs. Please try again."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };
    fetchActivityLogs();
    return () => {
      isMounted = false;
    };
  }, [page, limit, appliedFilters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({...prev,[name]: value,}));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    if ( filters.start_date && filters.end_date && filters.start_date > filters.end_date) {
      setError("Start date cannot be later than end date.");
      return;
    }
    setError("");
    setPage(1);
    setAppliedFilters({ ...filters });
  };
  const handleResetFilters = () => {
    const emptyFilters = {
      employee_id: "",
      action: "",
      start_date: "",
      end_date: "",
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(1);
    setError("");
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setAppliedFilters((prev) => ({ ...prev }));
        setPage((prev) => {
      return prev === 1 ? 1 : prev;
    });
  };

  const handlePreviousPage = () => {
    if (pagination.hasPreviousPage && page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setPage((prev) => prev + 1);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit",});
  };

  const formatAction = (action) => {
    if (!action) return "Activity";

    return action
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getActionStyle = (action) => {
    switch (action) {
      case "LEAVE_APPROVED":
        return "bg-green-100 text-green-700";

      case "LEAVE_REJECTED":
        return "bg-red-100 text-red-700";

      case "LEAVE_APPLIED":
        return "bg-blue-100 text-blue-700";

      case "BALANCE_ASSIGNED":
      case "BALANCE_UPDATED":
        return "bg-purple-100 text-purple-700";

      case "LEAVE_CANCELLED":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <FiActivity size={21} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Activity Logs </h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor employee and HR activities across the system.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-white px-4 py-2.5 text-sm font-medium text-green-700 shadow-sm transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""}/>
          Refresh
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-green-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Activities
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-800">
                {pagination.totalRecords ?? 0}
              </h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
              <FiActivity size={21} />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-green-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500"> Current Page</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-800">
                {pagination.currentPage || page}
              </h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <FiClock size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-green-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500"> Total Pages </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-800"> {pagination.totalPages ?? 0} </h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <FiCalendar size={21} />
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-green-100 bg-white p-5 shadow-sm">

        <div className="mb-5 flex items-center gap-2">
          <FiFilter className="text-green-700" size={19} />
          <h2 className="font-semibold text-gray-800">
            Filter Activities
          </h2>
        </div>
        <form onSubmit={handleApplyFilters}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Employee ID
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  name="employee_id"
                  value={filters.employee_id}
                  onChange={handleFilterChange}
                  placeholder="Enter employee ID"
                  className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700"> Activity Type</label>

              <select
                name="action"
                value={filters.action}
                onChange={handleFilterChange}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              >
                <option value="">All Activities</option>
                <option value="LEAVE_APPLIED">Leave Applied</option>
                <option value="LEAVE_APPROVED">Leave Approved</option>
                <option value="LEAVE_REJECTED">Leave Rejected</option>
                <option value="LEAVE_CANCELLED">Leave Cancelled</option>
                <option value="BALANCE_ASSIGNED">Balance Assigned</option>
                <option value="BALANCE_UPDATED">Balance Updated</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700"> Start Date </label>

              <input
                type="date"
                name="start_date"
                value={filters.start_date}
                onChange={handleFilterChange}
                max={filters.end_date || undefined}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700"> End Date </label>

              <input
                type="date"
                name="end_date"
                value={filters.end_date}
                onChange={handleFilterChange}
                min={filters.start_date || undefined}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-green-700"
            >
              <FiSearch size={16} />
              Apply Filters
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Reset Filters
            </button>
          </div>
        </form>
      </div>
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <FiAlertCircle className="mt-0.5 shrink-0" size={18} />
          <p>{error}</p>
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-green-100 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-green-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-800">
              Activity History
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Showing {activities.length} records on this page
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">
              Rows:
            </label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-212.5 text-left">
            <thead className="bg-green-50 text-sm text-green-900">
              <tr>
                <th className="px-5 py-4 font-semibold">  Date & Time</th>

                <th className="px-5 py-4 font-semibold"> Employee</th>
                <th className="px-5 py-4 font-semibold"> Activity</th>
                <th className="px-5 py-4 font-semibold"> Activity Type</th>
                <th className="px-5 py-4 font-semibold"> Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-14 text-center">
                    <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-4 border-green-100 border-t-green-600"></span>
                    <p className="mt-3 text-sm text-gray-500">
                      Loading activity logs...
                    </p>
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-14 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                      <FiActivity size={23} />
                    </div>
                    <p className="mt-3 font-medium text-gray-700">
                      No activity records found
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Activities will appear here when users perform actions.
                    </p>
                  </td>
                </tr>
              ) : (
                activities.map((activity) => (
                  <tr key={activity.id} className="transition hover:bg-green-50/40">
                    <td className="px-5 py-4">
                      <p className="whitespace-nowrap text-sm font-medium text-gray-700">
                        {formatDate(activity.created_at)}
                      </p>
                      <p className="mt-1 whitespace-nowrap text-xs text-gray-400">
                        {formatTime(activity.created_at)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                          <FiUser size={15} />
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {activity.employee_name || "Employee unavailable"}
                          </p>

                          <p className="text-xs text-gray-400">
                            ID: {activity.employee_id ?? "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-sm px-5 py-4">
                      <p className="text-sm leading-6 text-gray-600">
                        {activity.description || "No description available"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${getActionStyle(activity.action)}`}>
                        {formatAction(activity.action)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-700">
                        {activity.performed_by_name || "User unavailable"}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        ID: {activity.performed_by ?? "N/A"}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-green-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Total records:{" "}
            <span className="font-semibold text-gray-700">
              {pagination.totalRecords ?? 0}
            </span>
          </p>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <button
              type="button"
              onClick={handlePreviousPage}
              disabled={
                loading ||
                !pagination.hasPreviousPage ||
                page <= 1
              }
              className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronLeft size={17} />
              Previous
            </button>
            <span className="whitespace-nowrap text-sm text-gray-600">
              Page{" "}
              <span className="font-semibold text-gray-800">
                {pagination.currentPage || page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-800">
                {pagination.totalPages ?? 0}
              </span>
            </span>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={
                loading ||
                !pagination.hasNextPage
              }
              className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <FiChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ActivityLogs;
