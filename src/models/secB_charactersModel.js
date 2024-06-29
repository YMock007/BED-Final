const pool = require('../services/db');

module.exports.getCharacterId = (user_id, callback) =>
{
    const SQLSTATMENT = `
    SELECT *
    FROM character_status
    WHERE user_id = ?;
    `;

    const VALUES = [user_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.selectAll = (callback) =>
{
    const SQLSTATMENT = `
    SELECT *
    FROM character_status
    `;

    pool.query(SQLSTATMENT, callback);
}

module.exports.selectById = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT *
    FROM  character_status
    WHERE character_id = ?;
    `;

    const VALUES = [data.character_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.selectByUserId = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT *
    FROM  character_status
    WHERE user_id = ?;
    `;

    const VALUES = [data.user_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}


module.exports.check = (data, callback) => {
    const SQLSTATEMENT = `
    SELECT * FROM user
    WHERE user_id = ?;
   `;
  
    VALUES = [data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
  };

module.exports.insertSingle = (data, callback) => {
    // Check if the user with the given user_id already exists
    const checkUser = 'SELECT user_id FROM character_status WHERE user_id = ? OR character_name = ? LIMIT 1;';
    pool.query(checkUser, [data.user_id, data.character_name], (userCheckError, userCheckResults) => {
        if (userCheckError) {
            callback(userCheckError, null);
            return;
        }

        if (userCheckResults.length > 0) {
            callback({ message: 'Same User_id or Same Character name Had been detected' });
            return;
        }

        // Assign innate attributes and skill based on the chosen sect
        let innateAttributes = {};
        let innateSkill = '';
        let innateEquipment = '';
        switch (data.sect) {
            case 'Saber Sect':
                innateAttributes = { hp: 100, atk: 30, def: 10 };
                innateSkill = '';
                innateEquipment = '';
                break;
            case 'Sword Sect':
                innateAttributes = { hp: 120, atk: 20, def: 20 };
                innateSkill = '';
                innateEquipment = '';
                break;
            case 'Shield Sect':
                innateAttributes = { hp: 150, atk: 10, def: 30 };
                innateSkill = '';
                innateEquipment = '';
                break;
            default:
                callback({ message: 'Invalid sect selected.' });
                return;
        }
        
        // Combine innate attributes with user-provided data
        const finalData = {
            user_id: data.user_id,
            sect: data.sect,
            character_name: data.character_name,
            hp: innateAttributes.hp,
            atk: innateAttributes.atk,
            def:  innateAttributes.def,
            skill: innateSkill,
            equipment: innateEquipment
        };

        const SQLStatement = `
            INSERT INTO character_status (user_id, sect, character_name, hp, atk, def, skill, equipment) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
            SELECT * FROM character_status ORDER BY character_id DESC LIMIT 1;
        `;

        const values = [
            finalData.user_id,
            finalData.sect,
            finalData.character_name,
            finalData.hp,
            finalData.atk,
            finalData.def,
            finalData.skill,
            finalData.equipment
        ];

        pool.query(SQLStatement, values, callback);
    });
};


module.exports.updateById = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE character_status SET character_name = ? WHERE character_id = ?;
        SELECT * FROM character_status WHERE character_id = ?;
        `;
    VALUES = [data.character_name, data.character_id, data.character_id]
    pool.query(SQLSTATEMENT, VALUES, callback);
}

module.exports.deleteById = (data, callback) =>
{

    const SQLSTATMENT = `
    DELETE FROM character_status
    WHERE character_id = ?;

    DELETE FROM equipments
    WHERE character_id = ?;

    DELETE FROM skills
    WHERE character_id = ?;

    ALTER TABLE character_status AUTO_INCREMENT = 1;
    ALTER TABLE equipments AUTO_INCREMENT = 1;
    ALTER TABLE skills AUTO_INCREMENT = 1;
    `;

    const VALUES = [data.character_id, data.character_id, data.character_id];
    pool.query(SQLSTATMENT, VALUES, callback)
}

// Function to get user_id from character_status based on character_id
module.exports.getUserIdByCharacterId = (character_id, callback) => {
    const SQL_STATEMENT = `
      SELECT user_id
      FROM character_status
      WHERE character_id = ?;
    `;
  
    pool.query(SQL_STATEMENT, [character_id], (error, results, fields) => {
      if (error) {
        callback(error, null);
      } else {
        // Assuming there is only one result for the specified character_id
        const user_id = results.length > 0 ? results[0].user_id : null;
        callback(null, user_id);
      }
    });
  };

// Function to read character detail by character ID
module.exports.readCharacterDetail = (characterId, callback) => {
    const readCharacterDetailQuery = `
        SELECT *
        FROM character_status
        WHERE character_id = ?;
    `;

    pool.query(readCharacterDetailQuery, [characterId], (error, results) => {
        if (error) {
            return callback(error, null);
        }

        // If character not found, return null
        if (results.length === 0) {
            return callback(null, null);
        }

        // Extract character details from the results
        const characterDetail = results[0];

        // Return character details
        callback(null, characterDetail);
    });
};

  