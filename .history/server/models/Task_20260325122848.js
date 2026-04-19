const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['Todo', 'In Progress', 'Done'],
    default: 'Todo'
  },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // ── NEW ──
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  dueDate: { type: Date, default: null },
  // ─────────
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);