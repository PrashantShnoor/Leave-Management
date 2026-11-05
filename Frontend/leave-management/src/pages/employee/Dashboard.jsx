import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import BASE_URL from "../../utils/constants";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const [leaveBalances, setLeaveBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const response = await axios.get( BASE_URL + "/getLeavebalance",
        { withCredentials: true }
      );

      setLeaveBalances(response.data.employee_balance || []);
      console.log(response.data.employee_balance);

    } catch (error) {
      setError("Unable to fetch leave information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
    // console.log(leaveBalances);
  }, []);
  
  const summary = useMemo(() => {
    const allocated = leaveBalances.reduce(
      (total, leave) => total + Number(leave.allocated_days || 0),
      0
    );

    const used = leaveBalances.reduce(
      (total, leave) => total + Number(leave.used_days || 0),
      0
    );

    const pending = null;

    return {
      allocated,
      used,
      pending,
      available: allocated - used,
    };
  }, [leaveBalances]);

  const leaveTypeNames = {
    1: "Annual Leave",
    2: "Sick Leave",
    3: "Casual Leave",
    4: "Leave Without Pay",
  };
  const leaveTypes = useMemo(() => {
    return leaveBalances.map((leave) => ({
      id: leave.id,

      name: leaveTypeNames[leave.leave_type_id] || "Unknown Leave",

      allocated: Number(leave.allocated_days || 0),

      used: Number(leave.used_days || 0),

      available: Number(leave.allocated_days || 0) - Number(leave.used_days || 0),

      pending: leave.pending_days == null ? null : Number(leave.pending_days),
    }));
  }, [leaveBalances]);

  const summaryCards = [
    {
      title: "Allocated Leaves",
      value: summary.allocated,
      color: "bg-success/20",
    },
    {
      title: "Available Leaves",
      value: summary.available,
      color: "bg-success/20",
    },
    {
      title: "Used Leaves",
      value: summary.used,
      color: "bg-red-300",
    },
    {
      title: "Pending approval",
      value: summary.pending ?? "—",
      color: "bg-yellow-100",
    },
  ];

  const leaveSections = [
    {
      title: "Allocated leave types",
      key: "allocated",
      color: "bg-success/20",
    },
    {
      title: "Available leave types",
      key: "available",
      color: "bg-success/20",
    },
    {
      title: "Used leave types",
      key: "used",
      color: "bg-red-300",
    },
    {
      title: "Pending leave types",
      key: "pending",
      color: "bg-yellow-100",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        {error}
        <button className="btn btn-sm" onClick={fetchLeaves}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

        {summaryCards.map((card, index) => (
          <div
            key={index}
            className="card bg-base-100 shadow-md"
          >
            <div className="card-body flex-row items-center justify-between p-4">

              <div className={`${card.color} text-success-content rounded-sm px-3 py-1 text-center`}>
                <h2 className="text-4xl font-semibold">
                  {card.value}
                </h2>
                <p className="text-xs uppercase">Days</p>
              </div>

              <div className="flex-1 ml-3">
                <h3 className="text-base font-medium leading-tight text-primary">
                  {card.title}
                </h3>
              </div>

              {index === 0 && (
                <button
                  className="btn btn-outline btn-primary btn-sm"
                  onClick={() => navigate("/leaves")}
                >
                  Apply
                </button>
              )}

            </div>
          </div>
        ))}

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

        {leaveSections.map((section) => (
          <div key={section.key}>

            <ul className="list bg-base-100 rounded-box shadow-md">

              <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
                {section.title}
              </li>

              {leaveTypes.map((leave) => (
                <li
                  key={leave.id}
                  className="list-row"
                >

                  <div className={`${section.color} text-success-content rounded-sm px-3 py-1 text-center`}>
                    <h2 className="text-2xl font-semibold">
                      {leave[section.key] ?? "—"}
                    </h2>
                    <p className="text-xs uppercase">Days</p>
                  </div>

                  <div>
                    <div>{leave.name}</div>

                    <div className="text-xs uppercase font-semibold opacity-60">
                      {section.key === "allocated" && "Total allocated"}
                      {section.key === "available" && "Remaining leaves"}
                      {section.key === "used" && "Leaves consumed"}
                      {section.key === "pending" && "Awaiting approval"}
                    </div>
                  </div>

                </li>
              ))}

              {leaveTypes.length === 0 && (
                <li className="p-4 text-sm opacity-60">
                  No leave balances found.
                </li>
              )}

            </ul>

          </div>
        ))}

      </div>

    </div>
  );
};

export default Dashboard;
