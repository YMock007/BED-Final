const model = require("../models/secA_tasksModel.js");


module.exports.readAllTask = (req, res, next) =>
{
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllTask:", error);
            res.status(500).json(error);
        } 
        else res.status(200).json(results);
    }

    model.selectAll(callback);
}

module.exports.readTaskById = (req, res, next) =>
{
    const data = {
        task_id: req.params.task_id
    }
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readTaskById:", error);
            res.status(500).json(error);
        } else {
            if(results.length === 0) 
            {
                res.status(404).json({
                    message: "Task not found"
                });
            }
            else res.status(200).json(results[0]);
        }
    }

    model.selectById(data, callback);
}

module.exports.createNewTask = (req, res, next) => {
    const data = {
        title: req.body.title,
        description: req.body.description,
        points: req.body.points
    }
    if ( data.title === undefined || data.description === undefined || data.points === undefined) {
        return res.status(400).json({
            message: "Missing Required Data."
        })
    }
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error createNewTask:", error);
            res.status(500).json(error);
        } else {
            res.status(201).json(results[1][0]);
        }
    }
model.insertSingle(data, callback)
}


module.exports.updateTaskById = (req, res, next) =>
{
    if(req.body.title === undefined || req.body.description === undefined || req.body.points === undefined )
    {
        res.status(400).send("Error: Missing Required Data");
        return;
    }

    const data = {
        task_id: req.params.task_id,
        title: req.body.title,
        description: req.body.description,
        points: req.body.points
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error updateTaskById:", error);
            res.status(500).json(error);
        } else {  
            if (results[0].affectedRows === 0) {
                res.status(404).json({
                    message: "Task not found"
                });
            } else {
                // If successful, return the result from the database
                res.status(201).json(results.slice(1)[0][0]);
            }
        }
    };

    model.updateById(data, callback);
}


module.exports.deleteTaskById = (req, res, next) =>
{
    const data = {
        task_id: req.params.task_id
    }

    const callback = (error, results, fields) => {
        console.log(results)
        if (error) {
            console.error("Error deleteTaskById:", error);
            res.status(500).json(error);
        } else {
            if(results[0].affectedRows === 0) 
            {
                res.status(404).json({
                    message: "Task not found"
                });
            }
            else res.status(204).json(); 
        }
    }

    model.deleteById(data, callback);
}