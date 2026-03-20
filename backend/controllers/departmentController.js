const asyncHandler = require('express-async-handler');
const Department = require('../models/Department');
const Designation = require('../models/Designation');
const { validatePayload } = require('../utils/validate');
const { departmentSchemas } = require('../validators/schemas');

const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find({}).populate('manager', 'name email employeeId').sort('name');
  res.json(departments);
});

const createDepartment = asyncHandler(async (req, res) => {
  const payload = validatePayload(departmentSchemas.department, req.body);
  const department = await Department.create(payload);
  res.status(201).json(department);
});

const updateDepartment = asyncHandler(async (req, res) => {
  const payload = validatePayload(departmentSchemas.department, req.body);
  const department = await Department.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });

  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }

  res.json(department);
});

const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);

  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }

  await department.deleteOne();
  res.json({ message: 'Department removed' });
});

const getDesignations = asyncHandler(async (req, res) => {
  const filter = req.query.department ? { department: req.query.department } : {};
  const designations = await Designation.find(filter).populate('department', 'name').sort('title');
  res.json(designations);
});

const createDesignation = asyncHandler(async (req, res) => {
  const payload = validatePayload(departmentSchemas.designation, req.body);
  const designation = await Designation.create(payload);
  res.status(201).json(designation);
});

const updateDesignation = asyncHandler(async (req, res) => {
  const payload = validatePayload(departmentSchemas.designation, req.body);
  const designation = await Designation.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });

  if (!designation) {
    res.status(404);
    throw new Error('Designation not found');
  }

  res.json(designation);
});

const deleteDesignation = asyncHandler(async (req, res) => {
  const designation = await Designation.findById(req.params.id);

  if (!designation) {
    res.status(404);
    throw new Error('Designation not found');
  }

  await designation.deleteOne();
  res.json({ message: 'Designation removed' });
});

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation
};

