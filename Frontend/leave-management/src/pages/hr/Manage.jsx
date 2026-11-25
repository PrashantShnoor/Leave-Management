import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import SummaryCard from "../../components/common/SummaryCard";
import DetailItem from "../../components/common/DetailItem"
import BASE_URL from "../../utils/constants";

import {
  FiSearch,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiFileText,
  FiX,
  FiCheck,
  FiBriefcase,
  FiPaperclip,
  FiMessageSquare,
} from "react-icons/fi";



const leaveTypeNames = {
  1: "Annual Leave",
  2: "Sick Leave",
  3: "Casual Leave",
  4: "Leave Without Pay",
};

const formatDate = (date) => {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return parsedDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatStatus = (status) => {
  const normalizedStatus = String(status || "").toLowerCase();

  if (normalizedStatus === "approved") return "Approved";
  if (normalizedStatus === "rejected") return "Rejected";

  return "Pending";
};

const Manage = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [reviewComment, setReviewComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    try {
      setError("");

      const response = await axios.get(BASE_URL + "/getAllrequest" , {
        withCredentials : true , 
      });

      const backendRequests = response.data.leave_requests || [];

      const formattedRequests = backendRequests.map((request) => ({
        id: request.id,

        employee: request.employee_name,
        email: request.employee_email,
        employeeId: request.employee_id,
        leaveType: leaveTypeNames[request.leave_type_id] || `Leave Type #${request.leave_type_id}`,
        fromDate: request.start_date,
        toDate: request.end_date,
        requestedDays: Number(request.requested_days),
        appliedOn: request.created_at,
        reason: request.reason,
        status: formatStatus(request.status),
        reviewComment: request.reviewer_comment || "",
      }));
      setRequests(formattedRequests);
      return formattedRequests;
    } catch (err) {
      console.error("Error fetching leave requests:", err);
      setError(
        err.response?.data?.message ||
          "Unable to fetch leave requests. Please try again."
      );
      throw err;
    }
  };

  useEffect(() => {
    const loadRequests = async () => {
      try {
        await fetchRequests();
      } catch {} 
      finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, []);
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(
    (request) => request.status === "Pending"
  ).length;
  const approvedRequests = requests.filter(
    (request) => request.status === "Approved"
  ).length;
  const rejectedRequests = requests.filter(
    (request) => request.status === "Rejected"
  ).length;

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        request.employee.toLowerCase().includes(searchValue) ||
        String(request.employeeId).toLowerCase().includes(searchValue) ||
        request.leaveType.toLowerCase().includes(searchValue) ||
        request.reason.toLowerCase().includes(searchValue);

      const matchesStatus = statusFilter === "All" || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const openRequestDetails = (request) => {
    setSelectedRequest(request);
    setReviewComment(request.reviewComment || "");
    setError("");
  };

  const handleDecision = async (decision) => {
    if (!selectedRequest || actionLoading) return;

    if (selectedRequest.status !== "Pending") return;

    if (decision === "Rejected" && !reviewComment.trim()) {
      alert("Please provide a reason for rejecting this leave request.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const endpoint = decision === "Approved" ? `/approveLeave/${selectedRequest.id}` : `/rejectLeave/${selectedRequest.id}`;

      const response = await axios.patch(`${BASE_URL}${endpoint}`,
        {
          reviewer_comment: reviewComment.trim() || null,
        },
        {
          withCredentials : true
        });

      if (!response.data.leave) {
        throw new Error("The server did not return the updated leave request.");
      }
      await fetchRequests();

      setSelectedRequest(null);
      setReviewComment("");

    } catch (err) {
      console.error("Error updating leave request:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to update the leave request. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const statusClasses = {
    Pending: "bg-orange-100 text-orange-700",
    Approved: "bg-emerald-100 text-emerald-700",
    Rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-base-200/50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard title="Total Requests" count={totalRequests} icon={<FiFileText size={21} />} color="blue"/>

          <SummaryCard title="Pending Requests" count={pendingRequests} icon={<FiClock size={21} />} color="orange" />

          <SummaryCard title="Approved" count={approvedRequests} icon={<FiCheckCircle size={21} />} color="green" />

          <SummaryCard title="Rejected" count={rejectedRequests} icon={<FiXCircle size={21} />} color="red" />
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm">

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-base-300 p-5">
            <div>
              <h2 className="text-xl font-bold">Leave Requests</h2>
              <p className="mt-1 text-sm text-base-content/60">
                Select an application to view its details.
              </p>
            </div>

            <label className="input input-bordered flex items-center gap-2">
              <FiSearch className="text-base-content/50" />

              <input
                type="text"
                placeholder="Search employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-36 sm:w-52"
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2 px-5 pt-4">
            {["All", "Pending", "Approved", "Rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`btn btn-sm ${
                  statusFilter === status
                    ? "btn-primary"
                    : "btn-ghost bg-base-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="space-y-3 p-5">
            {loading ? (
              <div className="flex justify-center py-12">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : error && requests.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-error">{error}</p>

                <button
                  className="btn btn-sm btn-primary mt-4"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      await fetchRequests();
                    } catch {} 
                    finally {
                      setLoading(false);
                    }
                  }}
                >
                  Retry
                </button>
              </div>
            ) : filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <button
                  key={request.id}
                  onClick={() => openRequestDetails(request)}
                  className="flex w-full flex-col gap-4 rounded-xl border border-base-300 p-4 text-left transition hover:border-primary/50 hover:bg-base-200/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                      {request.employee.charAt(0)}
                    </div>

                    <div>
                      <h3 className="font-semibold text-base-content">
                        {request.employee}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-5">
                    <div>
                      <p className="text-xs text-base-content/50"> Leave Type </p>
                      <p className="text-sm font-medium"> {request.leaveType} </p>
                    </div>
                    <div>
                      <p className="text-xs text-base-content/50"> Duration </p>
                      <p className="text-sm font-medium"> {request.requestedDays} Days </p>
                    </div>
                    <div>
                      <p className="text-xs text-base-content/50"> Applied On </p>
                      <p className="text-sm font-medium"> {formatDate(request.appliedOn)} </p>
                    </div>
                    <span className={`badge border-none font-semibold ${statusClasses[request.status] }`}>
                      {request.status}
                    </span>
                    <FiFileText className="text-base-content/50" size={20} />
                  </div>
                </button>
              ))
            ) : (
              <div className="py-12 text-center text-base-content/50">
                No leave requests found.
              </div>
            )}
          </div>
          <div className="border-t border-base-300 px-5 py-4">
            <p className="text-sm text-base-content/60">
              Showing {filteredRequests.length} of {totalRequests} requests
            </p>
          </div>
        </div>
      </div>
      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!actionLoading) setSelectedRequest(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-title"
            className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-base-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-base-300 p-5">
              <div>
                <h2 id="request-title" className="text-xl font-bold">
                  Leave Application Details
                </h2>

                <p className="mt-1 text-sm text-base-content/60">
                  Request ID: #{selectedRequest.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedRequest(null)}
                className="btn btn-circle btn-ghost btn-sm"
                disabled={actionLoading}
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-5 p-5">

              <div>
                <h3 className="mb-3 font-semibold"> Employee Information </h3>

                <div className="flex flex-wrap items-center gap-4 rounded-xl bg-base-200 p-4">
                  <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                    {selectedRequest.employee.charAt(0)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold"> {selectedRequest.employee} </h4>
                    <p className="text-sm text-base-content/60"> {selectedRequest.email} </p>
                    <p className="text-sm text-base-content/60">{selectedRequest.employeeId}</p>
                  </div>

                </div>
              </div>
              <div>
                <h3 className="mb-3 font-semibold">Leave Information</h3>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailItem icon={<FiBriefcase />} label="Leave Type" value={selectedRequest.leaveType} />
                  <DetailItem icon={<FiCalendar />} label="Requested Days" value={`${selectedRequest.requestedDays} Days`}/>
                  <DetailItem icon={<FiCalendar />} label="From Date" value={formatDate(selectedRequest.fromDate)} />
                  <DetailItem icon={<FiCalendar />} label="To Date" value={formatDate(selectedRequest.toDate)}/>
                  <DetailItem icon={<FiClock />} label="Applied On" value={formatDate(selectedRequest.appliedOn)} />

                  <div className="rounded-xl border border-base-300 p-3">
                    <p className="mb-2 text-xs text-base-content/50">
                      Application Status
                    </p>

                    <span
                      className={`badge border-none font-semibold ${
                        statusClasses[selectedRequest.status]
                      }`}
                    >
                      {selectedRequest.status}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Reason for Leave</h3>

                <div className="rounded-xl bg-base-200 p-4">
                  <p className="text-sm leading-relaxed text-base-content/80"> {selectedRequest.reason} </p>
                </div>
              </div>

              {selectedRequest.reviewComment && (
                <div>
                  <h3 className="mb-2 font-semibold"> Review Comment </h3>
                  <div className="rounded-xl bg-base-200 p-4 text-sm">
                    {selectedRequest.reviewComment}
                  </div>
                </div>
              )}
              {selectedRequest.status === "Pending" && (
                <div>
                  <label className="mb-2 flex items-center gap-2 font-semibold">
                    <FiMessageSquare />
                    Manager Review Comment
                  </label>

                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Add a comment or reason for your decision..."
                    className="textarea textarea-bordered h-24 w-full resize-none"
                    disabled={actionLoading}
                  />

                  <p className="mt-1 text-xs text-base-content/50">
                    A rejection reason is required when rejecting an application.
                  </p>
                </div>
              )}

            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-base-300 p-5">
              <button onClick={() => setSelectedRequest(null)} className="btn btn-ghost" disabled={actionLoading}>
                Close
              </button>

              {selectedRequest.status === "Pending" && (
                <>
                  <button onClick={() => handleDecision("Rejected")} className="btn btn-error text-white" disabled={actionLoading} >
                    {actionLoading ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : (
                      <FiX />
                    )}
                    Reject
                  </button>

                  <button onClick={() => handleDecision("Approved")} className="btn btn-success text-white" disabled={actionLoading}>
                    {actionLoading ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : (
                      <FiCheck />
                    )}
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Manage;
