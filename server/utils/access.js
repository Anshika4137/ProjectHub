const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');

const isValidId = (value) => mongoose.isValidObjectId(value);
const isProjectMember = (project, userId) => project.members.some((member) => member.toString() === userId);

const getMemberProject = async (projectId, userId) => {
  if (!isValidId(projectId)) return { status: 400, msg: 'Invalid project id' };
  const project = await Project.findById(projectId);
  if (!project) return { status: 404, msg: 'Project not found' };
  if (!isProjectMember(project, userId)) return { status: 403, msg: 'You do not have access to this project' };
  return { project };
};

const getMemberTask = async (taskId, userId) => {
  if (!isValidId(taskId)) return { status: 400, msg: 'Invalid task id' };
  const task = await Task.findById(taskId);
  if (!task) return { status: 404, msg: 'Task not found' };
  const result = await getMemberProject(task.project, userId);
  if (result.msg) return result;
  return { task, project: result.project };
};

module.exports = { isValidId, isProjectMember, getMemberProject, getMemberTask };
