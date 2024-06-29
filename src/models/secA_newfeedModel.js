const pool = require('../services/db');

module.exports.selectAll = (callback) =>
{
    const SQLSTATMENT = `
    SELECT *
    FROM newsfeed
    `;

    pool.query(SQLSTATMENT, callback);
}

module.exports.selectById = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT *
    FROM newsfeed
    WHERE newsfeed_id = ?;
    `;

    const VALUES = [data.newsfeed_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.insertSingle = (data, callback) => {
    const verify = `
        SELECT * FROM user
        WHERE user_id = ?;

        SELECT * FROM newsfeed
        WHERE user_id = ? AND post_title = ? AND post_content = ?;
    `;
    const SQLStatement = `
        INSERT INTO newsfeed (user_id, post_title, post_content, post_date) VALUES (?, ?, ?, NOW());
        SELECT * FROM newsfeed ORDER BY newsfeed_id DESC LIMIT 1;
    `;
    const values = [data.user_id, data.post_title, data.post_content];

    pool.query(verify, [data.user_id, data.user_id, data.post_title, data.post_content], (error, result) => {
        if (error) {
            callback(error, null);
            return;
        }
        if (result[0].length === 0) {
            callback({ message: "User not found." , error:error}, null);
        } else if (result[1].length > 0) {
            callback({ message: "Duplicate post found." }, null);
        } else {
            pool.query(SQLStatement, values, (insertError, insertResult) => {
                if (insertError) {
                    callback(insertError, null);
                    return;
                }
                if (insertResult.length === 0) {
                    callback(null, insertResult);
                } else {
                    callback(null, insertResult[1]);
                }
            });
        }
    });
};



module.exports.updateById = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE newsfeed SET post_title = ?, post_content = ?, post_date = ? WHERE newsfeed_id = ?;
        SELECT * FROM newsfeed WHERE newsfeed_id = ?;
        `;
    VALUES = [data.post_title, data.post_content, data.post_date, data.newsfeed_id, data.newsfeed_id]
    pool.query(SQLSTATEMENT, VALUES, callback);
}
module.exports.deleteById = (data, callback) =>
{

    const SQLSTATEMENT = `

    
    SELECT user_id, newsfeed_id 
    FROM newsfeed
    WHERE newsfeed_id = ? AND user_id = ?;
    
    DELETE FROM newsfeed
    WHERE newsfeed_id = ? AND user_id = ? ;

    DELETE FROM post_comments
    WHERE newsfeed_id = ?;

    ALTER TABLE newsfeed AUTO_INCREMENT = 1;
    ALTER TABLE post_comments AUTO_INCREMENT = 1;
`;

pool.query(SQLSTATEMENT, [data.newsfeed_id, data.user_id, data.newsfeed_id, data.user_id, data.newsfeed_id], (error, results) => {
    if (error) {
        callback(error, null);
    } else {
        const postData = results;
        callback(null, postData);
    }
});
}
