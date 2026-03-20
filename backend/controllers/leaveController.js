const asyncHandler = require('express-async-handler');
const Leave = require('../models/Leave');
const { validatePayload } = require('../utils/validate');
const { leaveSchemas } = require('../validators/schemas');
const { sendPaginatedResponse } = require('../utils/pagination');
const { createNotification } = require('../services/notificationService');
const { ROLES } = require('../constants/roles');

const applyLeave = asyncHandler(async (req, res) => {
  const payload = validatePayload(leaveSchemas.apply, req.body);
  const leave = await Leave.create({
    ...payload,
    employee: req.user._id
  });

  await createNotification({
    title: 'New leave request',
    message: `${req.user.name} submitted a ${payload.leaveType} leave request.`,
    type: 'warning',
    module: 'leaves',
    recipientRoles: [ROLES.ADMIN, ROLES.HR],
    createdBy: req.user._id,
    actionUrl: '/leaves'
  });

  res.status(201).json(leave);
});

const getMyLeaves = asyncHandler(async (req, res) => {
  const result = await sendPaginatedResponse({
    model: Leave,
    filter: { employee: req.user._id },
    query: req.query,
    populate: { path: 'approvedBy', select: 'name' }
  });

  res.json(result);
});

const getAllLeaves = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const result = await sendPaginatedResponse({
    model: Leave,
    filter,
    query: req.query,
    populate: [
      { path: 'employee', select: 'name email employeeId' },
      { path: 'approvedBy', select: 'name' }
    ]
  });

  res.json(result);
});

const updateLeaveStatus = asyncHandler(async (req, res) => {
  const payload = validatePayload(leaveSchemas.updateStatus, req.body);
  const leave = await Leave.findById(req.params.id).populate('employee', 'name');

  if (!leave) {
    res.status(404);
    throw new Error('Leave request not found');
  }

  leave.status = payload.status;
  leave.adminComment = payload.adminComment;
  leave.approvedBy = req.user._id;
  await leave.save();

  await createNotification({
    title: `Leave ${payload.status.toLowerCase()}`,
    message: `${leave.employee?.name || 'Employee'} leave request was ${payload.status.toLowerCase()}.`,
    type: payload.status === 'Approved' ? 'success' : 'error',
    module: 'leaves',
    recipients: [leave.employee?._id].filter(Boolean),
    createdBy: req.user._id,
    actionUrl: '/leaves'
  });

  res.json(leave);
});

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus
};

