const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Create an event (Admin only)
router.post('/events', protect, admin, async (req, res) => {
  const { title, description, date, location, eligibility, imageUrl, isPaid, price, driveLink } = req.body;
  try {
    const event = await Event.create({
      title,
      description,
      date,
      location,
      eligibility: eligibility || { department: 'All', year: 'All' },
      imageUrl,
      isPaid: isPaid || false,
      price: price || 0,
      driveLink
    });

    // Create Notification
    await Notification.create({
      title: 'New Event Created!',
      message: `Admin has posted a new event: ${event.title}`,
      type: 'event',
      relatedId: event._id
    });

    // Send Push Notifications
    const users = await User.find({ expoPushToken: { $exists: true } });
    const messages = users.map(u => ({
      to: u.expoPushToken,
      sound: 'default',
      title: 'New Event Created!',
      body: `Admin has posted a new event: ${event.title}`,
      data: { eventId: event._id },
    }));

    if (messages.length > 0) {
      try {
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messages),
        });
      } catch (e) {
        console.error('Error sending push notifications:', e);
      }
    }

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an event (Admin only)
router.put('/events/:id', protect, admin, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    // Create Notification
    await Notification.create({
      title: 'Event Updated!',
      message: `The event "${event.title}" has been updated by the admin.`,
      type: 'event',
      relatedId: event._id
    });

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an event (Admin only)
router.delete('/events/:id', protect, admin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    await event.deleteOne();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve payment (Admin only)
router.post('/events/:id/approve-payment', protect, admin, async (req, res) => {
  const { userId } = req.body;
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const registration = event.registeredUsers.find(r => r.user && r.user.toString() === userId);
    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    registration.paymentStatus = 'paid';
    await event.save();

    res.json({ message: 'Payment approved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
