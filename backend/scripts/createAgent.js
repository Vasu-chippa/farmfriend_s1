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
<<<<<<< HEAD
  email: "agenttwo2@gmail.com",  // 👈 new email
  password: "agenttwo2",
=======
  email: "agenttwo@gmail.com",  // 👈 new email
  password: "agenttwo",
>>>>>>> 4480506761132cab8ea8e9e83e5a14ad937448ed
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
