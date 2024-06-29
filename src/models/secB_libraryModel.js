const pool = require('../services/db');

module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
    SELECT *
    FROM library
    `;

    pool.query(SQLSTATEMENT, callback);
}

module.exports.selectByLibraryId = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT *
    FROM library
    WHERE library_id = ?;
    `;

    const VALUES = [data.library_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.selectBySkill = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT *
    FROM library
    WHERE skill_name = ?;
    `;

    const VALUES = [data.skill_name];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.selectByCharacter = (data, callback) => {
  const GETSECT = `
    SELECT sect FROM character_status
    WHERE character_id = ?;
  `;

  const SQLSTATEMENT = `
    SELECT * FROM library
    WHERE profession = ?
  `;

  pool.query(GETSECT, [data.character_id], (error, results, fields) => {
    if (error) {
        // Handle the error
        console.error(error);
        callback(error, null);
        return;
    }

    if (!results || results.length === 0) {
        // Handle the case where no results are found
        const noResultsError = { message: "No results found for the character ID" };
        callback(noResultsError, null);
        return;
    }

    const sect = results[0].sect;

    pool.query(SQLSTATEMENT, [sect], (error, results, fields) => {
        if (error) {
            // Handle the error in the second query
            console.error(error);
            callback(error, null);
            return;
        }

        // Successful execution of the second query
        callback(null, results);
    });
});

};

module.exports.selectByHP = (callback) => {
    const SQLSTATEMENT = `
    SELECT *
    FROM library
    ORDER BY hp DESC
    `;

    pool.query(SQLSTATEMENT, callback);
}

module.exports.selectByATK = (callback) => {
    const SQLSTATEMENT = `
    SELECT *
    FROM library
    ORDER BY atk DESC
    `;

    pool.query(SQLSTATEMENT, callback);
}

module.exports.selectByDEF = (callback) => {
    const SQLSTATEMENT = `
    SELECT *
    FROM library
    ORDER BY def DESC
    `;

    pool.query(SQLSTATEMENT, callback);
}
module.exports.selectByPoints = (callback) => {
    const SQLSTATEMENT = `
    SELECT *
    FROM library
    ORDER BY points_worth DESC
    `;

    pool.query(SQLSTATEMENT, callback);
}


module.exports.selectByProfession = (profession, callback) => {
    const SQLSTATEMENT = `
    SELECT *
    FROM Library
    WHERE profession = ?;    
    `;

    pool.query(SQLSTATEMENT,[profession], callback);
}

// Function to select a library item by ID
module.exports.selectById = (libraryItemId, callback) => {
  const SQL_STATEMENT = `
      SELECT *
      FROM library
      WHERE library_id = ?
  `;

  pool.query(SQL_STATEMENT, [libraryItemId], (error, results, fields) => {
      if (error) {
          callback(error, null);
      } else {
          // Assuming there is only one result for the specified ID
          const libraryItem = results[0];
          callback(null, libraryItem);
      }
  });
};



  module.exports.insertSingle = (data, callback) => {
    const checkDuplicate = `
        SELECT skill_name FROM library WHERE skill_name = ?;
        SELECT * FROM library WHERE hp = ? AND atk = ? AND def = ?;
    `;
    const SQLStatement = `
        INSERT INTO library (profession, skill_name, hp, atk, def, points_worth) 
        VALUES (?, ?, ?, ?, ?, ?);
        SELECT * FROM library ORDER BY library_id DESC LIMIT 1;
    `;
    const values = [
        data.profession,
        data.skill_name,
        data.hp,
        data.atk,
        data.def,
        data.points_worth
    ];

    pool.query(checkDuplicate, [data.skill_name, data.hp, data.atk, data.def], (error, results) => {
        if (error) {
            callback(error, null);
            return;
        }

        // Check for duplicate equipment name
        if (results[0].length > 0) {
            callback({ message: 'Skill with the same name already exists.' });
        } else if (results[1].length > 0) {
            // Check for duplicate attributes (hp, atk, def)
            callback({ message: 'Skill with the same attributes already exists.' });
        } else {
            // Execute the main SQL statement using parameterized query
            pool.query(SQLStatement, values, callback);
        }
    });
};

module.exports.updateLibraryById = (data, callback) => {
    const SQLSTATEMENT = `
        UPDATE library
        SET profession = ?, skill_name = ?, hp = ?, atk = ?, def = ?, points_worth = ?
        WHERE library_id = ?;

        SELECT * FROM library
        WHERE library_id = ?;
    `;
    const VALUES = [
        data.profession,
        data.skill_name,
        data.hp,
        data.atk,
        data.def,
        data.points_worth,
        data.library_id,
        data.library_id
    ];
    pool.query(SQLSTATEMENT, VALUES, callback);
};

module.exports.deleteById = (data, callback) => {
  const SQLSTATEMENT = `
      DELETE FROM library
      WHERE library_id = ?;
      ALTER TABLE library AUTO_INCREMENT = 1;
  `;
  const VALUES = [data.library_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};