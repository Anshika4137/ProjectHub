const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { isValidId } = require('../utils/access');

const cleanText = (value, maxLength) => typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

router.post('/', auth, async (req, res, next) => {
  try {
    const name = cleanText(req.body.name, 120);
    const description = cleanText(req.body.description, 1000);
    if (!name) return res.status(400).json({ msg: 'Project name is required' });
    const project = await Project.create({ name, description, owner: req.user.id, members: [req.user.id] });
    res.status(201).json(project);
  } catch (err) { next(err); }
});

router.get('/', auth, async (req, res, next) => {
  try {
    const projects = await Project.find({ members: req.user.id }).populate('members', 'name email').populate('owner', 'name email');
    res.json(projects);
  } catch (err) { next(err); }
});

router.put('/:id/addmember', auth, async (req, res, next) => {
  try {
    if (!isValidId(req.params.id) || !isValidId(req.body.userId)) return res.status(400).json({ msg: 'Invalid project or user id' });
    const [project, user] = await Promise.all([Project.findById(req.params.id), User.findById(req.body.userId)]);
    if (!project) return res.status(404).json({ msg: 'Project not found' });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (project.owner.toString() !== req.user.id) return res.status(403).json({ msg: 'Only project owner can add members' });
    if (!project.members.some((member) => member.toString() === req.body.userId)) {
      project.members.push(req.body.userId);
      await project.save();
    }
    res.json(await Project.findById(project._id).populate('members', 'name email').populate('owner', 'name email'));
  } catch (err) { next(err); }
});

router.put('/:id', auth, async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ msg: 'Invalid project id' });
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });
    if (project.owner.toString() !== req.user.id) return res.status(403).json({ msg: 'Only project owner can edit' });
    if (req.body.name !== undefined) {
      const name = cleanText(req.body.name, 120);
      if (!name) return res.status(400).json({ msg: 'Project name is required' });
      project.name = name;
    }
    if (req.body.description !== undefined) project.description = cleanText(req.body.description, 1000);
    await project.save();
    res.json(await Project.findById(project._id).populate('members', 'name email').populate('owner', 'name email'));
  } catch (err) { next(err); }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ msg: 'Invalid project id' });
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });
    if (project.owner.toString() !== req.user.id) return res.status(403).json({ msg: 'Only project owner can delete' });
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ msg: 'Project deleted' });
  } catch (err) { next(err); }
});

router.put('/:id/removemember', auth, async (req, res, next) => {
  try {
    if (!isValidId(req.params.id) || !isValidId(req.body.userId)) return res.status(400).json({ msg: 'Invalid project or user id' });
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });
    if (project.owner.toString() !== req.user.id) return res.status(403).json({ msg: 'Only project owner can remove members' });
    if (req.body.userId === project.owner.toString()) return res.status(400).json({ msg: 'Cannot remove the project owner' });
    project.members = project.members.filter((member) => member.toString() !== req.body.userId);
    await Promise.all([project.save(), Task.updateMany({ project: project._id, assignedTo: req.body.userId }, { $set: { assignedTo: null } })]);
    res.json(await Project.findById(project._id).populate('members', 'name email').populate('owner', 'name email'));
  } catch (err) { next(err); }
});

module.exports = router;
