// socket.js
let ioInstance;

function initSocket(server) {
  const { Server } = require("socket.io");

  ioInstance = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "https://datn-trung-duc-store.vercel.app"],
      credentials: true,
    },
  });

  ioInstance.on("connection", (socket) => {
    console.log("⚡ User connected:", socket.id);

    // User đăng ký ID để join phòng theo userId
    socket.on("register", (userId) => {
      console.log("📌 User joined room:", userId);
      socket.join(userId);
    });

    // Admin join phòng "admin"
    socket.on("register-admin", () => {
      console.log("👑 Admin joined room");
      socket.join("admin");
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });

  return ioInstance;
}

// Gửi thông báo cho tất cả user
function notifyAll(message) {
  if (!ioInstance) return console.log("⛔ Socket not initialized");
  ioInstance.emit("notification", message);
}

// Gửi thông báo cho user cụ thể theo userId
function notifyUser(userId, message) {
  if (!ioInstance) return console.log("⛔ Socket not initialized");
  console.log("📨 Notify user:", userId, message);
  ioInstance.to(userId).emit("notification", message);
}

// Gửi thông báo cho tất cả admin
function notifyAdmin(message) {
  if (!ioInstance) return console.log("⛔ Socket not initialized");
  console.log("📢 Notification sent to admin:", message);
  ioInstance.to("admin").emit("notification", message);
}

module.exports = { initSocket, notifyAll, notifyUser, notifyAdmin };
