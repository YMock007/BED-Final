const pool = require('../services/db');

module.exports.selectAll = (callback) =>
{
    const SQLSTATMENT = `
    SELECT *
    FROM post_comments
    `;

    pool.query(SQLSTATMENT, callback);
}

module.exports.selectByNewsfeedId = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT *
    FROM post_comments
    WHERE newsfeed_id = ?;
    `;

    const VALUES = [data.newsfeed_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.insertSingle = (data, callback) => {
    const verify = `
        SELECT * FROM user
        WHERE user_id = ?;

        SELECT * FROM post_comments
        WHERE user_id = ? AND comment_content = ? AND newsfeed_id = ?;
    `;
    const SQLStatement = `
        INSERT INTO post_comments (user_id, newsfeed_id, comment_content, comment_date) VALUES (?, ?, ?, NOW());
        SELECT * FROM post_comments ORDER BY comment_id DESC LIMIT 1;
    `;
    const values = [data.user_id, data.newsfeed_id, data.comment_content, data.comment_date];

    pool.query(verify, [data.user_id, data.user_id, data.comment_content, data.newsfeed_id], (error, result) => {
        if (error) {
            callback(error, null);
            return;
        }
        if (result[0].length === 0) {
            callback({ message: "User not found." }, null);
        } else if (result[1].length > 0) {
            callback({ message: "Duplicate comment found." }, null);
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
        UPDATE post_comments SET comment_content = ?, comment_date = ?
        WHERE comment_id = ?;
        SELECT * FROM post_comments WHERE comment_id = ?;
        `;
    VALUES = [data.comment_content, new Date(),data.comment_id,data.comment_id]
    pool.query(SQLSTATEMENT, VALUES, callback);
}
module.exports.deleteById = (data, callback) =>
{

    const SQLSTATEMENT = `

    SELECT user_id, comment_id 
    FROM post_comments
    WHERE comment_id = ? AND user_id = ?;
    
    DELETE FROM post_comments
    WHERE comment_id = ? AND user_id = ? ;

    ALTER TABLE post_comments AUTO_INCREMENT = 1;
`;

pool.query(SQLSTATEMENT, [data.comment_id, data.user_id, data.comment_id, data.user_id], (error, results) => {
    if (error) {
        callback(error, null);
    } else {
        const commentData = results;
        callback(null, commentData);
    }
});
}
