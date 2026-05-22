const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// POST /api/auth/register
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Role is ALWAYS 'user' on self-registration.
    // Admins are created only via seeding or by an existing admin in UserManagement.
    const user = await User.create({ name, email, password, role: 'user' });

    await ActivityLog.create({
      user: user._id,
      action: 'REGISTER',
      details: `User ${user.email} registered`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'No account found with this email. Please register first.' });
    }
    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Account is deactivated. Contact admin.' });
    }

    await ActivityLog.create({
      user: user._id,
      action: 'LOGIN',
      details: `User ${user.email} logged in`,
      ipAddress: req.ip,
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  const { name, avatar, currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (name !== undefined) user.name = name.trim() || user.name;
    if (avatar !== undefined) user.avatar = avatar.trim();

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Current password is required to set a new password' });
      const match = await user.matchPassword(currentPassword);
      if (!match) return res.status(401).json({ message: 'Current password is incorrect' });
      user.password = newPassword;
    }

    await user.save();

    const updated = await User.findById(user._id);
    res.json({
      _id: updated._id, name: updated.name, email: updated.email,
      role: updated.role, avatar: updated.avatar, status: updated.status,
      token: req.headers.authorization?.split(' ')[1],
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile };
