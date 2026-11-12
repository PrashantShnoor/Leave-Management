import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie || "";

      const tokenCookie = cookieHeader
        .split(";")
        .find((cookie) => cookie.trim().startsWith("token="));

      if (!tokenCookie) {
        return next(new Error("Authentication required"));
      }

      const token = decodeURIComponent(
        tokenCookie.trim().substring("token=".length)
      );

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET_KEY
      );

      socket.user = decoded;

      next();

    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    const role = socket.user.role?.toLowerCase();

    
    socket.join(`user:${userId}`);

   
    if (role) {
      socket.join(`role:${role}`);
    }

    console.log(`User ${userId} connected to notifications`);

    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected`);
    });
  });

  return io;
};


export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};


