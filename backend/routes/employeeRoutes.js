const express = require('express');
const router = express.Router();
const { getEmployees, createEmployee, getEmployeeById, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, authorize('Admin', 'HR', 'Accountant'), getEmployees)
  .post(protect, authorize('Admin', 'HR'), createEmployee);

router.route('/:id')
  .get(protect, authorize('Admin', 'HR', 'Accountant'), getEmployeeById)
  .put(protect, authorize('Admin', 'HR'), updateEmployee)
  .delete(protect, authorize('Admin'), deleteEmployee);

module.exports = router;

