const model = require("../models/secA_tasksProgressModel.js");
const updateWallet = require("../models/secB_walletModel.js")
module.exports.readAllTaskProgress = (req, res, next) =>
{
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllTaskProgress:", error);
            res.status(500).json(error);
        } 
        else res.status(200).json(results);
    }

    model.selectAll(callback);
}

module.exports.readTaskProgressById = (req, res, next) =>
{
    const data = {
        progress_id: req.params.progress_id
    }
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readTaskProgressById:", error);
            res.status(500).json(error);
        } else {
            if(results.length === 0) 
            {
                res.status(404).json({
                    message: "Progress not found"
                });
            }
            else res.status(200).json(results[0]);
        }
    }

    model.selectById(data, callback);
}

module.exports.readTaskProgressByTaskId = (req, res, next) =>
{
    const data = {
        task_id: req.params.task_id
    }
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readTaskProgressByTaskId:", error);
            res.status(500).json(error);
        } else {
            if(results.length === 0) 
            {
                res.status(404).json({
                    message: "Progress not found"
                });
            }
            else res.status(200).json(results);
        }
    }

    model.selectByTaskId(data, callback);
}


module.exports.createNewTaskProgress = (req, res, next) => {
    const data = {
        user_id: req.body.user_id,
        task_id: req.body.task_id,
        completion_date: req.body.completion_date,
        notes: req.body.notes
    };
    
    if (data.user_id === undefined || data.task_id === undefined || data.notes === undefined) {
        return res.status(400).json({
            message: "Missing Required Data."
        });
    }
    
    if (data.completion_date === undefined) {
        data.completion_date = new Date();
    }
    
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error createNewTaskProgress:", error);
            return res.status(404).json(error);
        } else {
            req.user_id = data.user_id;
            req.task_id = data.task_id;
            next();
        }
    }
model.insertSingle(data, callback);

}


module.exports.updateTaskProgressById = (req, res, next) =>
{
    if(req.body.notes === undefined)
    {
        res.status(400).send("Error: Missing Required Data");
        return;
    }

    const data = {
        progress_id: req.params.progress_id,
        notes: req.body.notes
    }

    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error updateTaskProgressById:", error);
            res.status(500).json(error);
        } else {
            if (results[0].affectedRows === 0) {
                res.status(404).json({
                    message: "Progress not found"
                });
            } else {
                // If successful, return the result from the database
                res.status(201).json(results[1][0]);
            }
        }
    };

    model.updateById(data, callback);
}

module.exports.deleteTaskProgressById = (req, res, next) =>
{
    const data = {
        progress_id: req.params.progress_id,
        user_id: req.params.user_id
    }
    if ( data.progress_id === undefined || data.user_id === undefined) {
        res.status(400).json({message: "Missing Required Data"})
    }
    const callback = (error, results, fields) => {
        console.log(results)
        if (error) {
            console.error("Error deleteTaskProgressById:", error);
            res.status(500).json(error);
        } else {
            if(results[1].affectedRows === 0) 
            {
                res.status(404).json({
                    message: "Task Progress not found"
                });
            }
            else {
                console.log(results)
                req.user_id = results[0][0].user_id;
                req.task_id = results[0][0].task_id;
                next();
            } 
        }
    }

    model.deleteById(data, callback);
}