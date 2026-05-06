const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/pages.json');

// GET all pages
router.get('/', (req, res) => {
  try {
    if (!fs.existsSync(dataPath)) {
      return res.json({ success: true, data: [] });
    }
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error reading pages.json:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// POST update or create a page
router.post('/', (req, res) => {
  try {
    const newPage = req.body;
    let data = [];
    if (fs.existsSync(dataPath)) {
      data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    } else {
      // Ensure directory exists
      fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    }

    // Check if page with same slug exists
    const index = data.findIndex(p => p.slug === newPage.slug);
    if (index >= 0) {
      data[index] = newPage;
    } else {
      data.push(newPage);
    }

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error saving page to pages.json:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// DELETE a page
router.delete('/:slug', (req, res) => {
  try {
    if (!fs.existsSync(dataPath)) {
      return res.json({ success: true, data: [] });
    }
    let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    data = data.filter(p => p.slug !== req.params.slug);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
