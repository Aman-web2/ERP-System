const asyncHandler = require('express-async-handler');
const AuditLog = require('../models/AuditLog');
const { sendPaginatedResponse } = require('../utils/pagination');

const getAuditLogs = asyncHandler(async (req, res) => {
  const result = await sendPaginatedResponse({
    model: AuditLog,
    filter: {},
    query: req.query,
    populate: { path: 'performedBy', select: 'name role' }
  });

  // Default sorting to newest first
  if (result.items) {
    result.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  res.json(result);
});

module.exports = { getAuditLogs };
