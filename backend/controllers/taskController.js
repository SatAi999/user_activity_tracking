const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

// GET /api/tasks  — user's own tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/tasks
const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, priority } = req.body;

  try {
    const task = await Task.create({
      title,
      description,
      priority,
      user: req.user._id,
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'TASK_CREATED',
      details: `Task "${task.title}" created`,
      ipAddress: req.ip,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Users can only update their own tasks
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const { title, description, status, priority } = req.body;
    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.status = status ?? task.status;
    task.priority = priority ?? task.priority;

    const updated = await task.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'TASK_UPDATED',
      details: `Task "${updated.title}" updated`,
      ipAddress: req.ip,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Users can only delete their own tasks
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'TASK_DELETED',
      details: `Task "${task.title}" deleted`,
      ipAddress: req.ip,
    });

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
