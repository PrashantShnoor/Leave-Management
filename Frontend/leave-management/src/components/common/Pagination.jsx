
import React from "react";

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  if (totalItems === 0) return null;

  // Display a small range of page numbers around the current page.
  const getVisiblePages = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);

    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    return pages;
  };

  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t border-green-100">
      {/* Record information and page size */}
      <div className="flex flex-col sm:flex-row items-center gap-3 text-sm text-gray-600">
        <span>
          Showing <span className="font-semibold text-gray-800">{startRecord}</span>
          {" "}to{" "}
          <span className="font-semibold text-gray-800">{endRecord}</span>
          {" "}of{" "}
          <span className="font-semibold text-gray-800">{totalItems}</span>
          {" "}records
        </span>

        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="select select-bordered select-sm border-green-200 focus:outline-green-500"
        >
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn btn-sm bg-white border-green-200 text-green-800 hover:bg-green-50 disabled:opacity-40"
        >
          Previous
        </button>

        {currentPage > 3 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="btn btn-sm bg-white border-green-200 text-green-800 hover:bg-green-50"
            >
              1
            </button>
            {currentPage > 4 && (
              <span className="px-1 text-gray-400">...</span>
            )}
          </>
        )}

        {getVisiblePages().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`btn btn-sm ${
              currentPage === page
                ? "bg-green-700 text-white border-green-700 hover:bg-green-800"
                : "bg-white border-green-200 text-green-800 hover:bg-green-50"
            }`}
          >
            {page}
          </button>
        ))}

        {currentPage < totalPages - 2 && (
          <>
            {currentPage < totalPages - 3 && (
              <span className="px-1 text-gray-400">...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className="btn btn-sm bg-white border-green-200 text-green-800 hover:bg-green-50"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="btn btn-sm bg-white border-green-200 text-green-800 hover:bg-green-50 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
