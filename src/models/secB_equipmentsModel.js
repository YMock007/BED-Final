;const pool = require("../services/db");

module.exports.selectAll = (callback) => {
  const SQLSTATEMENT = `
  SELECT *
  FROM Equipments
  `;

  pool.query(SQLSTATEMENT, callback);
}

module.exports.selectByEquipmentId = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT *
    FROM equipments
    WHERE equipment_id = ?;
    `;

    const VALUES = [data.equipment_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}
module.exports.selectByCharacterId = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT *
    FROM equipments
    WHERE character_id = ?;
    `;

    const VALUES = [data.character_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}


module.exports.selectByCharacterIdEquipable = (data, callback) => {
  const GETSECT = `
    SELECT sect FROM character_status
    WHERE character_id = ?;
  `;

  const SQLSTATEMENT = `
    SELECT * FROM equipments
    WHERE profession = ? AND character_id = ?;
  `;

  pool.query(GETSECT, [data.character_id], (error, results, fields) => {
    if (error) {
      callback(error, null);
      return;
    }
    if( results === null || results.length === 0 ) {
      callback({error: "Character Not Found."}, null);
      return;
    }
    const sect = results[0].sect;

    pool.query(SQLSTATEMENT, [sect, data.character_id], (error, results, fields) => {
      if (error) {
        callback(error, null);
        return;
      }
      if(results === null || results.length === 0) {
        callback({error: "Equipable equipment Not Found."}, null);
        return;
      } else {
        callback(error, results);
      }
    });
  });
};

// Function to insert a new equipment into the database
module.exports.insert = (character_id, newEquipment, callback) => {
  const checkCharacter = `
  SELECT character_id FROM character_status
  WHERE character_id = ?;

  SELECT * FROM equipments
  WHERE equipment_name = ? AND profession = ? AND character_id = ? AND points_worth = ?;
  `
  const SQL_STATEMENT = `
    INSERT INTO equipments (equipment_name, profession, character_id, hp, atk, def, points_worth)
    VALUES (?, ?, ?, ?, ?, ?, ?);

    SELECT * FROM equipments
    ORDER BY equipment_id DESC
    LIMIT 1;
  `;

  const values = [
    newEquipment.equipment_name,
    newEquipment.profession,
    newEquipment.character_id,
    newEquipment.hp,
    newEquipment.atk,
    newEquipment.def,
    newEquipment.points_worth,
  ];

    pool.query(checkCharacter, [character_id, newEquipment.equipment_name, newEquipment.profession, newEquipment.character_id, newEquipment.points_worth], (error, result) => {
      if (error) {
        callback(error, null);
        return;
      }
      if (result[0].length === 0) {
        callback({ message: "Character not found" }, null);
        return;
      } else if(result[1].length > 0) {
        callback({ message: "Equipment already bought." }, null);
        return;
      }else {
        pool.query(SQL_STATEMENT, values, callback);
      }
  });
 
};
module.exports.checkExistingEquipment = (characterId, callback) => {
  // Fetch character status
  const getCharacterStatusQuery = `
      SELECT *
      FROM character_status
      WHERE character_id = ?;
  `;

  pool.query(getCharacterStatusQuery, [characterId], (characterError, characterResults) => {
    let characterExist = false;
    let equipmentExist = false;

    if (characterError) {
      callback({ error: characterError }, null);
      return;
   }
    if (characterResults === 0) {
      return callback(null, {
        characterExist,
        equipmentExist: false,
        characterData: null
      })
    } else {
      const characterData = characterResults[0];
      characterExist = true;
      if(!characterData.equipment || !characterData.equipment.trim()) {
        equipmentExist = false;  
      } else {
        equipmentExist = true;
      }
      return callback(null, {
        characterExist,
        equipmentExist,
        characterData
      })
  }
})
};


module.exports.checkAddingEquipment = (characterId, equipmentId, characterData, callback) => {
  // Ensure characterData is not null or undefined
  if (!characterData) {
      return callback({ message: 'Invalid character data from previous middleware' }, null);
  }

  // Fetch adding equipment attributes
  const getAddingEquipmentAttributesQuery = `
      SELECT *
      FROM equipments
      WHERE equipment_id = ? AND character_id = ?;
  `;

  pool.query(getAddingEquipmentAttributesQuery, [equipmentId, characterId], (equipmentError, equipmentResults) => {
      if (equipmentError) {
          return callback(equipmentError, null);
      }

      if (equipmentResults.length === 0) {
          return callback(null, { addingEquipmentExists: false });
      }

      const addingEquipmentAttributes = equipmentResults[0];

      // Implement additional checks if needed

      return callback(null, { addingEquipmentExists: true, addingEquipmentAttributes });
  });
};

module.exports.deductAndAddAttributes = (characterId, characterData, addingEquipmentAttributes, callback) => {
  // Fetch existing equipment attributes
  const getExistingEquipmentAttributesQuery = `
      SELECT hp, atk, def
      FROM arsenal
      WHERE equipment_name = ?;
  `;

  pool.query(getExistingEquipmentAttributesQuery, [characterData.equipment], (existingEquipmentError, existingEquipmentResults) => {
      if (existingEquipmentError) {
          return callback(existingEquipmentError, null);
      }
      const existingEquipmentAttributes = existingEquipmentResults[0];
      // Deduct existing equipment attributes
      const updatedCharacterStatus = {
          hp: characterData.hp - existingEquipmentAttributes.hp + addingEquipmentAttributes.hp,
          atk: characterData.atk - existingEquipmentAttributes.atk + addingEquipmentAttributes.atk,
          def: characterData.def - existingEquipmentAttributes.def + addingEquipmentAttributes.def,
          equipment: addingEquipmentAttributes.equipment_name
          // Add other attributes as needed
      };

      // Update character_status with the new attributes
      const updateCharacterStatusQuery = `
          UPDATE character_status
          SET hp = ?, atk = ?, def = ?, equipment = ?
          WHERE character_id = ?;
      `;

      const updateValues = [
          updatedCharacterStatus.hp,
          updatedCharacterStatus.atk,
          updatedCharacterStatus.def,
          updatedCharacterStatus.equipment,
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

module.exports.addAttributesToCharacter = (characterId, addingEquipmentAttributes, callback) => {
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

      // Add adding equipment attributes to character_status
      const updatedCharacterStatus = {
          hp: characterStatus.hp + addingEquipmentAttributes.hp,
          atk: characterStatus.atk + addingEquipmentAttributes.atk,
          def: characterStatus.def + addingEquipmentAttributes.def,
          equipment: addingEquipmentAttributes.equipment_name
          // Add other attributes as needed
      };

      // Update character_status with the new attributes
      const updateCharacterStatusQuery = `
          UPDATE character_status
          SET hp = ?, atk = ?, def = ?, equipment = ? 
          WHERE character_id = ?;
      `;

      const updateValues = [
          updatedCharacterStatus.hp,
          updatedCharacterStatus.atk,
          updatedCharacterStatus.def,
          updatedCharacterStatus.equipment,
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
