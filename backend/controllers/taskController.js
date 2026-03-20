const asyncHandler = require('express-async-handler');
const ProjectTask = require('../models/ProjectTask');
const { validatePayload } = require('../utils/validate');
const { taskSchemas } = require('../validators/schemas');
const { buildListOptions, sendPaginatedResponse } = require('../utils/pagination');
const { createNotification } = require('../services/notificationService');

const taskPopulate = [
  { path: 'assignee', select: 'name avatar email employeeId' },
  { path: 'createdBy', select: 'name' },
  { path: 'comments.author', select: 'name' }
];

const getTasks = asyncHandler(async (req, res) => {
  const { search } = buildListOptions(req.query);
  const filter = {};

  if (req.user.role === 'Employee') {
    filter.$or = [{ assignee: req.user._id }, { createdBy: req.user._id }];
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.priority) {
    filter.priority = req.query.priority;
  }

  if (search) {
    filter.$and = [
      ...(filter.$and || []),
      {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      }
    ];
  }

  const result = await sendPaginatedResponse({
    model: ProjectTask,
    filter,
    query: req.query,
    populate: taskPopulate
  });

  res.json(result);
});

const createTask = asyncHandler(async (req, res) => {
  const payload = validatePayload(taskSchemas.create, req.body);
  const task = await ProjectTask.create({
    ...payload,
    createdBy: req.user._id
  });

  if (payload.assignee) {
    await createNotification({
      title: 'New task assigned',
      message: `${payload.title} has been assigned to you.`,
      type: 'info',
      module: 'tasks',
      recipients: [payload.assignee],
      createdBy: req.user._id,
      actionUrl: '/tasks'
    });
  }

  res.status(201).json(await ProjectTask.findById(task._id).populate(taskPopulate));
});

const updateTask = asyncHandler(async (req, res) => {
  const payload = validatePayload(taskSchemas.update, req.body);
  const task = await ProjectTask.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  Object.assign(task, payload);
  await task.save();

  res.json(await ProjectTask.findById(task._id).populate(taskPopulate));
});

const addTaskComment = asyncHandler(async (req, res) => {
  const payload = validatePayload(taskSchemas.comment, req.body);
  const task = await ProjectTask.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  task.comments.push({
    author: req.user._id,
    comment: payload.comment
  });
  await task.save();

  res.status(201).json(await ProjectTask.findById(task._id).populate(taskPopulate));
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await ProjectTask.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  await task.deleteOne();
  res.json({ message: 'Task deleted' });
});

module.exports = {
  getTasks,
  createTask,
  updateTask,
  addTaskComment,
  deleteTask
};

