import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiBriefcase,
  FiPlus,
  FiSearch,
  FiDownload,
} from "react-icons/fi";

import HRAccountForm from "../../components/admin/HrAccountForm";
import SummaryCard from "../../components/common/SummaryCard";
import DataTable from "../../components/common/DataTable";
import BASE_URL from "../../utils/constants";

const PAGE_SIZE = 10;

const downloadCsv = (headers, rows, filename) => {
  const escapeValue = (value) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeValue).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


const HrAccounts = () => {
  const [hrAccounts, setHrAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchHrAccounts = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await axios.get(
        `${BASE_URL}/getAllHrAccounts`,
        {
          withCredentials: true,
        }
      );

      setHrAccounts(response.data.data || []);
    } catch (error) {
      console.error(
        "Fetch HR accounts error:",
        error.response?.data || error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to fetch HR accounts."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHrAccounts();
  }, []);

  const filteredAccounts = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return hrAccounts.filter((account) => {
      const fullName =
        `${account.first_name} ${account.last_name}`.toLowerCase();

      return (
        fullName.includes(searchValue) ||
        account.email.toLowerCase().includes(searchValue)
      );
    });
  }, [hrAccounts, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / PAGE_SIZE));
  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleExportCsv = () => {
    downloadCsv(
      ["HR ID", "First Name", "Last Name", "Email", "Role"],
      filteredAccounts.map((account) => [
        account.id,
        account.first_name,
        account.last_name,
        account.email,
        account.role || "HR",
      ]),
      "hr-account-records.csv"
    );
  };

  const handleCreateAccount = async (accountData) => {
    try {
      setCreating(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await axios.post(
        `${BASE_URL}/createHrAccount`,
        {
          first_name: accountData.first_name,
          last_name: accountData.last_name,
          email: accountData.email,
          password: accountData.password,
        },
        {
          withCredentials: true,
        }
      );

      setSuccessMessage(
        response.data.message || "HR account created successfully."
      );

      setShowForm(false);

      await fetchHrAccounts();
    } catch (error) {
      console.error(
        "Create HR account error:",
        error.response?.data || error
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to create HR account."
      );
    } finally {
      setCreating(false);
    }
  };

  const columns = [
    {
      key: "id",
      label: "ID",
    },
    {
      key: "first_name",
      label: "HR Account",
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-800">
            {row.first_name} {row.last_name}
          </p>
          <p className="text-xs text-gray-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: () => (
        <span className="badge badge-info">HR</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-900">
            HR Accounts
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage HR administrator accounts.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm((prev) => !prev);
            setErrorMessage("");
            setSuccessMessage("");
          }}
          className="btn border-none bg-green-700 text-white hover:bg-green-800"
        >
          <FiPlus size={18} />
          Create HR Account
        </button>
      </div>

      {successMessage && (
        <div className="alert border border-green-200 bg-green-50 text-green-800">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="alert border border-red-200 bg-red-50 text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard title="Total HR Accounts" count={loading ? "-" : hrAccounts.length} icon={<FiBriefcase size={20} />} color="green" />
      </div>

      {showForm && (
        <HRAccountForm onSubmit={handleCreateAccount} onCancel={() => setShowForm(false)} />
      )}

      {creating && (
        <div className="flex items-center gap-2 text-sm text-green-700">
          <span className="loading loading-spinner loading-sm"></span>
          Creating HR account...
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search HR accounts..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered w-full pl-10" />
        </div>
        <button type="button" onClick={handleExportCsv}
          disabled={filteredAccounts.length === 0}
          className="btn border-none bg-green-700 text-white hover:bg-green-800">
          <FiDownload size={17} /> Export CSV
        </button>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold text-gray-800">
          HR Account Records
        </h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg text-green-700"></span>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={paginatedAccounts}
            emptyMessage="No HR accounts found."
          />
        )}
        {!loading && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              Showing {filteredAccounts.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–
              {Math.min(currentPage * PAGE_SIZE, filteredAccounts.length)} of {filteredAccounts.length} HR accounts
            </p>
            <div className="join">
              <button className="btn btn-sm join-item" disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}>Previous</button>
              <button className="btn btn-sm join-item no-animation">Page {currentPage} of {totalPages}</button>
              <button className="btn btn-sm join-item" disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}>Next</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default HrAccounts;