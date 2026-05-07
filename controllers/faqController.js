const Faq = require('../models/Faq');

// Public: get published FAQs ordered by 'order' field
const getFaqs = async (req, res) => {
  try {
    const query = req.query.all === 'true' ? {} : { isPublished: true };
    const faqs = await Faq.find(query).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: faqs });
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: create FAQ
const createFaq = async (req, res) => {
  try {
    const { question, answer, order, isPublished } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ success: false, message: 'Question and answer are required' });
    }
    const faq = await Faq.create({ question, answer, order: order || 0, isPublished: isPublished !== false });
    res.status(201).json({ success: true, data: faq });
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: update FAQ
const updateFaq = async (req, res) => {
  try {
    const { question, answer, order, isPublished } = req.body;
    const faq = await Faq.findByIdAndUpdate(
      req.params.id,
      { question, answer, order, isPublished },
      { new: true }
    );
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    res.json({ success: true, data: faq });
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: delete FAQ
const deleteFaq = async (req, res) => {
  try {
    const faq = await Faq.findByIdAndDelete(req.params.id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    res.json({ success: true, message: 'FAQ deleted' });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getFaqs, createFaq, updateFaq, deleteFaq };
