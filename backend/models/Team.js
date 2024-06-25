// models/Team.js
const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  status: { type: String, default: 'payment pending' },
  venmoLink: { type: String }
});

playerSchema.index({ email: 1 }, { unique: true });

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  status: { type: String, default: 'active' },
  players: [playerSchema]
});

teamSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Team', teamSchema);

