const model = require("../models/secA_usersModel");


//////////////////////////////////////////////////////
// GET ALL CharacterS BY USER
//////////////////////////////////////////////////////

module.exports.readAllUser = (req, res, next) =>
{
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllUser:", error);
            res.status(500).json(error);
        } 
        else res.status(200).json(results);
    }

    model.selectAll(callback);
}

//////////////////////////////////////////////////////
// CONTROLLER FOR LOGIN
//////////////////////////////////////////////////////
module.exports.login = (req, res, next) =>
{
    const data = {
        username : req.body.username,
        password : req.body.password
    }
    if( !data.username || !data.password) {
        return res.status(400).json({message: "Missing Required Data."})
    }
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error login:", error);
            return res.status(500).json(error);
        } else {
            if(results.length === 0) 
            {
                res.status(404).json({
                    result : results,
                    message: "User not found"
                });
            }
            else {
                res.locals.hash = results[0].password;
                res.locals.user_id = results[0].user_id;
                res.locals.role = results[0].role;
                next();
            };
        }
    }

    model.selectByIdforlogin(data, callback);
}


module.exports.loginTimeUpdate = (req, res, next) => { 
    const data = {
        username : req.body.username,
    }
    const callback = (error, results) => {
        if(error) {
            console.error("Error login:", error);
            return res.status(500).json(error)
        } else {
            if(results.affectedRows === 0) {
                res.status(404).json({
                    resuuu : results,
                    message: "User not found"
                });
            } else {
                next()
            }
        }
    }
    model.updateLoginTime(data, callback);
}


//////////////////////////////////////////////////////
// CONTROLLER FOR REGISTER
//////////////////////////////////////////////////////
module.exports.register = (req, res, next) =>
{ 
    
    if(req.body.username === undefined || req.body.email === undefined || req.body.password === undefined)
    {
        res.status(400).send("Error: Missing required data");
        return;
    }

    const data = {
       username : req.body.username,
       email : req.body.email,
       password : res.locals.hash
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error register:", error);
            res.status(500).json({message: "Internal Server Error"});
        } else {
            res.locals.user_id = results[1][0].user_id;
            res.locals.role = results[1][0].role;
            res.locals.message = `User ${data.username} created successfully`;
            next();
            console.log(results)
            // res.status(200).json({message : User ${data.username} created successfully.});
        }
    }
   
    model.insertSingle(data, callback);
}

//////////////////////////////////////////////////////
// MIDDLEWARE FOR CHECK IF USERNAME OR EMAIL EXISTS
//////////////////////////////////////////////////////
module.exports.checkByNameAndEmail= (req, res, next) =>
{
    const data = {
        username : req.body.username,
        email: req.body.email
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error checking username and email:", error);
            res.status(500).json(error);
        } else {
            if (results[0].length > 0 && results[0][0].user_id != req.params.user_id && results[1].length > 0 && results[1][0].user_id != req.params.user_id) {
                res.status(409).json({
                    message: `Provided username is already associated with another user, userID ${results[0][0].user_id} and provided email is already associated with user, userID ${results[1][0].user_id}`
                });
            } else if (results[0].length > 0 && results[0][0].user_id != req.params.user_id) {
                res.status(409).json({
                    message: `Provided username is already associated with another user, userID ${results[0][0].user_id}`
                });
            } else if (results[1].length > 0 && results[1][0].user_id != req.params.user_id) {
                res.status(409).json({
                    message: `Provided email is already associated with another user, userID ${results[1][0].user_id}`
                });
            } else {
                 originalusername = (results[0][0] && results[0][0].username) || (results[1][0] && results[1][0].username);
                req.originalusername = originalusername

                 originalemail = (results[0][0] && results[0][0].email) || (results[1][0] && results[1][0].email)
                req.originalemail = originalemail
                next();
            }
        }
    };
    model.selectByNameAndEmail(data, callback);
}

