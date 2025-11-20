const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { initSocket } = require("./socket");

// --- ROUTES ---
const notificationRouter = require("./routes/shop/notification-routes");

const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
const userRoutes = require("./routes/admin/user-routes");
const StaRoutes = require("./routes/admin/statistics-routes");
const shipperRoutes = require("./routes/admin/shipper-routes");


const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const shopInfoUser = require("./routes/shop/user-routes");
const coupon = require("./routes/shop/coupon-routes");
const commonFeatureRouter = require("./routes/common/feature-routes");

// --- CONNECT MONGO ---
mongoose
  .connect(
    "mongodb+srv://thaibaduc2003:Duc_2003@cluster0.z0nxh0r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("✅ MongoDB connected"))
  .catch((error) => console.log("❌ MongoDB error:", error));

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// --- ROUTES ---
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/admin/users", userRoutes);
app.use("/api/admin/statistics", StaRoutes);
app.use("/api/admin/shipper", shipperRoutes);


app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use("/api/shop/user", shopInfoUser);
app.use("/api/coupons", coupon);
app.use("/api/common/feature", commonFeatureRouter);
app.use("/api/shop/user/notifications", notificationRouter);

// --- TẠO HTTP SERVER CHO SOCKET.IO ---
const server = http.createServer(app);
const io = initSocket(server);





// --- START SERVER ---
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

