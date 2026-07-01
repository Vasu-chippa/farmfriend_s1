import SupportTicket from '../models/SupportTicket.js';
import User from '../models/User.js';

export const raiseTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const ticket = await SupportTicket.create({ createdBy: req.user._id, role: req.user.role, subject, message });
    // assign to nearest agent (simple: first agent in same region)
    const agent = await User.findOne({ role: 'agent', regionId: req.user.regionId });
    if (agent) {
      ticket.assignedAgent = agent._id;
      ticket.status = 'Assigned';
      await ticket.save();
    }
    res.status(201).json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getTicketsForUser = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const resolveTicket = async (req, res) => {
  try {
    const t = await SupportTicket.findById(req.params.id);
    if (!t) return res.status(404).json({ error: 'Ticket not found' });
    t.status = 'Resolved';
    t.resolution = req.body.resolution || '';
    await t.save();
    res.json(t);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export default { raiseTicket, getTicketsForUser, resolveTicket };
