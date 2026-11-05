
import React from "react";
import DetailItem from "../common/DetailItem";
import StatusBadge from "../common/StatusBadge";

const LeaveRequestDetails = ({
  leave,
  onApprove,
  onReject,
  onClose,
}) => {
  if (!leave) return null;

  const isPending = leave.status?.toLowerCase() === "pending";

  return (
    <div className="bg-white rounded-xl border border-green-100 shadow-sm p-6">

      {/* Header */}
      <div className="flex justify-between items-start gap-3">
        <div>
          <h2 className="text-xl font-bold text-green-800">
            Leave Request Details
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Review the employee's leave application.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="btn btn-sm btn-ghost text-gray-500"
        >
          ✕
        </button>
      </div>

      {/* Employee Information */}
      <div className="flex items-center gap-4 mt-6 mb-5">
        <div className="avatar placeholder">
          <div className="bg-green-100 text-green-800 rounded-full w-14">
            <span className="text-xl font-bold">
              {leave.first_name?.charAt(0)?.toUpperCase() || "E"}
            </span>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg text-gray-800">
            {leave.first_name} {leave.last_name}
          </h3>
          <p className="text-sm text-gray-500">
            {leave.email || "N/A"}
          </p>
        </div>
      </div>

      {/* Leave Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">

        <DetailItem
          label="Request ID"
          value={leave.id}
        />

        <DetailItem
          label="Leave Type"
          value={leave.leave_type}
        />

        <DetailItem
          label="From Date"
          value={
            leave.start_date
              ? new Date(leave.start_date).toLocaleDateString("en-IN")
              : "N/A"
          }
        />

        <DetailItem
          label="To Date"
          value={
            leave.end_date
              ? new Date(leave.end_date).toLocaleDateString("en-IN")
              : "N/A"
          }
        />

        <DetailItem
          label="Requested Days"
          value={leave.requested_days}
        />

        <DetailItem
          label="Applied On"
          value={
            leave.created_at
              ? new Date(leave.created_at).toLocaleDateString("en-IN")
              : "N/A"
          }
        />

      </div>

      {/* Reason */}
      <div className="mt-5">
        <h3 className="font-semibold text-gray-700 mb-2">
          Reason for Leave
        </h3>

        <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-sm text-gray-700">
          {leave.reason || "No reason provided."}
        </div>
      </div>

      {/* Status and Reviewer Comment */}
      <div className="mt-5 space-y-3">
        <div>
          <p className="text-sm text-gray-500 mb-2">Current Status</p>
          <StatusBadge status={leave.status} />
        </div>

        {leave.reviewer_comment && (
          <div>
            <p className="font-semibold text-gray-700 mb-2">
              Reviewer Comment
            </p>

            <div className="bg-gray-50 border rounded-lg p-4 text-sm text-gray-600">
              {leave.reviewer_comment}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {isPending && (
        <div className="flex justify-end gap-3 mt-7">
          <button
            type="button"
            onClick={() => onReject?.(leave)}
            className="btn bg-red-600 hover:bg-red-700 text-white border-none"
          >
            Reject
          </button>

          <button
            type="button"
            onClick={() => onApprove?.(leave)}
            className="btn bg-green-700 hover:bg-green-800 text-white border-none"
          >
            Approve
          </button>
        </div>
      )}

    </div>
  );
};

export default LeaveRequestDetails;
