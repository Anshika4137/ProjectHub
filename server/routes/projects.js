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

// ── NEW: Edit Project - Only Owner
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });
    if (project.owner.toString() !== req.user.id)
      return res.status(403).json({ msg: 'Only project owner can edit' });
    project.name = req.body.name || project.name;
    project.description = req.body.description ?? project.description;
    await project.save();
    const updated = await Project.findById(project._id)
      .populate('members', 'name email')
      .populate('owner', 'name email');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ── NEW: Delete Project - Only Owner
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });
    if (project.owner.toString() !== req.user.id)
      return res.status(403).json({ msg: 'Only project owner can delete' });
    await project.deleteOne();
    res.json({ msg: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// ── NEW: Remove Member - Only Owner
router.put('/:id/removemember', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });
    if (project.owner.toString() !== req.user.id)
      return res.status(403).json({ msg: 'Only project owner can remove members' });
    if (req.body.userId === project.owner.toString())
      return res.status(400).json({ msg: 'Cannot remove the project owner' });
    project.members = project.members.filter(
      m => m.toString() !== req.body.userId
    );
    await project.save();
    const updated = await Project.findById(project._id)
      .populate('members', 'name email')
      .populate('owner', 'name email');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;