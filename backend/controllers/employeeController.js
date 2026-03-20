const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { validatePayload } = require('../utils/validate');
const { employeeSchemas } = require('../validators/schemas');
const { sendPaginatedResponse, buildListOptions } = require('../utils/pagination');
const { ROLES } = require('../constants/roles');
const { createNotification } = require('../services/notificationService');

const employeePopulate = [
  { path: 'department', select: 'name' },
  { path: 'designation', select: 'title' }
];

const getEmployees = asyncHandler(async (req, res) => {
  const { search } = buildListOptions(req.query);
  const filter = { role: { $ne: ROLES.ADMIN } };

  if (req.query.role) {
    filter.role = req.query.role;
  }

  if (req.query.department) {
    filter.department = req.query.department;
  }

  if (req.query.status) {
    filter.isActive = req.query.status === 'active';
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } }
    ];
  }

  const result = await sendPaginatedResponse({
    model: User,
    filter,
    query: req.query,
    populate: employeePopulate,
    select: '-password -resetPasswordOtp -resetPasswordExpires'
  });

  res.json(result);
});

const createEmployee = asyncHandler(async (req, res) => {
  const payload = validatePayload(employeeSchemas.create, req.body);
  const existingUser = await User.findOne({ email: payload.email });

  if (existingUser) {
    res.status(400);
    throw new Error('Employee with this email already exists');
  }

  const employee = await User.create(payload);
  await createNotification({
    title: 'New employee onboarded',
    message: `${employee.name} joined as ${employee.role}.`,
    type: 'success',
    module: 'employees',
    recipientRoles: [ROLES.ADMIN, ROLES.HR],
    createdBy: req.user._id,
    actionUrl: '/employees'
  });

  const populatedEmployee = await User.findById(employee._id)
    .populate(employeePopulate)
    .select('-password -resetPasswordOtp -resetPasswordExpires');

  res.status(201).json(populatedEmployee);
});

const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id)
    .populate(employeePopulate)
    .select('-password -resetPasswordOtp -resetPasswordExpires');

  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }

  res.json(employee);
});

const updateEmployee = asyncHandler(async (req, res) => {
  const payload = validatePayload(employeeSchemas.update, req.body);
  const employee = await User.findById(req.params.id);

  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }

  Object.assign(employee, payload);
  await employee.save();

  const updatedEmployee = await User.findById(req.params.id)
    .populate(employeePopulate)
    .select('-password -resetPasswordOtp -resetPasswordExpires');

  res.json(updatedEmployee);
});

const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);

  if (!employee) {
    res.status(404);
    throw new Error('Employee not found');
  }

  if (employee.role === ROLES.ADMIN) {
    res.status(400);
    throw new Error('Cannot delete admin user');
  }

  await employee.deleteOne();
  res.json({ message: 'Employee removed' });
});

module.exports = {
  getEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
};

