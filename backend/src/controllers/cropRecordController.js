// apps/backend/src/controllers/cropRecordController.js
import CropRecord from "../models/CropRecord.js";
import mongoose from "mongoose";

/**
 * Create record
 */
export const addRecord = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized. Please login again." });
    }

    const {
      cropId,
      date,
      cost,
      quantity,
      acres,
      description,
      fertilizer,
      seeds,
      workers,
      transportCost,
      recordType,
      activityType,
      hours,
      amountSpent,
      notes,
    } = req.body;

    if (!cropId || !date) {
      return res.status(400).json({ error: "Missing required fields (cropId, date)" });
    }

    if (recordType === 'activity') {
      if (amountSpent === undefined || amountSpent === null) {
        return res.status(400).json({ error: "Missing required field amountSpent for activity records" });
      }
    } else {
      if (cost === undefined || quantity === undefined) {
        return res.status(400).json({ error: "Missing required fields (cost, quantity) for cost records" });
      }
    }

    const recordData = {
      farmer: req.user._id,
      cropId,
      date,
      acres,
      description,
      fertilizer,
      seeds,
      workers,
      transportCost,
      recordType: recordType || 'cost',
      activityType,
      hours,
      notes,
    };

    if (recordType === 'activity') {
      recordData.amountSpent = amountSpent;
      recordData.cost = cost !== undefined ? cost : undefined;
      recordData.quantity = quantity !== undefined ? quantity : undefined;
    } else {
      recordData.cost = cost;
      recordData.quantity = quantity;
      recordData.amountSpent = amountSpent !== undefined ? amountSpent : undefined;
    }

    const record = new CropRecord(recordData);

    await record.save();
    res.status(201).json(record);
  } catch (err) {
    console.error("addRecord error:", err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Get records by crop (farmer scoped)
 */
export const getRecords = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized. Please login again." });
    }

    // validate cropId to avoid Mongoose CastError for invalid ObjectId values
    const { cropId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(cropId)) {
      // return empty list instead of 500 when caller passes an invalid id
      return res.json([]);
    }

    const records = await CropRecord.find({
      cropId,
      farmer: req.user._id,
    }).sort({ date: -1 });

    res.json(records);
  } catch (err) {
    console.error("getRecords error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update record (farmer-scoped)
 */
export const updateRecord = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized. Please login again." });
    }

    const allowed = (({
      date,
      cost,
      quantity,
      acres,
      description,
      fertilizer,
      seeds,
      workers,
      transportCost,
      recordType,
      activityType,
      hours,
      amountSpent,
      notes,
    }) => ({
      date,
      cost,
      quantity,
      acres,
      description,
      fertilizer,
      seeds,
      workers,
      transportCost,
      recordType,
      activityType,
      hours,
      amountSpent,
      notes,
    }))(req.body);

    const record = await CropRecord.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user._id },
      allowed,
      { new: true }
    );

    if (!record) {
      return res.status(404).json({ error: "Record not found or not yours" });
    }

    res.json(record);
  } catch (err) {
    console.error("updateRecord error:", err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Delete record (farmer-scoped)
 */
export const deleteRecord = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Unauthorized. Please login again." });
    }

    const deleted = await CropRecord.findOneAndDelete({
      _id: req.params.id,
      farmer: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ error: "Record not found or not yours" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("deleteRecord error:", err);
    res.status(500).json({ error: err.message });
  }
};
