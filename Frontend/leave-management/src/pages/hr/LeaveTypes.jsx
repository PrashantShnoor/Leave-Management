import React, { useState } from "react";
import { FiPlus, FiEdit2, FiPower } from "react-icons/fi";

const LeaveTypes = () => {
  const initialLeaveTypes = [
    {
      id: 1,
      name: "Casual Leave",
      description: "Leave for personal work or urgent situations.",
      allocatedDays: 12,
      status: "Active",
    },
    {
      id: 2,
      name: "Sick Leave",
      description: "Leave for illness or medical reasons.",
      allocatedDays: 10,
      status: "Active",
    },
    {
      id: 3,
      name: "Annual Leave",
      description: "Planned leave for vacations and personal time.",
      allocatedDays: 20,
      status: "Active",
    },
    {
      id: 4,
      name: "Maternity Leave",
      description: "Leave provided for maternity purposes.",
      allocatedDays: 90,
      status: "Inactive",
    },
  ];

  const [leaveTypes, setLeaveTypes] = useState(initialLeaveTypes);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    allocatedDays: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      allocatedDays: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      formData.allocatedDays === "" ||
      Number(formData.allocatedDays) < 0
    ) {
      alert("Please enter valid leave type details.");
      return;
    }

    if (editingId) {
      setLeaveTypes((previous) =>
        previous.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: formData.name.trim(),
                description: formData.description.trim(),
                allocatedDays: Number(formData.allocatedDays),
              }
            : item
        )
      );
    } else {
      setLeaveTypes((previous) => [
        ...previous,
        {
          id: Date.now(),
          name: formData.name.trim(),
          description: formData.description.trim(),
          allocatedDays: Number(formData.allocatedDays),
          status: "Active",
        },
      ]);
    }

    resetForm();
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      description: item.description,
      allocatedDays: String(item.allocatedDays),
    });
    setShowForm(true);
  };

  const toggleStatus = (id) => {
    setLeaveTypes((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "Active" ? "Inactive" : "Active",
            }
          : item
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leave Types</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure the leave categories available to employees.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn border-none bg-green-600 text-white hover:bg-green-700"
        >
          <FiPlus /> Add Leave Type
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Leave Types</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-800">
            {leaveTypes.length}
          </h2>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Active Types</p>
          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {leaveTypes.filter((item) => item.status === "Active").length}
          </h2>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Inactive Types</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-500">
            {leaveTypes.filter((item) => item.status === "Inactive").length}
          </h2>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="text-gray-500">
                <th>Leave Type</th>
                <th>Description</th>
                <th>Allocated Days</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveTypes.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium text-gray-800">{item.name}</td>
                  <td className="max-w-xs text-sm text-gray-500">
                    {item.description}
                  </td>
                  <td>{item.allocatedDays} days</td>
                  <td>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        item.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="btn btn-ghost btn-sm text-blue-600"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => toggleStatus(item.id)}
                        className="btn btn-ghost btn-sm text-gray-600"
                        title="Change status"
                      >
                        <FiPower />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="text-lg font-bold text-gray-800">
              {editingId ? "Edit Leave Type" : "Add Leave Type"}
            </h3>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="label">
                  <span className="label-text font-medium">Leave Name</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Casual Leave"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Description</span>
                </label>
                <textarea
                  placeholder="Enter leave description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="textarea textarea-bordered w-full"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">
                    Allocated Days Per Year
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.allocatedDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      allocatedDays: e.target.value,
                    })
                  }
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="modal-action">
                <button type="button" onClick={resetForm} className="btn">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn border-none bg-green-600 text-white hover:bg-green-700"
                >
                  {editingId ? "Save Changes" : "Add Leave Type"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveTypes;