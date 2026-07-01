import Transaction from '../models/Transaction.js';
import Order from '../models/Order.js';
import Wallet from '../models/Wallet.js';
import PlatformWallet from '../models/PlatformWallet.js';

// Create transaction and update wallets (idempotent basic flow)
export const createTransaction = async (req, res) => {
  try {
    const { orderId, paymentMethod, status = 'Completed', meta } = req.body;
    // Populate product->farmer so we can correctly attribute farmerId and region
    const order = await Order.findById(orderId)
      .populate({ path: 'product', populate: { path: 'farmer', select: 'regionId _id' } })
      .lean();
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const gross = Number(order.total || 0);
    const commission = Number(order.commissionAmount || (order.total * (order.commissionPercent||5)/100));
    const farmerAmount = gross - commission;

    // resolve farmerId from populated product if possible
    let farmerId = undefined;
    try {
      if (order.product && order.product.farmer) {
        farmerId = order.product.farmer._id || order.product.farmer;
      }
    } catch (e) {
      // fallback to any farmer field on order
      farmerId = order.farmer || undefined;
    }

    const txn = await Transaction.create({
      orderId,
      buyerId: order.buyer,
      farmerId,
      grossAmount: gross,
      commissionAmount: commission,
      farmerAmount,
      paymentMethod,
      status,
      transactionDate: new Date(),
      meta,
      regionId: order.regionId,
      regionSnapshot: order.regionSnapshot,
    });

    // Update farmer wallet
    if (txn.farmerId && status === 'Completed') {
      const w = await Wallet.findOneAndUpdate({ userId: txn.farmerId }, { $inc: { currentBalance: farmerAmount, lifetimeEarnings: farmerAmount } }, { upsert: true, new: true });
      // reduce pending if applicable
    }

    // Update platform wallet
    if (status === 'Completed') {
      const pw = await PlatformWallet.findOneAndUpdate({}, { $inc: { totalRevenue: commission, todayRevenue: commission, monthlyRevenue: commission, yearlyRevenue: commission }, $push: { commissionHistory: { date: new Date(), amount: commission, orderId } } }, { upsert: true, new: true });
    }

    // Update order status to Completed
    await Order.findByIdAndUpdate(orderId, { status: 'Completed' });

    res.status(201).json(txn);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const listTransactions = async (req, res) => {
  try {
    const txns = await Transaction.find().sort({ transactionDate: -1 }).limit(100);
    res.json(txns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { createTransaction, listTransactions };
