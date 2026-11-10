import React, { useState } from "react";
import axios from "axios";
import { FiUserPlus, FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import EmployeeForm from "../../components/admin/EmployeeForm";
import BASE_URL from "../../utils/constants";

const CreateEmployee = () => {
  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateEmployee = async (employeeData) => {
    try {
      setLoading(true);
      setSuccessMessage("");
      setErrorMessage("");

      const response = await axios.post(
        `${BASE_URL}/signup`,
        {
          first_name: employeeData.first_name,
          last_name: employeeData.last_name,
          email: employeeData.email,
          password_hash: employeeData.password,
          role: "employee",
        },
        {
          withCredentials: true,
        }
      );

      setSuccessMessage(
        response.data.message ||
        `Employee account for ${employeeData.first_name} has been created successfully.`
      );
    } catch (error) {
      console.error(
        "Create employee error:",
        error.response?.data || error
      );

      setErrorMessage(
        error.response?.data?.message ||
        "Failed to create employee. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/employees")}
          className="btn btn-ghost btn-circle"
        >
          <FiArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-green-900">
            Create Employee
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Register a new employee in your organization.
          </p>
        </div>
      </div>

      
      {successMessage && (
        <div className="alert border border-green-200 bg-green-50 text-green-800">
          <span>{successMessage}</span>

          <button className="btn btn-ghost btn-xs" onClick={() => setSuccessMessage("")} >
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="alert border border-red-200 bg-red-50 text-red-800">
          <span>{errorMessage}</span>

          <button className="btn btn-ghost btn-xs" onClick={() => setErrorMessage("")} >
            ✕
          </button>
        </div>
      )}

      <EmployeeForm
        onSubmit={handleCreateEmployee}
        onCancel={() => navigate("/admin/employees")}
      />

      {loading && (
        <div className="flex items-center gap-2 text-sm text-green-700">
          <span className="loading loading-spinner loading-sm"></span>
          Creating employee account...
        </div>
      )}

      <div className="rounded-xl border border-green-100 bg-green-50 p-4">
        <div className="flex items-start gap-3">
          <FiUserPlus
            className="mt-1 text-green-700"
            size={20}
          />

          <div>
            <h3 className="font-semibold text-green-900">
              Employee Account Information
            </h3>

            <p className="mt-1 text-sm text-green-800">
              New accounts are created with the employee role.
              Employees can use their credentials to access the
              leave management system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEmployee;