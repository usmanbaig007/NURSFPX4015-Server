const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Please provide username and password' });
    }

    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });
    if (!admin || !(await admin.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      token: generateToken(admin._id),
      admin: { id: admin._id, username: admin.username },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getMe = async (req, res) => {
  res.json({ success: true, admin: req.admin });
};

// Seed initial admin – only usable in development when no admin exists
const seedAdmin = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    const count = await Admin.countDocuments();
    if (count > 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Admin already exists' });
    }
    const admin = await Admin.create({ username: 'admin', password: 'Admin@123' });
    res.status(201).json({
      success: true,
      message: 'Admin created. Username: admin | Password: Admin@123 — change immediately!',
      id: admin._id,
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { login, getMe, seedAdmin };
