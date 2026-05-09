const mongoose = require('mongoose');

const chatGroupSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Computer Science Dept", "Robotics Club"
  type: { type: String, enum: ['department', 'club', 'event'], required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId }, // ID of the club or event (null if department)
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('ChatGroup', chatGroupSchema);
