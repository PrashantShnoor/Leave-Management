
import React, { useMemo, useState } from "react";
import {
  FiActivity,
  FiSearch,
  FiUser,
  FiFilter,
  FiCalendar,
} from "react-icons/fi";

import SummaryCard from "../../components/common/SummaryCard";
import DataTable from "../../components/common/DataTable";

const ActivityLogs = () => {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const [activities] = useState([
    {
      id: 1,
      performed_by: "Admin",
      action: "Employee Created",
      description: "Created a new employee account for Rahul Sharma.",
      date: "2026-11-05",
      time: "09:30 AM",
      category: "Employee",
    },
    {
      id: 2,
      performed_by: "Admin",
      action: "HR Account Created",
      description: "Created an HR account for Anjali Mehta.",
      date: "2026-11-04",
      time: "02:15 PM",
      category: "HR",
    },
    {
      id: 3,
      performed_by: "Admin",
      action: "Department Created",
      description: "Added the Engineering department.",
      date: "2026-11-04",
      time: "11:45 AM",
      category: "Department",
    },
    {
      id: 4,
      performed_by: "Admin",
      action: "Leave Type Updated",
      description: "Updated annual leave allocation to 20 days.",
      date: "2026-11-03",
      time: "10:20 AM",
      category: "Configuration",
    },
    {
      id: 5,
      performed_by: "HR",
      action: "Leave Approved",
      description: "Approved a leave request for Priya Verma.",
      date: "2026-11-03",
      time: "09:00 AM",
      category: "Leave",
    },
    {
      id: 6,
      performed_by: "Admin",
      action: "Employee Deactivated",
      description: "Deactivated an employee account.",
      date: "2026-11-02",
      time: "04:30 PM",
      category: "Employee",
    },
    {
      id: 7,
      performed_by: "HR",
      action: "Leave Rejected",
      description: "Rejected a leave request.",
      date: "2026-11-01",
      time: "01:10 PM",
      category: "Leave",
    },
  ]);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch =
        activity.action.toLowerCase().includes(search.toLowerCase()) ||
        activity.performed_by.toLowerCase().includes(search.toLowerCase()) ||
        activity.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        actionFilter === "all" ||
        activity.category === actionFilter;

      return matchesSearch && matchesCategory;
    });
  }, [activities, search, actionFilter]);

  const columns = [
    {
      key: "performed_by",
      label: "Performed By",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-green-100 text-green-700">
            <FiUser size={17} />
          </div>
          <span className="font-medium">{row.performed_by}</span>
        </div>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <span className="font-semibold text-gray-800">
          {row.action}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
    },
    {
      key: "category",
      label: "Category",
      render: (row) => (
        <span className="badge badge-ghost">{row.category}</span>
      ),
    },
    {
      key: "date",
      label: "Date & Time",
      render: (row) => (
        <div>
          <p className="text-sm font-medium">{row.date}</p>
          <p className="text-xs text-gray-500">{row.time}</p>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-green-900">
          Activity Logs
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor administrative and HR activities across the system.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Total Activities"
          count={activities.length}
          icon={<FiActivity size={20} />}
          color="green"
        />

        <SummaryCard
          title="Admin Activities"
          count={
            activities.filter((item) => item.performed_by === "Admin")
              .length
          }
          icon={<FiUser size={20} />}
          color="blue"
        />

        <SummaryCard
          title="HR Activities"
          count={
            activities.filter((item) => item.performed_by === "HR").length
          }
          icon={<FiCalendar size={20} />}
          color="orange"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-green-100 bg-white p-4 md:flex-row">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity, user or description..."
            className="input input-bordered w-full pl-10"
          />
        </div>

        <div className="relative">
          <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="select select-bordered w-full pl-10 md:w-52"
          >
            <option value="all">All Categories</option>
            <option value="Employee">Employee</option>
            <option value="HR">HR</option>
            <option value="Department">Department</option>
            <option value="Configuration">Configuration</option>
            <option value="Leave">Leave</option>
          </select>
        </div>
      </div>

      {/* Activity Table */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">
            System Activity History
          </h2>
          <span className="text-sm text-gray-500">
            {filteredActivities.length} activities
          </span>
        </div>

        <DataTable
          columns={columns}
          data={filteredActivities}
          emptyMessage="No activities found."
        />
      </section>

      <div className="rounded-xl border border-green-100 bg-green-50 p-4">
        <div className="flex items-start gap-3">
          <FiActivity className="mt-1 text-green-700" size={20} />
          <div>
            <h3 className="font-semibold text-green-900">
              Activity Monitoring
            </h3>
            <p className="mt-1 text-sm text-green-800">
              This page is currently displaying sample activity records.
              Actual audit logs will be loaded from the backend when
              connected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
