import React from 'react';

const Alert = ({ type = "danger",  message, onClose }) => {
  const alertStyles = {
    danger: "text-red-800 bg-red-50 dark:bg-gray-800 dark:text-red-400",
    success: "text-green-800 bg-green-50 dark:bg-gray-800 dark:text-green-400",
    warning: "text-yellow-800 bg-yellow-50 dark:bg-gray-800 dark:text-yellow-400",
    info: "text-blue-800 bg-blue-50 dark:bg-gray-800 dark:text-blue-400",
  };

  return (
    <div
      className={`p-4 mb-4 text-sm rounded-lg ${alertStyles[type]}`}
      role="alert">
      <div className="flex justify-between">
        <span className="font-medium">
        </span>{" "}
        {message}
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-sm font-medium text-gray-500 hover:underline dark:text-gray-300"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
