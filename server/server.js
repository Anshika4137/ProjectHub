const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Project = require('./models/Project');
const Notification = require('./models/Notification');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/notifications', require('./routes/notifications'));

const createNotification = async ({ recipient, sender, type, message, project, task }) => {
  const notification = await Notification.create({ recipient, sender, type, message, project, task });
  const overflow = await Notification.find({ recipient })
    .sort({ createdAt: -1 })
    .skip(20)
    .select('_id')
    .lean();

  if (overflow.length) {
    await Notification.deleteMany({ _id: { $in: overflow.map((item) => item._id) } });
  }

  io.to(`user:${recipient}`).emit('notification', notification.toObject());
};

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
    if (userId) socket.join(`user:${userId}`);
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
        .filter((recipient) => recipient !== sender)
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
      const project = await Project.findById(data.projectId).select('members');
      const recipient = data.assignedTo?.toString();
      if (!sender || !recipient || !project || !project.members.some((member) => member.toString() === sender) || !project.members.some((member) => member.toString() === recipient) || sender === recipient) return;

      await createNotification({
        recipient,
        sender,
        type: 'task-assigned',
        message: `Task "${data.taskTitle}" has been assigned to you 🎯`,
        project: project._id,
      });
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
