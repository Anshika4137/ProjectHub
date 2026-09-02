const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Project = require('./models/Project');
const { configureNotifications, createNotification } = require('./services/notifications');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());
configureNotifications(io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/notifications', require('./routes/notifications'));

const getSocketUserId = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET).id;
  } catch {
    return null;
  }
};

// Socket.io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinProject', (projectId) => {
    socket.join(projectId);
  });

  socket.on('authenticate', ({ token }) => {
    const userId = getSocketUserId(token);
    if (!userId) return;

    if (socket.data.userRoom) socket.leave(socket.data.userRoom);
    socket.data.userRoom = `user:${userId}`;
    socket.join(socket.data.userRoom);
  });

  socket.on('deauthenticate', () => {
    if (socket.data.userRoom) socket.leave(socket.data.userRoom);
    socket.data.userRoom = null;
  });

  socket.on('taskUpdated', (data) => {
    io.to(data.projectId).emit('refreshTasks', data);
  });

  socket.on('newTask', async (data) => {
    try {
      const sender = getSocketUserId(data.token);
      const project = await Project.findById(data.projectId).select('members');
      if (!sender || !project || !project.members.some((member) => member.toString() === sender)) return;

      await Promise.all(project.members
        .map((member) => member.toString())
        .map((recipient) => createNotification({
          recipient,
          sender,
          type: 'task-created',
          message: `New task added: ${data.taskTitle}`,
          project: project._id,
        })));
    } catch (err) {
      console.error('Unable to create task notifications');
    }
  });

  // ── NEW: handle taskAssigned event ──
  socket.on('taskAssigned', async (data) => {
    try {
      const sender = getSocketUserId(data.token);
      const project = await Project.findById(data.projectId).select('members owner');
      const recipient = data.assignedTo?.toString();
      if (!sender || !recipient || !project || !project.members.some((member) => member.toString() === sender) || !project.members.some((member) => member.toString() === recipient)) return;

      const notifications = [];

      if (recipient !== sender) {
        notifications.push(createNotification({
          recipient,
          sender,
          type: 'task-assigned',
          message: `Task "${data.taskTitle}" has been assigned to you 🎯`,
          project: project._id,
        }));
      }

      const ownerId = project.owner?.toString();
      if (ownerId && ownerId !== recipient) {
        notifications.push(createNotification({
          recipient: ownerId,
          sender,
          type: 'task-assigned',
          message: `Task "${data.taskTitle}" was assigned to a project member`,
          project: project._id,
        }));
      }

      await Promise.all(notifications);
    } catch (err) {
      console.error('Unable to create assignment notification');
    }
  });
  // ────────────────────────────────────

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// DB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log(err));

server.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
