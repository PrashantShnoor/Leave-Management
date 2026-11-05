
import React, { useState } from "react";
import {
  FiShield,
  FiSave,
  FiRefreshCw,
  FiLock,
  FiUsers,
} from "react-icons/fi";

const initialPermissions = {
  admin: {
    dashboard: true,
    view_employees: true,
    create_employee: true,
    manage_hr: true,
    manage_departments: true,
    manage_leave_types: true,
    manage_permissions: true,
    view_logs: true,
    manage_settings: true,
    apply_leave: true,
    approve_leave: true,
  },
  hr: {
    dashboard: true,
    view_employees: true,
    create_employee: false,
    manage_hr: false,
    manage_departments: false,
    manage_leave_types: false,
    manage_permissions: false,
    view_logs: false,
    manage_settings: false,
    apply_leave: false,
    approve_leave: true,
  },
  employee: {
    dashboard: true,
    view_employees: false,
    create_employee: false,
    manage_hr: false,
    manage_departments: false,
    manage_leave_types: false,
    manage_permissions: false,
    view_logs: false,
    manage_settings: false,
    apply_leave: true,
    approve_leave: false,
  },
};

const permissionGroups = [
  {
    title: "Dashboard",
    permissions: [
      { key: "dashboard", label: "Access Dashboard" },
    ],
  },
  {
    title: "Employee Management",
    permissions: [
      { key: "view_employees", label: "View Employees" },
      { key: "create_employee", label: "Create Employee Accounts" },
      { key: "manage_hr", label: "Manage HR Accounts" },
      { key: "manage_departments", label: "Manage Departments" },
    ],
  },
  {
    title: "Leave Management",
    permissions: [
      { key: "manage_leave_types", label: "Manage Leave Configuration" },
      { key: "apply_leave", label: "Apply for Leave" },
      { key: "approve_leave", label: "Approve or Reject Leave" },
    ],
  },
  {
    title: "System Administration",
    permissions: [
      { key: "manage_permissions", label: "Manage Permissions" },
      { key: "view_logs", label: "View Activity Logs" },
      { key: "manage_settings", label: "Manage System Settings" },
    ],
  },
];

const Permissions = () => {
  const [permissions, setPermissions] = useState(initialPermissions);
  const [selectedRole, setSelectedRole] = useState("admin");
  const [saved, setSaved] = useState(false);

  const handlePermissionChange = (key) => {
    setPermissions((prev) => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [key]: !prev[selectedRole][key],
      },
    }));

    setSaved(false);
  };

  const handleReset = () => {
    setPermissions((prev) => ({
      ...prev,
      [selectedRole]: { ...initialPermissions[selectedRole] },
    }));

    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
  };

  const totalPermissions = permissionGroups.reduce(
    (total, group) => total + group.permissions.length,
    0
  );

  const enabledCount = Object.values(permissions[selectedRole]).filter(
    Boolean
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-green-900">
          Roles & Permissions
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and configure the permissions assigned to each role.
        </p>
      </div>

      {/* Role Selection */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            role: "admin",
            label: "Administrator",
            description: "Full system access.",
            icon: FiShield,
          },
          {
            role: "hr",
            label: "HR",
            description: "Employee and leave management.",
            icon: FiUsers,
          },
          {
            role: "employee",
            label: "Employee",
            description: "Personal leave management.",
            icon: FiLock,
          },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = selectedRole === item.role;

          return (
            <button
              key={item.role}
              onClick={() => {
                setSelectedRole(item.role);
                setSaved(false);
              }}
              className={`rounded-xl border p-5 text-left transition ${
                isSelected
                  ? "border-green-600 bg-green-50 ring-1 ring-green-600"
                  : "border-green-100 bg-white hover:border-green-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex size-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                  <Icon size={22} />
                </div>

                {isSelected && (
                  <span className="badge badge-success">Selected</span>
                )}
              </div>

              <h3 className="mt-4 font-bold text-gray-800">
                {item.label}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Permission Summary */}
      <div className="flex flex-col gap-3 rounded-xl border border-green-100 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold capitalize text-green-900">
            {selectedRole} Permissions
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {enabledCount} of {totalPermissions} permissions enabled.
          </p>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 sm:max-w-xs">
          <div
            className="h-full rounded-full bg-green-600 transition-all"
            style={{
              width: `${(enabledCount / totalPermissions) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Permissions */}
      <div className="space-y-5">
        {permissionGroups.map((group) => (
          <section
            key={group.title}
            className="overflow-hidden rounded-xl border border-green-100 bg-white shadow-sm"
          >
            <div className="border-b border-green-100 bg-green-50 px-5 py-4">
              <h3 className="font-semibold text-green-900">
                {group.title}
              </h3>
            </div>

            <div className="divide-y divide-gray-100">
              {group.permissions.map((permission) => (
                <div
                  key={permission.key}
                  className="flex items-center justify-between gap-3 px-5 py-4"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {permission.label}
                  </span>

                  <input
                    type="checkbox"
                    className="checkbox checkbox-success"
                    checked={permissions[selectedRole][permission.key]}
                    onChange={() =>
                      handlePermissionChange(permission.key)
                    }
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {saved && (
        <div className="alert border border-green-200 bg-green-50 text-green-800">
          <FiShield size={20} />
          <span>Permission changes saved in the current session.</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col justify-end gap-3 sm:flex-row">
        <button onClick={handleReset} className="btn btn-outline">
          <FiRefreshCw size={17} />
          Reset Role
        </button>

        <button
          onClick={handleSave}
          className="btn border-none bg-green-700 text-white hover:bg-green-800"
        >
          <FiSave size={17} />
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Permissions;
