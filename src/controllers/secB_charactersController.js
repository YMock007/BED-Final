const model = require('../models/secB_charactersModel');

module.exports.readAllCharacter = (req, res, next) =>
{
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllCharacter:", error);
            res.status(500).json(error);
        } 
        else res.status(200).json(results);
    }

    model.selectAll(callback);
}

module.exports.readCharacterById = (req, res, next) =>
{
    const data = {
        character_id: req.params.character_id
    }
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readCharacterById:", error);
            res.status(500).json(error);
        } else {
            if(results.length === 0) 
            {
                res.status(404).json({
                    message: "Character not found"
                });
            }
            else res.status(200).json(results[0]);
        }
    }

    model.selectById(data, callback);
}
module.exports.readCharacterByUserId = (req, res, next) =>
{
    const data = {
        user_id: req.params.user_id
    }
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readCharacterByUserId:", error);
            res.status(500).json(error);
        } else {
            if(results.length === 0) 
            {
                res.status(404).json({
                    message: "Character not found"
                });
            }
            else res.status(200).json(results[0]);
        }
    }

    model.selectByUserId(data, callback);
}

module.exports.checkUserID = (req, res, next) => {
    const data = {
        user_id: req.body.user_id,
    };
    const callback = (error, results) => {
        if (error) {
            console.error("Error checkUserID:", error);
            res.status(500).json(error);
        } else {
            if(results.length === 0){
                res.status(409).json({
                    "message": "User Not Found."
                   });
            }
            else {
                req.correct = "yes";
                next();
        }
    }}

    model.check(data, callback);
}
module.exports.createNewCharacter = (req, res, next) => {
    if(req.correct !== "yes")
    {
        res.status(400).json({
            message: "Error: not yes"
        });
        return;
    }
    console.log("For a millennium, three powerful sects have reigned over this world.\nAs you step into this realm, you must choose your path among them.\nSelect one of the following sects: Saber Sect, Sword Sect, Shield Sect.");
    console.log('');
    const data = {
        user_id: req.body.user_id,
        character_name: req.body.character_name,
        sect: req.body.sect,
    };

    if (data.user_id === undefined || data.character_name === undefined || data.sect === undefined) {
        return res.status(400).json({
            message: "Missing Required Data."
        });
    }

    const callback = (error, results, fields) => {
        if (error) {
            if (error.message === 'User with this user_id already has a character.') {
                // Return a 404 status code if the user already has a character
                return res.status(404).json({
                    message: 'User with this user_id already has a character.',
                });
            }

            console.error("Error createNewCharacter:", error);
            res.status(500).json(error);
        } else {
            res.status(201).json(results[1][0]);
        }
    };

    model.insertSingle(data, callback);
};

module.exports.updateCharacterById = (req, res, next) =>
{
    if(req.body.character_id === undefined || req.body.character_name === undefined)
    {
        res.status(400).send("Error: Missing Required Data");
        return;
    }

    const data = {
        character_id: req.params.character_id,
        character_name: req.body.character_name,
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error updateCharacterById:", error);
            res.status(500).json(error);
        } else {
            if (results[0].affectedRows === 0) {
                res.status(404).json({
                    message: "Character not found"
                });
            } else {
                // If successful, return the result from the database
                res.status(201).json(results[1][0]);
            }
        }
    };

    model.updateById(data, callback);
}

module.exports.deleteCharacterById = (req, res, next) =>
{
    const data = {
        character_id: req.params.character_id
    }

    const callback = (error, results, fields) => {
        console.log(results)
        if (error) {
            console.error("Error deleteCharaterById:", error);
            res.status(500).json(error);
        } else {
            if(results[0].affectedRows === 0) 
            {
                res.status(404).json({
                    message: "character_id not found"
                });
            }
            else res.status(204).json(); 
        }
    }

    model.deleteById(data, callback);
}



// Middleware to read character detail
module.exports.readCharacterDetail = (req, res, next) => {
    const character_id = req.params.character_id;

    // Call the model function to read character detail
    model.readCharacterDetail(character_id, (error, characterDetail) => {
        if (error) {
            console.error('Error reading character detail:', error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (!characterDetail) {
            return res.status(404).json({ message: 'Character not found' });
        }
        // Attach the character detail to the request object
        req.characterDetail = characterDetail;

        // Attach the quest detail to the request object (received from the previous middleware)
        const questDetail = req.questDetail;

        // Pass both quest detail and character detail to the next middleware
        req.questCharacterDetails = {
            questDetail,
            characterDetail,
        };
        // return res.status(200).json({questDetail, characterDetail})
        next(); // Continue to the next middleware
    });
};
