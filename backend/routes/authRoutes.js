const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');
const Event = require('../models/Event');
const EmailChangeRequest = require('../models/EmailChangeRequest');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role, department, year, rollNumber } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role, department, year, rollNumber });
    
    // Auto Department Group Allocation
    if (department) {
      const ChatGroup = require('../models/ChatGroup');
      let deptGroup = await ChatGroup.findOne({ name: department, type: 'department' });
      if (!deptGroup) {
        deptGroup = await ChatGroup.create({ name: department, type: 'department' });
      }
      deptGroup.members.push(user._id);
      await deptGroup.save();
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get User Profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('joinedClubs').select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Find events registered by this user
    const registeredEvents = await Event.find({ registeredUsers: req.user._id });

    res.json({
      user,
      registeredEvents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update User Profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.department = req.body.department || user.department;
    user.year = req.body.year || user.year;
    
    if (req.body.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists && emailExists._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = req.body.email;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      department: updatedUser.department,
      year: updatedUser.year,
      role: updatedUser.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit Email Change Request
router.post('/profile/email-request', protect, async (req, res) => {
  const { newEmail, reason } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if a pending request already exists
    const existingRequest = await EmailChangeRequest.findOne({ userId: req.user._id, status: 'pending' });
    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending email change request.' });
    }

    const request = await EmailChangeRequest.create({
      userId: req.user._id,
      currentEmail: user.email,
      newEmail,
      reason,
      status: 'pending'
    });

    res.status(201).json({ message: 'Request submitted successfully', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
