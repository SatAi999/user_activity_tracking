const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Task title is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    category: { type: String, enum: ['Work', 'Personal', 'Urgent', 'Other'], default: 'Other' },
    dueDate: { type: Date, default: null },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isAdminAssigned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);

