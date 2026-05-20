const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const sendEmail = require('../config/email');

const router = express.Router();

// Helper to sign JWT
const getSignedJwtToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_key_food_rescue_connect_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, organization, address, coordinates } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists with this email' });
    }

    // Format location properly
    const location = {
      type: 'Point',
      coordinates: coordinates || [0, 0], // [longitude, latitude]
    };

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      organization,
      address,
      location,
    });

    // Create token
    const token = getSignedJwtToken(user._id);

    // Send Welcome Transactional Email (async, doesn't block response)
    const welcomeHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #111; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #8b5cf6;">🍕 Welcome to Food Rescue Connect, ${user.name}!</h2>
        <p>Thank you for registering as a key partner: <strong>${user.role.toUpperCase()}</strong>.</p>
        <p>Our real-time matching, socket coordination, and machine learning models are fully active in your area to prevent waste and feed local communities.</p>
        <p>Login to your portal to start listing, claiming, or navigating active rescues today!</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777;">Food Rescue Connect Logistics Services Inc.</p>
      </div>
    `;
    
    sendEmail({
      email: user.email,
      subject: '🍕 Welcome to Food Rescue Connect!',
      html: welcomeHtml,
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        organization: user.organization,
        address: user.address,
        location: user.location,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Create token
    const token = getSignedJwtToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        organization: user.organization,
        address: user.address,
        location: user.location,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        organization: req.user.organization,
        address: req.user.address,
        location: req.user.location,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