module.exports.updateUserById = (req, res, next) =>
{
    if(req.body.username === null && req.body.email === null)
    {
        res.status(400).json({
            message: "Error: missing required data"
        });
        return;
    }
    const data = {
        username: req.body.username !== undefined ? req.body.username : req.originalusername,
        email: req.body.email !== undefined ? req.body.email : req.originalemail,
        user_id: req.params.user_id
    };

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error updateUserById:", error);
            res.status(500).json(error);
        } else {
            if(results.affectedRows === 0) 
            {
                res.status(404).json({
                    message: "User not found",
                    results: results
                });
            }
            else {
                const resultId = req.params.user_id 
                req.resultId = resultId
                next();}
        }
    }

    model.updateById(data, callback);
}
module.exports.readUserbyId200 = (req, res, next) => 
{
    const data = {
        user_id: req.resultId
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readUserById", error);
            res.status(500).json(error);
        } else {
            if(results.length === 0) 
            {
                res.status(404).json({
                    message: "User not found",
                    results: results
                });
            }
            else res.status(200).json(results[0]);
        }
    }

    model.selectById(data, callback);
}





//////////////////////////////////////////////////////
// MIDDLEWARE FOR CHECK Password
//////////////////////////////////////////////////////

module.exports.checkUsernameOrEmailExist = (req, res, next) => {
    const data = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    };
    if(!data.username || !data.email || !data.password) {
        return res.status(400).json({message: "Missing required data."})
    }
    const callback = (error, result) => {
        if (error) {
            // Handle the error (e.g., send an error response) 
            if (error.message) {
                // Handle specific error (e.g., username or email already exists)
                return res.status(409).json(error);
            }
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            // Successfully checked details, continue with the registration process
            next();
        }
    };

    model.checkDetails(data, callback);
};

module.exports.readUserById = (req, res, next) =>
{
    const data = {
        user_id: req.params.user_id
    }
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readUserById:", error);
            res.status(500).json(error);
        } else {
            if(results.length === 0) 
            {
                res.status(404).json({
                    message: "User not found"
                });
            }
            else res.status(200).json(results[0]);
        }
    }

    model.selectById(data, callback);
}

const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports.hashBothPassword = async (req, res, next) => {
    try {
        const data = {
            user_id: req.params.user_id,
            oldPassword: req.body.oldPassword,
            newPassword: req.body.newPassword
        };

        if (!data.user_id || !data.oldPassword || !data.newPassword) {
            return res.status(400).json({ message: "Missing Required Data." });
        }

        // Hash both old and new passwords asynchronously
        const [newHash] = await Promise.all([
            bcrypt.hash(data.newPassword, saltRounds)
        ]);

        req.newPassword = newHash;

        next();
    } catch (error) {
        console.error("Error in hashBothPassword:", error);
        res.status(500).json(error);
    }
};

module.exports.checkOldPassword = async (req, res, next) => {
    try {
        const user_id = req.params.user_id;
        const oldPassword = req.body.oldPassword;
        const newPassword = req.newPassword;

        // Retrieve the hashed password from the database
        const data = {
            user_id: user_id,
            oldPassword: oldPassword,
            newPassword: newPassword
        }
        const result = await model.checkOldPassword(data);
        if (!result || !result[0] || !result[0].password) {
            return res.status(401).json({
                message: "Wrong password",
                databaseResult: result,
                oldPassword: oldPassword
            });
        }

        const databaseResult = result[0].password;

        // Compare the provided old password with the hashed password from the database
        const isMatch = await bcrypt.compare(oldPassword, databaseResult);

        if (isMatch) {
            req.data = data;
            next();
        } else {
            res.status(401).json({
                message: "Wrong password",
                databaseResult: databaseResult,
                oldPassword: oldPassword
            });
        }
    } catch (error) {
        console.error("Error in checkOldPassword:", error);
        res.status(500).json(error);
    }
};

module.exports.updatePasswordById = async (req, res, next) => {
    try {
        const data = req.data;
        const result = await model.updatePasswordById(data);
        if(result.affectedRows > 0) {
            return  res.status(201).json({
                message: `Updating the password for the user ${data.user_id} success.`
            });
        }
    } catch (error) {
        console.error("Error updatePasswordById:", error);
        res.status(500).json(error);
    }
};

module.exports.deleteUserById = (req, res, next) =>
{
    const data = {
        user_id: req.params.user_id
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error deleteUserById:", error);
            res.status(500).json(error);
        } else {
            if(results[0].affectedRows === 0) 
            {
                res.status(404).json({
                    message: "User not found"
                });
            }
            else res.status(204).json(); 
        }
    }
    model.deleteById(data, callback);
}
