const mongoose = require('mongoose');
require('dotenv').config();

// Check if the MONGO_URI environment variable is defined
if (!process.env.MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in the .env file.');
  process.exit(1);
}

// Get the MongoDB connection string from the environment variables
const mongoURI = process.env.MONGO_URI;

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  status: { type: String, default: 'active' },
  players: [
    {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      phoneNumber: { type: String, required: true },
      status: { type: String, default: 'payment pending' },
      venmoLink: { type: String }
    }
  ]
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

