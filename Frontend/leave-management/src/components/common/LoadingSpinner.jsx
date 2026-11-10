import React from "react";

const LoadingSpinner = ({
  message = "Loading...",
  fullScreen = false,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${
        fullScreen ? "min-h-screen" : "py-12"
      }`}
    >
      <span className="loading loading-spinner loading-lg text-green-700"></span>

      <p className="text-sm text-gray-500 font-medium">
        {message}
      </p>
    </div>
  );
};

export default LoadingSpinner;
