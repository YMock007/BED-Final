const pool = require('../services/db');
module.exports.selectAll = (callback) => {
  const SQLSTATEMENT = `
      SELECT user_id, points_balance
      FROM userswallet
  `;

  pool.query(SQLSTATEMENT, (error, results, fields) => {
      if (error) {
          console.error("Error in selectAll:", error);
          callback(error, null);
      } else {
          callback(null, results);
      }
  });
};

module.exports.selectByUserId = (data, callback) =>
{
    const SQLSTATMENT = `
    SELECT *
    FROM userswallet
    WHERE user_id = ?;
    `;

    const VALUES = [data.user_id];

    pool.query(SQLSTATMENT, VALUES, callback);
}

// Assuming walletModel.js

// Function to add points to the wallet
module.exports.addPointsToWallet = (user_id, task_id, callback) => {
  // Fetch the points_worth from the task table
  const SQL_SELECT_TASK_POINTS = `
    SELECT points FROM task WHERE task_id = ?;
  `;

  pool.query(SQL_SELECT_TASK_POINTS, [task_id], (selectError, selectResults) => {
    if (selectError) {
      console.error('Error fetching task points:', selectError);
      callback(selectError, null);
    } else {
      // Check if task with the specified task_id exists
      if (selectResults.length === 0) {
        callback({ message: 'Task not found.' }, null);
      } else {
        const points = selectResults[0].points;

        // Update the wallet balance for the user
        const SQL_UPDATE_WALLET = `
        -- Update the points_balance for the specified user_id
        UPDATE userswallet
        SET points_balance = points_balance + ?
        WHERE user_id = ?;
        
        -- Retrieve the updated information for the specified user_id
        SELECT user_id, points_balance
        FROM userswallet
        WHERE user_id = ?
        ORDER BY wallet_id DESC
        LIMIT 1;
        `;

        pool.query(SQL_UPDATE_WALLET, [points, user_id, user_id], (updateError, updateResults) => {
          if (updateError) {
            console.error('Error updating wallet balance:', updateError);
            callback(updateError, null);
          } else {
            // Respond with the update results
            callback(null, updateResults);
          }
        });
      }
    }
  });
};


// Function to add points to the wallet
module.exports.deducePointsFromWallet = (user_id, task_id, callback) => {
  // Fetch the points_worth from the task table
  const SQL_SELECT_TASK_POINTS = `
    SELECT points FROM task WHERE task_id = ?;
  `;

  pool.query(SQL_SELECT_TASK_POINTS, [task_id], (selectError, selectResults) => {
    if (selectError) {
      console.error('Error fetching task points:', selectError);
      callback(selectError, null);
    } else {
      // Check if task with the specified task_id exists
      if (selectResults.length === 0) {
        callback({ message: 'Task not found.' }, null);
      } else {
        const points = selectResults[0].points;

        // Update the wallet balance for the user
        const SQL_UPDATE_WALLET = `
        -- Update the points_balance for the specified user_id
        UPDATE userswallet
        SET points_balance = points_balance - ?
        WHERE user_id = ?;
        
        -- Retrieve the updated information for the specified user_id
        SELECT user_id, points_balance
        FROM userswallet
        WHERE user_id = ?
        ORDER BY wallet_id DESC
        LIMIT 1;
        `;

        pool.query(SQL_UPDATE_WALLET, [points, user_id, user_id], (updateError, updateResults) => {
          if (updateError) {
            console.error('Error updating wallet balance:', updateError);
            callback(updateError, null);
          } else {
            // Respond with the update results
            callback(null, updateResults);
          }
        });
      }
    }
  });
};

