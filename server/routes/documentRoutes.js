const express = require('express');
const {
  uploadDocument,
  getDocuments,
  getDocument,
  verifyDocument,
  deleteDocument
} = require('../controllers/documentController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/')
  .post(uploadDocument)
  .get(getDocuments);

router.route('/:id')
  .get(getDocument)
  .delete(deleteDocument);

router.put('/:id/verify', authorize('admin'), verifyDocument);

module.exports = router;