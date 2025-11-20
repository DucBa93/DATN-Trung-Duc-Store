// socket.js
let ioInstance;

function initSocket(server) {
  const { Server } = require("socket.io");
  ioInstance = new Server(server, {
    cors: { origin: "http://localhost:5173", credentials: true },
  });

  ioInstance.on("connection", (socket) => {
    console.log("⚡ User connected:", socket.id);
    socket.on("register", (userId) => socket.join(userId));
    socket.on("register-admin", () => socket.join("admin"));
    socket.on("disconnect", () => console.log("❌ User disconnected:", socket.id));
  });

  return ioInstance;
}

function notifyAll(message) {
  if (!ioInstance) return console.log("Socket not initialized");
  ioInstance.emit("notification", { message });
}

function notifyUser(userId, message) {
  if (!ioInstance) return console.log("Socket not initialized");
  ioInstance.to(userId).emit("notification", { message });
}

function notifyAdmin(message) {
  if (!ioInstance) return console.log("Socket not initialized");
  ioInstance.to("admin").emit("notification", { message });
  console.log("📢 Notification sent to admin:", message);
}

module.exports = { initSocket, notifyAll, notifyUser, notifyAdmin };
