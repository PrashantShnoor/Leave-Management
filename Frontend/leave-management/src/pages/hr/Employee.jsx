
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  FiSearch,
  FiEye,
  FiUsers,
  FiX,
  FiMail,
  FiCalendar,
  FiShield,
} from "react-icons/fi";

import BASE_URL from "../../utils/constants";

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch employees from backend
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${BASE_URL}/getAllEmployees`,
        {
          withCredentials: true,
        }
      );

      setEmployees(response.data.data || []);

    } catch (error) {
      console.error("Fetch Employees Error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to fetch employee records."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Search employees by name or email
  const filteredEmployees = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const fullName =
        `${employee.first_name || ""} ${employee.last_name || ""}`
          .trim()
          .toLowerCase();

      const email = (employee.email || "").toLowerCase();

      return (
        fullName.includes(searchValue) ||
        email.includes(searchValue)
      );
    });
  }, [employees, search]);

  // Total employees
  const totalEmployees = employees.length;

  // Employee status
  const getStatusClass = (isActive) => {
    return isActive
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";
  };

  return (
    <div className="space-y-6">

      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Employees
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View employee information and account details.
        </p>
      </div>

      {/* Total Employees */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Employees
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-800">
                {loading ? "..." : totalEmployees}
              </h2>
            </div>

            <FiUsers className="text-2xl text-green-600" />
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">

        {/* Search */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            placeholder="Search employee by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered w-full pl-10"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-green-600"></span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>

            <button
              onClick={fetchEmployees}
              className="btn btn-sm mt-3 bg-green-600 text-white hover:bg-green-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="mt-5 overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="text-gray-500">
                  <th>Employee</th>
                  <th>Employee ID</th>
                  <th>Account Created</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <p className="font-medium text-gray-800">
                        {employee.first_name} {employee.last_name}
                      </p>

                      <p className="text-xs text-gray-500">
                        {employee.email}
                      </p>
                    </td>

                    <td>EMP-{employee.id}</td>

                    <td>{formatDate(employee.created_at)}</td>

                    <td>
                      <button
                        onClick={() => setSelectedEmployee(employee)}
                        className="btn btn-ghost btn-sm text-green-700"
                      >
                        <FiEye />
                        View
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredEmployees.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-8 text-center text-gray-500"
                    >
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Employee Details
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Employee ID: EMP-{selectedEmployee.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedEmployee(null)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <FiX />
              </button>
            </div>

            {/* Employee Information */}
            <div className="mt-5 space-y-5">

              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-3 text-green-700">
                  <FiUsers className="text-xl" />
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800">
                    {selectedEmployee.first_name}{" "}
                    {selectedEmployee.last_name}
                  </h4>

                  <p className="text-sm text-gray-500">
                    Employee
                  </p>
                </div>
              </div>

              <DetailItem
                icon={<FiMail />}
                label="Email Address"
                value={selectedEmployee.email}
              />

              <DetailItem
                icon={<FiShield />}
                label="Role"
                value={selectedEmployee.role}
              />

              <DetailItem
                icon={<FiCalendar />}
                label="Account Created"
                value={formatDate(selectedEmployee.created_at)}
              />

              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-sm text-gray-500">
                  Account Status
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                    selectedEmployee.is_active
                  )}`}
                >
                  {selectedEmployee.is_active ? "Active" : "Inactive"}
                </span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="modal-action">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="btn"
              >
                Close
              </button>
            </div>

          </div>

          <div
            className="modal-backdrop"
            onClick={() => setSelectedEmployee(null)}
          >
            <button>Close</button>
          </div>
        </div>
      )}

    </div>
  );
};

// Reusable Detail Item
const DetailItem = ({ icon, label, value }) => {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {icon}
        <span>{label}</span>
      </div>

      <span className="text-right text-sm font-medium text-gray-800">
        {value || "N/A"}
      </span>
    </div>
  );
};

export default Employee;
