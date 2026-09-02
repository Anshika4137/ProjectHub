const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Project = require('./models/Project');
const { configureNotifications, createNotification } = require('./services/notifications');
const { isValidId, isProjectMember } = require('./utils/access');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);
const clientOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const io = require.main === module ? new Server(server, { cors: { origin: clientOrigins } }) : null;

app.use(cors({ origin: clientOrigins }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});
app.use(express.json());
configureNotifications(io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/notifications', require('./routes/notifications'));

app.get('/health', (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({ status: databaseReady ? 'ok' : 'starting' });
});

const getSocketUserId = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET).id;
  } catch {
    return null;
  }
};

// Socket.io is started only by the persistent Node host, never by Vercel Functions.
if (io) {
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  try {
    const userId = jwt.verify(token, process.env.JWT_SECRET).id;
    if (!userId) return next(new Error('Unauthorized'));
    socket.data.userId = userId;
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinProject', async (projectId) => {
    if (!isValidId(projectId)) return;
    const project = await Project.findById(projectId).select('members');
    if (project && isProjectMember(project, socket.data.userId)) socket.join(projectId);
  });

  socket.on('authenticate', ({ token }) => {
    const userId = getSocketUserId(token);
    if (!userId || userId !== socket.data.userId) return;

    if (socket.data.userRoom) socket.leave(socket.data.userRoom);
    socket.data.userRoom = `user:${userId}`;
    socket.join(socket.data.userRoom);
  });

  socket.on('deauthenticate', () => {
    if (socket.data.userRoom) socket.leave(socket.data.userRoom);
    socket.data.userRoom = null;
  });

  socket.on('taskUpdated', async (data = {}) => {
    try {
      if (!isValidId(data.projectId)) return;
      const project = await Project.findById(data.projectId).select('members');
      if (project && isProjectMember(project, socket.data.userId)) io.to(data.projectId).emit('refreshTasks', { projectId: data.projectId });
    } catch {
      console.error('Unable to refresh project tasks');
    }
  });

  socket.on('newTask', async (data) => {
    try {
      const sender = socket.data.userId;
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
      const sender = socket.data.userId;
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
}

// DB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('MongoDB connection failed:', err.message));

if (require.main === module) {
  const port = process.env.PORT || 5000;
  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
}

// Vercel invokes this Express app as a serverless handler. Local development
// continues to use the HTTP/Socket.io server above through `npm start`.
module.exports = app;

app.use((req, res) => res.status(404).json({ msg: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ msg: 'Something went wrong' });
});
