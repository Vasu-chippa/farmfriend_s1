// apps/backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
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

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Static folder for uploaded images
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve uploads folder (so frontend can access images)
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
app.use("/api/buyers", buyerRoutes);
app.use("/api/farmers", farmerRoutes);

app.use("/api/crops", cropRoutes);

app.use("/api/harvest", harvestRoutes);

app.use("/api/crop-records", cropRecordRoutes);

app.use("/api/marketplace", productRoutes);


// Database connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ DB Connection Error:", err);
    process.exit(1);
  });

// Server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
