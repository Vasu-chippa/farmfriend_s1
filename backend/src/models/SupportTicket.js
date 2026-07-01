import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['farmer','buyer','agent','admin'] },
  subject: { type: String },
  message: { type: String },
  status: { type: String, enum: ['Open','Assigned','Resolved','Closed'], default: 'Open' },
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolution: { type: String },
  messages: [
    {
      from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      body: { type: String },
      at: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

ticketSchema.index({ createdBy: 1, status: 1 });

export default mongoose.model('SupportTicket', ticketSchema);
