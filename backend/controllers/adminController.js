const User = require('../models/User');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'USER_DELETED',
      details: `Admin deleted user ${user.email}`,
      ipAddress: req.ip,
    });

    await Task.deleteMany({ user: user._id });
    await user.deleteOne();

    res.json({ message: 'User and their tasks deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PATCH /api/admin/users/:id/status
const updateUserStatus = async (req, res) => {
  const { status } = req.body;

  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ message: 'Status must be active or inactive' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own status' });
    }

    user.status = status;
    await user.save();

    await ActivityLog.create({
      user: req.user._id,
      action: 'USER_STATUS_UPDATED',
      details: `Admin set user ${user.email} to ${status}`,
      ipAddress: req.ip,
    });

    res.json({ message: `User status updated to ${status}`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('user', 'name email role')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/admin/tasks/assign
const assignTask = async (req, res) => {
  const { title, description, priority, category, dueDate, assignedTo } = req.body;
  if (!title || !assignedTo) return res.status(400).json({ message: 'Title and assignee are required' });

  try {
    const targetUser = await User.findById(assignedTo);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const task = await Task.create({
      title, description: description || '',
      priority: priority || 'medium', category: category || 'Work',
      dueDate: dueDate || null,
      user: req.user._id,
      assignedTo: targetUser._id, assignedBy: req.user._id,
      isAdminAssigned: true,
    });

    await Notification.create({
      user: targetUser._id,
      message: `Admin assigned you a new task: "${title}"`,
      type: 'task_assigned', task: task._id,
    });

    await ActivityLog.create({
      user: req.user._id, action: 'TASK_CREATED',
      details: `Admin assigned task "${title}" to ${targetUser.email}`,
      ipAddress: req.ip,
    });

    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'assignedBy', select: 'name email' },
    ]);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE /api/admin/tasks/:id
const adminDeleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('user', 'email');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'TASK_DELETED',
      details: `Admin deleted task "${task.title}" by ${task.user?.email}`,
      ipAddress: req.ip,
    });

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/logs
const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/analytics
const getAnalytics = async (req, res) => {
  try {
    const [totalUsers, totalTasks, completedTasks, pendingTasks, inProgressTasks, adminAssigned] =
      await Promise.all([
        User.countDocuments({ role: 'user' }),
        Task.countDocuments(),
        Task.countDocuments({ status: 'completed' }),
        Task.countDocuments({ status: 'pending' }),
        Task.countDocuments({ status: 'in-progress' }),
        Task.countDocuments({ isAdminAssigned: true }),
      ]);

    // Tasks by category
    const byCategory = await Task.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
      { $sort: { count: -1 } },
    ]);

    // Tasks created per day — last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const byDay = await Task.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%b %d', date: '$createdAt' } }, count: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
      { $sort: { _id: 1 } },
    ]);

    // Per-user productivity (top 6)
    const perUser = await Task.aggregate([
      { $group: { _id: '$user', total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'u' } },
      { $unwind: { path: '$u', preserveNullAndEmptyArrays: true } },
      { $project: { name: '$u.name', total: 1, completed: 1 } },
      { $sort: { total: -1 } },
      { $limit: 6 },
    ]);

    res.json({ totalUsers, totalTasks, completedTasks, pendingTasks, inProgressTasks, adminAssigned, byCategory, byDay, perUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/admin/search?q=
const search = async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json({ tasks: [], users: [] });
  const regex = new RegExp(q.trim(), 'i');
  try {
    const [tasks, users] = await Promise.all([
      Task.find({ $or: [{ title: regex }, { description: regex }] }).populate('user', 'name email').limit(10),
      User.find({ $or: [{ name: regex }, { email: regex }] }).limit(6),
    ]);
    res.json({ tasks, users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getAllUsers, deleteUser, updateUserStatus, getAllTasks, assignTask, adminDeleteTask, getActivityLogs, getAnalytics, search };

