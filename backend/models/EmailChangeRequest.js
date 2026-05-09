const mongoose = require('mongoose');

const emailChangeRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  currentEmail: { type: String, required: true },
  newEmail: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminComment: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('EmailChangeRequest', emailChangeRequestSchema);
