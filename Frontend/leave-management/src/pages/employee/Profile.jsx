
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiUser,
  FiMail,
  FiBriefcase,
  FiCalendar,
  FiShield,
  FiX,
} from "react-icons/fi";

import DetailItem from "../../components/common/DetailItem";
import StatusBadge from "../../components/common/StatusBadge";
import BASE_URL from "../../utils/constants";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch logged-in employee profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await axios.get(
        `${BASE_URL}/getemployee`,
        {
          withCredentials: true,
        }
      );

      setProfile(response.data.data);
    } catch (error) {
      console.error(
        "Fetch profile error:",
        error.response?.data || error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to fetch profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <span className="loading loading-spinner loading-lg text-green-700" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="alert border border-red-200 bg-red-50 text-red-700">
        <span>{errorMessage}</span>
        <button
          className="btn btn-ghost btn-xs"
          onClick={fetchProfile}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-green-900">
          My Profile
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          View your personal and employment information.
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-green-100 bg-white shadow-sm">

        <div className="h-28 bg-linear-to-r from-green-700 to-green-500" />

        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">

          <div className="-mt-12 flex size-24 items-center justify-center rounded-2xl border-4 border-white bg-green-100 text-3xl font-bold text-green-800 shadow-sm">
            {profile.first_name?.charAt(0) || ""}
            {profile.last_name?.charAt(0) || ""}
          </div>

          <div className="sm:pb-1">
            <h2 className="text-xl font-bold text-gray-900">
              {profile.first_name} {profile.last_name}
            </h2>

            <p className="text-sm text-gray-500">
              {profile.email}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="badge badge-outline border-green-300 text-green-700">
                {profile.role?.toUpperCase() || "N/A"}
              </span>
            </div>
          </div>

        </div>
      </div>
      <section className="overflow-hidden rounded-xl border border-green-100 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-green-100 bg-green-50 px-5 py-4">
          <FiUser className="text-green-700" size={20} />

          <div>
            <h2 className="font-bold text-green-900">
              Personal Information
            </h2>
            <p className="text-xs text-gray-500">
              Your registered personal details.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2">

          <DetailItem label="First Name" value={profile.first_name || "N/A"} icon={<FiUser />} />

          <DetailItem label="Last Name" value={profile.last_name || "N/A"} icon={<FiUser />} />

          <DetailItem label="Email Address" value={profile.email || "N/A"} icon={<FiMail />} />

        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-green-100 bg-white shadow-sm">

        <div className="flex items-center gap-3 border-b border-green-100 bg-green-50 px-5 py-4">
          <FiBriefcase className="text-green-700" size={20} />

          <div>
            <h2 className="font-bold text-green-900">
              Employment Information
            </h2>
            <p className="text-xs text-gray-500">
              Your official account information.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2">

          <DetailItem label="Employee ID" value={profile.id || "N/A"} icon={<FiUser />} />

          <DetailItem label="Account Role" value={profile.role || "N/A"} icon={<FiShield />} />

          <DetailItem label="Joining Date" value={formatDate(profile.created_at)} icon={<FiCalendar />} />
        </div>
      </section>

    </div>
  );
};

export default Profile;
