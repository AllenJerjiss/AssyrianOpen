// controllers/teamController.js
const Team = require('../models/Team');
const writeCsv = require('../utils/csvWriter');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');

const statusFilePath = path.join(__dirname, '../data/statusUpdates.csv');

const readStatusUpdates = () => {
  return new Promise((resolve, reject) => {
    const statusUpdates = {};
    fs.createReadStream(statusFilePath)
      .pipe(csvParser())
      .on('data', (row) => {
        if (row.Email && row.Status) {
          statusUpdates[row.Email.toLowerCase()] = row.Status;
        }
      })
      .on('end', () => {
        resolve(statusUpdates);
      })
      .on('error', reject);
  });
};

const generateVenmoLink = (name, teamName) => {
  const venmoUsername = 'your-venmo-username'; // Replace with your Venmo username
  const amount = 250; // Replace with the correct amount
  const paymentNote = `Payment for ${name} in ${teamName}`;
  return `https://venmo.com/${venmoUsername}?txn=pay&amount=${amount}&note=${encodeURIComponent(paymentNote)}`;
};

exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find();
    const statusUpdates = await readStatusUpdates();
    const updatedTeams = teams.map(team => {
      const players = team.players.map(player => {
        const updatedStatus = statusUpdates[player.email.toLowerCase()] || player.status;
        return {
          ...player._doc,
          status: updatedStatus,
          venmoLink: updatedStatus === 'payment pending' ? generateVenmoLink(player.name, team.name) : null
        };
      });
      return {
        ...team._doc,
        players
      };
    });
    res.json(updatedTeams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createTeam = async (req, res) => {
  const team = new Team(req.body);
  try {
    const newTeam = await team.save();
    const teams = await Team.find();
    await writeCsv(teams); // Generate the CSV file
    res.status(201).json(newTeam);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.addPlayerToTeam = async (req, res) => {
  try {
    const { name, email } = req.body;
    const teams = await Team.find();
    const emailExists = teams.some(team => 
      team.players.some(player => player.email.toLowerCase() === email.toLowerCase())
    );

    if (emailExists) {
      return res.status(400).json({ message: 'Email already exists in another team.' });
    }

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const newPlayer = { name, email: email.toLowerCase(), status: 'payment pending', venmoLink: generateVenmoLink(name, team.name) };
    team.players.push(newPlayer);
    await team.save();
    const updatedTeams = await Team.find();
    await writeCsv(updatedTeams); // Generate the CSV file

    res.status(201).json({ player: newPlayer });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

