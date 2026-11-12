import React from "react";
import { FiCheck, FiBell } from "react-icons/fi";

const NotificationDropdown = ({
  notifications = [],
  loading = false,
  onNotificationClick,
  onMarkAllRead,
}) => {
  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 overflow-hidden rounded-xl border border-green-100 bg-white shadow-xl">

    
      <div className="flex items-center justify-between border-b border-green-100 px-4 py-3">
        <div>
          <h3 className="font-semibold text-gray-800">
            Notifications
          </h3>
          <p className="text-xs text-gray-500">
            Stay updated with your latest activities
          </p>
        </div>

        {notifications.some((item) => !item.is_read) && (
          <button
            onClick={onMarkAllRead}
            className="text-xs font-medium text-green-700 hover:text-green-900"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">

        {loading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-md text-green-600"></span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
            <FiBell className="mb-3 text-3xl text-gray-300" />

            <p className="font-medium text-gray-700">
              No notifications yet
            </p>

            <p className="mt-1 text-xs text-gray-400">
              We'll notify you when something happens.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => onNotificationClick?.(notification)}
              className={`flex w-full gap-3 border-b border-gray-100 px-4 py-4 text-left transition hover:bg-green-50 ${
                !notification.is_read ? "bg-green-50/60" : "bg-white"
              }`}
            >
              <div className="mt-1 shrink-0">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${
                    !notification.is_read
                      ? "bg-green-600"
                      : "bg-gray-200"
                  }`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-gray-800">
                    {notification.title}
                  </h4>

                  {!notification.is_read && (
                    <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                      New
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  {notification.message}
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  {formatDate(notification.created_at)}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      {!loading && notifications.length > 0 && (
        <div className="flex items-center justify-center border-t border-green-100 px-4 py-3">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <FiCheck className="text-green-600" />
            You're all caught up
          </span>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
