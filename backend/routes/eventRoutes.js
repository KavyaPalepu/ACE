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
    
    const { type } = req.query;
    if (type === 'past') {
      query.date = { $lt: new Date() };
    } else if (type === 'upcoming') {
      query.date = { $gte: new Date() };
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
        },
        {
          title: 'Freshers Day 2025',
          description: 'Welcome party for the batch of 2025.',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          location: 'Main Auditorium',
          eligibility: { department: 'All', year: 'All' },
          imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500',
          isPaid: false,
          driveLink: 'https://drive.google.com/drive/folders/1placeholder1'
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
router.get('/:id', protect, async (req, res) => {
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
      eventObj.upiUri = upiUri; // Return URI for direct linking
    }
    
    // Add registration QR code if user is registered
    const registration = event.registeredUsers.find(r => r.user && r.user.toString() === req.user._id.toString());
    if (registration) {
      const qrData = JSON.stringify({ 
        userId: req.user._id, 
        eventId: event._id, 
        role: registration.role 
      });
      eventObj.registrationQr = await QRCode.toDataURL(qrData);
    }
    
    res.json(eventObj);
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



module.exports = router;
