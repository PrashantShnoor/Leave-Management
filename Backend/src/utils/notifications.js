
import { pool } from "../config/database.js";
import { getIO } from "../config/socket.js";


export const saveNotification = async (
  db,
  {
    recipient_id,
    leave_request_id,
    title,
    message,
    type,
  }
) => {
  const query = `
    INSERT INTO notifications
      (recipient_id, leave_request_id, title, message, type)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const result = await db.query(query, [
    recipient_id,
    leave_request_id,
    title,
    message,
    type,
  ]);

  return result.rows[0];
};


export const emitNotification = (notification) => {
  const io = getIO();

  io.to(`user:${notification.recipient_id}`).emit(
    "notification:new",
    notification
  );
};


export const createNotification = async (data) => {
  const notification = await saveNotification(pool, data);

  emitNotification(notification);

  return notification;
};
