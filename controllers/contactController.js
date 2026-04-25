const { body, validationResult } = require('express-validator');
const ContactSubmission = require('../models/ContactSubmission');

const validateContact = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('subject').optional().trim(),
  body('message').optional().trim(),
  body('source').optional().trim(),
];

const submitContact = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { fullName, email, phone, subject, message, source } = req.body;
    const submission = await ContactSubmission.create({
      fullName,
      email,
      phone,
      subject,
      message,
      source: source || 'contact-page',
    });
    res.status(201).json({
      success: true,
      message: 'Thank you! We will get back to you shortly.',
      data: { id: submission._id },
    });
  } catch (error) {
    console.error('Contact submit error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getSubmissions = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.unread === 'true') filter.isRead = false;

    const [submissions, total] = await Promise.all([
      ContactSubmission.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      ContactSubmission.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: submissions,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const submission = await ContactSubmission.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    res.json({ success: true, data: submission });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteSubmission = async (req, res) => {
  try {
    const submission = await ContactSubmission.findByIdAndDelete(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    res.json({ success: true, message: 'Submission deleted' });
  } catch (error) {
    console.error('Delete submission error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  validateContact,
  submitContact,
  getSubmissions,
  markAsRead,
  deleteSubmission,
};
