import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [teams, setTeams] = useState([]);
  const teamNames = Array.from({ length: 18 }, (_, i) => `Team ${i + 1}`);

  useEffect(() => {
    axios.get('/api/teams').then(response => {
      const existingTeams = response.data.map(team => team.name);
      const teamsToCreate = teamNames.filter(name => !existingTeams.includes(name));
      
      Promise.all(
        teamsToCreate.map(name => axios.post('/api/teams', { name, status: 'active', players: [] }))
      ).then(() => {
        axios.get('/api/teams').then(response => {
          setTeams(response.data);
        }).catch(error => {
          console.error('There was an error fetching the teams!', error);
        });
      }).catch(error => {
        console.error('There was an error creating the teams!', error);
      });
    }).catch(error => {
      console.error('There was an error fetching the teams!', error);
    });
  }, []);

  const handleAddPlayer = (teamId) => {
    const playerName = prompt('Enter player name:');
    if (!playerName) {
      alert('Player name cannot be empty');
      return;
    }
    const playerEmail = prompt('Enter player email:');
    if (!playerEmail) {
      alert('Player email cannot be empty');
      return;
    }

    axios.post(`/api/teams/${teamId}/players`, { name: playerName, email: playerEmail.toLowerCase() })
      .then(response => {
        setTeams(teams.map(team => 
          team._id === teamId ? { ...team, players: [...team.players, response.data.player] } : team
        ));
      })
      .catch(error => {
        console.error('There was an error adding the player to the team!', error);
        alert(error.response.data.message); // Display the error message
      });
  };

  return (
    <div className="home-container">
      <div className="overlay"></div>
      <div className="content">
        <h1>3rd Annual Assyrian Open Golf Tournament</h1>
        <h3>Ritz Carlton, Halfmoon Bay. September 10, 2024. Tee time at 11:30 am</h3>
        <div className="team-grid">
          {teams.map(team => (
            <div key={team._id} className="team-card">
              <h2>{team.name}</h2>
              <table className="player-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {team.players.map((player, index) => (
                    <tr key={index}>
                      <td>{player.name}</td>
                      <td>{player.email}</td>
                      <td>
                        {player.status === 'payment pending' ? (
                          <a
                            href={player.venmoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="venmo-link"
                          >
                            Pay via Venmo
                          </a>
                        ) : (
                          player.status
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {team.players.length < 4 && (
                <button onClick={() => handleAddPlayer(team._id)}>Add to Team</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;

