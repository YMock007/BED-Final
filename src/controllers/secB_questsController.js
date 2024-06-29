const model = require("../models/secB_questsModel");

module.exports.readAllQuest = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllQuest:", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    };
  
    model.selectAll(callback);
  };

  module.exports.readQuestById = (req, res, next) =>
{
    const data = {
        quest_id: req.params.quest_id
    }
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readQuestyId:", error);
            res.status(500).json(error);
        } else {
            if(results.length === 0) 
            {
                res.status(404).json({
                    message: "Quest not found"
                });
            }
            else res.status(200).json(results[0]);
        }
    }

    model.selectById(data, callback);
}

module.exports.readAllQuestByReward = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllQuestByReward:", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    };
  
    model.selectAllByReward(callback);
  };
module.exports.readAllQuestByEnemy = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllQuestByEnemy:", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    };
  
    model.selectAllByEnemy(callback);
  };
// Controller to create a new quest
module.exports.createNewQuest = (req, res) => {
    const { title, description, enemy_name, enemy_hp, enemy_atk, enemy_def, hp_reward, atk_reward, def_reward, points_reward } = req.body;

    // Check if required data is missing
    if (
        title === undefined ||
        description === undefined ||
        enemy_name === undefined ||
        enemy_hp === undefined ||
        enemy_atk === undefined ||
        enemy_def === undefined ||
        hp_reward === undefined ||
        atk_reward === undefined ||
        def_reward === undefined ||
        points_reward === undefined
    ) {
        return res.status(400).json({ message: 'Missing Required Data' });
    }

    // Call the model function to create a new quest
    model.createQuest(title, description, enemy_name, enemy_hp, enemy_atk, enemy_def, hp_reward, atk_reward, def_reward, points_reward, (error, result) => {
        if (error) {
            console.error('Error creating new quest:', error);
            return res.status(500).json({ error: 'Internal Server Error', result });
        }

        if (!result.success) {
            return res.status(400).json({ error: 'Quest with the same details already exists', result });
        }

        // Respond with success message or appropriate response
        res.status(201).json(result);
    });
};// Controller to update a quest by ID
module.exports.updateQuestById = (req, res) => {
    const quest_id = req.params.quest_id;
    const updatedData = req.body;

    if (quest_id === undefined || updatedData === undefined) {
        return res.status(400).json({ message: "Missing Required Data" });
    }

    // Call the model function to update the quest 
    model.updateQuestById(quest_id, updatedData, (error, result) => {
        if (error) {
            console.error('Error updating quest by ID:', error);
            return res.status(500).json({ error: 'Internal Server Error', result });
        } else if (result) {
             // Respond with success message or appropriate response
        res.status(200).json({ success: true, message: 'Quest updated successfully', data: result.updatedQuest });
        }
    });
};


// Controller to delete a quest by ID
module.exports.deleteQuestById = (req, res) => {
    const quest_id = req.params.quest_id;

    // Call the model function to delete the quest
    model.deleteQuestById(quest_id, (error, result) => {
        if (error) {
            console.error('Error deleting quest:', error);
            return res.status(500).json({ error: 'Internal Server Error'});
        }

        if (!result.success) {
            return res.status(404).json({ error: 'Quest not found' });
        }

        // Respond with success message or appropriate response
        res.status(200).json({message: 'Quest deleted successfully'});
    });
};


// Controller to read quest detail
module.exports.readQuestDetail = (req, res, next) => {
    const quest_id = req.params.quest_id;   
    if ( req.params.quest_id === undefined || req.params.character_id === undefined ) {
        return res.status(400).json({message: "Missing Required Data."})
    }
    // Call the model function to read quest detail
    model.readQuestDetail(quest_id, (error, questDetail) => {
        if (error) {
            console.error('Error reading quest detail:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (!questDetail) {
            return res.status(404).json({ message: 'Quest not found' });
        }

        // Attach the quest detail to the request object for later use
        req.questDetail = questDetail;
        next(); // Continue to the next middleware
    });
};
module.exports.checkPoints = (req, res, next) => {
    const character_id = req.params.character_id;
    model.checkPoints(character_id, (error, isPointEnough) => {
        if (error) {
            if ( isPointEnough.length === 0 ) {
                return res.status(404).json(error)
            }
            console.error('Error checkPoints', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
        if (isPointEnough.isPointEnough === false) {
            return res.status(404).json({ message: 'Points is not enough to do quest. Minimum Points to do Quest is 3'});
        } else {
            next(); // Continue to the next middleware
        }
    })
}
// Controller to simulate and handle the quest
module.exports.doQuest = (req, res, next) => {
    const character_id = req.params.character_id;
    const questCharacterDetails = req.questCharacterDetails;

    // Call the model function to simulate the quest
    model.doQuest(questCharacterDetails.questDetail, questCharacterDetails.characterDetail, character_id, (error, result) => {
        if (error) {
            console.error('Error simulating quest:', error);
            return res.status(500).json({ error: 'Internal Server Error', result });
        }

        // Check if the character won the quest
        if (result.success) {
            req.questCharacterDetails = questCharacterDetails;
            req.battleDetail = result

            // Proceed to the next middleware
            next();
        } else {
            // Character lost the quest, send an appropriate response
            res.status(200).json({ message: 'Character lost the battle', 
                                    DeducedUserPoints: result.result[1][0] });
        }
    });
};

// Fourth Middleware: Add Attributes and Points
module.exports.addAttributesPoints = (req, res) => {
    const questCharacterDetails = req.questCharacterDetails;
    const battleDetail = req.battleDetail;
    console.log(questCharacterDetails)
    console.log(battleDetail)
    // Check if the character won the quest
    if (battleDetail.success === true) {
        const character_id = req.params.character_id;
        const user_id = questCharacterDetails.characterDetail.user_id;

        // Update character attributes
        model.updateCharacterAttributes(character_id, questCharacterDetails.questDetail, (updateCharacterError, characterResult) => {
            if (updateCharacterError) {
                // Handle the error appropriately
                return res.status(500).json({ message: 'Error updating character attributes', result: characterResult });
            }

            // Update user's wallet with points
            model.updateUserPoints(user_id, questCharacterDetails.questDetail.points_reward, (updatePointsError, pointsResult) => {
                if (updatePointsError) {
                    // Handle the error appropriately
                    return res.status(500).json({ message: 'Error updating user points', result: pointsResult });
                }

                // Send a success response
                res.status(200).json({
                    battleDetail,
                    characterUpdateResult: characterResult,
                    pointsUpdateResult: pointsResult
                });
            });
        });
    } else {
        // Character lost the quest, no need to update attributes or points
        res.status(200).json({ message: 'Character lost the battle' });
    }
};

