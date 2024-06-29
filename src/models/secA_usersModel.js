const pool = require('../services/db');

module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
        SELECT user_id, username, email, created_on, updated_on, last_login_on
        FROM User;
    `;

    pool.query(SQLSTATEMENT, callback);
}

module.exports.selectById = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT user_id, username, email, created_on, updated_on, last_login_on FROM User
    WHERE user_id = ?;
    `;
    const VALUES = [data.user_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.insertSingle = (data, callback) => {
    const SQLSTATEMENT = `
        INSERT INTO User (username, email, password, created_on, updated_on, last_login_on)
        VALUES (?, ?, ?, NOW(), NOW(), NOW());

        SELECT * FROM User
        ORDER BY user_id DESC
        LIMIT 1;        
    `;
    const VALUES = [data.username, data.email, data.password];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

module.exports.checkDetails = (data, callback) => {
    const SQLSTATEMENT = `
        SELECT COUNT(*) AS Count FROM user WHERE username = ? OR email = ?;
    `;
    const VALUES = [data.username, data.email];

    pool.query(SQLSTATEMENT, VALUES, (error, result) => {
        if (error) {
            return callback(error, null);
        }

        if (result[0].Count > 0) {
            return callback({ message: "Username or Email has already been taken." }, null);
        } else {
            return callback(null, result);
        }
    });
};

module.exports.selectByIdforlogin = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT * FROM User
    WHERE username = ?;
    `;
    const VALUES = [data.username];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.updateLoginTime = (data, callback) => {
    const SQLSTATEMENT = `
    UPDATE User SET last_login_on = ?
    WHERE username = ?;
    `;
    const VALUES = [new Date(), data.username];

    pool.query(SQLSTATEMENT, VALUES, callback);
}

module.exports.selectByNameAndEmail = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT * FROM User 
    WHERE username = ?;

    SELECT * FROM User
    WHERE email = ?;

    `;
    const VALUES = [data.username, data.email];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.updateById = (data, callback) =>
{
    const SQLSTATMENT = `
    UPDATE User
    SET username = ?, email = ?, updated_on = ?
    WHERE user_id = ?;
    `;
    const VALUES = [data.username, data.email, new Date() ,data.user_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.checkOldPassword = (data) => {
    return new Promise((resolve, reject) => {
        const SQL_STATEMENT = `
            SELECT password FROM user
            WHERE user_id = ?;
        `;
        const VALUES = [data.user_id];

        pool.query(SQL_STATEMENT, VALUES, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};


module.exports.updatePasswordById = async (data) => {
    const SQLSTATMENT = `
        UPDATE User
        SET password = ?, updated_on = ?
        WHERE user_id = ?;
    `;
    const VALUES = [data.newPassword, new Date(), data.user_id];

    return new Promise((resolve, reject) => {
        pool.query(SQLSTATMENT, VALUES, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};


module.exports.deleteById = (data, callback) => {
    const SQLSTATEMENT = `
        DELETE FROM User
        WHERE user_id = ?;

        DELETE FROM userswallet
        WHERE user_id = ?;

        ALTER TABLE User AUTO_INCREMENT = 1;
        ALTER TABLE userswallet AUTO_INCREMENT = 1;
    `;

    const VALUES = [data.user_id, data.user_id];
    pool.query(SQLSTATEMENT, VALUES, callback);
}
