
import React from "react";

const ConfirmationModal = ({
  isOpen,
  title = "Are you sure?",
  message = "Do you want to continue with this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  confirmColor = "bg-green-700 hover:bg-green-800",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">

        <h2 className="text-xl font-bold text-gray-800">
          {title}
        </h2>

        <p className="text-gray-500 text-sm mt-3">
          {message}
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="btn btn-ghost"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`btn text-white ${confirmColor}`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmationModal;
