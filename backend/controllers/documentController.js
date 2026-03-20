const path = require('path');
const multer = require('multer');
const asyncHandler = require('express-async-handler');
const Document = require('../models/Document');
const { storeFile, ensureUploadDir } = require('../utils/fileStorage');
const { sendPaginatedResponse } = require('../utils/pagination');

const uploadDirectory = ensureUploadDir();
const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (req, file, callback) => {
    callback(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
  }
});

const upload = multer({ storage });

const getDocuments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.module) {
    filter.module = req.query.module;
  }
  if (req.query.linkedEntity) {
    filter.linkedEntity = req.query.linkedEntity;
  }

  const result = await sendPaginatedResponse({
    model: Document,
    filter,
    query: req.query,
    populate: { path: 'uploadedBy', select: 'name' }
  });

  res.json(result);
});

const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Document file is required');
  }

  const storedFile = await storeFile(req.file, req.body.module || 'general');
  const document = await Document.create({
    name: req.body.name || path.parse(req.file.originalname).name,
    module: req.body.module || 'general',
    linkedEntity: req.body.linkedEntity || '',
    tags: req.body.tags ? String(req.body.tags).split(',').map((tag) => tag.trim()).filter(Boolean) : [],
    uploadedBy: req.user._id,
    ...storedFile
  });

  res.status(201).json(document);
});

const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }

  await document.deleteOne();
  res.json({ message: 'Document removed' });
});

module.exports = {
  upload,
  getDocuments,
  uploadDocument,
  deleteDocument
};

