const mongoose = require('mongoose');
require('dotenv').config();

// Get the MongoDB connection string from the environment variables
const mongoURI = process.env.MONGO_URI;

const playerSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, unique: true, sparse: true },
  phoneNumber: { type: String },
  status: { type: String, default: 'payment pending' },
  venmoLink: { type: String }
});

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  status: { type: String, default: 'active' },
  players: [playerSchema]
});

const Team = mongoose.model('Team', teamSchema);

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    return Team.deleteMany({});
  })
  .then(() => {
    console.log('Cleared existing teams');
    const teamNames = Array.from({ length: 18 }, (_, i) => `Team ${i + 1}`);
    const teamPromises = teamNames.map(name => new Team({ name }).save());
    return Promise.all(teamPromises);
  })
  .then(() => {
    console.log('Initialized teams 1-18');
  })
  .catch(err => {
    console.error('Error initializing teams:', err);
  })
  .finally(() => {
    mongoose.disconnect();
  });

