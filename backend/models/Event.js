const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  eligibility: {
    department: { type: String }, // e.g., "All", "Computer Science"
    year: { type: String } // e.g., "All", "3rd Year"
  },
  organizedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Club' },
  registeredUsers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['Participant', 'Audience'] },
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    paymentId: { type: String }
  }],
  isPaid: { type: Boolean, default: false },
  price: { type: Number },
  upiId: { type: String },
  imageUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
