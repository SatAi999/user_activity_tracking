const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

// GET /api/tasks/:id/comments
const getComments = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isOwner    = task.user.toString() === req.user._id.toString();
    const isAssignee = task.assignedTo?.toString() === req.user._id.toString();
    const isAdmin    = req.user.role === 'admin';
    if (!isOwner && !isAssignee && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const comments = await Comment.find({ task: req.params.id })
      .populate('user', 'name email avatar')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/tasks/:id/comments
const addComment = async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ message: 'Comment content is required' });

  try {
    const task = await Task.findById(req.params.id).populate('user', 'name _id');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isOwner    = task.user._id.toString() === req.user._id.toString();
    const isAssignee = task.assignedTo?.toString() === req.user._id.toString();
    const isAdmin    = req.user.role === 'admin';
    if (!isOwner && !isAssignee && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const comment  = await Comment.create({ task: req.params.id, user: req.user._id, content: content.trim() });
    const populated = await comment.populate('user', 'name email avatar');

    // Notify task owner if commenter is not the owner
    if (task.user._id.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: task.user._id,
        message: `${req.user.name} commented on task "${task.title}"`,
        type: 'comment',
        task: task._id,
      });
    }
    // Notify assignee if they didn't comment
    if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: task.assignedTo,
        message: `${req.user.name} commented on task "${task.title}"`,
        type: 'comment',
        task: task._id,
      });
    }

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getComments, addComment };
