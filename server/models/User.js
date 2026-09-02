const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 254 },
  phone: { type: String, trim: true, maxlength: 30, default: '' },
  password: { type: String, required: true, minlength: 6 },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
