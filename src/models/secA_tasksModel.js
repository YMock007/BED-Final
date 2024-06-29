const pool = require('../services/db');

module.exports.selectAll = (callback) =>
{
    const SQLSTATMENT = `
    SELECT *
    FROM Task
    `;

    pool.query(SQLSTATMENT, callback);
}

module.exports.selectById = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT task_id, title, description, points
    FROM Task
    WHERE task_id = ?;
    `;

    const VALUES = [data.task_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.insertSingle = (data, callback) => {
    const SQLSTATMENT = `
    INSERT INTO Task (title, description, points) VALUES (?, ?, ?);
    SELECT task_id, title, description, points FROM Task ORDER BY task_id DESC LIMIT 1;
`
    VALUES = [data.title, data.description, data.points];
    pool.query(SQLSTATMENT, VALUES, callback)
}

module.exports.updateById = (data, callback) => {

    const SQLSTATMENT = `
        UPDATE Task SET title = ?, description = ?, points = ? WHERE task_id = ?;
        SELECT task_id, title, description, points FROM Task WHERE Task_id = ?;
    `;
    VALUES = [data.title, data.description, data.points, data.task_id, data.task_id]
    pool.query(SQLSTATMENT, VALUES, callback)
}
module.exports.deleteById = (data, callback) => {

    const SQLSTATEMENT = `
    DELETE FROM Taskprogress
    WHERE task_id = ?;

    DELETE FROM Task
    WHERE task_id = ?;

    ALTER TABLE Taskprogress AUTO_INCREMENT = 1;
    ALTER TABLE Task AUTO_INCREMENT = 1;
    `;

    const VALUES = [data.task_id, data.task_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}

