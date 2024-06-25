import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [teams, setTeams] = useState([]);
  
  useEffect(() => {
    axios.get('/api/teams').then(response => {
      const sortedTeams = response.data.sort((a, b) => {
        const aNumber = parseInt(a.name.split(' ')[1]);
        const bNumber = parseInt(b.name.split(' ')[1]);
        return aNumber - bNumber;
      });
      setTeams(sortedTeams);
    }).catch(error => {
      console.error('There was an error fetching the teams!', error);
    });
  }, []);

  const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

  const promptForInput = (message, validator) => {
    let input;
    do {
      input = prompt(message).trim().toLowerCase();
    } while (!validator(input));
    return capitalize(input);
  };

  const handleAddPlayer = (teamId) => {
    const firstName = promptForInput(
      'Enter first name:',
      input => input && !input.includes(' ') && /^[a-z]+$/.test(input)
    );

    const lastName = promptForInput(
      'Enter last name:',
      input => input && !input.includes(' ') && /^[a-z]+$/.test(input)
    );

    const playerEmail = promptForInput(
      'Enter player email:',
      input => /^[^\s@]+@[^\s@]+\.[a-z]{3}$/.test(input)
    ).toLowerCase(); // Ensure email is stored in lowercase

    const phoneNumber = promptForInput(
      'Enter phone number (format: 123-456-7890):',
      input => /^\d{3}-\d{3}-\d{4}$/.test(input)
    );

    axios.post(`/api/teams/${teamId}/players`, { firstName, lastName, email: playerEmail, phoneNumber })
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
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {team.players.map((player, index) => (
                    <tr key={index}>
                      <td>{player.firstName}</td>
                      <td>{player.lastName}</td>
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

