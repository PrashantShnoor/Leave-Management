import React from "react";

const DataTable = ({
  columns = [],
  data = [],
  onRowClick,
  emptyMessage = "No records found.",
  rowKey = "id",
}) => {
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
          {data.length > 0 ? (
            data.map((row, index) => (
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
    </div>
  );
};

export default DataTable;