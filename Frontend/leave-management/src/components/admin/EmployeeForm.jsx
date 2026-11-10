import React, { useState } from "react";

const EmployeeForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
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

    onSubmit({
      ...formData,
      role: "employee",
    });
  };

  return (
    <div className="card bg-white shadow-sm border border-green-100">
      <div className="card-body">
        <h2 className="text-xl font-bold text-green-800">
          Create Employee Account
        </h2>
        <p className="text-sm text-gray-500">
          Enter the employee details to create a new account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label font-semibold">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Enter first name"
                className="input input-bordered w-full focus:outline-green-500"
                required
              />
            </div>

            <div>
              <label className="label font-semibold">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Enter last name"
                className="input input-bordered w-full focus:outline-green-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="label font-semibold">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="employee@company.com"
              className="input input-bordered w-full focus:outline-green-500"
              required
            />
          </div>

          <div>
            <label className="label font-semibold">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="input input-bordered w-full focus:outline-green-500"
              required
              minLength={8}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onCancel} className="btn btn-ghost" >Cancel</button>

            <button type="submit" className="btn bg-green-700 text-white hover:bg-green-800">
              Create Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
