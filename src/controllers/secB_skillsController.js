const model = require("../models/secB_skillsModel");
const characterModel = require('../models/secB_charactersModel')


module.exports.readAllSkill = (req, res, next) => {
  const callback = (error, results, fields) => {
      if (error) {
          console.error("Error readAllSkill:", error);
          res.status(500).json(error);
      } else {
          res.status(200).json(results);
      }
  };

  model.selectAll(callback);
};

module.exports.readSkillById = (req, res, next) =>
{
    const data = {
        skill_id: req.params.skill_id
    }
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readSkillById:", error);
            res.status(500).json(error);
        } else {
            if(results.length === 0) 
            {
                res.status(404).json({
                    message: "Skill not found"
                });
            }
            else res.status(200).json(results);
        }
    }

    model.selectBySkillId(data, callback);
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


module.exports.readSkillByCharacterId = (req, res, next) =>
{
    const data = {
        character_id: req.params.character_id
    }
    const callback = (error, results, fields) => { 
        if (error) {
            console.error("Error readSkillByCharacterr:", error);
            res.status(500).json(error);
        } else {
            if(results.length === 0) 
            {
                res.status(404).json({
                    message: "Skill not found"
                });
            }
            else res.status(200).json(results);
        }
    }

    model.selectByCharacterId(data, callback);
}

module.exports.readSkillByCharacterIdLearnable = (req, res, next) =>
{
    const data = {
        character_id: req.params.character_id
    }
    const callback = (error, results, fields) => { 
        if (error) {
            if(results === null || results.length === 0) {
                return res.status(404).json({error});
            }
            console.error("Error readSkillByCharacterr:", error);
            return res.status(500).json(error);
        } else {
            return res.status(200).json(results);
        }
    }

    model.selectByCharacterIdLearnable(data, callback);
}



// Function to handle adding new skill
module.exports.addNewSkill = (req, res, next) => {
  
  const character_id = req.body.character_id;
  const libraryItem = req.libraryItem; // Retrieved from the previous middleware

  // Check if libraryItem is undefined
  if (!libraryItem) {
      return res.status(404).json({ error: "library item not found or missing data" });
  }


  // Create a new skill entry based on the library item
  const newskill = {
    skill_name: libraryItem.skill_name,
    profession: libraryItem.profession,
    character_id: character_id,
    hp: libraryItem.hp,
    atk: libraryItem.atk,
    def: libraryItem.def,
    points_worth: libraryItem.points_worth,
  };

  // Add the new skill to the database
  model.insert(character_id, newskill, (skillError, result) => {
    if (skillError) {
      return res.status(404).json(skillError);
    } else {
    // Attach the result to the request for the next middleware
    req.skill = result[1][0];
    req.correct = "YES"
    next();
    }
  });
};


module.exports.checkExistingSkill = (req, res, next) => {
    if ( req.params.character_id === undefined || req.body.skill_id === undefined ) {
        return res.status(400).json({message: "Missing Required Data"})
    }
    const characterId = req.params.character_id;

    model.checkExistingSkill(characterId, (error, result) => {
        if (error) {
            console.error('Error checking existing Skill:', error);
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

module.exports.checkAddingSkill = (req, res, next) => {
    // Retrieve data from the first middleware
    const characterData = req.characterData;
    const characterId = req.params.character_id;
    const skillId = req.body.skill_id;

    model.checkAddingSkill(characterId, skillId, characterData, (error, result) => {
        if (error) {
            console.error('Error checking adding Skill:', error);
            return res.status(500).json({ error: 'Internal Server Error', result });
        }

        if (!result.addingSkillExists) {
            return res.status(404).json({ error: 'Adding Skill not found or not owned.', result });
        }

        // Pass the result to the next controller
        req.characterData = characterData
        req.addingSkillData = result;
        next();
    });
};

module.exports.skillingCharacter = (req, res) => {
    const characterData = req.characterData
    const addingSkillData = req.addingSkillData;
    console.log(characterData)
    console.log(addingSkillData.addingSkillAttributes)
    if (!characterData || !addingSkillData) {
        return res.status(400).json({ error: 'Invalid character or adding Skill data from previous middleware' });
    }
    if ( addingSkillData.addingSkillAttributes.profession != characterData.characterData.sect) {
        return res.status(400).json({message: "Skill don't have the same profession as character"})
    }
    const characterId = req.params.character_id;

    // Check if Skill exists
    if (characterData.skillExist === false) {
        // If Skill doesn't exist, directly add the attributes of adding Skill to character_status
        model.addAttributesToCharacter(characterId, addingSkillData.addingSkillAttributes, (error, result) => {
            if (error) {
                console.error('Error adding attributes to character:', error);
                return res.status(500).json({ error: 'Internal Server Error', result });
            }

            // Respond with success message or appropriate response
            res.status(200).json({ success: true, message: 'Character equipped successfully', data: result });
        });
    } else {
        // If Skill exists, deduct existing Skill attributes and add adding Skill attributes
        model.deductAndAddAttributes(characterId, characterData.characterData, addingSkillData.addingSkillAttributes, (error, result) => {
            if (error) {
                console.error('Error deducting and adding attributes to character:', error);
                return res.status(500).json({ error: 'Internal Server Error', result });
            }

            // Respond with success message or appropriate response
            res.status(200).json({ success: true, message: 'Character equipped successfully', data: result });
        });
    }
};

