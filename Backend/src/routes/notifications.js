import express from "express";
import { pool } from "../config/database.js";
import authMiddleware from "../middleware/auth.js";

const notificationRoutes = express.Router();

notificationRoutes.get("/", authMiddleware, async (req, res) => {
  try {
    const recipient_id = req.user.id;

    const result = await pool.query(
      `SELECT *
       FROM notifications
       WHERE recipient_id = $1
       ORDER BY created_at DESC`,
      [recipient_id]
    );

    return res.status(200).json({
      message: "Notifications fetched successfully",
      notifications: result.rows,
    });

  } catch (error) {
    console.error("Fetch notifications error:", error);

    return res.status(500).json({
      message: "Failed to fetch notifications",
    });
  }
});

notificationRoutes.get("/unread-count", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS unread_count
       FROM notifications
       WHERE recipient_id = $1 AND is_read = false`,
      [req.user.id]
    );

    return res.status(200).json({
      unread_count: Number(result.rows[0].unread_count),
    });

  } catch (error) {
    console.error("Unread count error:", error);

    return res.status(500).json({
      message: "Failed to fetch unread notification count",
    });
  }
});

notificationRoutes.patch("/:id/read", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
      return res.status(400).json({
        message: "Invalid notification ID",
      });
    }

    const result = await pool.query(
      `UPDATE notifications
       SET is_read = true
       WHERE id = $1 AND recipient_id = $2
       RETURNING *`,
      [Number(id), req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      message: "Notification marked as read",
      notification: result.rows[0],
    });

  } catch (error) {
    console.error("Mark notification read error:", error);

    return res.status(500).json({
      message: "Failed to update notification",
    });
  }
});

notificationRoutes.patch("/read-all", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE notifications
       SET is_read = true
       WHERE recipient_id = $1 AND is_read = false
       RETURNING id`,
      [req.user.id]
    );

    return res.status(200).json({
      message: "All notifications marked as read",
      updated_count: result.rowCount,
    });

  } catch (error) {
    console.error("Mark all notifications read error:", error);

    return res.status(500).json({
      message: "Failed to update notifications",
    });
  }
});

export default notificationRoutes;
