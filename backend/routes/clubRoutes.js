const express = require('express');
const router = express.Router();
const Club = require('../models/Club');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const Notification = require('../models/Notification');
const ClubLeaveRequest = require('../models/ClubLeaveRequest');

// Get all clubs
router.get('/', async (req, res) => {
  try {
    let clubs = await Club.find();
    
    // If no clubs exist in the database, seed some default ones for demo purposes
    if (clubs.length === 0) {
      const mockClubs = [
        {
          name: 'Coding Club',
          description: 'Learn algorithms, web development, and participate in hackathons.',
          members: [],
          availableSlots: [
            { time: 'Monday 4:00 PM', capacity: 20, bookedBy: [] },
            { time: 'Wednesday 4:00 PM', capacity: 20, bookedBy: [] }
          ],
          imageUrl: 'https://images.unsplash.com/photo-1515879212627-48761241328a?w=500'
        },
        {
          name: 'Music & Arts Club',
          description: 'Explore your creative side with music, painting, and drama.',
          members: [],
          availableSlots: [
            { time: 'Tuesday 5:00 PM', capacity: 15, bookedBy: [] },
            { time: 'Thursday 5:00 PM', capacity: 15, bookedBy: [] }
          ],
          imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500'
        },
        {
          name: 'Sports & Fitness Club',
          description: 'Stay active with various sports activities and fitness sessions.',
          members: [],
          availableSlots: [
            { time: 'Friday 6:00 AM', capacity: 30, bookedBy: [] },
            { time: 'Saturday 7:00 AM', capacity: 30, bookedBy: [] }
          ],
          imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500'
        }
      ];
      
      await Club.insertMany(mockClubs);
      clubs = await Club.find(); // Refetch
    }
    
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a club (Admin only)
router.post('/', protect, admin, async (req, res) => {
  const { name, description, imageUrl, availableSlots } = req.body;
  try {
    const club = await Club.create({
      name,
      description,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500',
      availableSlots: availableSlots || [
        { time: 'Monday 4:00 PM', capacity: 20, bookedBy: [] },
        { time: 'Wednesday 4:00 PM', capacity: 20, bookedBy: [] }
      ]
    });

    // Create Notification
    await Notification.create({
      title: 'New Club Registered!',
      message: `A new club "${club.name}" is now available.`,
      type: 'club',
      relatedId: club._id
    });

    res.status(201).json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a club (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    
    await club.deleteOne();
    res.json({ message: 'Club deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a club (Admin only)
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const club = await Club.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!club) return res.status(404).json({ message: 'Club not found' });
    
    // Create Notification
    await Notification.create({
      title: 'Club Details Updated!',
      message: `The details for club "${club.name}" have been updated.`,
      type: 'club',
      relatedId: club._id
    });

    res.json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single club
router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    res.json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join a club & book slot
router.post('/:id/join', protect, async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    if (!club.members.includes(req.user._id)) {
      club.members.push(req.user._id);
      
      // Assign slot if provided in req.body
      if(req.body.slotIndex !== undefined && club.availableSlots[req.body.slotIndex]) {
        club.availableSlots[req.body.slotIndex].bookedBy.push(req.user._id);
      }
      
      await club.save();

      // Add club to user's joined clubs
      const user = await User.findById(req.user._id);
      user.joinedClubs.push(club._id);
      await user.save();
    }

    res.json({ message: 'Successfully joined the club', club });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit Club Leave Request
router.post('/:id/leave-request', protect, async (req, res) => {
  const { reason } = req.body;
  try {
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });

    // Check if user is a member
    if (!club.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are not a member of this club.' });
    }

    // Check if a pending request already exists
    const existingRequest = await ClubLeaveRequest.findOne({ userId: req.user._id, clubId: club._id, status: 'pending' });
    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending leave request for this club.' });
    }

    const request = await ClubLeaveRequest.create({
      userId: req.user._id,
      clubId: club._id,
      reason,
      status: 'pending'
    });

    res.status(201).json({ message: 'Leave request submitted successfully', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
