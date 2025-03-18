const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Placeholder routes for financial insights
router.get('/:userId', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Financial insights will be implemented here'
  });
});

module.exports = router;