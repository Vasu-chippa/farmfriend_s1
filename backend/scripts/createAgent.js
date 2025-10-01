// backend/scripts/createAgent.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Agent from "../src/models/Agent.js";

dotenv.config();

const createAgent = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const agent = new Agent({
  fullName: "Agent Two",
  email: "agenttwo@gmail.com",  // 👈 new email
  password: "agenttwo",
  phone: "90000001",
  region: "Hyderabad"
});


    await agent.save();
    console.log("✅ Agent created:", agent.email);
    process.exit();
  } catch (err) {
    console.error("❌ Error creating agent:", err.message);
    process.exit(1);
  }
};

createAgent();
