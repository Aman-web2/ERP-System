const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const CompanySetting = require('../models/CompanySetting');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const { validatePayload } = require('../utils/validate');
const { authSchemas } = require('../validators/schemas');
const { DEFAULT_ROLE_PERMISSIONS, ROLES } = require('../constants/roles');

const getRolePermissions = async (role) => {
  const settings = await CompanySetting.findOne({}).lean();
  return settings?.permissions?.[role] || DEFAULT_ROLE_PERMISSIONS[role] || [];
};

const serializeUser = async (user) => ({
  _id: user._id,
  employeeId: user.employeeId,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  phone: user.phone,
  permissions: await getRolePermissions(user.role)
});

const registerUser = asyncHandler(async (req, res) => {
  const payload = validatePayload(authSchemas.register, req.body);
  const userExists = await User.findOne({ email: payload.email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const existingUsers = await User.countDocuments();
  const assignedRole = existingUsers === 0 ? (payload.role || ROLES.ADMIN) : ROLES.EMPLOYEE;

  const user = await User.create({
    ...payload,
    role: assignedRole
  });

  generateToken(res, user._id);
  res.status(201).json(await serializeUser(user));
});

const loginUser = asyncHandler(async (req, res) => {
  const payload = validatePayload(authSchemas.login, req.body);
  const user = await User.findOne({ email: payload.email });

  if (!user || !(await user.matchPassword(payload.password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(401);
    throw new Error('User account is deactivated');
  }

  generateToken(res, user._id);
  res.json(await serializeUser(user));
});

const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0)
  });

  res.status(200).json({ message: 'User logged out' });
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('department', 'name')
    .populate('designation', 'title');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    ...(await serializeUser(user)),
    department: user.department,
    designation: user.designation,
    salary: user.salary,
    isActive: user.isActive,
    dateOfJoining: user.dateOfJoining
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const payload = validatePayload(authSchemas.forgotPassword, req.body);
  const user = await User.findOne({ email: payload.email });

  if (!user) {
    res.status(404);
    throw new Error('There is no user with that email address.');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordOtp = crypto.createHash('sha256').update(otp).digest('hex');
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user.email,
    subject: 'ERP Password Reset OTP',
    message: `Your ERP password reset OTP is ${otp}. It expires in 10 minutes.`
  });

  res.status(200).json({
    message: 'OTP sent successfully.',
    otp: process.env.NODE_ENV === 'production' ? undefined : otp
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const payload = validatePayload(authSchemas.resetPassword, req.body);
  const hashedOtp = crypto.createHash('sha256').update(payload.otp).digest('hex');

  const user = await User.findOne({
    email: payload.email,
    resetPasswordOtp: hashedOtp,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('OTP is invalid or has expired');
  }

  user.password = payload.newPassword;
  user.resetPasswordOtp = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  generateToken(res, user._id);
  res.json(await serializeUser(user));
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  forgotPassword,
  resetPassword
};

