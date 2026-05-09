const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  availableSlots: [{
    time: { type: String },
    capacity: { type: Number },
    bookedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  imageUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Club', clubSchema);
