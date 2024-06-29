// authController.js

//////////////////////////////////////////////////////
// AUTH CONTROLLER FOR TOKEN PRE-GENERATION
//////////////////////////////////////////////////////
module.exports.preTokenGenerate = (req, res, next) => {
    // Extract user ID from the request body and store it in locals
    res.locals.userId = req.body.id;
    next();
}

//////////////////////////////////////////////////////
// AUTH CONTROLLER FOR BEFORE SENDING TOKEN
//////////////////////////////////////////////////////
module.exports.beforeSendToken = (req, res, next) => {
    // Set a message to indicate that the token is generated
    res.locals.message = `Token is generated.`;
    next();
}

//////////////////////////////////////////////////////
// AUTH CONTROLLER FOR TOKEN VERIFICATION
//////////////////////////////////////////////////////
module.exports.showTokenVerified = (req, res, next) => {
    // Respond with user ID and a message after token verification
    res.status(200).json({
        role: res.locals.role,
        user_id: res.locals.user_id,
        message: "Token is verified."
    });
}

//////////////////////////////////////////////////////
// AUTH CONTROLLER FOR BCRYPT COMPARE
//////////////////////////////////////////////////////
module.exports.showCompareSuccess = (req, res, next) => {
    // Respond with a success message after bcrypt comparison
    res.status(200).json({
        message: "Compare is successful."
    });
}

//////////////////////////////////////////////////////
// AUTH CONTROLLER FOR BCRYPT PRE-COMPARE
//////////////////////////////////////////////////////
module.exports.preCompare = (req, res, next) => {
    // Extract hash from the request body and store it in locals
    res.locals.hash = req.body.hash;
    next();
}

//////////////////////////////////////////////////////
// AUTH CONTROLLER FOR BCRYPT HASHING
//////////////////////////////////////////////////////
module.exports.showHashing = (req, res, next) => {
    // Respond with the hash and a success message after hashing
    res.status(200).json({
        hash: res.locals.hash,
        message: `Hash is successful.`
    });
}
