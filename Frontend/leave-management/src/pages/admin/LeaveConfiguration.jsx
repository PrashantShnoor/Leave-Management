
import React, { useState } from "react";
import {
  FiCalendar,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
} from "react-icons/fi";

import SummaryCard from "../../components/common/SummaryCard";
import DataTable from "../../components/common/DataTable";
import StatusBadge from "../../components/common/StatusBadge";
import ConfirmationModal from "../../components/common/ConfirmationModel";

const initialLeaveTypes = [
  {
    id: 1,
    type: "Annual Leave",
    description: "Regular yearly vacation leave.",
    allocated_days: 20,
    is_paid: true,
    is_active: true,
  },
  {
    id: 2,
    type: "Sick Leave",
    description: "Leave for medical reasons.",
    allocated_days: 10,
    is_paid: true,
    is_active: true,
  },
  {
    id: 3,
    type: "Casual Leave",
    description: "Short personal leave.",
    allocated_days: 7,
    is_paid: true,
    is_active: true,
  },
  {
    id: 4,
    type: "Unpaid Leave",
    description: "Leave without salary.",
    allocated_days: 30,
    is_paid: false,
    is_active: true,
  },
];

const emptyForm = {
  type: "",
  description: "",
  allocated_days: "",
  is_paid: true,
};

const LeaveConfiguration = () => {
  const [leaveTypes, setLeaveTypes] = useState(initialLeaveTypes);
  const [formData, setFormData] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [leaveToDelete, setLeaveToDelete] = useState(null);

  const activeCount = leaveTypes.filter((item) => item.is_active).length;

  const openAddForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (leave) => {
    setEditingId(leave.id);
    setFormData({
      type: leave.type,
      description: leave.description,
      allocated_days: leave.allocated_days,
      is_paid: leave.is_paid,
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      setLeaveTypes((prev) =>
        prev.map((leave) =>
          leave.id === editingId
            ? {
                ...leave,
                ...formData,
                allocated_days: Number(formData.allocated_days),
              }
            : leave
        )
      );
    } else {
      setLeaveTypes((prev) => [
        ...prev,
        {
          ...formData,
          id: Date.now(),
          allocated_days: Number(formData.allocated_days),
          is_active: true,
        },
      ]);
    }

    setShowForm(false);
    setFormData(emptyForm);
    setEditingId(null);
  };

  const toggleStatus = (id) => {
    setLeaveTypes((prev) =>
      prev.map((leave) =>
        leave.id === id
          ? { ...leave, is_active: !leave.is_active }
          : leave
      )
    );
  };

  const handleDelete = () => {
    setLeaveTypes((prev) =>
      prev.filter((leave) => leave.id !== leaveToDelete.id)
    );
    setLeaveToDelete(null);
  };

  const columns = [
    {
      key: "type",
      label: "Leave Type",
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-800">{row.type}</p>
          <p className="text-xs text-gray-500">
            {row.description || "No description"}
          </p>
        </div>
      ),
    },
    {
      key: "allocated_days",
      label: "Allocated Days",
      render: (row) => (
        <span className="font-semibold">{row.allocated_days} days</span>
      ),
    },
    {
      key: "is_paid",
      label: "Payment",
      render: (row) => (
        <span
          className={`badge ${
            row.is_paid ? "badge-success" : "badge-warning"
          }`}
        >
          {row.is_paid ? "Paid" : "Unpaid"}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (row) => (
        <button
          onClick={() => toggleStatus(row.id)}
          title="Toggle status"
        >
          <StatusBadge status={row.is_active ? "active" : "inactive"} />
        </button>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button
            className="btn btn-ghost btn-sm text-green-700"
            onClick={() => openEditForm(row)}
          >
            <FiEdit2 size={16} />
          </button>

          <button
            className="btn btn-ghost btn-sm text-red-600"
            onClick={() => setLeaveToDelete(row)}
          >
            <FiTrash2 size={16} />
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
            Leave Configuration
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure the leave types and policies available in your organization.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="btn border-none bg-green-700 text-white hover:bg-green-800"
        >
          <FiPlus size={18} />
          Add Leave Type
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total Leave Types"
          count={leaveTypes.length}
          icon={<FiCalendar size={20} />}
          color="green"
        />
        <SummaryCard
          title="Active Leave Types"
          count={activeCount}
          icon={<FiCheckCircle size={20} />}
          color="blue"
        />
        <SummaryCard
          title="Inactive Leave Types"
          count={leaveTypes.length - activeCount}
          icon={<FiCalendar size={20} />}
          color="orange"
        />
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="rounded-xl border border-green-100 bg-white p-5 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-green-900">
            {editingId ? "Edit Leave Type" : "Create Leave Type"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="label font-semibold">Leave Type</label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  placeholder="e.g. Annual Leave"
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div>
                <label className="label font-semibold">
                  Allocated Days Per Year
                </label>
                <input
                  type="number"
                  name="allocated_days"
                  value={formData.allocated_days}
                  onChange={handleChange}
                  min="0"
                  className="input input-bordered w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label font-semibold">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe this leave type..."
                className="textarea textarea-bordered w-full"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="is_paid"
                checked={formData.is_paid}
                onChange={handleChange}
                className="checkbox checkbox-success"
              />
              <span className="font-medium text-gray-700">
                This is a paid leave
              </span>
            </label>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn border-none bg-green-700 text-white hover:bg-green-800"
              >
                {editingId ? "Save Changes" : "Create Leave Type"}
              </button>
            </div>
          </form>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-800">
          Available Leave Types
        </h2>

        <DataTable
          columns={columns}
          data={leaveTypes}
          emptyMessage="No leave types configured."
        />
      </section>

      <ConfirmationModal
        isOpen={!!leaveToDelete}
        title="Delete Leave Type"
        message={
          leaveToDelete
            ? `Are you sure you want to delete ${leaveToDelete.type}?`
            : ""
        }
        confirmText="Delete"
        confirmColor="bg-red-600 hover:bg-red-700"
        onConfirm={handleDelete}
        onCancel={() => setLeaveToDelete(null)}
      />
    </div>
  );
};

export default LeaveConfiguration;
