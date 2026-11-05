import React from "react";

const StatusBadge = ({ status }) => {
  const statusStyles = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-700",
    paid: "bg-blue-100 text-blue-700",
    active: "bg-green-100 text-green-700",
    inactive: "bg-red-100 text-red-700",
  };

  const normalizedStatus = status?.toLowerCase() || "unknown";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
        statusStyles[normalizedStatus] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
};

export default StatusBadge;
