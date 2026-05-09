const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  targetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // empty means all users
  type: { type: String, enum: ['general', 'exam', 'club', 'event'], default: 'general' },
  relatedId: { type: mongoose.Schema.Types.ObjectId }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
