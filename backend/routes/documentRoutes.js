const express = require('express');
const router = express.Router();
const { upload, getDocuments, uploadDocument, deleteDocument } = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getDocuments)
  .post(protect, upload.single('file'), uploadDocument);
router.delete('/:id', protect, deleteDocument);

module.exports = router;

