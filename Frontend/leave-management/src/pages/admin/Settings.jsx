
import React, { useState } from "react";
import {
  FiSettings,
  FiUser,
  FiBell,
  FiShield,
  FiSave,
  FiRefreshCw,
} from "react-icons/fi";
import { FaBuilding } from "react-icons/fa";

const Settings = () => {
  const [profile, setProfile] = useState({
    first_name: "System",
    last_name: "Administrator",
    email: "admin@company.com",
  });

  const [company, setCompany] = useState({
    company_name: "Shnoor International LLC",
    support_email: "support@company.com",
    timezone: "Asia/Kolkata",
  });

  const [preferences, setPreferences] = useState({
    email_notifications: true,
    leave_notifications: true,
    account_notifications: true,
    two_factor: false,
  });

  const [saved, setSaved] = useState(false);

  const handleProfileChange = (e) => {
    setProfile((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setSaved(false);
  };

  const handleCompanyChange = (e) => {
    setCompany((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setSaved(false);
  };

  const handlePreferenceChange = (e) => {
    setPreferences((prev) => ({
      ...prev,
      [e.target.name]: e.target.checked,
    }));
    setSaved(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
  };

  const handleReset = () => {
    setProfile({
      first_name: "System",
      last_name: "Administrator",
      email: "admin@company.com",
    });

    setCompany({
      company_name: "Shnoor International LLC",
      support_email: "support@company.com",
      timezone: "Asia/Kolkata",
    });

    setPreferences({
      email_notifications: true,
      leave_notifications: true,
      account_notifications: true,
      two_factor: false,
    });

    setSaved(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-green-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your administrator profile and system preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Admin Profile */}
        <section className="rounded-xl border border-green-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-green-100 bg-green-50 px-5 py-4">
            <FiUser size={21} className="text-green-700" />
            <div>
              <h2 className="font-bold text-green-900">
                Administrator Profile
              </h2>
              <p className="text-xs text-gray-500">
                Manage your personal account information.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
            <div>
              <label className="label font-semibold">First Name</label>
              <input
                type="text"
                name="first_name"
                value={profile.first_name}
                onChange={handleProfileChange}
                className="input input-bordered w-full"
                required
              />
            </div>

            <div>
              <label className="label font-semibold">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={profile.last_name}
                onChange={handleProfileChange}
                className="input input-bordered w-full"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="label font-semibold">Email Address</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                className="input input-bordered w-full"
                required
              />
            </div>
          </div>
        </section>

        {/* Company Settings */}
        <section className="rounded-xl border border-green-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-green-100 bg-green-50 px-5 py-4">
            <FaBuilding size={21} className="text-green-700" />
            <div>
              <h2 className="font-bold text-green-900">
                Company Information
              </h2>
              <p className="text-xs text-gray-500">
                Organization details and regional preferences.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="label font-semibold">
                Company Name
              </label>
              <input
                type="text"
                name="company_name"
                value={company.company_name}
                onChange={handleCompanyChange}
                className="input input-bordered w-full"
                required
              />
            </div>

            <div>
              <label className="label font-semibold">
                Support Email
              </label>
              <input
                type="email"
                name="support_email"
                value={company.support_email}
                onChange={handleCompanyChange}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="label font-semibold">Timezone</label>
              <select
                name="timezone"
                value={company.timezone}
                onChange={handleCompanyChange}
                className="select select-bordered w-full"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Asia/Dubai">Asia/Dubai</option>
                <option value="Europe/London">Europe/London</option>
                <option value="America/New_York">America/New York</option>
              </select>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="rounded-xl border border-green-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-green-100 bg-green-50 px-5 py-4">
            <FiBell size={21} className="text-green-700" />
            <div>
              <h2 className="font-bold text-green-900">
                Notification Preferences
              </h2>
              <p className="text-xs text-gray-500">
                Choose which notifications you want to receive.
              </p>
            </div>
          </div>

          <div className="divide-y divide-gray-100 px-5">
            {[
              {
                key: "email_notifications",
                title: "Email Notifications",
                description: "Receive system notifications through email.",
              },
              {
                key: "leave_notifications",
                title: "Leave Notifications",
                description: "Get notified about leave requests and decisions.",
              },
              {
                key: "account_notifications",
                title: "Account Notifications",
                description: "Receive updates about employee and HR accounts.",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.description}
                  </p>
                </div>

                <input
                  type="checkbox"
                  name={item.key}
                  checked={preferences[item.key]}
                  onChange={handlePreferenceChange}
                  className="toggle toggle-success"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Security */}
        <section className="rounded-xl border border-green-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-green-100 bg-green-50 px-5 py-4">
            <FiShield size={21} className="text-green-700" />
            <div>
              <h2 className="font-bold text-green-900">
                Security Preferences
              </h2>
              <p className="text-xs text-gray-500">
                Configure additional account security options.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 p-5">
            <div>
              <p className="font-medium text-gray-800">
                Two-Factor Authentication
              </p>
              <p className="text-sm text-gray-500">
                Enable an additional verification step for account access.
              </p>
            </div>

            <input
              type="checkbox"
              name="two_factor"
              checked={preferences.two_factor}
              onChange={handlePreferenceChange}
              className="toggle toggle-success"
            />
          </div>
        </section>

        {/* Save Actions */}
        {saved && (
          <div className="alert border border-green-200 bg-green-50 text-green-800">
            <FiShield size={20} />
            <span>Settings saved in the current session.</span>
          </div>
        )}

        <div className="flex flex-col justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-outline"
          >
            <FiRefreshCw size={17} />
            Reset Changes
          </button>

          <button
            type="submit"
            className="btn border-none bg-green-700 text-white hover:bg-green-800"
          >
            <FiSave size={17} />
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
