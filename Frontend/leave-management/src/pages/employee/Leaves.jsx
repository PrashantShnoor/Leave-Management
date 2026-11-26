import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import LeaveBalanceDetails from "../../components/employee/LeaveBalanceDetails";
import {
  FiActivity,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiLoader,
  FiSearch,
  FiSend,
  FiX,
} from "react-icons/fi";

import BASE_URL from "../../utils/constants";

const leaveTypeNames = {
  1: "Annual Leave",
  2: "Sick Leave",
  3: "Casual Leave",
  4: "Leave Without Pay",
};

const leaveTypeIds = {
  "Annual Leave": 1,
  "Sick Leave": 2,
  "Casual Leave": 3,
  "Leave Without Pay": 4,
};

const initialForm = {
  type: "",
  from: "",
  to: "",
  requestedDays: "",
  reason: "",
  document: null,
};

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [formData, setFormData] = useState(initialForm);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const today = new Date().toLocaleDateString("en-CA");

  const toLocalDate = (date) => {
    if (!date) return "";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) return "";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const d = new Date(date + "T00:00:00");

    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getLeaveType = (id) => {
    return leaveTypeNames[id] || "Unknown Leave";
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      setPageError("");

      const [historyResponse, balanceResponse] = await Promise.all([
        axios.get(`${BASE_URL}/getLeaveRequests`,
          { withCredentials: true }
        ),

        axios.get(`${BASE_URL}/getLeavebalance`,
          { withCredentials: true }
        ),
      ]);

      setLeaves(historyResponse.data.employee_balance || []);
      setLeaveBalances(balanceResponse.data.employee_balance || []);

    } catch (error) {
      console.error("Unable to fetch leave information:", error);

      setPageError(
        error.response?.data?.message ||
          "Unable to load leave information. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const summary = useMemo(() => {
    const allocated = leaveBalances.reduce(
      (total, item) => total + Number(item.allocated_days || 0),
      0
    );

    const used = leaveBalances.reduce(
      (total, item) => total + Number(item.used_days || 0),
      0
    );

    const available = allocated - used;

    const pending = leaves.filter(
      (leave) => leave.status?.toLowerCase() === "pending"
    ).length;

    return {
      allocated,
      used,
      available,
      pending,
    };
  }, [leaveBalances, leaves]);

  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      const leaveName = getLeaveType(leave.leave_type_id);

      const matchesSearch = leaveName
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        formatStatus(leave.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leaves, search, statusFilter]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const calculateDays = (from, to) => {
    if (!from || !to || to < from) return 0;

    const start = new Date(`${from}T00:00:00`);
    const end = new Date(`${to}T00:00:00`);

    return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    const requestedDays = Number(formData.requestedDays);

    if ( !formData.type || !formData.from || !formData.to || !formData.requestedDays || !formData.reason.trim()) {
      setFormError("Please fill in all required fields.");
      return;
    }

    if (formData.to < formData.from) {
      setFormError("End date cannot be before start date.");
      return;
    }

    if (!Number.isInteger(requestedDays) || requestedDays <= 0) {
      setFormError("Requested days must be a positive whole number.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        leave_type_id: leaveTypeIds[formData.type],
        start_date: formData.from,
        end_date: formData.to,
        requested_days: String(requestedDays),
        reason: formData.reason.trim(),
      };

      const response = await axios.post(`${BASE_URL}/createLeave`, payload,{ withCredentials: true });

      if (!response.data.employee) {
        throw new Error("Invalid response received from server.");
      }

      await fetchLeaveData();

      setFormData(initialForm);
      setShowModal(false);
      setSuccessMessage("Your leave request was submitted successfully.");

    } catch (error) {
      console.error("Leave request failed:", error);
      setFormError(error.response?.data?.message || error.message || "Unable to submit leave request.");
    } finally {
      setSubmitting(false);
      setFormData(initialForm);
    }
  };

  const statusStyle = {
    Approved: "bg-emerald-100 text-emerald-700",
    Rejected: "bg-red-100 text-red-700",
    Pending: "bg-amber-100 text-amber-700",
  };

  const summaryCards = [
    {
      title: "Total Allocated",
      value: summary.allocated,
      icon: <FiCalendar size={21} />,
      style: "bg-blue-50 text-blue-700",
    },
    {
      title: "Available Leaves",
      value: summary.available,
      icon: <FiCheckCircle size={21} />,
      style: "bg-emerald-50 text-emerald-700",
    },
    {
      title: "Used Leaves",
      value: summary.used,
      icon: <FiClock size={21} />,
      style: "bg-orange-50 text-orange-700",
    },
    {
      title: "Pending Requests",
      value: summary.pending,
      icon: <FiLoader size={21} />,
      style: "bg-violet-50 text-violet-700",
    },
  ];

  return (
    <div className="min-h-screen bg-base-200/50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-7">

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <FiCalendar size={25} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-base-content">
                My Leaves
              </h1>
              <p className="mt-1 text-sm text-base-content/60">
                Manage your leave applications and check your leave balance
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/employee/leave-report"
              className="btn btn-outline border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white"
            >
              View Full Report
            </Link>
            <button
            onClick={() => {
              setFormError("");
              setShowModal(true);
            }}
            className="btn bg-slate-900 text-white border-none hover:bg-slate-800"
          >
            <FiSend size={18} />
            Apply for Leave
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="alert alert-success">
            <FiCheckCircle />
            <span>{successMessage}</span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setSuccessMessage("")}
            >
              <FiX />
            </button>
          </div>
        )}

        {pageError && (
          <div className="alert alert-error">
            <span>{pageError}</span>
            <button
              className="btn btn-sm"
              onClick={fetchLeaveData}
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.title}
              className={`rounded-2xl p-4 shadow-sm ${card.style}`}
            >
              <div className="flex items-center gap-4">
                <div className="flex size-11 items-center justify-center rounded-full bg-white/70">
                  {card.icon}
                </div>

                <div>
                  <h2 className="text-2xl font-bold">
                    {loading ? "..." : card.value}
                  </h2>
                  <p className="mt-1 text-sm font-medium">
                    {card.title}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <LeaveBalanceDetails leaveBalances={leaveBalances} loading={loading} getLeaveType={getLeaveType}/>

        <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-base-300 p-5">
            <div className="flex items-center gap-3">
              <FiActivity size={23} className="text-primary" />
              <h2 className="text-xl font-bold">Leave History</h2>
            </div>

            <div className="flex gap-3">
              <label className="input input-bordered flex items-center gap-2">
                <FiSearch className="text-base-content/50" />
                <input
                  type="text"
                  placeholder="Search leaves..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-36 sm:w-48"
                />
              </label>

              <select
                className="select select-bordered"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto p-3">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-200 text-base-content">
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center">
                      <span className="loading loading-spinner loading-lg text-success" />
                      <p className="mt-2 text-sm text-base-content/60">
                        Loading leave history...
                      </p>
                    </td>
                  </tr>
                ) : filteredLeaves.length > 0 ? (
                  filteredLeaves.slice(0, 5).map((leave) => {
                    const status = formatStatus(leave.status);

                    return (
                      <tr key={leave.id} className="hover">
                        <td className="font-semibold">
                          {getLeaveType(leave.leave_type_id)}
                        </td>

                        <td>
                          {formatDate(toLocalDate(leave.start_date))}
                        </td>

                        <td>
                          {formatDate(toLocalDate(leave.end_date))}
                        </td>

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

                        <td className="text-center">
                          <button
                            className="btn btn-ghost btn-sm"
                            title="View leave details"
                            onClick={() => setSelectedLeave(leave)}
                          >
                            <FiEye size={18} />
                          </button>
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

          <div className="border-t border-base-300 px-5 py-4">
            <p className="text-sm text-base-content/60">
              Showing {Math.min(filteredLeaves.length, 5)} of {leaves.length} leave applications. View the full report for all records.
            </p>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => !submitting && setShowModal(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-2xl bg-base-100 shadow-2xl"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-base-300 p-6">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <FiSend size={25} />
                </div>

                <div>
                  <h2 className="text-xl font-bold">Apply for Leave</h2>
                  <p className="mt-1 text-sm text-base-content/60">
                    Fill in the details to submit your leave request
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="btn btn-circle btn-ghost btn-sm"
                aria-label="Close modal"
                disabled={submitting}
              >
                <FiX size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4 p-6">

                {formError && (
                  <div className="alert alert-error text-sm">
                    {formError}
                  </div>
                )}

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Leave Type
                    </span>
                  </label>

                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                    required
                  >
                    <option value="" disabled>
                      Select leave type
                    </option>

                    {Object.keys(leaveTypeIds).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        From Date
                      </span>
                    </label>

                    <input
                      type="date"
                      name="from"
                      value={formData.from}
                      min={today}
                      onChange={handleChange}
                      className="input input-bordered w-full"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        To Date
                      </span>
                    </label>

                    <input
                      type="date"
                      name="to"
                      value={formData.to}
                      min={formData.from || today}
                      onChange={handleChange}
                      className="input input-bordered w-full"
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Requested Days
                    </span>
                  </label>

                  <input
                    type="number"
                    name="requestedDays"
                    value={formData.requestedDays}
                    onChange={handleChange}
                    placeholder="Enter requested days"
                    min="1"
                    step="1"
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Reason for Leave
                    </span>
                  </label>

                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Enter your reason..."
                    className="textarea textarea-bordered h-24 w-full resize-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-base-300 bg-base-100 p-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-ghost"
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !formData.type ||
                    !formData.from ||
                    !formData.to ||
                    formData.to < formData.from ||
                    !formData.requestedDays ||
                    !Number.isInteger(Number(formData.requestedDays)) ||
                    Number(formData.requestedDays) <= 0 ||
                    !formData.reason.trim()
                  }
                  className="btn bg-emerald-600 text-white hover:bg-emerald-700 border-none"
                >
                  <FiSend size={16} />
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedLeave && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedLeave(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-base-100 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">Leave Details</h2>
              <button
                className="btn btn-circle btn-ghost btn-sm"
                onClick={() => setSelectedLeave(null)}
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-base-content/60">Leave Type</p>
                <p className="font-semibold">
                  {getLeaveType(selectedLeave.leave_type_id)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-base-content/60">From Date</p>
                  <p className="font-semibold">
                    {formatDate(toLocalDate(selectedLeave.start_date))}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-base-content/60">To Date</p>
                  <p className="font-semibold">
                    {formatDate(toLocalDate(selectedLeave.end_date))}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-base-content/60">Requested Days</p>
                <p className="font-semibold">
                  {Number(selectedLeave.requested_days || 0)} days
                </p>
              </div>

              <div>
                <p className="text-sm text-base-content/60">Reason</p>
                <p className="font-medium">{selectedLeave.reason}</p>
              </div>

              <div>
                <p className="text-sm text-base-content/60">Status</p>
                <span
                  className={`badge border-none font-semibold ${
                    statusStyle[formatStatus(selectedLeave.status)] ||
                    "badge-ghost"
                  }`}
                >
                  {formatStatus(selectedLeave.status)}
                </span>
              </div>

              <div>
                <p className="text-sm text-base-content/60">
                  Reviewer Comment
                </p>
                <p className="font-medium">
                  {selectedLeave.reviewer_comment || "No reviewer comment yet."}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="btn btn-primary"
                onClick={() => setSelectedLeave(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;
