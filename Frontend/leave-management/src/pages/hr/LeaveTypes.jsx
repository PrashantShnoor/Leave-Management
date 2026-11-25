
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiPlus, FiX, FiLayers, FiUsers } from "react-icons/fi";

import BASE_URL from "../../utils/constants";

const LeaveTypes = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const currentYear = new Date().getFullYear();

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [leaveTypeResponse, balanceResponse, requestResponse] =
        await Promise.all([
          axios.get(`${BASE_URL}/getLeaveTypes` ,{ withCredentials: true }),
          axios.get(`${BASE_URL}/getAllLeaveBalances` , { withCredentials: true }),
          axios.get(`${BASE_URL}/getAllrequest` ,  { withCredentials: true }),
        ]);

      setLeaveTypes(leaveTypeResponse.data.data || []);
      setLeaveBalances(balanceResponse.data.data || []);
      setLeaveRequests(requestResponse.data.leave_requests || []);
    } catch (error) {
      console.error("Leave Types Fetch Error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to fetch leave management data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const getAllocatedDays = (leaveTypeId) => {
    return leaveBalances.reduce((total, balance) => {
      const isSameLeaveType =
        Number(balance.leave_type_id) === Number(leaveTypeId);

      const isCurrentYear =
        Number(balance.leave_year) === currentYear;

      if (isSameLeaveType && isCurrentYear) {
        return total + Number(balance.allocated_days || 0);
      }

      return total;
    }, 0);
  };

  const employeesOnLeave = useMemo(() => {
    const today = getTodayDate();

    const employeeIds = new Set();

    leaveRequests.forEach((request) => {
      const status = String(request.status || "").toLowerCase();

      const startDate = String(request.start_date || "").slice(0, 10);
      const endDate = String(request.end_date || "").slice(0, 10);

      const isApproved = status === "approved";
      const isCurrentlyOnLeave =
        startDate <= today && endDate >= today;

      if (
        isApproved &&
        isCurrentlyOnLeave &&
        request.employee_id
      ) {
        employeeIds.add(request.employee_id);
      }
    });

    return employeeIds.size;
  }, [leaveRequests]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      alert("Please enter leave name and description.");
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post(`${BASE_URL}/createLeaveType`, {
        type: formData.name.trim(),
        description: formData.description.trim(),
      });
      setFormData({
        name: "",
        description: "",
      });

      setShowForm(false);
      await fetchData();

    } catch (error) {
      console.error("Create Leave Type Error:", error);
      alert(error.response?.data?.message ||"Unable to create leave type.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Leave Types
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and configure the leave categories available to employees.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="btn border-none bg-green-600 text-white hover:bg-green-700"
        >
          <FiPlus />
          Add Leave Type
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Leave Types
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-800">
                {loading ? "..." : leaveTypes.length}
              </h2>
            </div>
            <FiLayers className="text-2xl text-green-600" />
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Employees Currently on Leave
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-800">
                {loading ? "..." : employeesOnLeave}
              </h2>
            </div>

            <FiUsers className="text-2xl text-green-600" />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">

        <div className="border-b border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800">
            Available Leave Types
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Leave categories and their total employee allocations for {currentYear}.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-green-600"></span>
          </div>
        )}

        {!loading && error && (
          <div className="p-5">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-600">{error}</p>

              <button
                onClick={fetchData}
                className="btn btn-sm mt-3 bg-green-600 text-white hover:bg-green-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="text-gray-500">
                  <th>Leave Type</th>
                  <th>Description</th>
                  <th>Total Allocated Days</th>
                </tr>
              </thead>

              <tbody>
                {leaveTypes.map((item) => (
                  <tr key={item.id}>
                    <td className="font-medium text-gray-800">
                      {item.type}
                    </td>

                    <td className="max-w-xs text-sm text-gray-500">
                      {item.description || "No description available"}
                    </td>

                    <td>
                      <span className="font-semibold text-green-700">
                        {getAllocatedDays(item.id)}
                      </span>

                      <span className="ml-1 text-sm text-gray-500">
                        days
                      </span>
                    </td>
                  </tr>
                ))}

                {leaveTypes.length === 0 && (
                  <tr>
                    <td
                      colSpan="3"
                      className="py-10 text-center text-gray-500"
                    >
                      No leave types found. Add your first leave type.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                Add Leave Type
              </h3>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">

              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Leave Name
                  </span>
                </label>

                <input
                  type="text"
                  placeholder="e.g. Casual Leave"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Description
                  </span>
                </label>

                <textarea
                  placeholder="Enter leave description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  className="textarea textarea-bordered w-full"
                  rows="3"
                  required
                />
              </div>

              <div className="modal-action">
                <button type="button" onClick={() => setShowForm(false)} className="btn" disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn border-none bg-green-600 text-white hover:bg-green-700" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Add Leave Type"
                  )}
                </button>
              </div>

            </form>
          </div>
          <div className="modal-backdrop" onClick={() => !isSubmitting && setShowForm(false)} >
            <button type="button">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveTypes;
