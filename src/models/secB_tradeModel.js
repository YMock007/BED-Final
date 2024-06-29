const { error } = require('console');
const pool = require('../services/db');


module.exports.selectAll = (callback) => {
    const SQLSTATEMENT = `
    SELECT *
    FROM trade
    `;
  
    pool.query(SQLSTATEMENT, callback);
  }
  
  module.exports.selectByTradeId = (data, callback) =>
  {
      const SQLSTATMENT = `
      SELECT *
      FROM trade
      WHERE trade_id = ?;
      `;
  
      const VALUES = [data.trade_id];
  
      pool.query(SQLSTATMENT, VALUES, callback);
  }
  module.exports.selectByUserId = (data, callback) =>
  {
      const SQLSTATMENT = `
      SELECT *
      FROM trade
      WHERE seller_user_id = ? OR buyer_user_id = ?;
      `;
  
      const VALUES = [data.user_id, data.user_id];
  
      pool.query(SQLSTATMENT, VALUES, callback);
  }
  module.exports.selectByUserIdSell = (data, callback) =>
  {
      const SQLSTATMENT = `
      SELECT *
      FROM trade
      WHERE seller_user_id = ?;
      `;
  
      const VALUES = [data.user_id];
  
      pool.query(SQLSTATMENT, VALUES, callback);
  }
  module.exports.selectByUserIdBuy = (data, callback) =>
  {
      const SQLSTATMENT = `
      SELECT *
      FROM trade
      WHERE buyer_user_id = ?;
      `;
  
      const VALUES = [data.user_id];
  
      pool.query(SQLSTATMENT, VALUES, callback);
  }

module.exports.checkItem = (data, callback) => {
    let equipment_points = 0;
    let skill_points = 0;
    let equipmentValid = false;
    let skillValid = false;
    let checkItem = {
        ownership: false,
        points: false
    };

    if (data.equipment_id && data.skill_id) {
        // If both equipment_id and skill_id are present
        const CHECKEQUIPMENT = `
            SELECT * FROM Equipments
            WHERE character_id = ? AND equipment_id = ?;
        `;
        const CHECKSKILL = `
            SELECT * FROM Skills
            WHERE character_id = ? AND skill_id = ?;
        `;
        const EQUIPMENT_VALUES = [data.seller_character_id, data.equipment_id];
        const SKILL_VALUES = [data.seller_character_id, data.skill_id];

        pool.query(CHECKEQUIPMENT, EQUIPMENT_VALUES, (error, equipmentResult) => {
            if (error) {
                return callback(error, checkItem);
            }

            if (equipmentResult && equipmentResult.length > 0) {
                equipment_points = equipmentResult[0].points_worth;
                equipmentValid = true;
                checkItem.equipmentDetail = equipmentResult[0];
            }

            pool.query(CHECKSKILL, SKILL_VALUES, (error, skillResult) => {
                if (error) {
                    return callback(error, checkItem);
                }

                if (skillResult && skillResult.length > 0) {
                    skill_points = skillResult[0].points_worth;
                    skillValid = true
                    checkItem.skillDetail = skillResult[0]
                }

                let total_points = equipment_points + skill_points;
                if (data.points <= total_points) {
                    checkItem.ownership = equipmentValid && skillValid;
                    checkItem.points = true;
                }

                return callback(null, checkItem);
            });
        });
    } else if (data.equipment_id && !data.skill_id) {
        // If only equipment_id is present
        const CHECKEQUIPMENT = `
            SELECT * FROM Equipments
            WHERE character_id = ? AND equipment_id = ?;
        `;
        const VALUES = [data.seller_character_id, data.equipment_id];

        pool.query(CHECKEQUIPMENT, VALUES, (error, result) => {
            if (error) {
                return callback(error, checkItem);
            }

            if (result && result.length > 0) {
                equipment_points = result[0].points_worth;
                checkItem.equipmentDetail = result[0];
            }

            if (data.points <= equipment_points) {
                checkItem.ownership = true;
                checkItem.points = true;
            }

            return callback(null, checkItem);
        });
    } else if (data.skill_id && !data.equipment_id) {
        // If only skill_id is present
        const CHECKSKILL = `
            SELECT * FROM Skills
            WHERE character_id = ? AND skill_id = ?;
        `;
        const VALUES = [data.seller_character_id, data.skill_id];

        pool.query(CHECKSKILL, VALUES, (error, result) => {
            if (error) {
                return callback(error, checkItem);
            }

            if (result && result.length > 0) {
                skill_points = result[0].points_worth;
                checkItem.skillDetail = result[0];
            }

            if (data.points <= skill_points) {
                checkItem.ownership = true;
                checkItem.points = true;
            }

            return callback(null, checkItem);
        });
    } else {
        // Handle other cases or provide an error message
        return callback(null, checkItem);
    }
};


