const { urlencoded } = require("express");
const model = require("../models/secB_arsenalModel");

module.exports.readAllArsenal = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllArsenal:", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    };

    model.selectAll(callback);
};

module.exports.readAllArsenalById = (req, res, next) =>
{
    const data = {
        arsenal_id: req.params.arsenal_id
    }
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllArsenalById:", error);
            res.status(500).json(error);
        } else {
            if(results.length === 0) 
            {
                res.status(404).json({
                    message: "Arsenal not found"
                });
            }
            else res.status(200).json(results[0]);
        }
    }

    model.selectByArsenalId(data, callback);
}
module.exports.readAllArsenalByEquipment = (req, res, next) =>
{
    const data = {
        equipment_name: req.params.equipment_name
    }
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllArsenalById:", error);
            res.status(500).json(error);
        } else {
            if(results.length === 0) 
            {
                res.status(404).json({
                    message: "Equipment not found"
                });
            }
            else res.status(200).json(results[0]);
        }
    }

    model.selectByEquipment(data, callback);
}

module.exports.readAllArsenalByCharacter = (req, res, next) =>
{
    const data = {
        character_id: req.params.character_id
    }
    const callback = (error, results, fields) => { 
        if (error) {
            console.error("Error readAllArsenalByCharacter:", error);
            res.status(500).json(error);
        } else {
            if(results.length === 0) 
            {
                res.status(404).json({
                    message: "Arsenal not found"
                });
            }
            else res.status(200).json(results);
        }
    }

    model.selectByCharacter(data, callback);
}

module.exports.readAllArsenalByHP = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllArsenalByHP:", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    };

    model.selectByHP(callback);
};

module.exports.readAllArsenalByATK = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllArsenalByATK:", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    };

    model.selectByATK(callback);
};

module.exports.readAllArsenalByDEF = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllArsenalByDEF:", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    };

    model.selectByDEF(callback);
};

module.exports.readAllArsenalByPoints = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllArsenalByPoints:", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    };

    model.selectByPoints(callback);
};


module.exports.readAllArsenalByProfession = (req, res, next) => {
    let profession = req.params.profession;
    profession = profession.replace(/\|/g, ' ')
    console.log(profession)
    if( profession !== "Saber Sect" && profession !== "Sword Sect" && profession !== "Shield Sect") {
        return res.status(404).json({message: "Missing Required Data"})
    }
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllArsenalByProfession:", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    };

    model.selectByProfession(profession, callback);
};


module.exports.buyFromArsenal = (req, res, next) => {
    const character_id = req.body.character_id;
    const arsenal_id = req.body.arsenal_id;

    // Validate characterId and arsenalItemId
    if (!character_id || !arsenal_id) {
        return res.status(400).json({ message: "Missing Required Data" });
    }

    // Retrieve the selected item from the Arsenal
    model.selectById(arsenal_id, (error, arsenalItem) => {
        if (error) {
            console.error("Error retrieving Arsenal item:", error);
            return res.status(500).json(error);
        }

        if (!arsenalItem) {
            return res.status(404).json({ message: "Arsenal item not found." });
        }

        // Attach the Arsenal item to the request for the next middleware
        req.arsenalItem = arsenalItem;
        req.character_id = character_id;
        next();
    });
}

module.exports.createNewArsenal = (req, res, next) => {
    const data = {
        profession: req.body.profession,
        equipment_name: req.body.equipment_name,
        hp: req.body.hp,
        atk: req.body.atk,
        def: req.body.def,
        points_worth: req.body.points_worth
    };
    if (data.profession !== "Saber Sect" && data.profession !== "Sword Sect" && data.profession !== "Shield Sect") {
        return res.status(400).json({
            message: "Profession must be Saber Sect, Sword Sect, or Shield Sect"
        });
    }    
    // Validate required data
    if (!data.profession || !data.equipment_name || !data.hp || !data.atk || !data.def || !data.points_worth) {
        return res.status(400).json({
            message: "Missing Required Data."
        });
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error createNewArsenal:", error);
            res.status(404).json(error);
        } else {
            res.status(201).json(results[1][0]);
        }
    };

    model.insertSingle(data, callback);
};
module.exports.updateArsenalById = (req, res, next) => {
    const data = {
        arsenal_id: req.params.arsenal_id,
        profession: req.body.profession,
        equipment_name: req.body.equipment_name,
        hp: req.body.hp,
        atk: req.body.atk,
        def: req.body.def,
        points_worth: req.body.points_worth
    };
    if(data.profession !== "Saber Sect" && data.profession !== "Sword Sect" && data.profession !== "Shield Sect") {
        return res.status(400).json({
            message: "Profession must be Saber Sect, Sword Sect or Shield Sect"
        });
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error updateArsenalById:", error);
            res.status(500).json(error);
        } else {
            if (results[0].affectedRows === 0) {
                res.status(404).json({
                    message: "Arsenal item not found"
                });
            } else {
                // If successful, return the updated result from the database
                res.status(200).json(results[1][0]);
            }
        }
    };

    model.updateById(data, callback);
};

module.exports.deleteArsenalById = (req, res, next) => {
    const data = {
        arsenal_id: req.params.arsenal_id
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error deleteArsenalById:", error);
            res.status(500).json(error);
        } else {
            if (results[0].affectedRows === 0) {
                res.status(404).json({
                    message: "Arsenal item not found"
                });
            } else {
                res.status(204).json();
            }
        }
    };

    model.deleteById(data, callback);
};

