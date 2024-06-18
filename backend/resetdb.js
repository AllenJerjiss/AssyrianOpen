const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Team = require('./models/Team');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

const resetDatabase = async () => {
  await connectDB();
  await Team.collection.drop();
  console.log('Team collection dropped');
  };
  mongoose.connection.close();

resetDatabase();

