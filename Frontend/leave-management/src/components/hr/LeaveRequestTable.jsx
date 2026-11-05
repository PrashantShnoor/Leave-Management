
import React from "react";
import StatusBadge from "../common/StatusBadge";

const LeaveRequestTable = ({
  leaves = [],
  onSelectLeave,
}) => {
  return (
    <div className="bg-white rounded-xl border border-green-100 shadow-sm p-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
        <div>
          <h2 className="text-xl font-bold text-green-800">
            Leave Requests
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Review and manage employee leave applications.
          </p>
        </div>

        <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-2 rounded-lg">
          Total Requests: {leaves.length}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">

          <thead className="bg-green-50 text-green-900">
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>From Date</th>
              <th>To Date</th>
              <th>Days</th>
              <th>Status</th>
              <th>Applied On</th>
            </tr>
          </thead>

          <tbody>
            {leaves.length > 0 ? (
              leaves.map((leave) => (
                <tr
                  key={leave.id}
                  onClick={() => onSelectLeave?.(leave)}
                  className="hover:bg-green-50 cursor-pointer transition-colors"
                >
                  <td>
                    <p className="font-semibold text-gray-800">
                      {leave.first_name} {leave.last_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {leave.email || "N/A"}
                    </p>
                  </td>

                  <td className="text-gray-700">
                    {leave.leave_type || "N/A"}
                  </td>

                  <td className="text-gray-600">
                    {leave.start_date
                      ? new Date(leave.start_date).toLocaleDateString("en-IN")
                      : "N/A"}
                  </td>

                  <td className="text-gray-600">
                    {leave.end_date
                      ? new Date(leave.end_date).toLocaleDateString("en-IN")
                      : "N/A"}
                  </td>

                  <td className="text-gray-600">
                    {leave.requested_days ?? "N/A"}
                  </td>

                  <td>
                    <StatusBadge status={leave.status} />
                  </td>

                  <td className="text-gray-600">
                    {leave.created_at
                      ? new Date(leave.created_at).toLocaleDateString("en-IN")
                      : "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-10 text-gray-500">
                  No leave requests found.
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default LeaveRequestTable;
