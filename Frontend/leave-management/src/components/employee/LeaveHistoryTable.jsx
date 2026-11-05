
import React from "react";
import StatusBadge from "../common/StatusBadge";

const LeaveHistoryTable = ({ leaves = [], onViewDetails }) => {
  return (
    <div className="bg-white rounded-xl border border-green-100 shadow-sm p-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
        <div>
          <h2 className="text-xl font-bold text-green-800">
            Leave History
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            View all your previous leave applications.
          </p>
        </div>

        <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-2 rounded-lg">
          Total Records: {leaves.length}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">

          <thead className="bg-green-50 text-green-900">
            <tr>
              <th>Leave Type</th>
              <th>From Date</th>
              <th>To Date</th>
              <th>Requested Days</th>
              <th>Status</th>
              <th>Applied On</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {leaves.length > 0 ? (
              leaves.map((leave) => (
                <tr
                  key={leave.id}
                  className="hover:bg-green-50 transition-colors"
                >
                  <td className="font-medium text-gray-800">
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

                  <td>
                    <button
                      type="button"
                      onClick={() => onViewDetails?.(leave)}
                      className="btn btn-sm bg-green-100 text-green-800 border-none hover:bg-green-200"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-10 text-gray-500"
                >
                  <p className="font-medium">No leave records found.</p>
                  <p className="text-sm mt-1">
                    Your leave applications will appear here.
                  </p>
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default LeaveHistoryTable;
