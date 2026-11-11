import React from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";

const dialogStyles = {
  success: {
    icon: <FaCheckCircle />,
    iconClass: "bg-green-100 text-green-600",
    buttonClass: "bg-green-600 hover:bg-green-700",
    defaultTitle: "Success",
  },
  error: {
    icon: <FaExclamationCircle />,
    iconClass: "bg-red-100 text-red-600",
    buttonClass: "bg-red-600 hover:bg-red-700",
    defaultTitle: "Something went wrong",
  },
  warning: {
    icon: <FaExclamationTriangle />,
    iconClass: "bg-amber-100 text-amber-600",
    buttonClass: "bg-amber-500 hover:bg-amber-600",
    defaultTitle: "Please check",
  },
  info: {
    icon: <FaExclamationCircle />,
    iconClass: "bg-blue-100 text-blue-600",
    buttonClass: "bg-green-600 hover:bg-green-700",
    defaultTitle: "Information",
  },
};

const MessageDialog = ({
  isOpen,
  onClose,
  type = "info",
  title,
  message,
}) => {
  if (!isOpen) return null;

  const style = dialogStyles[type] || dialogStyles.info;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="message-dialog-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full text-xl ${style.iconClass}`}>
            {style.icon}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="btn btn-sm btn-circle btn-ghost text-gray-500"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mt-4">
          <h2
            id="message-dialog-title"
            className="text-xl font-bold text-gray-800"
          >
            {title || style.defaultTitle}
          </h2>

          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
            {message}
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`btn min-w-24 text-white ${style.buttonClass}`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageDialog;