
import React, { useEffect, useMemo, useState } from "react";
import Pagination from "./Pagination";

const DataTable = ({
  columns = [],
  data = [],
  onRowClick,
  emptyMessage = "No records found.",
  rowKey = "id",
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Keep the current page valid if filtering or deleting records
  // reduces the total number of pages.
  useEffect(() => {
    if (currentPage > Math.max(totalPages, 1)) {
      setCurrentPage(Math.max(totalPages, 1));
    }
  }, [currentPage, totalPages]);

  // Get only the records required for the current page.
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl border border-green-100 shadow-sm">
      <table className="table w-full">

        <thead className="bg-green-50 text-green-900">
          <tr>
            {columns.map((column) => (
              <th key={column.key}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {currentData.length > 0 ? (
            currentData.map((row, index) => (
              <tr
                key={row[rowKey] ?? index}
                onClick={() => onRowClick?.(row)}
                className={`hover:bg-green-50 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render
                      ? column.render(row)
                      : row[column.key] ?? "N/A"}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length || 1}
                className="text-center py-8 text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

export default DataTable;
