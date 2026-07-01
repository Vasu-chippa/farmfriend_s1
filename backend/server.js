// apps/backend/server.js
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load .env from backend root as early as possible so imports and modules
// that access process.env during initialization see the variables.
const __filename_for_env = fileURLToPath(import.meta.url);
const __dirname_for_env = path.dirname(__filename_for_env);
dotenv.config({ path: path.join(__dirname_for_env, ".env") });

import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mongoose from "mongoose";

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
import ledgerRoutes from "./src/routes/ledgerRoutes.js";
import dashboardRoutes from "./src/routes/dashboard.js";
import regionRoutes from "./src/routes/regionRoutes.js";
import notificationRoutesLocal from "./src/routes/notificationRoutes.js";
import supportRoutes from "./src/routes/supportRoutes.js";
import reviewRoutes from "./src/routes/reviewRoutes.js";
import marketplaceRoutes from "./src/routes/marketplaceRoutes.js";
import transactionRoutes from "./src/routes/transactionRoutes.js";

// Environment summary (do not print sensitive values)
const printEnvSummary = () => {
  const PORT = process.env.PORT || '5000';
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const MONGO_LOADED = process.env.MONGO_URI ? 'Loaded' : 'Not Loaded';
  const JWT_LOADED = process.env.JWT_SECRET ? 'Loaded' : 'Not Loaded';
  console.log('\nEnvironment\n-----------');
  console.log(`PORT: ${PORT}`);
  console.log(`NODE_ENV: ${NODE_ENV}`);
  console.log(`MONGO_URI: ${MONGO_LOADED}`);
  console.log(`JWT_SECRET: ${JWT_LOADED}\n`);
  if (NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not set. The application requires a JWT secret in production.');
  }
};
printEnvSummary();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
// parse cookies for cookie-based auth
app.use(cookieParser());

// CORS: allow only the client origin and allow credentials (cookies)
// Support multiple allowed origins and reflect the request origin when allowed.
const parseCommaSeparatedOrigins = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const allowedOrigins = [
  process.env.CLIENT_URL,
  ...parseCommaSeparatedOrigins(process.env.ALLOWED_ORIGINS),
  // Local dev hosts
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
].filter(Boolean);

const allowDeploySubdomains = process.env.ALLOW_DEPLOY_SUBDOMAINS === "true";
const deployOriginPatterns = [
  /(^|\.)netlify\.app$/,
  /(^|\.)render\.com$/,
];

// CORS configuration
// Behavior:
// - In development (NODE_ENV !== 'production') allow all origins to avoid CORS blockers.
// - In production, allow origins in `allowedOrigins` or via `ALLOWED_ORIGINS`.
// - To allow Netlify / Render dynamic deploy domains, set ALLOW_DEPLOY_SUBDOMAINS=true.
// - Use `CORS_ALLOW_ALL=true` to permit all origins in production (use with caution).
const corsOptionsDelegate = (origin, callback) => {
  // Allow non-browser requests (no origin)
  if (!origin) return callback(null, true);

  // Development convenience: allow all origins unless explicitly locked down
  if (process.env.NODE_ENV !== 'production' || process.env.CORS_ALLOW_ALL === 'true') {
    return callback(null, true);
  }

  // Allow configured explicit origins
  if (allowedOrigins.includes(origin)) return callback(null, true);

  // Allow dynamic deploy subdomains for Netlify and Render when opting in
  if (allowDeploySubdomains && typeof origin === 'string') {
    if (deployOriginPatterns.some((pattern) => pattern.test(origin))) {
      return callback(null, true);
    }
  }

  // Deny other origins (will result in no CORS headers for those requests)
  return callback(null, false);
};

app.use(cors({ origin: corsOptionsDelegate, credentials: true }));
// Ensure preflight (OPTIONS) requests are handled with the same policy
app.options('*', cors({ origin: corsOptionsDelegate, credentials: true }));
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
// Optionally enable legacy `/auth` mount for older frontends.
if (process.env.ENABLE_LEGACY_AUTH_ROUTE === "true") {
  app.use("/auth", authRoutes);
}
app.use("/api/buyers", buyerRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/harvest", harvestRoutes);
app.use("/api/crop-records", cropRecordRoutes);
// Product routes are mounted under /api/products to avoid conflicting with marketplace listings
app.use("/api/products", productRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/regions", regionRoutes);
app.use('/api/notifications', notificationRoutesLocal);
app.use('/api/support', supportRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/transactions', transactionRoutes);

// Database connection
// Filter specific Node deprecation warning from dependencies (optional)
process.on('warning', (warning) => {
  try {
    if (warning && warning.name === 'DeprecationWarning' && /util\._extend/.test(warning.message)) {
      // Ignore this specific deprecation coming from a dependency
      return;
    }
  } catch (e) {
    // fallback to default
  }
  console.warn(warning.name + ':', warning.message);
});

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.warn(
      "⚠️  MONGO_URI is not set. Skipping MongoDB connection. Set MONGO_URI in your .env to enable DB features."
    );
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Fail fast if server selection takes too long
      serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_TIMEOUT_MS) || 5000,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", (error && error.message) || error);
    // Helpful diagnostics for common mistakes
    if (mongoUri.indexOf('mongodb://') === -1 && mongoUri.indexOf('mongodb+srv://') === -1) {
      console.error('Provided MONGO_URI does not look like a valid MongoDB connection string.');
    }
    // Attempt local fallback when available (useful for offline dev)
    const local = process.env.LOCAL_MONGO_URI;
    if (local && local !== mongoUri) {
      console.warn('Attempting fallback to LOCAL_MONGO_URI...');
      try {
        await mongoose.connect(local, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 3000 });
        console.log('✅ Connected to LOCAL_MONGO_URI fallback');
        return;
      } catch (e2) {
        console.error('Fallback LOCAL_MONGO_URI connection failed:', (e2 && e2.message) || e2);
      }
    }
    // Do not crash the server; routes that require DB should handle missing connection.
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
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error(`   Suggested actions:`);
    console.error(`     - Stop the process using port ${PORT}`);
    console.error(`     - Or set an alternate port and restart: PORT=5002 npm run dev`);
  } else {
    console.error("❌ Server error:", err);
  }
});
