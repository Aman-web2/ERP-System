const express = require('express');
const router = express.Router();
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getDepartments)
  .post(protect, authorize('Admin', 'HR'), createDepartment);

router.route('/:id')
  .put(protect, authorize('Admin', 'HR'), updateDepartment)
  .delete(protect, authorize('Admin'), deleteDepartment);

router.route('/designations')
  .get(protect, getDesignations)
  .post(protect, authorize('Admin', 'HR'), createDesignation);

router.route('/designations/:id')
  .put(protect, authorize('Admin', 'HR'), updateDesignation)
  .delete(protect, authorize('Admin'), deleteDesignation);

module.exports = router;

