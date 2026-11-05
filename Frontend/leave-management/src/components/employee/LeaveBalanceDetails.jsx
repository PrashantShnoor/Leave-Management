import React from "react";
import { FiActivity } from "react-icons/fi";

const LeaveBalanceDetails = ({ leaveBalances, loading, getLeaveType }) => {
  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <FiActivity className="text-emerald-600" size={22} />
        <h2 className="text-lg font-bold">Leave Balance Details</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <span className="loading loading-spinner loading-md text-success" />
        </div>
      ) : leaveBalances.length === 0 ? (
        <p className="py-5 text-center text-sm text-base-content/60">
          No leave balance information found.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {leaveBalances.map((item) => {
            const allocated = Number(item.allocated_days || 0);
            const used = Number(item.used_days || 0);
            const available = allocated - used;

            return (
              <div
                key={item.id}
                className="rounded-xl border border-base-300 p-4"
              >
                <h3 className="font-semibold">
                  {getLeaveType(item.leave_type_id)}
                </h3>

                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-base-content/60">Allocated</span>
                  <strong>{allocated}</strong>
                </div>

                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-base-content/60">Used</span>
                  <strong>{used}</strong>
                </div>

                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-base-content/60">Available</span>
                  <strong className="text-emerald-600">{available}</strong>
                </div>

                <progress
                  className="progress progress-success mt-3 w-full"
                  value={allocated > 0 ? (used / allocated) * 100 : 0}
                  max="100"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LeaveBalanceDetails;