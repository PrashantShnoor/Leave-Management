import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiDownload,
  FiFileText,
  FiSearch,
} from "react-icons/fi";
import BASE_URL from "../../utils/constants";

const PAGE_SIZE = 10;

const leaveTypeNames = {
  1: "Annual Leave",
  2: "Sick Leave",
  3: "Casual Leave",
  4: "Leave Without Pay",
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatStatus = (status) => {
  if (!status) return "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const getLeaveType = (id) => leaveTypeNames[id] || "Unknown Leave";

const escapeCsvValue = (value) => {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
};

const LeaveReport = () => {
  const [leaves, setLeaves] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${BASE_URL}/getLeaveRequests`, {
          withCredentials: true,
        });

        setLeaves(response.data.employee_balance || []);
      } catch (err) {
        console.error("Unable to fetch leave report:", err);
        setError(
          err.response?.data?.message ||
            "Unable to load the leave report. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, []);

  const filteredLeaves = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return leaves.filter((leave) => {
      const leaveType = getLeaveType(leave.leave_type_id);
      const status = formatStatus(leave.status);

      const matchesSearch =
        !normalizedSearch ||
        leaveType.toLowerCase().includes(normalizedSearch) ||
        String(leave.reason || "").toLowerCase().includes(normalizedSearch) ||
        status.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leaves, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLeaves.length / PAGE_SIZE));

  const paginatedLeaves = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredLeaves.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredLeaves, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const handleExportCsv = () => {
    const headers = [
      "Leave Type",
      "From Date",
      "To Date",
      "Requested Days",
      "Status",
      "Reason",
      "Reviewer Comment",
    ];

    const rows = filteredLeaves.map((leave) => [
      getLeaveType(leave.leave_type_id),
      leave.start_date ? String(leave.start_date).slice(0, 10) : "",
      leave.end_date ? String(leave.end_date).slice(0, 10) : "",
      Number(leave.requested_days || 0),
      formatStatus(leave.status),
      leave.reason || "",
      leave.reviewer_comment || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(","))
      .join("\r\n");
    const blob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = `leave-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };

  const statusStyle = {
    Approved: "bg-emerald-100 text-emerald-700",
    Rejected: "bg-red-100 text-red-700",
    Pending: "bg-amber-100 text-amber-700",
  };

  const firstRecord = filteredLeaves.length
    ? (currentPage - 1) * PAGE_SIZE + 1
    : 0;
  const lastRecord = Math.min(currentPage * PAGE_SIZE, filteredLeaves.length);

  return (
    <div className="min-h-screen bg-base-200/50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <FiFileText size={23} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-base-content">
                Leave Report
              </h1>
              <p className="mt-1 text-sm text-base-content/60">
                View, filter, and export all your leave applications.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/employee/leaves" className="btn btn-ghost">
              <FiArrowLeft size={17} />
              Back to My Leaves
            </Link>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={loading || filteredLeaves.length === 0}
              className="btn border-none bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <FiDownload size={17} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
            <p className="text-sm text-base-content/60">All Requests</p>
            <p className="mt-2 text-2xl font-bold">
              {loading ? "—" : leaves.length}
            </p>
          </div>
          <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
            <p className="text-sm text-base-content/60">Matching Records</p>
            <p className="mt-2 text-2xl font-bold">
              {loading ? "—" : filteredLeaves.length}
            </p>
          </div>
          <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
            <p className="text-sm text-base-content/60">Pending Requests</p>
            <p className="mt-2 text-2xl font-bold">
              {loading
                ? "—"
                : leaves.filter(
                    (leave) => leave.status?.toLowerCase() === "pending"
                  ).length}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-300 p-5">
            <div>
              <h2 className="text-lg font-bold">All Leave Applications</h2>
              <p className="mt-1 text-sm text-base-content/60">
                {filteredLeaves.length} matching record(s)
              </p>
            </div>

            <div className="flex gap-3">
              <label className="input input-bordered flex items-center gap-2">
                <FiSearch className="text-base-content/50" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-36 sm:w-48"
                />
              </label>

              <select
                className="select select-bordered"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="alert alert-error m-4">
              <span>{error}</span>
            </div>
          )}

          <div className="overflow-x-auto p-3">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-200 text-base-content">
                  <th>Leave Type</th>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center">
                      <span className="loading loading-spinner loading-lg text-success" />
                      <p className="mt-2 text-sm text-base-content/60">
                        Loading leave report...
                      </p>
                    </td>
                  </tr>
                ) : paginatedLeaves.length > 0 ? (
                  paginatedLeaves.map((leave) => {
                    const status = formatStatus(leave.status);

                    return (
                      <tr key={leave.id}>
                        <td className="font-semibold">
                          {getLeaveType(leave.leave_type_id)}
                        </td>
                        <td>{formatDate(leave.start_date)}</td>
                        <td>{formatDate(leave.end_date)}</td>
                        <td>{Number(leave.requested_days || 0)}</td>
                        <td>
                          <span
                            className={`badge border-none font-semibold ${
                              statusStyle[status] || "badge-ghost"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="max-w-xs truncate" title={leave.reason}>
                          {leave.reason || "—"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center">
                      <p className="font-medium text-base-content/60">
                        No leave applications found.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-base-300 px-5 py-4">
            <p className="text-sm text-base-content/60">
              Showing {firstRecord}–{lastRecord} of {filteredLeaves.length} records
            </p>

            <div className="join">
              <button
                type="button"
                className="btn join-item btn-sm"
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage((page) => page - 1)}
              >
                Previous
              </button>
              <button type="button" className="btn join-item btn-sm no-animation">
                Page {currentPage} of {totalPages}
              </button>
              <button
                type="button"
                className="btn join-item btn-sm"
                disabled={currentPage === totalPages || loading}
                onClick={() => setCurrentPage((page) => page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveReport;
