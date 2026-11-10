import React from "react";
const SummaryCard = ({ title, count, icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
  };

  const iconColors = {
    blue: "bg-blue-100",
    orange: "bg-orange-100",
    green: "bg-emerald-100",
    red: "bg-red-100",
  };

  return (
    <div className={`rounded-2xl p-4 shadow-sm ${colors[color]}`}>
      <div className="flex items-center gap-3">
        <div className={`flex size-10 items-center justify-center rounded-full ${iconColors[color]}`}> {icon} </div>
        <div>
          <h2 className="text-2xl font-bold">{count}</h2>
          <p className="text-sm font-medium">{title}</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
