// apps/backend/server.js
import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import adminRoutes from "./src/routes/adminRoutes.js";
import agentRoutes from "./src/routes/agentRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import buyerRoutes from "./src/routes/buyerRoutes.js";
import farmerRoutes from "./src/routes/farmerRoutes.js";
import harvestRoutes from "./src/routes/harvestRoutes.js";
import cropRecordRoutes from "./src/routes/cropRecordRoutes.js";
import cropRoutes from "./src/routes/cropRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import reviewRoutes from "./src/routes/reviewRoutes.js";
import ledgerRoutes from "./src/routes/ledgerRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import dashboardRoutes from "./src/routes/dashboard.js";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
// parse cookies for cookie-based auth
app.use(cookieParser());

// CORS: allow only the client origin and allow credentials (cookies)
// Support multiple allowed origins and reflect the request origin when allowed.
const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://farm-friends.netlify.app",
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (e.g., curl, server-to-server) with no origin
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, origin);
      return callback(new Error("CORS origin not allowed"), false);
    },
    credentials: true,
  })
);
app.use(morgan("dev"));

// Static folder for uploaded images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));

// Health check route
app.get("/", (req, res) => {
  res.send("✅ FarmFriend Backend is running...");
});

// Routes
app.use("/api/orders", orderRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/auth", authRoutes);
// Backwards-compatible route used by some builds (keeps older frontend working)
app.use("/auth", authRoutes);
app.use("/api/buyers", buyerRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/harvest", harvestRoutes);
app.use("/api/crop-records", cropRecordRoutes);
app.use("/api/marketplace", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.warn(
        "⚠️  MONGO_URI is not set. Skipping MongoDB connection. Set MONGO_URI in your .env to enable DB features."
      );
      return;
    }

    await mongoose.connect(mongoUri, {
      // mongoose options (no deprecated options required for modern mongoose)
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error && error.message ? error.message : error);
    // Don't crash here; depending on environment (like preview or static deployments)
    // you may intentionally run without a DB. If you expect a DB, set MONGO_URI.
  }
};

connectDB();

// Server listening
const PORT = Number(process.env.PORT) || 5000;
// Create HTTP server and Socket.IO
const httpServer = http.createServer(app);
const io = new IOServer(httpServer, {
  cors: { origin: process.env.CLIENT_URL || "*", credentials: true },
});

// In-memory map of userId -> socketId
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("register", (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      console.log("Registered user", userId, "->", socket.id);
    }
  });

  socket.on("disconnect", () => {
    // remove from onlineUsers
    for (const [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(uid);
        break;
      }
    }
    console.log("Socket disconnected:", socket.id);
  });
});

// Make io and onlineUsers available to routes via app.locals
app.locals.io = io;
app.locals.onlineUsers = onlineUsers;

const server = httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use. Set a different PORT in your environment or stop the process using this port.`);
  } else {
    console.error("❌ Server error:", err);
  }
});
