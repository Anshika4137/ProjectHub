const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Project = require('../models/Project');

// Create Task - Only Owner can create
router.post('/', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.body.projectId);
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Only project owner can create tasks' });
    }
    const task = new Task({
      title: req.body.title,
      description: req.body.description,
      project: req.body.projectId,
      assignedTo: req.body.assignedTo,
      priority: req.body.priority || 'Medium', // ── NEW
      dueDate: req.body.dueDate || null,        // ── NEW
    });
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get Tasks by Project
router.get('/:projectId', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update Task - status, assignee, priority, dueDate
router.put('/:id', auth, async (req, res) => {
  try {
    const updateFields = {};
    if (req.body.status !== undefined) updateFields.status = req.body.status;
    if (req.body.assignedTo !== undefined) updateFields.assignedTo = req.body.assignedTo || null;
    if (req.body.priority !== undefined) updateFields.priority = req.body.priority; // ── NEW
    if (req.body.dueDate !== undefined) updateFields.dueDate = req.body.dueDate;   // ── NEW
    if (req.body.title !== undefined) updateFields.title = req.body.title;         // ── NEW
    if (req.body.description !== undefined) updateFields.description = req.body.description; // ── NEW

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    ).populate('assignedTo', 'name email');
    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ── NEW: Delete Task - Only Owner
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    const project = await Project.findById(task.project);
    if (project.owner.toString() !== req.user.id)
      return res.status(403).json({ msg: 'Only project owner can delete tasks' });
    await task.deleteOne();
    res.json({ msg: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add Comment - Any member can comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    task.comments.push({ user: req.user.id, text: req.body.text });
    await task.save();
    const updated = await Task.findById(task._id).populate('comments.user', 'name');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ── NEW: Edit Comment - Only comment owner
router.put('/:id/comment/:commentId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    const comment = task.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });
    if (comment.user.toString() !== req.user.id)
      return res.status(403).json({ msg: 'You can only edit your own comments' });
    comment.text = req.body.text;
    await task.save();
    const updated = await Task.findById(task._id).populate('comments.user', 'name');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ── NEW: Delete Comment - Only comment owner
router.delete('/:id/comment/:commentId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    const comment = task.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });
    if (comment.user.toString() !== req.user.id)
      return res.status(403).json({ msg: 'You can only delete your own comments' });
    comment.deleteOne();
    await task.save();
    const updated = await Task.findById(task._id).populate('comments.user', 'name');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;