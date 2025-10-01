import Agent from "../models/Agent.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

// @desc    Login agent
// @route   POST /api/agents/login
// @access  Public
export const loginAgent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const agent = await Agent.findOne({ email });
    if (!agent) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, agent.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    return res.json({
      message: "Login successful",
      token: generateToken(agent._id, "agent"),
      user: {
        _id: agent._id,
        fullName: agent.fullName,
        email: agent.email,
        role: "agent",
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
