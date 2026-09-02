const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');
const { createNotification } = require('../services/notifications');
const { isValidId, isProjectMember, getMemberProject, getMemberTask } = require('../utils/access');

const statuses = ['Todo', 'In Progress', 'Done'];
const priorities = ['Low', 'Medium', 'High'];
const cleanText = (value, maxLength) => typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
const isValidDate = (value) => value === null || value === '' || !Number.isNaN(Date.parse(value));

const validateAssignee = async (project, assignee) => {
  if (!assignee) return null;
  if (!isValidId(assignee)) return 'Invalid assignee id';
  if (!isProjectMember(project, assignee)) return 'Assignee must be a project member';
  const user = await User.exists({ _id: assignee });
  return user ? null : 'Assignee not found';
};

router.post('/', auth, async (req, res, next) => {
  try {
    const result = await getMemberProject(req.body.projectId, req.user.id);
    if (result.msg) return res.status(result.status).json({ msg: result.msg });
    if (result.project.owner.toString() !== req.user.id) return res.status(403).json({ msg: 'Only project owner can create tasks' });
    const title = cleanText(req.body.title, 160);
    const description = cleanText(req.body.description, 2000);
    const priority = req.body.priority || 'Medium';
    if (!title) return res.status(400).json({ msg: 'Task title is required' });
    if (!priorities.includes(priority)) return res.status(400).json({ msg: 'Invalid priority' });
    if (!isValidDate(req.body.dueDate)) return res.status(400).json({ msg: 'Invalid due date' });
    const assigneeError = await validateAssignee(result.project, req.body.assignedTo);
    if (assigneeError) return res.status(400).json({ msg: assigneeError });
    const task = await Task.create({ title, description, project: result.project._id, assignedTo: req.body.assignedTo || null, priority, dueDate: req.body.dueDate || null });
    res.status(201).json(task);
  } catch (err) { next(err); }
});

router.get('/:projectId', auth, async (req, res, next) => {
  try {
    const result = await getMemberProject(req.params.projectId, req.user.id);
    if (result.msg) return res.status(result.status).json({ msg: result.msg });
    const tasks = await Task.find({ project: result.project._id }).populate('assignedTo', 'name email').populate('comments.user', 'name');
    res.json(tasks);
  } catch (err) { next(err); }
});

router.put('/:id', auth, async (req, res, next) => {
  try {
    const result = await getMemberTask(req.params.id, req.user.id);
    if (result.msg) return res.status(result.status).json({ msg: result.msg });
    const { task, project } = result;
    if (req.body.status !== undefined) {
      if (!statuses.includes(req.body.status)) return res.status(400).json({ msg: 'Invalid status' });
      task.status = req.body.status;
    }
    if (req.body.priority !== undefined) {
      if (!priorities.includes(req.body.priority)) return res.status(400).json({ msg: 'Invalid priority' });
      task.priority = req.body.priority;
    }
    if (req.body.assignedTo !== undefined) {
      const assigneeError = await validateAssignee(project, req.body.assignedTo);
      if (assigneeError) return res.status(400).json({ msg: assigneeError });
      task.assignedTo = req.body.assignedTo || null;
    }
    if (req.body.dueDate !== undefined) {
      if (!isValidDate(req.body.dueDate)) return res.status(400).json({ msg: 'Invalid due date' });
      task.dueDate = req.body.dueDate || null;
    }
    if (req.body.title !== undefined) {
      const title = cleanText(req.body.title, 160);
      if (!title) return res.status(400).json({ msg: 'Task title is required' });
      task.title = title;
    }
    if (req.body.description !== undefined) task.description = cleanText(req.body.description, 2000);
    await task.save();
    res.json(await Task.findById(task._id).populate('assignedTo', 'name email'));
  } catch (err) { next(err); }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const result = await getMemberTask(req.params.id, req.user.id);
    if (result.msg) return res.status(result.status).json({ msg: result.msg });
    if (result.project.owner.toString() !== req.user.id) return res.status(403).json({ msg: 'Only project owner can delete tasks' });
    await result.task.deleteOne();
    res.json({ msg: 'Task deleted' });
  } catch (err) { next(err); }
});

router.post('/:id/comment', auth, async (req, res, next) => {
  try {
    const result = await getMemberTask(req.params.id, req.user.id);
    if (result.msg) return res.status(result.status).json({ msg: result.msg });
    const text = cleanText(req.body.text, 1000);
    if (!text) return res.status(400).json({ msg: 'Comment text is required' });
    result.task.comments.push({ user: req.user.id, text });
    await result.task.save();
    const updated = await Task.findById(result.task._id).populate('comments.user', 'name');
    try {
      const author = await User.findById(req.user.id).select('name');
      const recipients = [...new Set([result.task.assignedTo?.toString(), result.project.owner.toString()].filter((recipient) => recipient && recipient !== req.user.id))];
      await Promise.all(recipients.map((recipient) => createNotification({ recipient, sender: req.user.id, type: 'comment-added', message: `${author?.name || 'A teammate'} commented on "${result.task.title}"`, project: result.project._id, task: result.task._id })));
    } catch (notificationError) { console.error('Unable to create comment notification'); }
    res.json(updated);
  } catch (err) { next(err); }
});

router.put('/:id/comment/:commentId', auth, async (req, res, next) => {
  try {
    if (!isValidId(req.params.commentId)) return res.status(400).json({ msg: 'Invalid comment id' });
    const result = await getMemberTask(req.params.id, req.user.id);
    if (result.msg) return res.status(result.status).json({ msg: result.msg });
    const comment = result.task.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });
    if (comment.user.toString() !== req.user.id) return res.status(403).json({ msg: 'You can only edit your own comments' });
    const text = cleanText(req.body.text, 1000);
    if (!text) return res.status(400).json({ msg: 'Comment text is required' });
    comment.text = text;
    await result.task.save();
    res.json(await Task.findById(result.task._id).populate('comments.user', 'name'));
  } catch (err) { next(err); }
});

router.delete('/:id/comment/:commentId', auth, async (req, res, next) => {
  try {
    if (!isValidId(req.params.commentId)) return res.status(400).json({ msg: 'Invalid comment id' });
    const result = await getMemberTask(req.params.id, req.user.id);
    if (result.msg) return res.status(result.status).json({ msg: result.msg });
    const comment = result.task.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ msg: 'Comment not found' });
    if (comment.user.toString() !== req.user.id) return res.status(403).json({ msg: 'You can only delete your own comments' });
    comment.deleteOne();
    await result.task.save();
    res.json(await Task.findById(result.task._id).populate('comments.user', 'name'));
  } catch (err) { next(err); }
});

module.exports = router;
