const pool = require('../services/db');

module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
    SELECT *
    FROM Quest
    `;
  
    pool.query(SQLSTATEMENT, callback);
  }
  module.exports.selectById = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT *
    FROM quest
    WHERE quest_id = ?;
    `;

    const VALUES = [data.quest_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}
module.exports.selectAllByReward = (callback) => {
    const SQLSTATEMENT = `
    SELECT *
    FROM quest
    ORDER BY (hp_reward + atk_reward + def_reward + points_reward) DESC
    `;
  
    pool.query(SQLSTATEMENT, callback);
  }
module.exports.selectAllByEnemy = (callback) => {
    const SQLSTATEMENT = `
    SELECT *
    FROM quest
    ORDER BY (enemy_hp + enemy_atk + enemy_def) DESC
    `;
  
    pool.query(SQLSTATEMENT, callback);
  }

// Function to create a new quest
module.exports.createQuest = (title, description, enemy_name, enemy_hp, enemy_atk, enemy_def, hp_reward, atk_reward, def_reward, points_reward, callback) => {
    // Check if a quest with the same details already exists
    const checkExistingQuestQuery = `
        SELECT quest_id
        FROM quest
        WHERE title = ? AND description = ? AND enemy_name = ? AND enemy_hp = ? AND enemy_atk = ? AND enemy_def = ? AND hp_reward = ? AND atk_reward = ? AND def_reward = ? AND points_reward = ?;
    `;

    pool.query(checkExistingQuestQuery, [title, description, enemy_name, enemy_hp, enemy_atk, enemy_def, hp_reward, atk_reward, def_reward, points_reward], (checkError, checkResults) => {
        if (checkError) {
            return callback(checkError, null);
        }

        if (checkResults.length > 0) {
            // Quest with the same details already exists
            return callback(null, { success: false });
        }

        // If no existing quest, proceed to create a new one
        const createQuestQuery = `
            INSERT INTO quest (title, description, enemy_name, enemy_hp, enemy_atk, enemy_def, hp_reward, atk_reward, def_reward, points_reward)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            SELECT * FROM quest
            ORDER BY quest_id DESC LIMIT 1;
        `;

        pool.query(createQuestQuery, [title, description, enemy_name, enemy_hp, enemy_atk, enemy_def, hp_reward, atk_reward, def_reward, points_reward], (createError, createResult) => {
            if (createError) {
                return callback(createError, createResult);
            }
            // Quest created successfully
            return callback(null, { success: true, questId: createResult[1][0] });
        });
    });
};
// Function to update a quest by ID
module.exports.updateQuestById = (questId, updatedData, callback) => {
    // Filter out undefined values from the updated data
    const filteredData = Object.fromEntries(Object.entries(updatedData).filter(([key, value]) => value !== undefined));

    // Check if the same data already exists in other quests (except for quest_id)
    const checkDuplicateValuesQuery = `
        SELECT *
        FROM quest
        WHERE ${Object.keys(filteredData).map(key => `(${key} = ? AND ${key} IS NOT NULL)`).join(' AND ')}
        AND quest_id != ?
        LIMIT 1;
    `;

    const checkValues = [...Object.values(filteredData), questId];

    pool.query(checkDuplicateValuesQuery, checkValues, (checkError, checkResults) => {
        if (checkError) {
            return callback(checkError, null);
        }

        if (checkResults.length > 0) {
            // Duplicate values found, return appropriate response
            return callback(null, { success: false, message: 'Duplicate values found. Cannot update quest.' });
        }

        // Update the quest with the new values
        const updateQuestQuery = `
            UPDATE quest
            SET ${Object.keys(filteredData).map(key => `${key} = ?`).join(', ')}
            WHERE quest_id = ?;
        `;

        const updateValues = [...Object.values(filteredData), questId];

        pool.query(updateQuestQuery, updateValues, (updateError, updateResult) => {
            if (updateError) {
                return callback(updateError, null);
            }

            // Get the updated quest by querying the database
            const getUpdatedQuestQuery = `
                SELECT *
                FROM quest
                WHERE quest_id = ?;
            `;

            pool.query(getUpdatedQuestQuery, [questId], (selectError, selectResults) => {
                if (selectError) {
                    return callback(selectError, null);
                }

                // Return the updated quest details
                return callback(null, { updatedQuest: selectResults[0] });
            });
        });
    });
};


// Function to delete a quest by ID
module.exports.deleteQuestById = (quest_id, callback) => {
    // Delete the quest by ID
    const deleteQuestQuery = `
        DELETE FROM quest
        WHERE quest_id = ?;

        ALTER TABLE quest AUTO_INCREMENT = 1;

    `;

    pool.query(deleteQuestQuery, [quest_id], (deleteError, deleteResult) => {
        if (deleteError) {
            return callback(deleteError, null);
        }

        if (deleteResult.affectedRows === 0) {
            // No rows affected, indicating that the quest was not found
            return callback(null, { success: false });
        }

        // Quest deleted successfully
        return callback(null, { success: true });
    });
};


