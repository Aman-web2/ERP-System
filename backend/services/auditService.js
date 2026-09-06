const AuditLog = require('../models/AuditLog');

const logAction = async (action, entity, entityId, performedBy, details) => {
  try {
    await AuditLog.create({
      action,
      entity,
      entityId: performedBy ? entityId : null, // Fallbacks
      performedBy,
      details
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

module.exports = { logAction };
