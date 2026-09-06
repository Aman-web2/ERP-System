const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Admin', 'HR', 'Accountant', 'Employee'],
    default: 'Employee'
  },
  avatar: {
    type: String,
    default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['PendingDetails', 'PendingApproval', 'Active', 'Inactive'],
    default: 'Active'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  designation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Designation'
  },
  salary: {
    type: Number,
    default: 0
  },
  phone: {
    type: String
  },
  dateOfJoining: {
    type: Date,
    default: Date.now
  },
  address: {
    type: String,
    default: ''
  },
  resetPasswordOtp: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

userSchema.pre('validate', function assignEmployeeId() {
  if (!this.employeeId) {
    this.employeeId = `EMP-${String(Date.now()).slice(-6)}`;
  }
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;

