
import React, { useState } from "react";

const DepartmentForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    department_name: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit(formData);
  };

  return (
    <div className="card bg-white shadow-sm border border-green-100">
      <div className="card-body">
        <h2 className="text-xl font-bold text-green-800">
          Add Department
        </h2>
        <p className="text-sm text-gray-500">
          Add a new department to your organization.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
          <div>
            <label className="label font-semibold">Department Name</label>
            <input
              type="text"
              name="department_name"
              value={formData.department_name}
              onChange={handleChange}
              placeholder="e.g. Engineering"
              className="input input-bordered w-full focus:outline-green-500"
              required
            />
          </div>

          <div>
            <label className="label font-semibold">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter department description"
              className="textarea textarea-bordered w-full focus:outline-green-500"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-ghost"
            >
              Cancel
            </button>

            <button type="submit" className="btn bg-green-700 text-white hover:bg-green-800">
              Add Department
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentForm;
