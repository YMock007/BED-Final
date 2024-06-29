const model = require("../models/secA_newfeedModel");

module.exports.readAllPost = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllPost:", error);
            res.status(500).json(error);
        } 
        else res.status(200).json(results);
    }

    model.selectAll(callback);
}

module.exports.readPostById = (req, res, next) =>
{
    const data = {
        newsfeed_id: req.params.newsfeed_id
    }
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readPostById:", error);
            res.status(500).json(error);
        } else {
            if(results.length === 0) 
            {
                res.status(404).json({
                    message: "Post not found"
                });
            }
            else res.status(200).json(results[0]);
        }
    }

    model.selectById(data, callback);
}

module.exports.createNewPost = (req, res, next) => {
    const data = {
        user_id: req.body.user_id,
        post_title: req.body.post_title,
        post_content: req.body.post_content,
    };
    
    if (data.user_id === undefined || data.post_title === undefined || data.post_content === undefined) {
        return res.status(400).json({
            message: "Missing Required Data."
        });
    }
    
    
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error createNewPost:", error);
            return res.status(404).json(error);
        } else {
            return res.status(201).json({
                message: "Post Created Successfuly.",
                results: results[0]
            })
        }
    }
model.insertSingle(data, callback);
}

module.exports.updatePostById = (req, res, next) =>
{
    if(req.body.post_title === undefined || req.body.post_content === undefined)
    {
        res.status(400).send("Error: Missing Required Data");
        return;
    }

    const data = {
        newsfeed_id: req.params.newsfeed_id,
        post_title: req.body.post_title,
        post_content: req.body.post_content,
        post_date: new Date()
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error updatePostById:", error);
            res.status(500).json(error);
        } else {
            if (results[0].affectedRows === 0) {
                res.status(404).json({
                    message: "Post not found"
                });
            } else {
                // If successful, return the result from the database
                res.status(201).json(results[1][0]);
            }
        }
    };

    model.updateById(data, callback);
}


module.exports.deletePostById = (req, res, next) =>
{
    const data = {
        newsfeed_id: req.params.newsfeed_id,
        user_id: req.params.user_id
    }
    if ( data.newsfeed_id === undefined || data.user_id === undefined) {
        res.status(400).json({message: "Missing Required Data"})
    }
    const callback = (error, results, fields) => {
        console.log(results)
        if (error) {
            console.error("Error deletePostById:", error);
            res.status(500).json(error);
        } else {
            if(results[1].affectedRows === 0) 
            {
                res.status(404).json({
                    message: "Post not found"
                });
            }
            else {
                res.status(204).json()
            } 
        }
    }

    model.deleteById(data, callback);
}