const model = require("../models/secA_commentsModel");

module.exports.readAllComment = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllComment:", error);
            res.status(500).json(error);
        } 
        else res.status(200).json(results);
    }

    model.selectAll(callback);
}

module.exports.readCommentByNewsfeedId = (req, res, next) =>
{
    const data = {
        newsfeed_id: req.params.newsfeed_id
    }
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readCommentById:", error);
            res.status(500).json(error);
        } 
        else res.status(200).json(results);
    }


    model.selectByNewsfeedId(data, callback);
}

module.exports.createNewComment = (req, res, next) => {
    const data = {
        user_id: req.body.user_id,
        newsfeed_id: req.body.newsfeed_id,
        comment_content: req.body.comment_content,
    };
    
    if (data.user_id === undefined || data.newsfeed_id === undefined || data.comment_content === undefined) {
        return res.status(400).json({
            message: "Missing Required Data."
        });
    }

    
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error createNewPist:", error);
            return res.status(404).json(error);
        } else {
            return res.status(201).json({
                message: "Comment Created Successfuly.",
                results: results[0]
            })
        }
    }
model.insertSingle(data, callback);
}

module.exports.updateCommentById = (req, res, next) =>
{
    if(req.body.comment_content === undefined)
    {
        res.status(400).send("Error: Missing Required Data");
        return;
    }

    const data = {
        comment_id: req.params.comment_id,
        comment_content: req.body.comment_content,
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error updateCommentById:", error);
            res.status(500).json(error);
        } else {
            if (results[0].affectedRows === 0) {
                res.status(404).json({
                    message: "Comment not found"
                });
            } else {
                // If successful, return the result from the database
                res.status(201).json(results[1][0]);
            }
        }
    };

    model.updateById(data, callback);
}


module.exports.deleteCommentById = (req, res, next) =>
{
    const data = {
        comment_id: req.params.comment_id,
        user_id: req.params.user_id
    }
    if ( data.comment_id === undefined || data.user_id === undefined) {
        res.status(400).json({message: "Missing Required Data"})
    }
    const callback = (error, results, fields) => {
        console.log(results)
        if (error) {
            console.error("Error deleteCommentById:", error);
            res.status(500).json(error);
        } else {
            if(results[1].affectedRows === 0) 
            {
                res.status(404).json({
                    message: "Comment not found"
                });
            }
            else {
                res.status(204).json()
            } 
        }
    }

    model.deleteById(data, callback);
}
