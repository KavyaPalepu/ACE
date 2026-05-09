const mongoose = require('mongoose');

const eventLeaveRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminComment: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('EventLeaveRequest', eventLeaveRequestSchema);
