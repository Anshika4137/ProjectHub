const Notification = require('../models/Notification');

let io;

const configureNotifications = (socketServer) => {
  io = socketServer;
};

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

  io?.to(`user:${recipient}`).emit('notification', notification.toObject());
  return notification;
};

module.exports = { configureNotifications, createNotification };
