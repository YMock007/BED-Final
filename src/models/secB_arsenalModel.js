const pool = require('../services/db');

module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
    SELECT *
    FROM Arsenal
    `;

    pool.query(SQLSTATEMENT, callback);
}


module.exports.selectByArsenalId = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT *
    FROM arsenal
    WHERE arsenal_id = ?;
    `;

    const VALUES = [data.arsenal_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}
module.exports.selectByEquipment = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT *
    FROM arsenal
    WHERE equipment_name = ?;
    `;

    const VALUES = [data.equipment_name];

    pool.query(SQLSTATMENT, VALUES, callback);
}

module.exports.selectByCharacter = (data, callback) => {
  const GETSECT = `
    SELECT sect FROM character_status
    WHERE character_id = ?;
  `;

  const SQLSTATEMENT = `
    SELECT * FROM arsenal
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
    FROM Arsenal
    ORDER BY hp DESC
    `;

    pool.query(SQLSTATEMENT, callback);
}

module.exports.selectByATK = (callback) => {
    const SQLSTATEMENT = `
    SELECT *
    FROM Arsenal
    ORDER BY atk DESC
    `;

    pool.query(SQLSTATEMENT, callback);
}

module.exports.selectByDEF = (callback) => {
    const SQLSTATEMENT = `
    SELECT *
    FROM Arsenal
    ORDER BY def DESC
    `;

    pool.query(SQLSTATEMENT, callback);
}
module.exports.selectByPoints = (callback) => {
    const SQLSTATEMENT = `
    SELECT *
    FROM Arsenal
    ORDER BY points_worth DESC
    `;

    pool.query(SQLSTATEMENT, callback);
}

module.exports.selectByProfession = (profession, callback) => {
    const SQLSTATEMENT = `
    SELECT *
    FROM Arsenal
    WHERE profession = ?;    
    `;

    pool.query(SQLSTATEMENT,[profession], callback);
}

// Function to select an Arsenal item by ID
module.exports.selectById = (arsenalItemId, callback) => {
  const SQL_STATEMENT = `
      SELECT *
      FROM arsenal
      WHERE arsenal_id = ?
  `;

  pool.query(SQL_STATEMENT, [arsenalItemId], (error, results, fields) => {
      if (error) {
          callback(error, null);
      } else {
          // Assuming there is only one result for the specified ID
          const arsenalItem = results[0];
          callback(null, arsenalItem);
      }
  });
};

module.exports.insertSingle = (data, callback) => {
    const checkDuplicate = `
        SELECT equipment_name FROM arsenal WHERE equipment_name = ?;
        SELECT * FROM arsenal WHERE hp = ? AND atk = ? AND def = ?;
    `;
    const SQLStatement = `
        INSERT INTO arsenal (profession, equipment_name, hp, atk, def, points_worth) 
        VALUES (?, ?, ?, ?, ?, ?);
        SELECT * FROM arsenal ORDER BY arsenal_id DESC LIMIT 1;
    `;
    const values = [
        data.profession,
        data.equipment_name,
        data.hp,
        data.atk,
        data.def,
        data.points_worth
    ];

    pool.query(checkDuplicate, [data.equipment_name, data.hp, data.atk, data.def], (error, results) => {
        if (error) {
            callback(error, null);
            return;
        }

        // Check for duplicate equipment name
        if (results[0].length > 0) {
            callback({ message: 'Equipment with the same name already exists.' });
        } else if (results[1].length > 0) {
            // Check for duplicate attributes (hp, atk, def)
            callback({ message: 'Equipment with the same attributes already exists.' });
        } else {
            // Execute the main SQL statement using parameterized query
            pool.query(SQLStatement, values, callback);
        }
    });
};

module.exports.updateById = (data, callback) => {
  const SQLSTATEMENT = `
      UPDATE arsenal
      SET profession = ?, equipment_name = ?, hp = ?, atk = ?, def = ?, points_worth = ?
      WHERE arsenal_id = ?;

      SELECT * FROM arsenal
      WHERE arsenal_id = ?;
  `;
  const VALUES = [
      data.profession,
      data.equipment_name,
      data.hp,
      data.atk,
      data.def,
      data.points_worth,
      data.arsenal_id,
      data.arsenal_id
  ];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

module.exports.deleteById = (data, callback) => {
  const SQLSTATEMENT = `
      DELETE FROM arsenal
      WHERE arsenal_id = ?;
      ALTER TABLE library AUTO_INCREMENT = 1;
  `;
  const VALUES = [data.arsenal_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

