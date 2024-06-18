// models/Team.js
const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: String,
  email: String,
  status: { type: String, default: 'payment pending' }
});

const teamSchema = new mongoose.Schema({
  name: String,
  players: [playerSchema],
  status: String,
});

module.exports = mongoose.model('Team', teamSchema);

