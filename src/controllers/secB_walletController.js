
const charactersModel = require("../models/secB_charactersModel");
const walletModel = require("../models/secB_walletModel");

// Assuming walletController.js


module.exports.readWalletByUserId = (req, res, next) =>
{
    const data = {
        user_id: req.params.user_id
    }
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readWalletByUserId:", error);
            res.status(500).json(error);
        } else {
            if(results.length === 0) 
            {
                res.status(404).json({
                    message: "User not found"
                });
            }
            else res.status(200).json(results[0]);
        }
    }

    walletModel.selectByUserId(data, callback);
}


module.exports.addPointsForNewTask = (req, res, next) => {
  const user_id = req.user_id;
  const task_id = req.task_id;

  // Call the model function to add points to the wallet
  walletModel.addPointsToWallet(user_id, task_id, (error, results) => {
    if (error) {
      console.error('Error adding points to wallet:', error);
      return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }

    // Return after sending a response
    return res.status(200).json({ message: 'Points added to wallet successfully.', results: results[1][0] });
  });
};

module.exports.deducePointsForDeleteTask = (req, res, next) => {
  const user_id = req.user_id;
  const task_id = req.task_id;

  // Call the model function to deduce points from the wallet
  walletModel.deducePointsFromWallet(user_id, task_id, (error, results) => {

    if (error) {
      console.error('Error deducing points from wallet:', error);
      return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }

    // Return after sending a response
      return res.status(200).json({ message: 'Points deduced from wallet successfully.', 
                              results: results[1][0]});
  });
};

module.exports.updateWallet = (req, res, next) => {
  // Assuming updateWalletBalanceForAllUsers is a synchronous function with callbacks
  walletModel.updateWalletBalanceForAllUsers((updateError, updateResults) => {
    if (updateError) {
      console.error('Error updating wallets:', updateError);
      res.status(500).json({ error: 'Internal Server Error', details: updateError.message });
    } else {
      // Now, execute selectAll after the update is complete
      walletModel.selectAll((selectAllError, selectAllResults) => {
        if (selectAllError) {
          console.error("Error in selectAll:", selectAllError);
          res.status(500).json({ error: 'Internal Server Error', details: selectAllError.message });
        } else {
          res.status(200).json({ message: 'Wallets updated successfully.', results: selectAllResults });
        }
      });
    }
  });
};

module.exports.deducePointsEquipment = (req, res) => {
  const equipment = req.equipment; // Retrieved from the first middleware
  if (!equipment) {
    return res.status(404).json({ message: "Character or Arsenal Not Found" });
  }
  
  // Get user_id from character_status based on character_id
  charactersModel.getUserIdByCharacterId(equipment.character_id, (user_idError, user_id) => {
    if (user_idError) {
      console.error("Error getting user_id from character_status:", user_idError);
      return res.status(500).json(user_idError);
    }
    // Deduct points from the user's wallet
    walletModel.deductPoints(user_id, equipment.points_worth, (walletError, walletResult) => {
      if (walletError) {
        console.error("Error deducting points from wallet:", walletError);
        walletModel.deleteLastEquipment(); 
        return res.status(500).json({
          walletError: walletError,
          message: "Insufficient Money!!!"
        }); 
      }

      if (!walletResult || !walletResult[1] || !walletResult[1][0]) {
        return res.status(404).json({ message: "Character Not Found" });
      }

      // Return the response
      res.status(200).json({
        itemBought: equipment,
        message: "Points deducted successfully",
        User: walletResult[1][0].user_id,
        Balance: walletResult[1][0].points_balance,
      });
    });
  });
};


// Function to handle deducting points from the wallet for skill purchase
module.exports.deducePointsSkill = (req, res) => {
  const skill = req.skill; // Retrieved from the first middleware
  if (!skill) {
    return res.status(404).json({ message: "Library or Skill Not Found" });
  }
  
  // Get user_id from character_status based on character_id
  charactersModel.getUserIdByCharacterId(skill.character_id, (user_idError, user_id) => {
    if (user_idError) {
      console.error("Error getting user_id from character_status:", user_idError);
      return res.status(500).json(user_idError);
    }
    // Deduct points from the user's wallet
    walletModel.deductPoints(user_id, skill.points_worth, (walletError, walletResult) => {
      if (walletError) {
        walletModel.deleteLastSkill(); 
        console.error("Error deducting points from wallet:", walletError);
        return res.status(500).json({
          walletError: walletError,
          message: "Insufficient Money!!!"
        });
      }

      // Check if walletResult has the expected structure
      if (walletResult && walletResult[1] && walletResult[1][0]) {
        res.status(200).json({
          skillBought: skill,
          message: "Points deducted successfully",
          User: walletResult[1][0].user_id,
          Balance: walletResult[1][0].points_balance,
        });
      } else {
        res.status(404).json({ message: "Character Not Found" });
      }
    });
  });
};
