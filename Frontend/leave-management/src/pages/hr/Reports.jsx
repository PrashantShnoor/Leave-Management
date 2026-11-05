import React, { useMemo, useState } from "react";
import { FiDownload, FiFileText, FiCheckCircle, FiClock } from "react-icons/fi";

const Reports = () => {
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");

  const leaveRecords = [
    {
      id: 1,
      employee: "Rahul Sharma",
      department: "Engineering",
      leaveType: "Casual Leave",
      from: "2026-11-10",
      to: "2026-11-12",
      days: 3,
      status: "Pending",
    },
    {
      id: 2,
      employee: "Priya Singh",
      department: "Human Resources",
      leaveType: "Sick Leave",
      from: "2026-11-08",
      to: "2026-11-09",
      days: 2,
      status: "Approved",
    },
    {
      id: 3,
      employee: "Amit Kumar",
      department: "Finance",
      leaveType: "Annual Leave",
      from: "2026-10-15",
      to: "2026-10-19",
      days: 5,
      status: "Approved",
    },
    {
      id: 4,
      employee: "Neha Verma",
      department: "Marketing",
      leaveType: "Casual Leave",
      from: "2026-11-05",
      to: "2026-11-05",
      days: 1,
      status: "Rejected",
    },
    {
      id: 5,
      employee: "Rohit Gupta",
      department: "Engineering",
      leaveType: "Sick Leave",
      from: "2026-10-20",
      to: "2026-10-21",
      days: 2,
      status: "Approved",
    },
  ];

  const filteredRecords = useMemo(() => {
    return leaveRecords.filter((record) => {
      const matchesStatus =
        status === "All" || record.status === status;

      const matchesSearch =
        record.employee.toLowerCase().includes(search.toLowerCase()) ||
        record.department.toLowerCase().includes(search.toLowerCase()) ||
        record.leaveType.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [status, search]);

  const approvedCount = filteredRecords.filter(
    (record) => record.status === "Approved"
  ).length;

  const pendingCount = filteredRecords.filter(
    (record) => record.status === "Pending"
  ).length;

  const totalDays = filteredRecords.reduce(
    (total, record) => total + record.days,
    0
  );

  const formatDate = (date) => {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const exportCSV = () => {
    const headers = [
      "Employee",
      "Department",
      "Leave Type",
      "From",
      "To",
      "Days",
      "Status",
    ];

    const rows = filteredRecords.map((record) => [
      record.employee,
      record.department,
      record.leaveType,
      record.from,
      record.to,
      record.days,
      record.status,
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "leave-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const getStatusClass = (value) => {
    if (value === "Approved") return "bg-green-100 text-green-700";
    if (value === "Pending") return "bg-yellow-100 text-yellow-700";
    if (value === "Rejected") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leave Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review employee leave history and generate reports.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="btn border-none bg-green-600 text-white hover:bg-green-700"
        >
          <FiDownload /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Requests</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-800">
                {filteredRecords.length}
              </h2>
            </div>
            <FiFileText className="text-2xl text-blue-600" />
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Approved Requests</p>
              <h2 className="mt-2 text-2xl font-bold text-green-600">
                {approvedCount}
              </h2>
            </div>
            <FiCheckCircle className="text-2xl text-green-600" />
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Requests</p>
              <h2 className="mt-2 text-2xl font-bold text-yellow-600">
                {pendingCount}
              </h2>
            </div>
            <FiClock className="text-2xl text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            placeholder="Search employee, department or leave type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered flex-1"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="select select-bordered w-full md:w-52"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="mb-5 rounded-lg bg-green-50 p-4">
          <p className="text-sm text-green-800">
            <span className="font-semibold">{totalDays} leave days</span> are
            represented in the currently filtered records.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="text-gray-500">
                <th>Employee</th>
                <th>Department</th>
                <th>Leave Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td className="font-medium text-gray-800">
                    {record.employee}
                  </td>
                  <td>{record.department}</td>
                  <td>{record.leaveType}</td>
                  <td>{formatDate(record.from)}</td>
                  <td>{formatDate(record.to)}</td>
                  <td>{record.days}</td>
                  <td>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                        record.status
                      )}`}
                    >
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    No leave records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;