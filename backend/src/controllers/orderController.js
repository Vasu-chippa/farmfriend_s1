// apps/backend/controllers/orderController.js
import Order from "../models/Order.js";
import Region from "../models/Region.js";
import MarketplaceListing from "../models/MarketplaceListing.js";

// Create new order
export const createOrder = async (req, res) => {
  try {
    // compute totals and commission breakdown if not provided
    const payload = { ...req.body };
    if (!payload.total) {
      payload.total = Number(payload.price || 0) * Number(payload.quantity || 0);
    }
    const cp = Number(payload.commissionPercent !== undefined ? payload.commissionPercent : 5);
    const commissionAmount = payload.total * (cp / 100);
    payload.commissionPercent = cp;
    payload.commissionAmount = commissionAmount;
    payload.platformAmount = commissionAmount;
    payload.farmerAmount = payload.total - commissionAmount;

    // attach region snapshot if regionId provided
    if (payload.regionId) {
      const region = await Region.findById(payload.regionId).lean();
      if (region) payload.regionSnapshot = { name: region.name, slug: region.slug, id: region._id };
    } else if (payload.regionSnapshot) {
      // ok
    } else if (payload.listingId) {
      const listing = await MarketplaceListing.findById(payload.listingId).populate('regionId');
      if (listing) {
        payload.regionId = listing.regionId?._id;
        payload.regionSnapshot = listing.regionId ? { name: listing.regionId.name, slug: listing.regionId.slug } : {};
      }
    }

    const order = new Order(payload);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single order
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
