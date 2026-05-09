const express = require('express');
const router = express.Router();
const EmailChangeRequest = require('../models/EmailChangeRequest');
const ClubLeaveRequest = require('../models/ClubLeaveRequest');
const EventLeaveRequest = require('../models/EventLeaveRequest');
const User = require('../models/User');
const Club = require('../models/Club');
const Event = require('../models/Event');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const Notification = require('../models/Notification');

// --- User Endpoints ---

// Submit email change request
router.post('/email-change', protect, async (req, res) => {
  const { currentEmail, newEmail, reason } = req.body;
  try {
    const request = await EmailChangeRequest.create({
      userId: req.user._id,
      currentEmail,
      newEmail,
      reason
    });
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit club leave request
router.post('/club-leave', protect, async (req, res) => {
  const { clubId, reason } = req.body;
  try {
    const request = await ClubLeaveRequest.create({
      userId: req.user._id,
      clubId,
      reason
    });
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit event leave request
router.post('/event-leave', protect, async (req, res) => {
  const { eventId, reason } = req.body;
  try {
    const request = await EventLeaveRequest.create({
      userId: req.user._id,
      eventId,
      reason
    });
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Admin Endpoints ---

// Get all pending requests
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const emailRequests = await EmailChangeRequest.find({ status: 'pending' }).populate('userId', 'name email');
    const clubRequests = await ClubLeaveRequest.find({ status: 'pending' }).populate('userId', 'name email').populate('clubId', 'name');
    const eventRequests = await EventLeaveRequest.find({ status: 'pending' }).populate('userId', 'name email').populate('eventId', 'title');

    res.json({
      emailRequests,
      clubRequests,
      eventRequests
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve/Reject Email Request
router.put('/admin/email/:id', protect, admin, async (req, res) => {
  const { status, adminComment } = req.body;
  try {
    const request = await EmailChangeRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    request.adminComment = adminComment;
    await request.save();

    if (status === 'approved') {
      // Update user's email
      const user = await User.findById(request.userId);
      if (user) {
        user.email = request.newEmail;
        await user.save();
        console.log('User email updated in DB to:', user.email);
      }
    }

    // Create targeted notification
    await Notification.create({
      title: `Email Change Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your request to change email to ${request.newEmail} has been ${status}.`,
      type: 'general',
      targetUsers: [request.userId]
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve/Reject Club Leave Request
router.put('/admin/club/:id', protect, admin, async (req, res) => {
  const { status, adminComment } = req.body;
  try {
    const request = await ClubLeaveRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    request.adminComment = adminComment;
    await request.save();

    const club = await Club.findById(request.clubId);

    if (status === 'approved' && club) {
      // Remove user from club
      club.availableSlots.forEach(slot => {
        if (slot.bookedBy) {
          slot.bookedBy = slot.bookedBy.filter(u => u.toString() !== request.userId.toString());
        }
      });
      await club.save();
    }

    // Create targeted notification
    await Notification.create({
      title: `Club Leave Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your request to leave club "${club?.name || 'Club'}" has been ${status}.`,
      type: 'club',
      targetUsers: [request.userId]
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve/Reject Event Leave Request
router.put('/admin/event/:id', protect, admin, async (req, res) => {
  const { status, adminComment } = req.body;
  try {
    const request = await EventLeaveRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    request.adminComment = adminComment;
    await request.save();

    const event = await Event.findById(request.eventId);

    if (status === 'approved' && event) {
      // Remove user from event
      event.registeredUsers = event.registeredUsers.filter(r => {
        if (!r) return false;
        const userId = r.user ? r.user.toString() : r.toString();
        return userId !== request.userId.toString();
      });
      await event.save();
    }

    // Create targeted notification
    await Notification.create({
      title: `Event Cancel Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your request to cancel registration for event "${event?.title || 'Event'}" has been ${status}.`,
      type: 'event',
      targetUsers: [request.userId]
    });

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
