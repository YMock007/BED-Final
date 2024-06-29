const model = require("../models/secB_duelModel");


module.exports.readAllDuel = (req, res, next) => {
  const callback = (error, results, fields) => {
      if (error) {
          console.error("Error readAllDuel:", error);
          res.status(500).json(error);
      } else {
          res.status(200).json(results);
      }
  };

  model.selectAll(callback);
};

module.exports.readDuelById = (req, res, next) =>
{
  const data = {
      duel_id: req.params.duel_id
  }
  const callback = (error, results, fields) => {
      if (error) {
          console.error("Error readDuelyId:", error);
          res.status(500).json(error);
      } else {
          if(results.length === 0) 
          {
              res.status(404).json({
                  message: "Duel not found"
              });
          }
          else res.status(200).json(results[0]);
      }
  }

  model.selectById(data, callback);
}

module.exports.readDuelByWin = (req, res, next) =>
{
  const data = {
    participant_name: decodeURIComponent(req.params.character_name)
  }
  const callback = (error, results, fields) => {
      if (error) {
          console.error("Error readDuelByWin:", error);
          res.status(500).json(error);
      } else {
          if(results.length === 0) 
          {
              res.status(404).json({
                  message: "Duel not found"
              });
          }
          else res.status(200).json(results);
      }
  }

  model.selectByWin(data, callback);
}
module.exports.readDuelByLost = (req, res, next) =>
{
  const data = {
      participant_name: decodeURIComponent(req.params.character_name)
  }
    console.log("Decoded participant name:", data.participant_name);

  const callback = (error, results, fields) => {
      if (error) {
          console.error("Error readDuelByWin:", error);
          res.status(500).json(error);
      } else {
          if(results.length === 0) 
          {
              res.status(404).json({
                  message: "Duel not found"
              });
          }
          else res.status(200).json(results);
      }
  }

  model.selectByLost(data, callback);
}

module.exports.readDuelByName = (req, res, next) => {
  const data = {
    participant_name: decodeURIComponent(req.params.character_name)
  };

  console.log("Decoded participant name:", data.participant_name);

  const callback = (error, results, fields) => {
    if (error) {
      console.error("Error readDuelById:", error);
      res.status(500).json(error);
    } else {
      if (results.length === 0) {
        res.status(404).json({
          message: "Duel not found"
        });
      } else {
        res.status(200).json(results);
      }
    }
  };

  model.selectByName(data, callback);
};



module.exports.checkIds = (req, res, next) => {
  const { participant_1_name, participant_2_name, points_bet } = req.body;

  if (!participant_1_name || !participant_2_name || points_bet === undefined || points_bet < 0) {
    return res.status(400).json({ message: "Missing Required Data" });
  }

  model.checkIds(participant_1_name, participant_2_name, points_bet, (err, results) => {
    if (err) {
      console.error('Error in checkIds controller:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (!results.isValid || !results.participant1Data.isParticipantExist || !results.participant2Data.isParticipantExist) {
      return res.status(400).json({ message: "Invalid participants or insufficient points for the duel." });
    }

    // Pass data to the next middleware
    req.participant1Data = results.participant1Data.results[0];
    req.participant2Data = results.participant2Data.results[0];
    req.points_bet = points_bet;
    next();
  });
};


module.exports.createNewDuel = (req, res, next) => {
  const participant1Data = req.participant1Data;
  const participant2Data = req.participant2Data;
  const points_bet = req.points_bet;
    console.log(participant1Data, participant2Data)
  model.createNewDuel(participant1Data, participant2Data, points_bet , (err, { winner, loser }) => {
    if (err) {
      console.error('Error in createNewDuel controller:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // Pass winner_id and loser_id to the next middleware
    req.winner = winner;
    req.loser = loser;
    req.points_bet = points_bet;
    next();
  });
};

module.exports.modifyPoints = (req, res) => {
  const { winner, loser, points_bet } = req;

  model.updatePoints(winner.user_id, loser.user_id, points_bet, (err, result) => {
    if (err) {
      console.error('Error updating points:', err);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }

    res.status(200).json({ success: true, message: 'Points updated successfully',
                           winnerResult: result.winnerResult[0],
                           loserResult: result.loserResult[0] });
  });
};
