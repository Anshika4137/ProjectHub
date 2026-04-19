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

// Update Task Status - Any member can drag
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(task);
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
    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;