module.exports.addNewTrade = (data, callback) => {
    let CHECK_EXISTENCE;
    // Check if the trade already exists
    if(data.equipment_id) {
        CHECK_EXISTENCE = `
        SELECT * FROM trade
        WHERE 
            seller_user_id = ? AND
            equipment_id = ? AND
            trade_date IS NULL;
    `;
    } else {
        CHECK_EXISTENCE = `
        SELECT * FROM trade
        WHERE 
            seller_user_id = ? AND
            skill_id = ? AND
            trade_date IS NULL;
    `;

    }
    const EXISTENCE_VALUES = [
        data.seller_user_id,
        data.equipment_id,
        data.skill_id
    ];

    pool.query(CHECK_EXISTENCE, EXISTENCE_VALUES, (existenceError, existenceResult) => {
        if (existenceError) {
            return callback(existenceError, null);
        }

        // If the entry already exists, return an error
        if (existenceResult && existenceResult.length > 0) {
            return callback({ error: 'Duplicate entry. The trade already exists.' }, existenceResult);
        }

        // If the entry does not exist, proceed with the insertion
        const ADD_TRADE = `
            INSERT INTO trade (
                seller_user_id, 
                seller_user_name, 
                equipment_id, 
                equipment_name, 
                skill_id, 
                skill_name,
                points
            ) VALUES (?, ?, ?, ?, ?, ?, ?);

            SELECT * FROM trade ORDER BY trade_id DESC LIMIT 1;
        `;

        const VALUES = [
            data.seller_user_id,
            data.seller_user_name,
            data.equipment_id,
            data.equipment_name,
            data.skill_id,
            data.skill_name,
            data.points
        ];

        pool.query(ADD_TRADE, VALUES, (error, result) => {
            if (error) {
                return callback(error, result);
            }

            return callback(null, result);
        });
    });
};

module.exports.checkBuyer = (data, callback) => {
    const result = {
        buyerExist: false,
        enoughPoints: false,
        tradeExist: false
    };

    // Check if the buyer exists
    const CHECK_BUYER = `
        SELECT * FROM user
        WHERE user_id = ?;
    `;

    pool.query(CHECK_BUYER, [data.buyer_user_id], (buyerError, buyerResult) => {
        if (buyerError) {
            return callback(buyerError, result);
        }

        if (buyerResult && buyerResult.length > 0) {
            result.buyerExist = true;
            result.buyerDetail = buyerResult[0];

            // Retrieve points from the trade table and check if the trade exists
            const GET_TRADE_INFO = `
                SELECT * FROM trade
                WHERE trade_id = ?;
            `;

            pool.query(GET_TRADE_INFO, [data.trade_id], (tradeError, tradeResult) => {
                if (tradeError) {
                    return callback(tradeError, result);
                }

                if (tradeResult && tradeResult.length > 0) {
                    const tradePoints = tradeResult[0].points;
                    result.tradeExist = true;
                    result.tradeDetail = tradeResult[0];

                    // Check if the buyer has enough points in the usersWallet
                    const CHECK_POINTS = `
                        SELECT * FROM usersWallet
                        WHERE user_id = ? AND points_balance >= ?;
                    `;

                    pool.query(CHECK_POINTS, [data.buyer_user_id, tradePoints], (walletError, walletResult) => {
                        if (walletError) {
                            return callback(walletError, result);
                        }

                        if (walletResult && walletResult.length > 0) {
                            result.enoughPoints = true;
                        }

                        return callback(null, result);
                    });
                } else {
                    return callback(null, result);
                }
            });
        } else {
            return callback(null, result);
        }
    });
};


