import React from "react";
const DetailItem = ({ icon, label, value }) => {
  return (
    <div className="rounded-xl border border-base-300 p-3">
      <div className="mb-2 flex items-center gap-2 text-base-content/50">
        {icon}
        <span className="text-xs">{label}</span>
      </div>

      <p className="font-semibold text-base-content">{value}</p>
    </div>
  );
};

export default DetailItem;
