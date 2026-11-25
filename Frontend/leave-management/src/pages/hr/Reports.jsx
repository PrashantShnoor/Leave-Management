import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  FiDownload,
  FiFileText,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";

import BASE_URL from "../../utils/constants";

const Reports = () => {
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const leaveTypeNames = {
    1: "Annual Leave",
    2: "Sick Leave",
    3: "Casual Leave",
    4: "Leave Without Pay",
  };

  const fetchLeaveRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${BASE_URL}/getAllrequest` , {withCredentials : true} );
      const requests = response.data.leave_requests || [];
      setLeaveRecords(requests);
    } catch (error) {
      console.error("Fetch Leave Reports Error:", error);
      setError( error.response?.data?.message ||"Unable to fetch leave reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRecords();
  }, []);

  const formatStatus = (value) => {
    if (!value) return "Unknown";
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    const dateValue = String(date).slice(0, 10);
    const parsedDate = new Date(`${dateValue}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) return "N/A";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalRequests = leaveRecords.length;

  const approvedCount = leaveRecords.filter(
    (record) => record.status?.toLowerCase() === "approved"
  ).length;

  const pendingCount = leaveRecords.filter(
    (record) => record.status?.toLowerCase() === "pending"
  ).length;

  const filteredRecords = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return leaveRecords.filter((record) => {
      const recordStatus = formatStatus(record.status);

      const matchesStatus =
        status === "All" || recordStatus === status;

      const employeeName = (record.employee_name || "").toLowerCase();
      const employeeEmail = (record.employee_email || "").toLowerCase();

      const leaveType = (leaveTypeNames[record.leave_type_id] ||`Leave Type #${record.leave_type_id}`).toLowerCase();

      const matchesSearch =
        employeeName.includes(searchValue) ||
        employeeEmail.includes(searchValue) ||
        leaveType.includes(searchValue) ||
        String(record.employee_id || "").includes(searchValue);

      return matchesStatus && matchesSearch;
    });
  }, [leaveRecords, search, status]);

  const recentRecords = filteredRecords.slice(0, 7);

  const totalDays = recentRecords.reduce(
    (total, record) => total + Number(record.requested_days || 0),
    0
  );

  const exportCSV = () => {
    if (filteredRecords.length === 0) {
      alert("No leave records available to export.");
      return;
    }

    const headers = [
      "Employee",
      "Employee Email",
      "Leave Type",
      "From",
      "To",
      "Days",
      "Status",
    ];

    const rows = filteredRecords.map((record) => [
      record.employee_name || "N/A",
      record.employee_email || "N/A",
      leaveTypeNames[record.leave_type_id] || `Leave Type #${record.leave_type_id}`,
      formatDate(record.start_date),
      formatDate(record.end_date),
      Number(record.requested_days || 0),
      formatStatus(record.status),
    ]);

    const csvContent = [headers, ...rows].map((row) =>
      row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "leave-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const getStatusClass = (value) => {
    const normalizedStatus = value?.toLowerCase();

    if (normalizedStatus === "approved") {
      return "bg-green-100 text-green-700";
    }

    if (normalizedStatus === "pending") {
      return "bg-yellow-100 text-yellow-700";
    }

    if (normalizedStatus === "rejected") {
      return "bg-red-100 text-red-700";
    }

    if (normalizedStatus === "cancelled") {
      return "bg-gray-100 text-gray-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Leave Reports
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review employee leave history and generate reports.
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={loading || leaveRecords.length === 0}
          className="btn border-none bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300"
        >
          <FiDownload />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Requests
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-800">
                {loading ? "..." : totalRequests}
              </h2>
            </div>

            <FiFileText className="text-2xl text-blue-600" />
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Approved Requests
              </p>

              <h2 className="mt-2 text-2xl font-bold text-green-600">
                {loading ? "..." : approvedCount}
              </h2>
            </div>

            <FiCheckCircle className="text-2xl text-green-600" />
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Pending Requests
              </p>

              <h2 className="mt-2 text-2xl font-bold text-yellow-600">
                {loading ? "..." : pendingCount}
              </h2>
            </div>

            <FiClock className="text-2xl text-yellow-600" />
          </div>
        </div>

      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">

        <div className="mb-5">
          <h2 className="font-semibold text-gray-800">
            Recent Leave Requests
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Showing up to 7 recent leave requests.
          </p>
        </div>

        <div className="mb-5 flex flex-col gap-3 md:flex-row">

          <input
            type="text"
            placeholder="Search employee, email or leave type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered flex-1"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="select select-bordered w-full md:w-52"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="mb-5 rounded-lg bg-green-50 p-4">
          <p className="text-sm text-green-800">
            <span className="font-semibold">
              {totalDays} leave days
            </span>{" "}
            are represented in the currently displayed records.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-green-600"></span>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>

            <button
              onClick={fetchLeaveRecords}
              className="btn btn-sm mt-3 bg-green-600 text-white hover:bg-green-700"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="text-gray-500">
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentRecords.map((record) => {
                  const recordStatus = formatStatus(record.status);

                  return (
                    <tr key={record.id}>
                      <td>
                        <p className="font-medium text-gray-800">
                          {record.employee_name || "N/A"}
                        </p>

                        <p className="text-xs text-gray-500">
                          {record.employee_email || "N/A"}
                        </p>
                      </td>
                      <td>{leaveTypeNames[record.leave_type_id] || `Leave Type #${record.leave_type_id}`}</td>
                      <td>{formatDate(record.start_date)}</td>
                      <td>{formatDate(record.end_date)}</td>
                      <td>{Number(record.requested_days || 0)}</td>

                      <td>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                            record.status
                          )}`}
                        >
                          {recordStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {recentRecords.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      No leave records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default Reports;
