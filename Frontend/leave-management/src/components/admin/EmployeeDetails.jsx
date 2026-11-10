import React from "react";

const EmployeeDetails = ({ employee, onClose }) => {
  if (!employee) return null;

  const DetailItem = ({ label, value }) => (
    <div className="border-b border-green-100 py-3">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold text-gray-800">
        {value || "N/A"}
      </p>
    </div>
  );

  return (
    <div className="card bg-white shadow-sm border border-green-100">
      <div className="card-body">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-green-800">
              Employee Details
            </h2>
            <p className="text-sm text-gray-500">
              Employee account information
            </p>
          </div>

          <button onClick={onClose} className="btn btn-sm btn-ghost text-gray-500" >✕</button>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="avatar placeholder">
            <div className="bg-green-100 text-green-800 rounded-full w-14">
              <span className="text-xl font-bold">
                {employee.first_name?.charAt(0)?.toUpperCase() || "E"}
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg text-gray-800">
              {employee.first_name} {employee.last_name}
            </h3>
            <p className="text-sm text-gray-500">{employee.email}</p>
          </div>
        </div>

        <div className="mt-4">
          <DetailItem label="Employee ID" value={employee.id} />
          <DetailItem label="First Name" value={employee.first_name} />
          <DetailItem label="Last Name" value={employee.last_name} />
          <DetailItem label="Email Address" value={employee.email} />
          <DetailItem label="Role" value={employee.role} />

          <div className="border-b border-green-100 py-3">
            <p className="text-sm text-gray-500">Account Status</p>
            <span
              className={`badge mt-1 ${
                employee.is_active
                  ? "badge-success"
                  : "badge-error"
              }`}
            >
              {employee.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
