const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  clockIn: {
    type: Date
  },
  clockOut: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Half Day', 'Late'],
    default: 'Present'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Attendance', attendanceSchema);

