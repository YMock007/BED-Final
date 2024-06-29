const pool = require('../services/db');
const { check } = require('./secB_charactersModel');

module.exports.selectAll = (callback) =>
{
    const SQLSTATMENT = `
    SELECT *
    FROM Taskprogress
    `;

    pool.query(SQLSTATMENT, callback);
}



module.exports.selectById = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT *
    FROM Taskprogress
    WHERE progress_id = ?;
    `;

    const VALUES = [data.progress_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.selectByTaskId = (data, callback) => {
    const SQL_STATEMENT = `
        SELECT Taskprogress.*, User.username
        FROM Taskprogress
        INNER JOIN User ON Taskprogress.user_id = User.user_id
        WHERE Taskprogress.task_id = ?;
    `;
    const VALUES = [data.task_id];

    pool.query(SQL_STATEMENT, VALUES, callback);
};


module.exports.insertSingle = (data, callback) => {
    const verify = `
    SELECT * FROM taskprogress
    WHERE user_id = ? AND task_id = ? AND notes = ?
    `
    const checkAuth = `
        SELECT task_id FROM task ORDER BY task_id DESC LIMIT 1;
        SELECT user_id FROM user ORDER BY user_id DESC LIMIT 1;
    `;
    const SQLStatement = `
        INSERT INTO taskprogress (user_id, task_id, completion_date, notes) VALUES (?, ?, ?, ?);
        SELECT * FROM taskprogress ORDER BY progress_id DESC LIMIT 1;
    `;
    const values = [data.user_id, data.task_id, data.completion_date, data.notes];

    pool.query(verify, [data.user_id, data.task_id, data.notes], (error, result) => {
        if (error) {
            callback(error, null);
            return;
        }
        if (result.length > 0) {
            callback({message: "Same user_id, task_id and notes exists."})
        } else { 
            pool.query(checkAuth, (error, results) => {
                if (error) {
                    callback(error, null);
                    return;
                }
                // Check if the result sets are not empty
                if (results[0].length === 0 || results[1].length === 0) {
                    callback({ message: 'user_id or task_id not found' });
                } else {
                    // Access the first row of each result set
                    const taskId = results[0][0].task_id;
                    const userId = results[1][0].user_id;

                    // Check conditions for task_id and user_id
                    if (data.task_id > taskId || data.task_id < 1 || data.user_id > userId || data.user_id < 1) {
                        callback({ message: 'user_id or task_id not found' });
                    } else {
                        // Execute the main SQL statement using parameterized query
                        pool.query(SQLStatement, values, callback);
                    }
                }
            });
        }
    })
};

module.exports.updateById = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE taskprogress SET notes = ? WHERE progress_id = ?;
        SELECT * FROM taskprogress WHERE progress_id = ?;
        `;
    VALUES = [data.notes, data.progress_id, data.progress_id]
    pool.query(SQLSTATEMENT, VALUES, callback);
}
module.exports.deleteById = (data, callback) =>
{

    const SQLSTATEMENT = `

    
    SELECT user_id, task_id 
    FROM Taskprogress
    WHERE progress_id = ? AND user_id = ?;
    
    DELETE FROM Taskprogress
    WHERE progress_id = ? AND user_id = ? ;

    ALTER TABLE Taskprogress AUTO_INCREMENT = 1;
`;

pool.query(SQLSTATEMENT, [data.progress_id, data.user_id, data.progress_id, data.user_id], (error, results) => {
    if (error) {
        callback(error, null);
    } else {
        const userData = results;
        callback(null, userData);
    }
});
}