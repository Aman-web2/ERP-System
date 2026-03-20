const asyncHandler = require('express-async-handler');
const Attendance = require('../models/Attendance');
const { buildListOptions, sendPaginatedResponse } = require('../utils/pagination');

const clockIn = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let attendance = await Attendance.findOne({
    employee: req.user._id,
    date: { $gte: today }
  });

  if (attendance?.clockIn) {
    res.status(400);
    throw new Error('Already clocked in today');
  }

  attendance = attendance || new Attendance({ employee: req.user._id, date: new Date() });
  attendance.clockIn = new Date();
  attendance.status = 'Present';
  attendance.notes = req.body.notes || attendance.notes;
  await attendance.save();

  res.status(201).json(attendance);
});

const clockOut = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await Attendance.findOne({
    employee: req.user._id,
    date: { $gte: today }
  });

  if (!attendance?.clockIn) {
    res.status(400);
    throw new Error('Not clocked in today');
  }

  if (attendance.clockOut) {
    res.status(400);
    throw new Error('Already clocked out today');
  }

  attendance.clockOut = new Date();
  if (req.body.notes) {
    attendance.notes = req.body.notes;
  }
  await attendance.save();

  res.json(attendance);
});

const getAllAttendance = asyncHandler(async (req, res) => {
  const { search } = buildListOptions(req.query);
  const filter = {};

  if (req.query.employee) {
    filter.employee = req.query.employee;
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (search) {
    const records = await Attendance.find(filter)
      .populate('employee', 'name email employeeId department')
      .sort('-date');

    const items = records.filter((record) => {
      const user = record.employee;
      if (!user) {
        return false;
      }
      return [user.name, user.email, user.employeeId].filter(Boolean).some((value) => value.toLowerCase().includes(search.toLowerCase()));
    });

    return res.json({
      items,
      pagination: {
        page: 1,
        limit: items.length || 1,
        total: items.length,
        totalPages: 1
      }
    });
  }

  const result = await sendPaginatedResponse({
    model: Attendance,
    filter,
    query: req.query,
    populate: { path: 'employee', select: 'name email employeeId department' }
  });

  res.json(result);
});

const getMyAttendance = asyncHandler(async (req, res) => {
  const result = await sendPaginatedResponse({
    model: Attendance,
    filter: { employee: req.user._id },
    query: req.query
  });

  res.json(result);
});

module.exports = {
  clockIn,
  clockOut,
  getAllAttendance,
  getMyAttendance
};

