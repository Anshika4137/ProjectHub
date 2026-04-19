const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
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

// Socket.io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinProject', (projectId) => {
    socket.join(projectId);
  });

  socket.on('taskUpdated', (data) => {
    io.to(data.projectId).emit('refreshTasks', data);
  });

  // 🔔 ADD THIS NEW PART
  socket.on('newTask', (data) => {
    io.to(data.projectId).emit('notification', {
      message: `New task added: ${data.taskTitle}`,
      projectId: data.projectId
    });
  });

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