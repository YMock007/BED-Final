const model = require("../models/secB_equipmentsModel");
const characterModel = require('../models/secB_charactersModel')


module.exports.readAllEquipment = (req, res, next) => {
  const callback = (error, results, fields) => {
      if (error) {
          console.error("Error readAllEquipment:", error);
          res.status(500).json(error);
      } else {
          res.status(200).json(results);
      }
  };

  model.selectAll(callback);
};



module.exports.readEquipmentById = (req, res, next) =>
{
    const data = {
        equipment_id: req.params.equipment_id
    }
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readEquipmentById:", error);
            res.status(500).json(error);
        } else {
            if(results.length === 0) 
            {
                res.status(404).json({
                    message: "Equipment not found"
                });
            }
            else res.status(200).json(results);
        }
    }

    model.selectByEquipmentId(data, callback);
}

module.exports.getCharacterId = (req, res, next) => {
    const user_id = req.params.user_id;
    const callback = (error, results, fields) => { 
        if (error) {
            console.error("Error getCharacterId:", error);
            res.status(500).json(error);
        } else {
            if(results.length === 0) 
            {
                res.status(404).json({
                    message: "User not found"
                });
            }
            else {
                req.params.character_id = results[0].character_id;
                next();
            }    
        }
    }

    characterModel.getCharacterId(user_id, callback);
}

module.exports.readEquipmentByCharacterId = (req, res, next) =>
{
    const data = {
        character_id: req.params.character_id
    }
    const callback = (error, results, fields) => { 
        if (error) {
            console.error("Error readEquipmentByCharacter:", error);
            res.status(500).json(error);
        } else {
            if(results.length === 0) 
            {
                res.status(404).json({
                    message: "Equipment not found"
                });
            }
            else res.status(200).json(results);
        }
    }

    model.selectByCharacterId(data, callback);
}

module.exports.readEquipmentByCharacterIdEquipable = (req, res, next) =>
{
    const data = {
        character_id: req.params.character_id
    }
    const callback = (error, results, fields) => { 
        if (error) {
            if(results === null || results.length === 0) {
                return res.status(404).json({error});
            }
            console.error("Error readEquipmentByCharacterr:", error);
            return res.status(500).json(error);
        } else {
            return res.status(200).json(results);
        }
    }

    model.selectByCharacterIdEquipable(data, callback);
}

// Function to handle adding new equipment
module.exports.addNewEquipment = (req, res, next) => {

  const character_id = req.body.character_id;
  const arsenalItem = req.arsenalItem; // Retrieved from the previous middleware

  // Check if arsenalItem is undefined
  if (!arsenalItem) {
      return res.status(404).json({ error: "Arsenal item not found or missing data" });
  }


  // Create a new equipment entry based on the Arsenal item
  const newEquipment = {
    equipment_name: arsenalItem.equipment_name,
    profession: arsenalItem.profession,
    character_id: character_id,
    hp: arsenalItem.hp,
    atk: arsenalItem.atk,
    def: arsenalItem.def,
    points_worth: arsenalItem.points_worth,
  };

  // Add the new equipment to the database
  model.insert(character_id, newEquipment, (equipmentError, result) => {
    if (equipmentError) {
        return res.status(404).json(equipmentError);
    } else {
    // Attach the result to the request for the next middleware
    req.equipment = result[1][0];
    req.correct = "YES"
    next();
    }
  });
};

module.exports.checkExistingEquipment = (req, res, next) => {
    if ( req.params.character_id === undefined || req.body.equipment_id === undefined ) {
        return res.status(400).json({message: "Missing Required Data"})
    }
    const characterId = req.params.character_id;

    model.checkExistingEquipment(characterId, (error, result) => {
        if (error) {     
            console.error('Error checking existing equipment:', error);
            return res.status(500).json({ error: 'Internal Server Error', result });
        }
        if (result.characterExist === false) {
            return res.status(404).json({ error: 'Character not found', result });
        }
        // Pass the result to the next controller
        req.characterData = result;
        next();
    });
};

module.exports.checkAddingEquipment = (req, res, next) => {
    // Retrieve data from the first middleware
    const characterData = req.characterData;
    const characterId = req.params.character_id;
    const equipmentId = req.body.equipment_id;

    model.checkAddingEquipment(characterId, equipmentId, characterData, (error, result) => {
        if (error) {
            console.error('Error checking adding equipment:', error);
            return res.status(500).json({ error: 'Internal Server Error', result });
        }

        if (!result.addingEquipmentExists) {
            return res.status(404).json({ error: 'Adding equipment not found Or not owned.', result });
        }

        // Pass the result to the next controller
        req.characterData = characterData
        req.addingEquipmentData = result;
        next();
    });
};

module.exports.equipingCharacter = (req, res) => {
    const characterData = req.characterData
    const addingEquipmentData = req.addingEquipmentData;
    console.log(characterData)
    console.log(addingEquipmentData.addingEquipmentAttributes)
    if (!characterData || !addingEquipmentData) {
        return res.status(400).json({ error: 'Invalid character or adding equipment data from previous middleware' });
    }
    if ( addingEquipmentData.addingEquipmentAttributes.profession != characterData.characterData.sect) {
        return res.status(400).json({message: "Equipment don't have the same profession as character"})
    }
    const characterId = req.params.character_id;

    // Check if equipment exists
    if (characterData.equipmentExist === false) {
        // If equipment doesn't exist, directly add the attributes of adding equipment to character_status
        model.addAttributesToCharacter(characterId, addingEquipmentData.addingEquipmentAttributes, (error, result) => {
            if (error) {
                console.error('Error adding attributes to character:', error);
                return res.status(500).json({ error: 'Internal Server Error', result });
            }

            // Respond with success message or appropriate response
            res.status(200).json({ success: true, message: 'Character equipped successfully', data: result });
        });
    } else {
        // If equipment exists, deduct existing equipment attributes and add adding equipment attributes
        model.deductAndAddAttributes(characterId, characterData.characterData, addingEquipmentData.addingEquipmentAttributes, (error, result) => {
            if (error) {
                console.error('Error deducting and adding attributes to character:', error);
                return res.status(500).json({ error: 'Internal Server Error', result });
            }

            // Respond with success message or appropriate response
            res.status(200).json({ success: true, message: 'Character equipped successfully', data: result });
        });
    }
};

