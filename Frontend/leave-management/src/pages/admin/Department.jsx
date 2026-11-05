
import React, { useMemo, useState } from "react";
import {
  FiLayers,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";

import DepartmentForm from "../../components/admin/DepartmentForm";
import SummaryCard from "../../components/common/SummaryCard";
import DataTable from "../../components/common/DataTable";
import ConfirmationModal from "../../components/common/ConfirmationModel";

const Department = () => {
  const [departments, setDepartments] = useState([
    {
      id: 1,
      department_name: "Engineering",
      description: "Software development and technology.",
      employee_count: 32,
    },
    {
      id: 2,
      department_name: "Human Resources",
      description: "Employee relations and recruitment.",
      employee_count: 8,
    },
    {
      id: 3,
      department_name: "Finance",
      description: "Financial planning and accounting.",
      employee_count: 12,
    },
    {
      id: 4,
      department_name: "Marketing",
      description: "Marketing and brand management.",
      employee_count: 15,
    },
    {
      id: 5,
      department_name: "Operations",
      description: "Business operations and administration.",
      employee_count: 20,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const filteredDepartments = useMemo(() => {
    return departments.filter((department) =>
      department.department_name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [departments, search]);

  const handleAddDepartment = (data) => {
    setDepartments((prev) => [
      ...prev,
      {
        ...data,
        id: Date.now(),
        employee_count: 0,
      },
    ]);

    setShowForm(false);
  };

  const handleDeleteDepartment = () => {
    setDepartments((prev) =>
      prev.filter((department) => department.id !== departmentToDelete.id)
    );

    setDepartmentToDelete(null);
    setSelectedDepartment(null);
  };

  const columns = [
    {
      key: "id",
      label: "ID",
    },
    {
      key: "department_name",
      label: "Department",
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-800">
            {row.department_name}
          </p>
          <p className="max-w-xs truncate text-xs text-gray-500">
            {row.description || "No description"}
          </p>
        </div>
      ),
    },
    {
      key: "employee_count",
      label: "Employees",
      render: (row) => (
        <span className="flex items-center gap-2">
          <FiUsers className="text-green-700" />
          {row.employee_count}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            className="btn btn-ghost btn-sm text-green-700"
            onClick={() => setSelectedDepartment(row)}
          >
            View
          </button>

          <button
            className="btn btn-ghost btn-sm text-red-600"
            onClick={() => setDepartmentToDelete(row)}
          >
            <FiTrash2 size={17} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-900">
            Department Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Organize and manage your organization's departments.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="btn border-none bg-green-700 text-white hover:bg-green-800"
        >
          <FiPlus size={18} />
          Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SummaryCard
          title="Total Departments"
          count={departments.length}
          icon={<FiLayers size={20} />}
          color="green"
        />

        <SummaryCard
          title="Total Employees Assigned"
          count={departments.reduce(
            (total, department) => total + department.employee_count,
            0
          )}
          icon={<FiUsers size={20} />}
          color="blue"
        />
      </div>

      {showForm && (
        <DepartmentForm
          onSubmit={handleAddDepartment}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="relative max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search departments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-bordered w-full pl-10"
        />
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-800">
          Department Records
        </h2>

        <DataTable
          columns={columns}
          data={filteredDepartments}
          emptyMessage="No departments found."
        />
      </section>

      {/* Department Details */}
      {selectedDepartment && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-green-900">
                Department Details
              </h2>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedDepartment(null)}
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Department Name</p>
                <p className="font-semibold">
                  {selectedDepartment.department_name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p>{selectedDepartment.description || "N/A"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Employee Count</p>
                <p className="font-semibold">
                  {selectedDepartment.employee_count}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!departmentToDelete}
        title="Delete Department"
        message={
          departmentToDelete
            ? `Are you sure you want to delete ${departmentToDelete.department_name}?`
            : ""
        }
        confirmText="Delete"
        confirmColor="bg-red-600 hover:bg-red-700"
        onConfirm={handleDeleteDepartment}
        onCancel={() => setDepartmentToDelete(null)}
      />
    </div>
  );
};

export default Department;
