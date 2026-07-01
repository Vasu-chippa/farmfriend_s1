
import express from "express";
import Notification from "../models/Notification.js";

const router = express.Router();

// Get notifications for user
router.get("/:userId", async (req, res) => {
  try {
    const notes = await Notification.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Mark as read
router.put("/:id/read", async (req, res) => {
  try {
    const note = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

export default router;
