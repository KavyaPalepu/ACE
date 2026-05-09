const mongoose = require('mongoose');

const clubLeaveRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clubId: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminComment: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ClubLeaveRequest', clubLeaveRequestSchema);
