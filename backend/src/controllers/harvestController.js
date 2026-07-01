import Harvest from "../models/Harvest.js";

// 📋 Get all harvest crops for logged-in farmer
export const getHarvest = async (req, res) => {
  try {
    const harvest = await Harvest.findOne({ farmer: req.user._id }).populate(
      "crops.cropId",
      "name image price quantity isOrganic quality category"
    );

    if (!harvest) return res.json({ crops: [] });

    // Normalize image paths for frontend consumers
    const normalized = harvest.crops.map((c) => {
      const cropObj = c.toObject ? c.toObject() : c;
      const ci = cropObj.cropId || {};
      let img = ci.image;
      if (img && typeof img === 'string') {
        if (img.startsWith('http') || img.startsWith('/')) {
          // keep as-is
        } else {
          img = `/cropimages/${img}`;
        }
      } else {
        img = `/cropimages/default.jpeg`;
      }
      cropObj.cropId = { ...ci, image: img };
      return cropObj;
    });

    res.json({ crops: normalized });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➕ Add a crop to harvest
export const addCrop = async (req, res) => {
  try {
    const {
      cropId,
      name,
      variety,
      farmName,
      village,
      district,
      state,
      pincode,
      acres,
      price,
      quantity,
      yieldPerAcre,
      image,
      category,
      quality,
      isMarketplaceListed,
      commissionPercent,
    } = req.body;

    let harvest = await Harvest.findOne({ farmer: req.user._id });
    if (!harvest) {
      harvest = new Harvest({ farmer: req.user._id, crops: [] });
    }

    // avoid duplicates when exact same cropId exists
    if (cropId && harvest.crops.some((c) => c.cropId && c.cropId.toString() === cropId && !c.removedAt)) {
      return res.status(400).json({ msg: "Crop already in harvest list" });
    }

    // normalize image before saving: store filename or path without host
    let img = image;
    if (img && typeof img === 'string' && !img.startsWith('http') && !img.startsWith('/')) {
      img = `/cropimages/${img}`;
    }

    const cp = Number(commissionPercent || 5);
    const qty = Number(quantity || 0);
    const pr = Number(price || 0);
    const commissionAmount = (qty * pr) * (cp / 100);

    harvest.crops.push({
      cropId: cropId || undefined,
      name,
      variety,
      farmName,
      village,
      district,
      state,
      pincode,
      acres: acres !== undefined ? Number(acres) : undefined,
      price: pr,
      quantity: qty,
      yieldPerAcre: yieldPerAcre !== undefined ? Number(yieldPerAcre) : undefined,
      image: img,
      category,
      quality,
      isMarketplaceListed: !!isMarketplaceListed,
      commissionPercent: cp,
      commissionAmount: commissionAmount,
    });

    await harvest.save();

    await harvest.populate("crops.cropId", "name image price quantity isOrganic quality category");

    const normalized = harvest.crops.map((c) => {
      const cropObj = c.toObject ? c.toObject() : c;
      const ci = cropObj.cropId || {};
      let img2 = ci.image || cropObj.image;
      if (img2 && typeof img2 === 'string') {
        if (img2.startsWith('http') || img2.startsWith('/')) {
          // keep
        } else {
          img2 = `/cropimages/${img2}`;
        }
      } else {
        img2 = `/cropimages/default.jpeg`;
      }
      cropObj.cropId = { ...ci, image: img2 };
      return cropObj;
    });

    res.json({ msg: "Crop added", crops: normalized });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ Remove a crop from harvest
export const removeCrop = async (req, res) => {
  try {
    const { cropId } = req.params;
    let harvest = await Harvest.findOne({ farmer: req.user._id });
    if (!harvest) return res.status(404).json({ msg: "No harvest list found" });

    // Soft-remove: mark removedAt timestamp on matching crop entry (match by cropId or internal id)
    const target = harvest.crops.find((c) => (c.cropId && c.cropId.toString() === cropId) || (c._id && c._id.toString() === cropId));
    if (!target) return res.status(404).json({ msg: "Crop not found in harvest" });
    target.removedAt = new Date();
    await harvest.save();

    await harvest.populate("crops.cropId", "name image price quantity isOrganic quality category");

    const normalized = harvest.crops.map((c) => {
      const cropObj = c.toObject ? c.toObject() : c;
      const ci = cropObj.cropId || {};
      let img = ci.image || cropObj.image;
      if (img && typeof img === 'string') {
        if (img.startsWith('http') || img.startsWith('/')) {
        } else {
          img = `/cropimages/${img}`;
        }
      } else {
        img = `/cropimages/default.jpeg`;
      }
      cropObj.cropId = { ...ci, image: img };
      return cropObj;
    });

    res.json({ msg: "Crop archived", crops: normalized });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Get single harvest crop by id
export const getSingleHarvest = async (req, res) => {
  try {
    const harvest = await Harvest.findOne({ farmer: req.user._id }).populate(
      "crops.cropId",
      "name image price quantity isOrganic quality category"
    );

    if (!harvest) return res.status(404).json({ message: "Harvest not found" });

    const crop = harvest.crops.find((c) => c.cropId._id.toString() === req.params.id);

    if (!crop) return res.status(404).json({ message: "No crop found" });

    res.json(crop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➕ Restore an archived crop in harvest (clear removedAt)
export const restoreCrop = async (req, res) => {
  try {
    const { cropId } = req.params;
    let harvest = await Harvest.findOne({ farmer: req.user._id });
    if (!harvest) return res.status(404).json({ msg: 'No harvest list found' });

    const target = harvest.crops.find((c) => (c.cropId && c.cropId.toString() === cropId) || (c._id && c._id.toString() === cropId));
    if (!target) return res.status(404).json({ msg: 'Crop not found in harvest' });

    target.removedAt = null;
    await harvest.save();

    await harvest.populate('crops.cropId', 'name image price quantity isOrganic quality category');

    const normalized = harvest.crops.map((c) => {
      const cropObj = c.toObject ? c.toObject() : c;
      const ci = cropObj.cropId || {};
      let img = ci.image || cropObj.image;
      if (img && typeof img === 'string') {
        if (img.startsWith('http') || img.startsWith('/')) {
        } else {
          img = `/cropimages/${img}`;
        }
      } else {
        img = `/cropimages/default.jpeg`;
      }
      cropObj.cropId = { ...ci, image: img };
      return cropObj;
    });

    res.json({ msg: 'Crop restored', crops: normalized });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
