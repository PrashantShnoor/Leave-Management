import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiSearch,
  FiEye,
} from "react-icons/fi";

import SummaryCard from "../../components/common/SummaryCard";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import EmployeeDetails from "../../components/admin/EmployeeDetails";
import BASE_URL from "../../utils/constants";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch employees from backend
  useEffect(() => {
    fetchEmployees();
  }, []);

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
      console.error(
        "Error fetching employees:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
        "Failed to fetch employees."
      );
    } finally {
      setLoading(false);
    }
  };

  // Search and filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const fullName =
        `${employee.first_name} ${employee.last_name}`.toLowerCase();

      const searchValue = search.toLowerCase();

      const matchesSearch =
        fullName.includes(searchValue) ||
        employee.email.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && employee.is_active) ||
        (statusFilter === "inactive" && !employee.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [employees, search, statusFilter]);


  // Table columns
  const columns = [
  {
    key: "id",
    label: "ID",
  },
  {
    key: "first_name",
    label: "Employee",
    render: (row) => (
      <div>
        <p className="font-semibold text-gray-800">
          {row.first_name} {row.last_name}
        </p>
        <p className="text-xs text-gray-500">{row.email}</p>
      </div>
    ),
  },
  {
    key: "role",
    label: "Role",
    render: (row) => (
      <span className="capitalize">{row.role}</span>
    ),
  },
  {
    key: "actions",
    label: "Actions",
    render: (row) => (
      <button
        className="btn btn-ghost btn-sm text-green-700"
        title="View Details"
        onClick={() => setSelectedEmployee(row)}
      >
        <FiEye size={17} />
      </button>
    ),
  },
];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-green-900">
          Employee Management
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View and manage all employee accounts.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex min-h-48 items-center justify-center">
          <span className="loading loading-spinner loading-lg text-green-700"></span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>

          <button
            onClick={fetchEmployees}
            className="btn btn-sm mt-3 bg-green-700 text-white hover:bg-green-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Dashboard Content */}
      {!loading && !error && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              title="Total Employees"
              count={employees.length}
              icon={<FiUsers size={20} />}
              color="green"
            />

            <SummaryCard
              title="Active Employees"
              count={"-"}
              icon={<FiUserCheck size={20} />}
              color="blue"
            />

            <SummaryCard
              title="Inactive Employees"
              count={"-"}
              
              icon={<FiUserX size={20} />}
              color="red"
            />
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-3 rounded-xl border border-green-100 bg-white p-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-sm">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input input-bordered w-full pl-10 focus:outline-green-500"
              />
            </div>

            <select
              className="select select-bordered w-full md:w-48"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Employees</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Employee Table */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">
                Employee Records
              </h2>

              <span className="text-sm text-gray-500">
                {filteredEmployees.length} records
              </span>
            </div>

            <DataTable
              columns={columns}
              data={filteredEmployees}
              emptyMessage="No employees match your search."
            />
          </div>
        </>
      )}

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="w-full max-w-xl">
            <EmployeeDetails
              employee={selectedEmployee}
              onClose={() => setSelectedEmployee(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
