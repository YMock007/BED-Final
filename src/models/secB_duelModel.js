// models/checkIds.js
const pool = require('../services/db');

module.exports.selectAll = (callback) => {
  const SQLSTATEMENT = `
  SELECT *
  FROM character_duel
  `;

  pool.query(SQLSTATEMENT, callback);
}
module.exports.selectById = (data, callback) =>
{
  const SQLSTATMENT = `
  SELECT *
  FROM character_duel
  WHERE duel_id = ?;
  `;

  const VALUES = [data.duel_id];

  pool.query(SQLSTATMENT, VALUES, callback);
}
module.exports.selectByWin = (data, callback) =>
{
  const SQLSTATMENT = `
  SELECT *
  FROM character_duel
  WHERE winner_name = ?;
  `;

  const VALUES = [data.participant_name];

  pool.query(SQLSTATMENT, VALUES, callback);
}
module.exports.selectByLost = (data, callback) =>
{
  const SQLSTATMENT = `
  SELECT *
  FROM character_duel
  WHERE loser_name = ?;
  `;

  const VALUES = [data.participant_name];

  pool.query(SQLSTATMENT, VALUES, callback);
}
module.exports.selectByName = (data, callback) =>
{
  const SQLSTATMENT = `
  SELECT *
  FROM character_duel
  WHERE participant_1_name = ? OR participant_2_name = ?;
  `;

  const VALUES = [data.participant_name, data.participant_name];

  pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.checkIds = (participant1Name, participant2Name, pointsBet, callback) => {
  const checkParticipantExistence = (characterName, cb) => {
    const query = `SELECT * FROM character_status WHERE character_name = ?`;
    pool.query(query, [characterName], (err, results) => {
      if (err) return cb(err);
      
      const isParticipantExist = results.length > 0;
      cb(null, { isParticipantExist, results });
    });
  };

  const checkPointsBalance = (userId, points, cb) => {
    const query = `SELECT points_balance FROM usersWallet WHERE user_id = ?`;
    pool.query(query, [userId], (err, results) => {
      if (err) return cb(err);

      const hasEnoughPoints = results.length > 0 && results[0].points_balance >= points;
      cb(null, hasEnoughPoints);
    });
  };

    checkParticipantExistence(participant1Name, (err, participant1Data) => {
    if (err) return callback(err);

    checkParticipantExistence(participant2Name, (err, participant2Data) => {
      if (err) return callback(err);

      if (!participant1Data.isParticipantExist || !participant2Data.isParticipantExist) {
        return callback(null, false);
      }
      const participant_1_id = participant1Data.results[0].user_id;
      const participant_2_id = participant2Data.results[0].user_id;
      checkPointsBalance(participant_1_id, pointsBet, (err, participant1HasEnoughPoints) => {
        if (err) return callback(err);

        checkPointsBalance(participant_2_id, pointsBet, (err, participant2HasEnoughPoints) => {
          if (err) return callback(err);

          const isValid = participant1HasEnoughPoints && participant2HasEnoughPoints;
          return callback(null, {isValid, participant1Data, participant2Data});
        });
      });
    });
  });
};

// Function to simulate a fight between two characters
const simulateFight = (character1, character2) => {
  // For simplicity, let's assume the character with higher HP win
  const score1 = calculateHp(character1);
  const score2 = calculateHp(character2);

  return score1 > score2 ? character1 : character2;
};

// Function to calculate HP
const calculateHp = (character) => {
  return character.hp;
};
module.exports.createNewDuel = (participant1Data, participant2Data, points_bet, callback) => {
  // Log the initial stats
  console.log('Initial Stats:');
  console.log('Participant 1:', participant1Data);
  console.log('Participant 2:', participant2Data);

  let currentRound = 0;
  const maxRounds = 20; // Adjust the maximum number of rounds as needed

  // Simulate the fight between the participants
  const fightInterval = setInterval(() => {
    // Use the modified data from the previous round
    const winner = simulateFight(participant1Data, participant2Data);
    const loser = winner === participant1Data ? participant2Data : participant1Data;

    // Log the fight progress
    console.log('-----------------------------------');
    console.log('Fight Progress:');
    console.log('Winner:', winner.character_name);
    console.log('Loser:', loser.character_name);
    const MIN_DAMAGE_TO_WINNER = 5;
    const MIN_DAMAGE_TO_LOSER = 4;
    
    // Calculate damage based on attack and defense
    const winnerAttack = winner.atk - loser.def * Math.random(0.9, 1);
    const loserAttack = loser.atk - winner.def * Math.random(0.9, 1);
    
    // Deduct HP based on the calculated damage
    let damageToWinner = Math.max(MIN_DAMAGE_TO_WINNER, winnerAttack);
    let damageToLoser = Math.max(MIN_DAMAGE_TO_LOSER, loserAttack);
    
    // Deduct HP from both players
    winner.hp -= damageToWinner + damageToWinner * Math.random(-0.10, 0.10);
    loser.hp -= damageToLoser + damageToLoser * Math.random(-0.10, 0.10);
    

        
    // Log updated stats (modified data)
    console.log(`Damage to Winner: ${damageToWinner.toFixed(2)}, Damage to Loser: ${damageToLoser.toFixed(2)}`);
    console.log('Simulated Updated Stats:');
    console.log('Participant 1 HP:', participant1Data.hp);
    console.log('Participant 2 HP:', participant2Data.hp);
    console.log("");

    // Check if the fight is over or reached the maximum rounds
    currentRound++;
    if (winner.hp <= 0 || loser.hp <= 0 || currentRound >= maxRounds) {
      // Stop the simulation
      console.log("---------------------------------------")
      console.log("Congratulations!!!")
      console.log(winner.character_name + " Win the Duel.");
      clearInterval(fightInterval);

      // Update winner_id and loser_id in the callback
      callback(null, { winner, loser });

      // Insert duel information into character_duel table
      const duelInsertQuery = `
        INSERT INTO character_duel (participant_1_name, participant_2_name, points_bet, winner_name, loser_name)
        VALUES (?, ?, ?, ?, ?);
      `;

      pool.query(duelInsertQuery, [participant1Data.character_name, participant2Data.character_name, points_bet, winner.character_name, loser.character_name], (err, result) => {
        if (err) {
          console.error('Error inserting duel information:', err);
        }
      });
    }
  }, 700); // Simulate every 0.7 seconds (adjust as needed)
};

module.exports.updatePoints = (winnerUserId, loserUserId, pointsBet, callback) => {
  // Update points for the winner
  const updateWinnerQuery = `
    UPDATE userswallet
    SET points_balance = points_balance + ?
    WHERE user_id = ?;

    SELECT user_id, points_balance
    FROM userswallet
    WHERE user_id = ?
  `;

  // Deduct points from the loser
  const updateLoserQuery = `
    UPDATE userswallet
    SET points_balance = points_balance - ?
    WHERE user_id = ?;

    
    SELECT user_id, points_balance
    FROM userswallet
    WHERE user_id = ?
  `;

  // Execute both queries in a transaction
  pool.getConnection((err, connection) => {
    if (err) {
      return callback(err);
    }

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return callback(err);
      }

      connection.query(updateWinnerQuery, [pointsBet, winnerUserId, winnerUserId], (err, winnerResult) => {
        if (err) {
          return connection.rollback(() => {
            connection.release();
            callback(err);
          });
        }

        connection.query(updateLoserQuery, [pointsBet, loserUserId, loserUserId], (err, loserResult) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              callback(err);
            });
          }

          connection.commit((err) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                callback(err);
              });
            }

            connection.release();
            callback(null, { winnerResult: winnerResult[1],
                             loserResult: loserResult[1] });
          });
        });
      });
    });
  });
};
