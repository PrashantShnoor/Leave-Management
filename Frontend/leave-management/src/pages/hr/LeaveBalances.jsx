import React, { useEffect, useState , useMemo} from "react";
import axios from "axios";
import BASE_URL from "../../utils/constants";
import {
  FaSearch,
  FaUsers,
  FaCalendarAlt,
  FaPlus,
  FaTimes,
} from "react-icons/fa";

import { BiCalendarCheck } from "react-icons/bi";
import MessageDialog from "../../components/common/MessageDialog";

const LeaveBalances = () => {
  const currentYear = new Date().getFullYear();

  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balances, setBalances] = useState([]);
  const [leaveRequests , setLeaveRequests] = useState([]);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [messageDialog, setMessageDialog] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  const showMessage = (type, message, title = "") => {
    setMessageDialog({
      isOpen: true,
      type,
      title,
      message,
    });
  };

  const closeMessage = () => {
    setMessageDialog((previous) => ({
      ...previous,
      isOpen: false,
    }));
  };

  const [leaveYear, setLeaveYear] = useState(currentYear);
  const [selectedLeaveType, setSelectedLeaveType] = useState("");
  const [allocatedDays, setAllocatedDays] = useState("");

  const getArray = (response) => {
    const data = response.data;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.employees)) return data.employees;
    if (Array.isArray(data?.leaveTypes)) return data.leaveTypes;
    if (Array.isArray(data?.balances)) return data.balances;

    return [];
  };

    const getTodayDate = () => {
      const today = new Date();

      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };
  const fetchData = async () => {
    try {
      setLoading(true);

      const [employeeResponse, leaveTypeResponse, balanceResponse, requestResponse] = 
      await Promise.all([
        axios.get(`${BASE_URL}/getAllEmployees`, {withCredentials: true}),

        axios.get(`${BASE_URL}/getLeaveTypes`, {withCredentials: true}),

        axios.get(`${BASE_URL}/getAllLeaveBalances`, {withCredentials: true}),

        axios.get(`${BASE_URL}/getAllrequest` , {withCredentials: true})
      ]);

      setEmployees(getArray(employeeResponse));
      setLeaveTypes(getArray(leaveTypeResponse));
      setBalances(getArray(balanceResponse));
      setLeaveRequests(requestResponse.data.leave_requests || []);

    } catch (error) {
      console.error("Error fetching leave balance data:", error);
      showMessage("error", error.response?.data?.message || "Unable to load leave balance information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.first_name || ""} ${employee.last_name || ""}`;

    return (
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      employee.email?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setLeaveYear(currentYear);
    setShowAssignModal(false);
  };

  const employeeBalances = balances.filter(
    (balance) =>
      Number(balance.employee_id) === Number(selectedEmployee?.id) &&
      Number(balance.leave_year) === Number(leaveYear)
  );

  const isLeaveAssigned = (leaveTypeId) => {
    return employeeBalances.some(
      (balance) =>
        Number(balance.leave_type_id) === Number(leaveTypeId)
    );
  };

  const unassignedLeaveTypes = leaveTypes.filter(
    (leaveType) => !isLeaveAssigned(leaveType.id)
  );

  const openAssignModal = () => {
    setSelectedLeaveType("");
    setAllocatedDays("");
    setShowAssignModal(true);
  };

  const handleAssignLeave = async (e) => {
    e.preventDefault();

    if (!selectedEmployee) {
      showMessage("warning", "Please select an employee.");
      return;
    }

    if (!selectedLeaveType || !allocatedDays) {
      showMessage("warning", "Please select a leave type and enter allocated days.");
      return;
    }

    const days = Number(allocatedDays);
    const year = Number(leaveYear);

    if (!Number.isFinite(days) || days <= 0) {
      showMessage("warning", "Allocated days must be greater than zero.");
      return;
    }

    if (!Number.isInteger(year) || year < 2000) {
      showMessage("warning", "Please enter a valid leave year.");
      return;
    }

    try {
      setSaving(true);

      const response = await axios.post(
        `${BASE_URL}/createLeavebalance`,
        {
          employee_id: Number(selectedEmployee.id),
          leave_type_id: Number(selectedLeaveType),
          leave_year: year,
          allocated_days: days,
        },{ withCredentials: true}
      );

      showMessage("success", response.data?.message || "Leave balance assigned successfully!");

      setShowAssignModal(false);
      setSelectedLeaveType("");
      setAllocatedDays("");

      await fetchData();

    } catch (error) {
      console.error("Error assigning leave balance:", error);

      showMessage("error", error.response?.data?.message || "Unable to assign leave balance. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const closeEmployeeDetails = () => {
    setSelectedEmployee(null);
    setShowAssignModal(false);
    setSelectedLeaveType("");
    setAllocatedDays("");
  };
   const employeesOnLeave = useMemo(() => {
      const today = getTodayDate();
  
      const employeeIds = new Set();
  
      leaveRequests.forEach((request) => {
        const status = String(request.status || "").toLowerCase();
  
        const startDate = String(request.start_date || "").slice(0, 10);
        const endDate = String(request.end_date || "").slice(0, 10);
  
        const isApproved = status === "approved";
        const isCurrentlyOnLeave =
          startDate <= today && endDate >= today;
  
        if (
          isApproved &&
          isCurrentlyOnLeave &&
          request.employee_id
        ) {
          employeeIds.add(request.employee_id);
        }
      });
  
      return employeeIds.size;
    }, [leaveRequests]);

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-800"> Leave Balances </h1>

        <p className="text-gray-500 mt-1">
          Manage leave allocations for your employees.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="bg-white rounded-xl shadow-sm border border-green-100 p-5 flex items-center gap-4">
          <div className="bg-green-100 text-green-700 p-4 rounded-xl">
            <FaUsers className="text-xl" />
          </div>

          <div>
            <p className="text-sm text-gray-500"> Total Employees</p>

            <h2 className="text-2xl font-bold text-gray-800"> {employees.length} </h2>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-green-100 p-5 flex items-center gap-4">
          <div className="bg-green-100 text-green-700 p-4 rounded-xl">
            <FaCalendarAlt className="text-xl" />
          </div>

          <div className="cursor-pointer">
            <p className="text-sm text-gray-500">
              Employee currently on leave
            </p>

            <h2 className="text-2xl font-bold text-gray-800">
              {loading ? "...." : employeesOnLeave}
            </h2>
          </div>
        </div>

      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">

        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">

          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Employees
            </h2>

            <p className="text-sm text-gray-500">
              Select an employee to manage their leave balance.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />

            <input
              type="text"
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-bordered w-full pl-10 focus:outline-green-500"
            />
          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="table w-full">

            <thead>
              <tr className="text-gray-600">
                <th>Employee</th>
                <th>Email</th>
                <th>Employee ID</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-8">
                    <span className="loading loading-spinner loading-md text-green-600"></span>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">
                    No employees found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (

                  <tr
                    key={employee.id}
                    className="hover:bg-green-50 cursor-pointer"
                    onClick={() => handleEmployeeClick(employee)}
                  >

                    <td>
                      <div className="flex items-center gap-3">

                        <div className="avatar placeholder">
                          <div className="bg-green-100 text-green-700 rounded-full w-10 flex items-center justify-center">
                            <span className="font-semibold">{employee.first_name?.[0]}{employee.last_name?.[0]} </span>
                          </div>
                        </div>

                        <span className="font-semibold text-gray-800">
                          {employee.first_name} {employee.last_name}
                        </span>

                      </div>
                    </td>

                    <td className="text-gray-600">
                      {employee.email}
                    </td>

                    <td>
                      EMP-{employee.id}
                    </td>

                    <td>
                      <button
                        className="btn btn-sm btn-outline btn-success"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEmployeeClick(employee);
                        }}
                      >
                        View Balances
                      </button>
                    </td>

                  </tr>
                ))
              )}

            </tbody>
          </table>

        </div>
      </div>

      {selectedEmployee && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">

            <div className="p-5 border-b flex justify-between items-center">

              <div>
                <h2 className="text-xl font-bold text-gray-800"> Employee Leave Details </h2>

                <p className="text-sm text-gray-500"> Manage allocated leave balances. </p>
              </div>

              <button onClick={closeEmployeeDetails} className="btn btn-sm btn-circle btn-ghost">
                <FaTimes />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-4">

                <div className="bg-green-100 text-green-700 rounded-full w-14 h-14 flex items-center justify-center text-xl font-bold">
                  {selectedEmployee.first_name?.[0]}
                  {selectedEmployee.last_name?.[0]}
                </div>

                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    {selectedEmployee.first_name}{" "}
                    {selectedEmployee.last_name}
                  </h3>

                  <p className="text-sm text-gray-500"> {selectedEmployee.email} </p>

                  <p className="text-xs text-gray-400"> Employee ID: EMP-{selectedEmployee.id} </p>
                </div>

              </div>

              <div className="divider my-0"></div>

              <div className="flex items-center justify-between gap-3">

                <div>
                  <h3 className="font-bold text-gray-800">
                    Assigned Leave Types
                  </h3>

                  <p className="text-xs text-gray-500">
                    Leave balances for the selected year.
                  </p>
                </div>

                <select value={leaveYear} onChange={(e) => setLeaveYear(Number(e.target.value))} className="select select-bordered select-sm">
                  <option value={currentYear}> {currentYear} </option>

                  <option value={currentYear - 1}> {currentYear - 1} </option>

                  <option value={currentYear + 1}> {currentYear + 1} </option>
                </select>

              </div>
              <div className="space-y-3">
                {employeeBalances.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <BiCalendarCheck className="text-4xl text-gray-400 mx-auto mb-2" />
                    <p className="font-semibold text-gray-700"> No leave balances assigned </p>

                    <p className="text-sm text-gray-500"> Assign leave types to this employee. </p>
                  </div>
                ) : (
                  employeeBalances.map((balance) => {

                    const leaveType = leaveTypes.find(
                      (type) =>
                        Number(type.id) === Number(balance.leave_type_id)
                    );

                    const allocated = Number(balance.allocated_days || 0);
                    const used = Number(balance.used_days || 0);
                    const available = allocated - used;

                    return (

                      <div key={balance.id} className="border border-gray-200 rounded-xl p-4" >

                        <div className="flex justify-between items-center mb-4">

                          <h4 className="font-bold text-gray-800">
                            {leaveType?.type || leaveType?.name || "Leave Type"}
                          </h4>
                          <span className="badge badge-success badge-soft">
                            Assigned
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3">

                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">
                              Allocated
                            </p>

                            <p className="text-xl font-bold text-gray-800">
                              {allocated}
                            </p>
                          </div>

                          <div className="bg-orange-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">
                              Used
                            </p>

                            <p className="text-xl font-bold text-gray-800">
                              {used}
                            </p>
                          </div>

                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">
                              Available
                            </p>

                            <p className="text-xl font-bold text-gray-800">
                              {available}
                            </p>
                          </div>

                        </div>

                      </div>

                    );
                  })
                )}

              </div>

              {/* Unassigned Leave Types */}
              <div className="space-y-3">

                <h3 className="font-bold text-gray-800">
                  Unassigned Leave Types
                </h3>

                {unassignedLeaveTypes.length === 0 ? (

                  <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                    All available leave types have been assigned for this year.
                  </p>

                ) : (

                  unassignedLeaveTypes.map((leaveType) => (

                    <div
                      key={leaveType.id}
                      className="flex justify-between items-center border border-dashed border-gray-300 rounded-xl p-3"
                    >

                      <div>
                        <p className="font-semibold text-gray-800">
                          {leaveType.type || leaveType.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          Not assigned to this employee
                        </p>
                      </div>

                      <span className="badge badge-warning badge-soft">
                        Not Assigned
                      </span>

                    </div>

                  ))
                )}

              </div>

              {/* Assign New Leave Type Button */}
              {unassignedLeaveTypes.length > 0 && (

                <button
                  type="button"
                  onClick={openAssignModal}
                  className="btn bg-green-600 hover:bg-green-700 text-white w-full"
                >
                  <FaPlus />
                  Assign New Leave Type
                </button>

              )}

            </div>

          </div>
        </div>
      )}

      {showAssignModal && selectedEmployee && (

        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl">

            {/* Modal Header */}
            <div className="p-5 border-b flex justify-between items-center">

              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  Assign Leave Balance
                </h2>

                <p className="text-sm text-gray-500">
                  {selectedEmployee.first_name}{" "}
                  {selectedEmployee.last_name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <FaTimes />
              </button>

            </div>

            <form
              onSubmit={handleAssignLeave}
              className="p-5 space-y-4"
            >

              <div>
                <label className="label font-semibold">
                  Leave Type
                </label>
                <select
                  value={selectedLeaveType}
                  onChange={(e) => setSelectedLeaveType(e.target.value)}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">
                    Select Leave Type
                  </option>
                  {unassignedLeaveTypes.map((type) => (

                    <option key={type.id} value={type.id}>
                      {type.type || type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>

                <label className="label font-semibold">
                  Leave Year
                </label>

                <input
                  type="number"
                  value={leaveYear}
                  onChange={(e) => setLeaveYear(Number(e.target.value))}
                  className="input input-bordered w-full"
                  required
                />

              </div>

              <div>
                <label className="label font-semibold">
                  Allocated Days
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={allocatedDays}
                  onChange={(e) => setAllocatedDays(e.target.value)}
                  placeholder="Enter allocated days"
                  className="input input-bordered w-full"
                  required
                />

                <p className="text-xs text-gray-500 mt-1">
                  Enter the total number of days allocated to this leave type.
                </p>

              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="btn btn-ghost"
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || unassignedLeaveTypes.length === 0}
                  className="btn bg-green-600 hover:bg-green-700 text-white"
                >
                  {saving ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <>
                      <FaPlus />
                      Assign Leave
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default LeaveBalances;
