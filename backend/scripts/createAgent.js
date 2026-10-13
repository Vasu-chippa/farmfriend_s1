// backend/scripts/createAgent.js
import mongoose from "mongoose";
import dns from "dns";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../src/models/User.js";

// Load .env relative to this script file so the seeder works when run from project root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const connectDB = async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not configured");

  const options = {
    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_TIMEOUT_MS) || 10000,
  };

  try {
    await mongoose.connect(process.env.MONGO_URI, options);
  } catch (error) {
    if (error.code !== "ECONNREFUSED" || !error.message.startsWith("querySrv")) throw error;

    const dnsServers = (process.env.MONGO_DNS_SERVERS || "1.1.1.1,8.8.8.8")
      .split(",")
      .map((server) => server.trim())
      .filter(Boolean);
    console.warn(`MongoDB SRV lookup was refused; retrying with DNS servers: ${dnsServers.join(", ")}`);
    dns.setServers(dnsServers);
    await mongoose.connect(process.env.MONGO_URI, options);
  }
};

const agents = [
  {
    fullName: "Agent Two",
    email: "agenttwo2@gmail.com",
    password: "agenttwo2",
    phone: "90000001",
    region: "Hyderabad",
  },
  {
    fullName: "Agent warnagal",
    email: "agentwarangal@gmail.com",
    password: "agentwarangal",
    phone: "9003464574",
    region: "warangal",
  },
];

const createAgents = async () => {
  await connectDB();

  try {
    for (const agentData of agents) {
      const email = agentData.email.toLowerCase();
      const existing = await User.findOne({ email });
      if (existing) {
        if (existing.role !== "agent") {
          throw new Error(`Refusing to change the existing account role for ${email}`);
        }
        console.log(`Agent already exists, skipping: ${email}`);
        continue;
      }

      const agent = await User.create({
        fullName: agentData.fullName,
        email,
        password: await bcrypt.hash(agentData.password, 10),
        phone: agentData.phone,
        region: agentData.region,
        role: "agent",
      });
      console.log(`Agent created: ${agent.email}`);
    }

    console.log("Agent seeding complete.");
  } finally {
    await mongoose.disconnect();
  }
};

createAgents().catch((error) => {
  console.error("Agent seeding failed:", error.message);
  process.exitCode = 1;
});
