const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type:    { type: String, enum: ['task_assigned', 'overdue', 'comment', 'system'], default: 'system' },
    read:    { type: Boolean, default: false },
    task:    { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
