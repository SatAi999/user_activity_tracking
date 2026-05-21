const User = require('../models/User');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

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
      .sort({ createdAt: -1 });
    res.json(tasks);
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
    const [totalUsers, totalTasks, completedTasks, pendingTasks, inProgressTasks] =
      await Promise.all([
        User.countDocuments({ role: 'user' }),
        Task.countDocuments(),
        Task.countDocuments({ status: 'completed' }),
        Task.countDocuments({ status: 'pending' }),
        Task.countDocuments({ status: 'in-progress' }),
      ]);

    res.json({ totalUsers, totalTasks, completedTasks, pendingTasks, inProgressTasks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  updateUserStatus,
  getAllTasks,
  adminDeleteTask,
  getActivityLogs,
  getAnalytics,
};
