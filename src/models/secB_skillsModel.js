const pool = require("../services/db");

module.exports.selectAll = (callback) => {
  const SQLSTATEMENT = `
  SELECT *
  FROM Skills
  `;

  pool.query(SQLSTATEMENT, callback);
}

module.exports.selectBySkillId = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT *
    FROM skills
    WHERE skill_id = ?;
    `;

    const VALUES = [data.skill_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.selectByCharacterId = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT *
    FROM skills
    WHERE character_id = ?;
    `;

    const VALUES = [data.character_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.selectByCharacterIdLearnable = (data, callback) => {
  const GETSECT = `
    SELECT sect FROM character_status
    WHERE character_id = ?;
  `;

  const SQLSTATEMENT = `
    SELECT * FROM skills
    WHERE profession = ? AND character_id = ?;
  `;

  pool.query(GETSECT, [data.character_id], (error, results, fields) => {
    if (error) {
      callback(error, null);
      return;
    }
    if(results === null || results.length === 0 ) {
      callback({error: "Character not Found"}, null);
      return;
    }
    const sect = results[0].sect;

    pool.query(SQLSTATEMENT, [sect, data.character_id], (error, results, fields) => {
      if (error) {
        callback(error, null);
        return;
      }
      if(results === null || results.length === 0 ) {
        callback({error: "Learnable skill not Found"}, null);
        return;
      } else {
        callback(error, results);
      }
    });
  });
};

// Function to insert a new skill into the database
module.exports.insert = (character_id, newSkill, callback) => {
  const checkCharacter = `
  SELECT character_id FROM character_status
  WHERE character_id = ?;

  SELECT * FROM skills
  WHERE skill_name = ? AND profession = ? AND character_id = ? AND points_worth = ?;
  `

  const SQL_STATEMENT = `
    INSERT INTO skills (skill_name, profession, character_id, hp, atk, def, points_worth)
    VALUES (?, ?, ?, ?, ?, ?, ?);

    SELECT * FROM skills
    ORDER BY skill_id DESC
    LIMIT 1;
  `;


  const values = [
    newSkill.skill_name,
    newSkill.profession,
    newSkill.character_id,
    newSkill.hp,
    newSkill.atk,
    newSkill.hp,
    newSkill.points_worth,
  ];

    pool.query(checkCharacter, [character_id, newSkill.skill_name, newSkill.profession, newSkill.character_id, newSkill.points_worth], (error, result) => {
      if (error) {
        callback(error, null);
        return;
      }
      if (result[0].length === 0) {
        callback({ message: "Character not found" }, null);
        return;
      } else if (result[1].length > 0) {
        callback({ message: "Skill already bought" }, null);
        return;
      } 
      else {
        pool.query(SQL_STATEMENT, values, callback);
      }
  });
 
};

module.exports.checkExistingSkill = (characterId, callback) => {
  // Fetch character status
  const getCharacterStatusQuery = `
      SELECT *
      FROM character_status
      WHERE character_id = ?;
  `;

  pool.query(getCharacterStatusQuery, [characterId], (characterError, characterResults) => {
    let characterExist = false;
    if(characterError) {
      return callback({error: characterError}, null);
    }
    if (characterResults === 0) {
      return callback(null, {
        characterExist,
        skillExist: false,
        characterData: null
      })
    } else {
      const characterData = characterResults[0];
      characterExist = true;
      if(!characterData.skill || !characterData.skill.trim()) {
        skillExist = false;  
      } else {
        skillExist = true;
      }
      return callback(null, {
        characterExist,
        skillExist,
        characterData
      })
  }
})
};



module.exports.checkAddingSkill = (characterId, skillId, characterData, callback) => {
  // Ensure characterData is not null or undefined
  if (!characterData) {
      return callback({ message: 'Invalid character data from previous middleware' }, null);
  }

  // Fetch adding Skill attributes
  const getAddingSkillAttributesQuery = `
      SELECT *
      FROM skills
      WHERE skill_id = ? AND character_id = ?;
  `;

  pool.query(getAddingSkillAttributesQuery, [skillId, characterId], (skillError, skillResults) => {
      if (skillError) {
          return callback(skillError, null);
      }

      if (skillResults.length === 0) {
          return callback(null, { addingSkillExists: false });
      }

      const addingSkillAttributes = skillResults[0];

      // Implement additional checks if needed

      return callback(null, { addingSkillExists: true, addingSkillAttributes });
  });
};

module.exports.deductAndAddAttributes = (characterId, characterData, addingSkillAttributes, callback) => {
  // Fetch existing Skill attributes
  const getExistingSkillAttributesQuery = `
      SELECT hp, atk, def
      FROM library
      WHERE skill_name = ?;
  `;

  pool.query(getExistingSkillAttributesQuery, [characterData.skill], (existingSkillError, existingSkillResults) => {
      if (existingSkillError) {
          return callback(existingSkillError, null);
      }
      const existingSkillAttributes = existingSkillResults[0];
      // Deduct existing Skill attributes
      const updatedCharacterStatus = {
          hp: characterData.hp - existingSkillAttributes.hp + addingSkillAttributes.hp,
          atk: characterData.atk - existingSkillAttributes.atk + addingSkillAttributes.atk,
          def: characterData.def - existingSkillAttributes.def + addingSkillAttributes.def,
          skill: addingSkillAttributes.skill_name
          // Add other attributes as needed
      };

      // Update character_status with the new attributes
      const updateCharacterStatusQuery = `
          UPDATE character_status
          SET hp = ?, atk = ?, def = ?, skill = ?
          WHERE character_id = ?;
      `;

      const updateValues = [
          updatedCharacterStatus.hp,
          updatedCharacterStatus.atk,
          updatedCharacterStatus.def,
          updatedCharacterStatus.skill,
          characterId
      ];

      pool.query(updateCharacterStatusQuery, updateValues, (updateError, updateResult) => {
          if (updateError) {
              return callback(updateError, null);
          }

          // Respond with the updated character status
          return callback(null, { updatedCharacterStatus });
      });
  });
};

module.exports.addAttributesToCharacter = (characterId, addingSkillAttributes, callback) => {
  // Fetch character status
  const getCharacterStatusQuery = `
      SELECT *
      FROM character_status
      WHERE character_id = ?;
  `;

  pool.query(getCharacterStatusQuery, [characterId], (characterError, characterResults) => {
      if (characterError) {
          return callback(characterError, null);
      }

      if (characterResults.length === 0) {
          return callback(null, { characterExists: false });
      }

      const characterStatus = characterResults[0];

      // Add adding Skill attributes to character_status
      const updatedCharacterStatus = {
          hp: characterStatus.hp + addingSkillAttributes.hp,
          atk: characterStatus.atk + addingSkillAttributes.atk,
          def: characterStatus.def + addingSkillAttributes.def,
          skill: addingSkillAttributes.skill_name
          // Add other attributes as needed
      };

      // Update character_status with the new attributes
      const updateCharacterStatusQuery = `
          UPDATE character_status
          SET hp = ?, atk = ?, def = ?, skill = ? 
          WHERE character_id = ?;
      `;

      const updateValues = [
          updatedCharacterStatus.hp,
          updatedCharacterStatus.atk,
          updatedCharacterStatus.def,
          updatedCharacterStatus.skill,
          characterId
      ];

      pool.query(updateCharacterStatusQuery, updateValues, (updateError, updateResult) => {
          if (updateError) {
              return callback(updateError, null);
          }

          // Respond with the updated character status
          return callback(null, { updatedCharacterStatus });
      });
  });
};
