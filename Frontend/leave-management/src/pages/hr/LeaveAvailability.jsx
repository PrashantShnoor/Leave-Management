import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaCalendarAlt,
  FaUsers,
  FaSearch,
  FaFilter,
  FaTimes,
} from "react-icons/fa";
import { BiCalendarCheck } from "react-icons/bi";
import BASE_URL from "../../utils/constants";
import MessageDialog from "../../components/common/MessageDialog";

const toInputDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const getArray = (response, keys = []) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
};

const LeaveAvailability = () => {
  const today = toInputDate(new Date());

  const [employees, setEmployees] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState("");

  const [messageDialog, setMessageDialog] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  const showMessage = (type, message, title = "") =>
    setMessageDialog({ isOpen: true, type, title, message });

  const closeMessage = () =>
    setMessageDialog((previous) => ({ ...previous, isOpen: false }));

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeeResponse, requestResponse] = await Promise.all([
        axios.get(`${BASE_URL}/getAllEmployees`, { withCredentials: true }),
        axios.get(`${BASE_URL}/getAllrequest`, { withCredentials: true }),
      ]);

      setEmployees(getArray(employeeResponse, ["employees"]));
      setRequests(
        getArray(requestResponse, ["leave_requests", "requests"])
      );
    } catch (error) {
      console.error("Error loading leave availability:", error);
      showMessage(
        "error",
        error.response?.data?.message ||
          "Unable to load employee leave information. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const employeeMap = useMemo(
    () => new Map(employees.map((employee) => [Number(employee.id), employee])),
    [employees]
  );

  const approvedLeaves = useMemo(
    () =>
      requests
        .filter(
          (request) =>
            String(request.status || "").toLowerCase() === "approved" &&
            request.start_date &&
            request.end_date
        )
        .map((request) => {
          const employee =
            employeeMap.get(Number(request.employee_id)) ||
            request.employee ||
            {};
          const employeeName =
            `${employee.first_name || ""} ${employee.last_name || ""}`.trim() ||
            employee.name ||
            "Unknown employee";

          return {
            ...request,
            employeeName,
            employeeEmail:
              employee.email || request.employee_email || "",
            start: String(request.start_date).slice(0, 10),
            end: String(request.end_date).slice(0, 10),
          };
        }),
    [requests, employeeMap]
  );

  const currentOnLeave = useMemo(
    () => approvedLeaves.filter((leave) => leave.start <= today && leave.end >= today),
    [approvedLeaves, today]
  );

  const periodLeaves = useMemo(() => {
    if (!startDate || !endDate || startDate > endDate) return [];

    return approvedLeaves
      .filter((leave) => leave.start <= endDate && leave.end >= startDate)
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [approvedLeaves, startDate, endDate]);

  const filteredLeaves = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return periodLeaves;

    return periodLeaves.filter(
      (leave) =>
        leave.employeeName.toLowerCase().includes(query) ||
        leave.employeeEmail.toLowerCase().includes(query) ||
        String(leave.employee_id || "").includes(query)
    );
  }, [periodLeaves, search]);

  const overlapDays = useMemo(() => {
    if (!startDate || !endDate || startDate > endDate) return [];

    const days = [];
    const cursor = new Date(`${startDate}T00:00:00`);
    const last = new Date(`${endDate}T00:00:00`);
    let count = 0;

    while (cursor <= last && count < 366) {
      const date = toInputDate(cursor);
      const onLeave = periodLeaves.filter(
        (leave) => leave.start <= date && leave.end >= date
      );
      days.push({ date, employees: onLeave, count: onLeave.length });
      cursor.setDate(cursor.getDate() + 1);
      count += 1;
    }
    return days;
  }, [periodLeaves, startDate, endDate]);

  const overlappingDays = overlapDays.filter((day) => day.count > 1);
  const selectedDay = overlapDays.find((day) => day.date === selectedDate);

  const resetFilters = () => {
    setStartDate(today);
    setEndDate(today);
    setSearch("");
    setSelectedDate("");
  };

  const changeStartDate = (value) => {
    setStartDate(value);
    setSelectedDate("");
    if (endDate && value > endDate) setEndDate(value);
  };

  const changeEndDate = (value) => {
    setEndDate(value);
    setSelectedDate("");
    if (startDate && value < startDate) setStartDate(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Employee Leave Availability
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor approved employee leaves and identify overlapping absences.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="btn btn-sm btn-outline btn-success"
        >
          {loading ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <FaCalendarAlt />
          )}
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-green-100 bg-white p-5 shadow-sm">
          <div className="rounded-xl bg-green-100 p-4 text-green-700">
            <FaUsers className="text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Employees on leave today</p>
            <h2 className="text-2xl font-bold text-gray-800">
              {loading ? "—" : currentOnLeave.length}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="rounded-xl bg-blue-100 p-4 text-blue-700">
            <FaCalendarAlt className="text-xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Employees in selected period</p>
            <h2 className="text-2xl font-bold text-gray-800">
              {loading ? "—" : new Set(periodLeaves.map((leave) => leave.employee_id)).size}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-orange-100 bg-white p-5 shadow-sm">
          <div className="rounded-xl bg-orange-100 p-4 text-orange-700">
            <BiCalendarCheck className="text-2xl" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Overlapping dates</p>
            <h2 className="text-2xl font-bold text-gray-800">
              {loading ? "—" : overlappingDays.length}
            </h2>
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <FaFilter className="text-green-600" />
          <h2 className="font-bold text-gray-800">Filter by dates</h2>
        </div>
        <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-[1fr_1fr_auto]">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              From date
            </label>
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(event) => changeStartDate(event.target.value)}
              className="input input-bordered w-full focus:border-green-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              To date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => changeEndDate(event.target.value)}
              className="input input-bordered w-full focus:border-green-500 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="btn btn-ghost border border-gray-200"
          >
            <FaTimes />
            Reset
          </button>
        </div>
        {startDate && endDate && startDate > endDate && (
          <p className="mt-3 text-sm text-red-600">
            The end date must be on or after the start date.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h2 className="font-bold text-gray-800">Overlapping leave dates</h2>
          <p className="mt-1 text-sm text-gray-500">
            Select a date to see which employees are absent at the same time.
          </p>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="py-8 text-center">
              <span className="loading loading-spinner loading-md text-green-600" />
            </div>
          ) : overlappingDays.length === 0 ? (
            <div className="rounded-xl bg-gray-50 px-4 py-8 text-center">
              <BiCalendarCheck className="mx-auto mb-2 text-4xl text-gray-400" />
              <p className="font-semibold text-gray-700">
                No overlapping leave dates
              </p>
              <p className="mt-1 text-sm text-gray-500">
                No date in this period has more than one approved leave.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {overlappingDays.map((day) => (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setSelectedDate(day.date)}
                  className={`rounded-xl border p-4 text-left transition ${
                    selectedDate === day.date
                      ? "border-green-500 bg-green-50 ring-2 ring-green-100"
                      : "border-orange-100 bg-orange-50/60 hover:border-orange-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-gray-800">
                      {formatDate(day.date)}
                    </span>
                    <span className="badge badge-warning badge-soft">
                      {day.count} on leave
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                    {day.employees.map((leave) => leave.employeeName).join(", ")}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-green-700">
                    View employees
                  </p>
                </button>
              ))}
            </div>
          )}

          {selectedDay && (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-gray-800">
                    Employees on leave — {formatDate(selectedDay.date)}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {selectedDay.count} employees have approved leave on this date.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDate("")}
                  aria-label="Close selected date details"
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {selectedDay.employees.map((leave) => (
                  <div
                    key={leave.id || `${leave.employee_id}-${leave.start}-${leave.end}`}
                    className="rounded-lg border border-green-100 bg-white p-3"
                  >
                    <p className="font-semibold text-gray-800">
                      {leave.employeeName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {leave.employeeEmail || `Employee ID: ${leave.employee_id}`}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDate(leave.start)} – {formatDate(leave.end)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-bold text-gray-800">
              Employees on leave in selected period
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Approved leave requests that overlap the selected dates.
            </p>
          </div>
          <div className="relative w-full lg:w-72">
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employee..."
              className="input input-bordered w-full pl-10 focus:border-green-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="text-gray-600">
                <th>Employee</th>
                <th>Employee ID</th>
                <th>From date</th>
                <th>To date</th>
                <th>Requested days</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center">
                    <span className="loading loading-spinner loading-md text-green-600" />
                  </td>
                </tr>
              ) : filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-gray-500">
                    No approved leaves found for the selected dates.
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => (
                  <tr
                    key={leave.id || `${leave.employee_id}-${leave.start}-${leave.end}`}
                  >
                    <td>
                      <div className="font-semibold text-gray-800">
                        {leave.employeeName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {leave.employeeEmail}
                      </div>
                    </td>
                    <td>EMP-{leave.employee_id}</td>
                    <td>{formatDate(leave.start)}</td>
                    <td>{formatDate(leave.end)}</td>
                    <td>{leave.requested_days ?? "—"}</td>
                    <td>
                      <span className="badge badge-success badge-soft">
                        Approved
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
          Showing {filteredLeaves.length} approved leave request(s).
        </div>
      </section>

      <MessageDialog
        isOpen={messageDialog.isOpen}
        onClose={closeMessage}
        type={messageDialog.type}
        title={messageDialog.title}
        message={messageDialog.message}
      />
    </div>
  );
};

export default LeaveAvailability;
