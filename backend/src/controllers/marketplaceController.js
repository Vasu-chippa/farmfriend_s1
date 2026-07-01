import MarketplaceListing from '../models/MarketplaceListing.js';
import Harvest from '../models/Harvest.js';

export const createListingFromHarvest = async (req, res) => {
  try {
    const { harvestId, cropIndex, price, quantity, title, description, images, regionId } = req.body;
    // If harvestId provided, derive listing details
    let listingPayload = { price, quantity, title, description, images, regionId, farmer: req.user._id };
    if (harvestId) {
      const harvest = await Harvest.findOne({ farmer: req.user._id, _id: harvestId });
      if (!harvest) return res.status(404).json({ error: 'Harvest not found' });
      const crop = typeof cropIndex === 'number' ? harvest.crops[cropIndex] : harvest.crops[0];
      if (!crop) return res.status(404).json({ error: 'Crop not found in harvest' });
      listingPayload = {
        ...listingPayload,
        harvestId: harvest._id,
        cropId: crop.cropId || undefined,
        title: title || crop.name,
        description: description || crop.quality || '',
        price: price !== undefined ? price : crop.price,
        quantity: quantity !== undefined ? quantity : crop.quantity,
      };
    }

    // If regionId not provided, try to inherit from the harvest's regionId
    if (!listingPayload.regionId && harvest && harvest.regionId) {
      listingPayload.regionId = harvest.regionId;
    }

    const listing = await MarketplaceListing.create(listingPayload);
    res.status(201).json(listing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const listActiveListings = async (req, res) => {
  try {
    const listings = await MarketplaceListing.find({ isActive: true, removedAt: null }).populate('farmer', 'fullName').limit(100);
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { createListingFromHarvest, listActiveListings };
import Harvest from "../models/Harvest.js";

// Get all crops uploaded by farmers (for marketplace)
export const getMarketplaceCrops = async (req, res) => {
  try {
    const crops = await Harvest.find()
      .populate("farmer", "name email") // shows farmer info
      .sort({ createdAt: -1 });
    res.json(crops);
  } catch (error) {
    res.status(500).json({ message: "Failed to load marketplace crops", error });
  }
};
