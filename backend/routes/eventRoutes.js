const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const QRCode = require('qrcode');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const Notification = require('../models/Notification');

// Get all events (Filtered by eligibility for students)
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query = {
        $and: [
          { $or: [{ 'eligibility.department': 'All' }, { 'eligibility.department': req.user.department }] },
          { $or: [{ 'eligibility.year': 'All' }, { 'eligibility.year': req.user.year }] }
        ]
      };
    }
    
    let events = await Event.find(query).populate('organizedBy');
    
    // If no events exist in the database, seed some default ones for demo purposes
    if (events.length === 0) {
      const mockEvents = [
        {
          title: 'Annual Tech Symposium',
          description: 'A grand symposium showcasing the latest in technology and innovation.',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          location: 'Main Auditorium',
          eligibility: { department: 'All', year: 'All' },
          imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500',
          isPaid: true,
          price: 100
        },
        {
          title: 'Inter-Department Hackathon',
          description: '24-hour coding challenge to solve real-world problems.',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          location: 'CS Lab 3',
          eligibility: { department: 'Computer Science', year: 'All' },
          imageUrl: 'https://images.unsplash.com/photo-1504384308090-c564bd248275?w=500',
          isPaid: false
        }
      ];
      await Event.insertMany(mockEvents);
      events = await Event.find(query).populate('organizedBy');
    }

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset and seed events (for testing)
router.get('/reset', async (req, res) => {
  try {
    await Event.deleteMany({});
    const mockEvents = [
      {
        title: 'Annual Tech Symposium',
        description: 'A grand symposium showcasing the latest in technology and innovation. Join us for guest lectures, workshops, and project displays.',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        location: 'Main Auditorium',
        eligibility: { department: 'All', year: 'All' },
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500',
        isPaid: true,
        price: 100
      },
      {
        title: 'Inter-Department Hackathon',
        description: '24-hour coding challenge to solve real-world problems. Great prizes to be won!',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        location: 'CS Lab 3',
        eligibility: { department: 'Computer Science', year: 'All' },
        imageUrl: 'https://images.unsplash.com/photo-1504384308090-c564bd248275?w=500',
        isPaid: false
      },
      {
        title: 'Cultural Night 2026',
        description: 'An evening of music, dance, and drama showcasing the diverse cultures of our college.',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        location: 'Open Air Theatre',
        eligibility: { department: 'All', year: 'All' },
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500',
        isPaid: true,
        price: 50
      }
    ];
    await Event.insertMany(mockEvents);
    res.json({ message: 'Events reset and seeded successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizedBy');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    const eventObj = event.toObject();
    if (event.isPaid) {
      // Generate UPI URI
      const upiUri = `upi://pay?pa=${event.upiId || 'college@upi'}&pn=CollegeName&am=${event.price}&cu=INR&tn=Event_${event.title.replace(/\s+/g, '_')}`;
      // Generate QR Code base64
      const paymentQr = await QRCode.toDataURL(upiUri);
      eventObj.paymentQr = paymentQr;
    }
    
    res.json(eventObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create an event (Admin only)
router.post('/', protect, admin, async (req, res) => {
  const { title, description, date, location, eligibility, imageUrl, isPaid, price } = req.body;
  try {
    const event = await Event.create({
      title,
      description,
      date,
      location,
      eligibility: eligibility || { department: 'All', year: 'All' },
      imageUrl,
      isPaid: isPaid || false,
      price: price || 0
    });

    // Create Notification
    await Notification.create({
      title: 'New Event Created!',
      message: `Admin has posted a new event: ${event.title}`,
      type: 'event',
      relatedId: event._id
    });
    console.log('Notification created for event:', event.title);

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an event (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    await event.deleteOne();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an event (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
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

// Register for an event
router.post('/:id/register', protect, async (req, res) => {
  const { role, paymentId } = req.body; // Expecting 'Participant' or 'Audience'
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check Eligibility
    if (event.eligibility && event.eligibility.department !== 'All' && event.eligibility.department !== req.user.department) {
      return res.status(403).json({ message: 'You are not eligible for this event based on your department.' });
    }

    // Check if already registered
    const isAlreadyRegistered = event.registeredUsers.some(r => {
      if (!r) return false;
      const userId = r.user ? r.user.toString() : r.toString();
      return userId === req.user._id.toString();
    });
    
    if (!isAlreadyRegistered) {
      event.registeredUsers.push({ 
        user: req.user._id, 
        role: role || 'Audience',
        paymentId: paymentId || '',
        paymentStatus: event.isPaid ? 'pending' : 'paid'
      });
      await event.save();
    }

    // Generate QR Code data (User ID + Event ID + Role)
    const qrData = JSON.stringify({ 
      userId: req.user._id, 
      eventId: event._id, 
      role: role || 'Audience' 
    });
    
    const qrCodeImage = await QRCode.toDataURL(qrData);

    res.json({ message: 'Registered successfully', qrCode: qrCodeImage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve payment (Admin only)
router.post('/:id/approve-payment', protect, admin, async (req, res) => {
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