// Function to update the wallet balance for all users and select all data from userswallet
module.exports.updateWalletBalanceForAllUsers = (callback) => {
  console.log('Start updating wallet balance for all users.');

  // Fetch all user IDs from the user table
  pool.query('SELECT user_id FROM user', (userQueryError, userRows) => {
    if (userQueryError) {
      console.error('Error fetching user IDs:', userQueryError);
      return callback(userQueryError, null);
    }
    const userIds = userRows.map(row => row.user_id);

    // Loop through all user IDs
    userIds.forEach(userId => {
      console.log(`Checking wallet balance for user ${userId}`);

      // Use parameterized queries to prevent SQL injection
      const SQL_SELECT_USER_WALLET = `
        SELECT user_id FROM userswallet WHERE user_id = ?;
      `;

      pool.query(SQL_SELECT_USER_WALLET, [userId], (selectError, selectResults) => {
        if (selectError) {
          console.error(`Error checking wallet balance for user ${userId}:`, selectError);
        } else {
          // If the user doesn't have a wallet entry, insert one
          if (selectResults.length === 0) {
            const SQL_INSERT_USER_WALLET = `
              INSERT INTO userswallet (user_id, points_balance)
              VALUES (?, 0);
            `;

            pool.query(SQL_INSERT_USER_WALLET, [userId], (insertError, insertResults) => {
              if (insertError) {
                console.error(`Error inserting wallet entry for user ${userId}:`, insertError);
              } else {
                console.log(`Wallet entry inserted for user ${userId}`);
                updateWalletBalance(userId);
              }
            });
          } else {
            // If the wallet entry already exists, only show the balance
            console.log(`Wallet entry already exists for user ${userId}.}`);
          }
        }
      });
    });

    console.log('Wallet balance checked for all users.');
    callback(null, 'Wallet balance checked for all users.');
  });

  function updateWalletBalance(userId) {
    // Now update the wallet balance
    const SQL_UPDATE_WALLET = `
      UPDATE userswallet
      SET points_balance = (
        SELECT COALESCE(SUM(task.points), 0)
        FROM taskProgress
        JOIN task ON taskProgress.task_id = task.task_id
        WHERE taskProgress.user_id = ?
      )
      WHERE user_id = ?;
    `;

    pool.query(SQL_UPDATE_WALLET, [userId, userId], (updateError, updateResults) => {
      if (updateError) {
        console.error(`Error updating wallet balance for user ${userId}:`, updateError);
      } else {
        console.log(`Wallet balance updated for user ${userId}`);
      }
    });
  }
}


// Function to deduct points from the wallet
module.exports.deductPoints = (user_id, pointsToDeduct, callback) => {
  const SQL_STATEMENT = `
    UPDATE usersWallet
    SET points_balance = points_balance - ?
    WHERE user_id = ? AND points_balance >= ?;

    SELECT * FROM usersWallet
    WHERE user_id = ?;
  `;

  pool.query(SQL_STATEMENT, [pointsToDeduct, user_id, pointsToDeduct, user_id], (error, results, fields) => {
    if (error) {
      callback(error, null);
      return;
    }

    const updatedRows = results[0].affectedRows;
    if (updatedRows === 0) {
      // Not enough money, point balance would go negative
      const insufficientFundsError = new Error("Not enough money in the wallet");
      insufficientFundsError.statusCode = 500; // You can customize the status code
      callback(insufficientFundsError, null);
      return;
    }
  
    // Sufficient funds, proceed with the callback
    callback(null, results);
  });
};
module.exports.deleteLastEquipment = () => {
  const getMaxEquipmentId = `
    SELECT equipment_id
    FROM Equipments
    ORDER BY equipment_id DESC
    LIMIT 1;
  `;

  const SQLSTATEMENT = `
    DELETE FROM Equipments
    WHERE equipment_id = ?;

    ALTER TABLE Equipments AUTO_INCREMENT = 1;
  `;

  pool.query(getMaxEquipmentId, (err, result) => {
    if (err) {
      return console.log("Failed to Get Max ID");
    }

    const maxEquipmentId = result[0].equipment_id;

    pool.query(SQLSTATEMENT, [maxEquipmentId], (err, result) => {
      if (err) {
        return console.log("Failed to delete");
      } else {
        return console.log("Deleted");
      }
    });
  });
};


module.exports.deleteLastSkill = () => {
  const getMaxSkillId = `
    SELECT skill_id
    FROM skills
    ORDER BY skill_id DESC
    LIMIT 1;
  `;

  const SQLSTATEMENT = `
    DELETE FROM skills
    WHERE skill_id = ?;

    ALTER TABLE skills AUTO_INCREMENT = 1;
  `;

  pool.query(getMaxSkillId, (err, result) => {
    if (err) {
      return console.log("Failed to Get Max ID");
    }

    const maxSkillId = result[0].skill_id;

    pool.query(SQLSTATEMENT, [maxSkillId], (err, result) => {
      if (err) {
        return console.log("Failed to delete");
      } else {
        return console.log("Deleted");
      }
    });
  });
};
