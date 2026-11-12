
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import BASE_URL from "../utils/constants";

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Axios configuration
  const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
  });

  // Fetch all notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/notifications");

      const data = response.data;

      const notificationList = Array.isArray(data)
        ? data
        : data.notifications || data.data || [];

      setNotifications(notificationList);
    } catch (error) {
      console.error(
        "Error fetching notifications:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get("/notifications/unread-count");

      const data = response.data;

      const count =
        data.unread_count ??
        data.count ??
        data.data?.unread_count ??
        0;

      setUnreadCount(Number(count));
    } catch (error) {
      console.error(
        "Error fetching unread count:",
        error.response?.data || error.message
      );
    }
  }, []);

  // Mark one notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));

    } catch (error) {
      console.error(
        "Error marking notification as read:",
        error.response?.data || error.message
      );
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch("/notifications/read-all");

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );

      setUnreadCount(0);

    } catch (error) {
      console.error(
        "Error marking all notifications as read:",
        error.response?.data || error.message
      );
    }
  }, []);

  // Fetch notifications and establish Socket.IO connection
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    const socket = io(BASE_URL, {
      withCredentials: true,
    });

    // Listen for new notifications
    socket.on("notification:new", (notification) => {
      setNotifications((prev) => {
        // Avoid duplicate notifications
        const alreadyExists = prev.some(
          (item) => item.id === notification.id
        );

        if (alreadyExists) return prev;

        return [notification, ...prev];
      });

      // Increase unread count for a new notification
      if (!notification.is_read) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Notification socket connection error:", error.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  };
};

export default useNotifications;
