const express = require('express');
const router = express.Router();
const Page = require('../models/Page');

// GET all pages
router.get('/', async (req, res) => {
  try {
    const pages = await Page.find().sort({ createdAt: -1 });
    res.json({ success: true, data: pages });
  } catch (error) {
    console.error('Error fetching pages from DB:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// POST update or create a page
router.post('/', async (req, res) => {
  try {
    const { title, slug, description, parent, content } = req.body;
    
    // Upsert the page based on slug
    const updatedPage = await Page.findOneAndUpdate(
      { slug },
      { title, slug, description, parent, content },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: updatedPage });
  } catch (error) {
    console.error('Error saving page to DB:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// DELETE a page
router.delete('/:slug', async (req, res) => {
  try {
    await Page.findOneAndDelete({ slug: req.params.slug });
    res.json({ success: true, message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page from DB:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