// Function to read quest detail by ID
module.exports.readQuestDetail = (questId, callback) => {
    const readQuestDetailQuery = `
        SELECT *
        FROM quest
        WHERE quest_id = ?;
    `;

    pool.query(readQuestDetailQuery, [questId], (error, results) => {
        if (error) {
            return callback(error, null);
        }

        if (results.length === 0) {
            return callback(null, null); // Quest not found
        }

        const questDetail = results[0];
        return callback(null, questDetail);
    });
};
module.exports.checkPoints = (character_id, callback) => {
    const getUserId = `
        SELECT user_id FROM character_status
        WHERE character_id = ?
    `;
    const checkPoints = `
        SELECT points_balance
        FROM userswallet
        WHERE user_id = ?;
    `;

    pool.query(getUserId, [character_id], (error, result) => {
        if (error) {
            callback({ error: "Cannot get user_id" }, result);
        }

        if (result.length === 0) {
            return callback({ error: "User Not Found" }, result);
        }

        const user_id = result[0].user_id;

        pool.query(checkPoints, [user_id], (error, result) => {
            if (error) {
                callback({ message: "Cannot get points_balance" }, null);
            }

            if (result.length === 0) {
                return callback({ message: "Points Not Found" });
            }

            const points_balance = result[0].points_balance;

            if (points_balance < 30) {
                return callback(null, { isPointEnough: false });
            } else {
                return callback(null, { isPointEnough: true });
            }
        });
    });
};


// Function to simulate a quest (fighting scenario)
module.exports.doQuest = (questDetail, characterDetail, character_id, callback) => {
    // Simulate the quest (fighting scenario)
    const questInterval = setInterval(() => {
        // Simulate the battle scenario
        const characterAttack = (Math.random() * characterDetail.atk) + 5; // Adding a buff of 5 to character's attack
        const enemyDefend = Math.random() * questDetail.enemy_def + (characterDetail.def * 0.5);

        // Deduct enemy HP based on character attack
        const damageToEnemy = Math.max(0, characterAttack - enemyDefend);
        questDetail.enemy_hp -= damageToEnemy;

        // Log character attack
        console.log(`Character attacks for ${damageToEnemy.toFixed(2)} damage. Enemy defends for ${enemyDefend.toFixed(2)} damage. Enemy HP: ${questDetail.enemy_hp.toFixed(2)}`);

        // Check if the quest or character is defeated
        if (questDetail.enemy_hp <= 0) {
            // Character wins the battle
            clearInterval(questInterval); // Stop the simulation
            callback(null, { success: true, message: 'Character wins the battle' });
        } else {
            // Simulate enemy attack
            const enemyAttack = Math.random() * questDetail.enemy_atk + ( characterDetail.atk * 0.8 );
            const characterDefend = Math.random() * characterDetail.def;

            // Deduct character HP based on enemy attack
            const damageToCharacter = Math.max(0, enemyAttack - characterDefend);
            characterDetail.hp -= damageToCharacter;

            // Log enemy attack
            console.log(`Enemy attacks for ${damageToCharacter.toFixed(2)} damage. Character defends for ${characterDefend.toFixed(2)} damage. Character HP: ${characterDetail.hp.toFixed(2)}`);
            console.log('');

            // Check if the character is defeated
            // Check if the character is defeated
            if (characterDetail.hp <= 0) {
                // Character loses the battle
                clearInterval(questInterval); // Stop the simulation

                const getUserId = `
                    SELECT user_id FROM character_status
                    WHERE character_id = ?
                `;
                const deducePoints = `
                    UPDATE userswallet
                    SET points_balance = points_balance - 30
                    WHERE user_id = ?;

                    SELECT user_id,points_balance
                    FROM userswallet
                    WHERE user_id = ?;
                `;

                pool.query(getUserId, [character_id], (error, result) => {
                    if (error) {
                        return callback(error, null);
                    }

                    if (result.length === 0) {
                        return callback({ message: "User Not Found" }, null);
                    }

                    // Assuming result is an array, extract user_id
                    const user_id = result[0].user_id;

                    pool.query(deducePoints, [user_id, user_id], (error, result) => {
                        if (error) {
                            return callback(error, null);
                        }

                        if (result.affectedRows === 0) {
                            return callback({ message: "Can't deduce Points" }, null);
                        }

                        callback(null, { success: false, message: 'Character lost the battle', result });
                    });
                });
            }
        }
    }, 1000); // Simulate every 1 second
    
    // Add a horizontal dash line at the end of the simulation
    setTimeout(() => {
        console.log('---------------------------------------------------------------------------------------------------------');
    }, 18000); // Adjust the timing based on your preference
};

// Function to update character attributes
module.exports.updateCharacterAttributes = (characterId, questDetail, callback) => {
    // Update character attributes based on quest rewards
    const updateCharacterQuery = `
        UPDATE character_status
        SET hp = hp + ?, atk = atk + ?, def = def + ?
        WHERE character_id = ?;
        
        SELECT character_name, sect, hp, atk, def, skill, equipment
        FROM character_status 
        WHERE character_id = ?;
    `;

    const updateCharacterValues = [questDetail.hp_reward, questDetail.atk_reward, questDetail.def_reward, characterId, characterId];

    pool.query(updateCharacterQuery, updateCharacterValues, (updateCharacterError, updateCharacterResult) => {
        if (updateCharacterError) {
            return callback(updateCharacterError, null);
        }

        // Character attributes updated successfully
        return callback(null, { success: true, message: 'Character attributes updated successfully', updateCharacterResult: updateCharacterResult[1] });
    });
};

// Function to update user's wallet with points
module.exports.updateUserPoints = (userId, pointsReward, callback) => {
    // Update user's wallet with points
    const updateUserPointsQuery = `
        UPDATE userswallet
        SET points_balance = points_balance + ?
        WHERE user_id = ?;
        SELECT points_balance
        FROM userswallet
        WHERE user_id = ?;
    `;

    const updateUserPointsValues = [pointsReward, userId, userId];

    pool.query(updateUserPointsQuery, updateUserPointsValues, (updateUserPointsError, updateUserPointsResult) => {
        if (updateUserPointsError) {
            return callback(updateUserPointsError, null);
        }

        // User's wallet points updated successfully
        return callback(null, { success: true, message: "User's wallet points updated successfully", updateUserPointsResult: updateUserPointsResult[1] });
    });
};
