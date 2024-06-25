const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvParser = require('csv-parser');

const csvFilePath = path.join(__dirname, '../data/registrations.csv');
const statusFilePath = path.join(__dirname, '../data/statusUpdates.csv');

const csvWriter = createCsvWriter({
  path: csvFilePath,
  header: [
    {id: 'team', title: 'Team'},
    {id: 'firstName', title: 'First Name'},
    {id: 'lastName', title: 'Lirst Name'},
    {id: 'email', title: 'Email'},
    {id: 'phoneNumber', title: 'Phone Number'},
    {id: 'status', title: 'Status'},
  ]
});

const readStatusUpdates = () => {
  return new Promise((resolve, reject) => {
    const statusUpdates = {};
    fs.createReadStream(statusFilePath)
      .pipe(csvParser())
      .on('data', (row) => {
        statusUpdates[row.Email] = row.Status;
      })
      .on('end', () => {
        resolve(statusUpdates);
      })
      .on('error', reject);
  });
};

const writeCsv = async (teams) => {
  const statusUpdates = await readStatusUpdates();
  const records = [];
  teams.forEach(team => {
    team.players.forEach(player => {
      records.push({
        team: team.name,
        name: player.name,
        email: player.email,
        status: statusUpdates[player.email] || player.status // Use status from statusUpdates if available
      });
    });
  });
  await csvWriter.writeRecords(records);
};

module.exports = writeCsv;

