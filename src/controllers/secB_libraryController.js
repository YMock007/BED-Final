const model = require("../models/secB_libraryModel");

module.exports.readAllLibrary = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllLibrary:", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    };

    model.selectAll(callback);
};
module.exports.readAllLibraryById = (req, res, next) =>
{
    const data = {
        library_id: req.params.library_id
    }
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllLibraryById:", error);
            res.status(500).json(error);
        } else {
            if(results.length === 0) 
            {
                res.status(404).json({
                    message: "Library not found"
                });
            }
            else res.status(200).json(results[0]);
        }
    }

    model.selectByLibraryId(data, callback);
}
module.exports.readAllArsenalBySkill = (req, res, next) =>
{
    const data = {
        skill_name: req.params.skill_name
    }
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllArsenalById:", error);
            res.status(500).json(error);
        } else {
            if(results.length === 0) 
            {
                res.status(404).json({
                    message: "Skill not found"
                });
            }
            else res.status(200).json(results[0]);
        }
    }

    model.selectBySkill(data, callback);
}

module.exports.readAllLibraryByCharacter = (req, res, next) =>
{
    const data = {
        character_id: req.params.character_id
    }
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllLibraryByCharacter:", error);
            res.status(500).json(error);
        } else {
            if(results.length === 0) 
            {
                res.status(404).json({
                    message: "skill not found"
                });
            }
            else res.status(200).json(results);
        }
    }

    model.selectByCharacter(data, callback);
}

module.exports.readAllLibraryByHP = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllskillByHP:", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    };

    model.selectByHP(callback);
};

module.exports.readAllLibraryByATK = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllLibraryByATK:", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    };

    model.selectByATK(callback);
};

module.exports.readAllLibraryByDEF = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllLibraryByDEF:", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    };

    model.selectByDEF(callback);
};

module.exports.readAllLibraryByPoints = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllLibraryByPoints:", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    };

    model.selectByPoints(callback);
};


module.exports.readAllLibraryByProfession = (req, res, next) => {
    let profession = req.params.profession;
    profession = profession.replace(/\|/g, ' ')
    console.log(profession)
    if( profession !== "Saber Sect" && profession !== "Sword Sect" && profession !== "Shield Sect") {
        return res.status(404).json({message: "Missing Required Data"})
    }
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllLibraryByProfession:", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    };

    model.selectByProfession(profession, callback);
};
module.exports.buyFromLibrary = (req, res, next) => {
    const character_id = req.body.character_id;
    const library_id = req.body.library_id;

    // Validate characterId and libraryItemId
    if (!character_id || !library_id) {
        return res.status(400).json({ message: "Missing Required Data" });
    }

    // Retrieve the selected item from the library
    model.selectById(library_id, (error, libraryItem) => {
        if (error) {
            console.error("Error retrieving library item:", error);
            return res.status(500).json(error);
        }

        if (!libraryItem) {
            return res.status(404).json({ message: "Library item not found." });
        }

        // Attach the library item to the request for the next middleware
        req.libraryItem = libraryItem;
        req.character_id = character_id;
        next();
    });
};

module.exports.createNewLibrary = (req, res, next) => {
    const data = {
        profession: req.body.profession,
        skill_name: req.body.skill_name,
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
    // Validate required data
    if (!data.profession || !data.skill_name || !data.hp || !data.atk || !data.def || !data.points_worth) {
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

module.exports.updateLibraryById = (req, res, next) => {
    const data = {
        library_id: req.params.library_id,
        profession: req.body.profession,
        skill_name: req.body.skill_name,
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

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error updateLibraryById:", error);
            res.status(500).json(error);
        } else {
            if (results[0].affectedRows === 0) {
                res.status(404).json({
                    message: "Library item not found",
                    error,
                    results
                });
            } else {
                // If successful, return the updated result from the database
                res.status(200).json(results[1][0]);
            }
        }
    };

    model.updateLibraryById(data, callback);
};

module.exports.deleteLibraryById = (req, res, next) => {
    const data = {
        library_id: req.params.library_id
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error deleteLibraryById:", error);
            res.status(500).json(error);
        } else {
            if (results[0].affectedRows === 0) {
                res.status(404).json({
                    message: "Library item not found"
                });
            } else {
                res.status(204).json();
            }
        }
    };

    model.deleteById(data, callback);
};

