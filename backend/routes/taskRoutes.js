const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, addTaskComment, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getTasks)
  .post(protect, createTask);
router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, deleteTask);
router.post('/:id/comments', protect, addTaskComment);

module.exports = router;

