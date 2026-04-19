const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');

// Create Project
router.post('/', auth, async (req, res) => {
  try {
    const project = new Project({
      name: req.body.name,
      description: req.body.description,
      owner: req.user.id,
      members: [req.user.id]
    });
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get All Projects for user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user.id })
      .populate('members', 'name email')
      .populate('owner', 'name email');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Add Member to Project - Only Owner can add
router.put('/:id/addmember', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    // Check if owner
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Only project owner can add members' });
    }
    if (!project.members.includes(req.body.userId)) {
      project.members.push(req.body.userId);
      await project.save();
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;