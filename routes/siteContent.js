const express = require('express');
const router = express.Router();
const { getContent, updateContent } = require('../controllers/siteContentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:key', getContent);
router.put('/:key', protect, updateContent);

module.exports = router;
