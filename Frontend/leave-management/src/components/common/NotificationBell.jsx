import React, { useState } from "react";
import { FiBell } from "react-icons/fi";
import NotificationDropdown from "./NotificationDropDown";

const NotificationBell = ({
  notifications = [],
  unreadCount = 0,
  loading = false,
  onNotificationClick,
  onMarkAllRead,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notification) => {
    onNotificationClick?.(notification);
    setIsOpen(false);
  };

  return (
    <div className="relative">

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition hover:bg-green-50 hover:text-green-700"
        aria-label="Notifications"
      >
        <FiBell className="text-xl" />

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          loading={loading}
          onNotificationClick={handleNotificationClick}
          onMarkAllRead={onMarkAllRead}
        />
      )}
    </div>
  );
};

export default NotificationBell;