module.exports.addBuyer = (data, callback) => {
    // Check if buyer_user_id is not null
    const CHECKBUYERID = `
        SELECT seller_user_id, buyer_user_id, buyer_user_name
        FROM trade
        WHERE trade_id = ?;
    `;

    pool.query(CHECKBUYERID, [data.tradeDetail.trade_id], (error, checkBuyerIdResult) => {
        if (error) {
            return callback(error, null);
        }

        const buyer_user_id = checkBuyerIdResult[0].buyer_user_id;
        const seller_user_id = checkBuyerIdResult[0].seller_user_id;
        const buyer_user_name = checkBuyerIdResult[0].buyer_user_name;
        if(buyer_user_id === seller_user_id ) {
            return callback({ error: "Seller and buyer can't be same." }, null);
        }
        if (buyer_user_id && buyer_user_name) {
            return callback({ error: "Buyer already exists:" }, null);
        }

        // If buyer is null, continue with the transaction
        // Begin a transaction
        pool.getConnection((connectionError, connection) => {
            if (connectionError) {
                return callback(connectionError, null);
            }

            connection.beginTransaction((beginTransactionError) => {
                if (beginTransactionError) {
                    connection.release();
                    return callback(beginTransactionError, null);
                }

                // Update the trade table
                const UPDATE_TRADE = `
                    UPDATE trade
                    SET buyer_user_id = ?, buyer_user_name = ?, trade_date = ?
                    WHERE trade_id = ?;
                `;

                const TRADE_VALUES = [data.buyerDetail.user_id, data.buyerDetail.username, new Date(), data.tradeDetail.trade_id];

                connection.query(UPDATE_TRADE, TRADE_VALUES, (updateTradeError, updateTradeResult) => {
                    if (updateTradeError) {
                        return connection.rollback(() => {
                            connection.release();
                            callback(updateTradeError, null);
                        });
                    }

                    // Retrieve points from the trade table
                    const GET_TRADE_POINTS = `
                        SELECT points FROM trade
                        WHERE trade_id = ?;
                    `;

                    const VALUES = [data.tradeDetail.trade_id];

                    connection.query(GET_TRADE_POINTS, VALUES, (getPointsError, pointsResult) => {
                        if (getPointsError) {
                            return connection.rollback(() => {
                                connection.release();
                                callback(getPointsError, null);
                            });
                        }

                        if (pointsResult && pointsResult.length > 0) {
                            const points = pointsResult[0].points;

                            // Deduct points from buyer's wallet
                            const DEDUCT_POINTS_BUYER = `
                                UPDATE usersWallet
                                SET points_balance = points_balance - ?
                                WHERE user_id = ?;
                            `;

                            const BUYER_VALUES = [points, data.buyerDetail.user_id];

                            connection.query(DEDUCT_POINTS_BUYER, BUYER_VALUES, (deductBuyerError, deductBuyerResult) => {
                                if (deductBuyerError) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        callback(deductBuyerError, null);
                                    });
                                }

                                // Add points to seller's wallet
                                const ADD_POINTS_SELLER = `
                                    UPDATE usersWallet
                                    SET points_balance = points_balance + ?
                                    WHERE user_id = ?;
                                `;

                                const SELLER_VALUES = [points, data.tradeDetail.seller_user_id];

                                connection.query(ADD_POINTS_SELLER, SELLER_VALUES, (addSellerError, addSellerResult) => {
                                    if (addSellerError) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            callback(addSellerError, null);
                                        });
                                    }

                                    // Commit the transaction
                                    connection.commit((commitError) => {
                                        if (commitError) {
                                            return connection.rollback(() => {
                                                connection.release();
                                                callback(commitError, null);
                                            });
                                        }

                                        // Release the connection after a successful commit
                                        connection.release();
                                        callback(null, updateTradeResult);
                                    });
                                });
                            });
                        } else {
                            // Points not found, rollback the transaction
                            connection.rollback(() => {
                                connection.release();
                                callback({ message: 'Points not found.' }, null);
                            });
                        }
                    });
                });
            });
        });
    });
};


module.exports.updateCharacterId = (isAddBuyerSuccess, data, callback) => {
    if(!isAddBuyerSuccess) {
        return;
    }
    if (data.tradeDetail.skill_id && data.tradeDetail.equipment_id) {
        // Update both skills and equipments
        const UPDATE_SKILL = `
            UPDATE skills
            SET character_id = ?
            WHERE skill_id = ?;

            SELECT * FROM  skills
            WHERE skill_id = ?;
        `;

        const UPDATE_EQUIPMENT = `
            UPDATE equipments
            SET character_id = ?
            WHERE equipment_id = ?;

            
            SELECT * FROM  equipments
            WHERE equipment_id = ?;
        `;

        const SKILL_VALUES = [data.buyerDetail.buyer_character_id, data.tradeDetail.skill_id, data.tradeDetail.skill_id];
        const EQUIPMENT_VALUES = [data.buyerDetail.buyer_character_id, data.tradeDetail.equipment_id, data.tradeDetail.equipment_id];

        pool.query(UPDATE_SKILL, SKILL_VALUES, (skillError, skillResult) => {
            if (skillError) {
                return callback(skillError, null);
            }

            pool.query(UPDATE_EQUIPMENT, EQUIPMENT_VALUES, (equipmentError, equipmentResult) => {
                if (equipmentError) {
                    return callback(equipmentError, null);
                }

                return callback(null, { skillResult: skillResult[1][0], equipmentResult: equipmentResult[1][0] });
            });
        });
    } else if (data.tradeDetail.skill_id) {
        // Update only skills
        const UPDATE_SKILL = `
            UPDATE skills
            SET character_id = ?
            WHERE skill_id = ?;

            SELECT * FROM  skills
            WHERE skill_id = ?;
        `;

        const VALUES = [data.buyerDetail.buyer_character_id, data.tradeDetail.skill_id, data.tradeDetail.skill_id];

        pool.query(UPDATE_SKILL, VALUES, (error, result) => {
            if (error) {
                return callback(error, null);
            }

            return callback(null, result[1]);
        });
    } else if (data.tradeDetail.equipment_id) {
        // Update only equipments
        const UPDATE_EQUIPMENT = `
            UPDATE equipments
            SET character_id = ?
            WHERE equipment_id = ?;

            SELECT * FROM  equipments
            WHERE equipment_id = ?;
        `;

        const VALUES = [data.buyerDetail.buyer_character_id, data.tradeDetail.equipment_id, data.tradeDetail.equipment_id];

        pool.query(UPDATE_EQUIPMENT, VALUES, (error, result) => {
            if (error) {
                return callback(error, null);
            }

            return callback(null, result[1]);
        });
    } else {
        // No skill_id or equipment_id to update
        return callback(null, null);
    }
};