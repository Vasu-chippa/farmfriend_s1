// backend/src/app.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import farmerRoutes from "./routes/farmerRoutes.js";
import buyerRoutes from "./routes/buyerRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import marketplaceRoutes from "./routes/marketplaceRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/farmers", farmerRoutes);
app.use("/api/buyers", buyerRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/marketplace", marketplaceRoutes);
app.use("/api/marketplace", productRoutes);

export default app;
