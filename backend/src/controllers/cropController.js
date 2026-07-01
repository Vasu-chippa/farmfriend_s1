//apps/backend/src/controllers/cropController.js

import Crop from "../models/Crop.js";

// GET all crops
export const getCrops = async (req, res) => {
  try {
    const crops = await Crop.find();
    res.json(crops);
  } catch (err) {
    console.error("❌ Error fetching crops:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ GET crop by ID
export const getCropById = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }
    res.json(crop);
  } catch (err) {
    console.error("❌ Error fetching crop by id:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST create new crop
export const createCrop = async (req, res) => {
  try {
    // ensure we use normalized user id set by protect middleware
    const farmerId = req.user && (req.user._id || req.user.id);
    const crop = new Crop({ ...req.body, farmer: farmerId });
    await crop.save();
    res.status(201).json(crop);
  } catch (err) {
    res.status(400).json({ message: "Error creating crop" });
  }
};

// PUT update crop
export const updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(crop);
  } catch (err) {
    res.status(400).json({ message: "Error updating crop" });
  }
};

// DELETE crop
export const deleteCrop = async (req, res) => {
  try {
    await Crop.findByIdAndDelete(req.params.id);
    res.json({ message: "Crop deleted" });
  } catch (err) {
    res.status(400).json({ message: "Error deleting crop" });
  }
};
