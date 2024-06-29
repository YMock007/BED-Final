const model = require("../models/secB_tradeModel");
const characterModel = require('../models/secB_charactersModel');
const userModel = require("../models/secA_usersModel")


module.exports.readAllTrade = (req, res, next) => {
    const callback = (error, results, fields) => {
        if (error) {
            console.error("Error readAllTrade:", error);
            res.status(500).json(error);
        } else {
            res.status(200).json(results);
        }
    };
  
    model.selectAll(callback);
  };
  
  module.exports.readTradeById = (req, res, next) =>
  {
      const data = {
          trade_id: req.params.trade_id
      }
      const callback = (error, results, fields) => {
          if (error) {
              console.error("Error readTradeById:", error);
              res.status(500).json(error);
          } else {
              if(results.length === 0) 
              {
                  res.status(404).json({
                      message: "Trade not found"
                  });
              }
              else res.status(200).json(results);
          }
      }
  
      model.selectByTradeId(data, callback);
  }

    
  module.exports.readTradeByUserId = (req, res, next) =>
  {
      const data = {
          user_id: req.params.user_id
      }
      const callback = (error, results, fields) => {
          if (error) {
              console.error("Error readTradeById:", error);
              res.status(500).json(error);
          } else {
              if(results.length === 0) 
              {
                  res.status(404).json({
                      message: "Trade not found"
                  });
              }
              else res.status(200).json(results);
          }
      }
  
      model.selectByUserId(data, callback);
  }
  module.exports.readTradeByUserIdSell = (req, res, next) =>
  {
      const data = {
          user_id: req.params.user_id
      }
      const callback = (error, results, fields) => {
          if (error) {
              console.error("Error readTradeById:", error);
              res.status(500).json(error);
          } else {
              if(results.length === 0) 
              {
                  res.status(404).json({
                      message: "Trade not found"
                  });
              }
              else res.status(200).json(results);
          }
      }
  
      model.selectByUserIdSell(data, callback);
  }
  module.exports.readTradeByUserIdBuy = (req, res, next) =>
  {
      const data = {
          user_id: req.params.user_id
      }
      const callback = (error, results, fields) => {
          if (error) {
              console.error("Error readTradeById:", error);
              res.status(500).json(error);
          } else {
              if(results.length === 0) 
              {
                  res.status(404).json({
                      message: "Trade not found"
                  });
              }
              else res.status(200).json(results);
          }
      }
  
      model.selectByUserIdBuy(data, callback);
  }
module.exports.checkItem = (req, res, next) => {
    const data = {
        seller_user_id: req.body.seller_user_id,
        seller_character_id: null,
        equipment_id: req.body.equipment_id,
        skill_id: req.body.skill_id,
        points: req.body.points
    };
    
    // Check for missing required data
    if (
        data.seller_user_id === undefined ||
        data.points === undefined ||
        (data.equipment_id === undefined && data.skill_id === undefined)
    ) {
        return res.status(400).json({ error: "Invalid data. Provide either equipment_id or skill_id, but not both absent." });
    }
    
    
    characterModel.getCharacterId(data.seller_user_id, (error, results, fields) => {
        if (error) {
            // Check if results is null or undefined
            console.error("Error getCharacterId:", error);
            return res.status(500).json(error);
        }
        if (!results || results.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        const seller_character_id = results[0].character_id;
        const user_id = {
            user_id: data.seller_user_id
        }
        const userCallBack = (error, userResults, fields) => {
            if (error) {
                console.error("Error selectById:", error);
                res.status(500).json(error);
            } else {
                if(userResults.length === 0) 
                {
                    res.status(404).json({
                        message: "User not found"
                    });
                }
                userDetail = userResults[0]
            }
        }
        userModel.selectById(user_id, userCallBack);


        data.seller_character_id = seller_character_id;

        model.checkItem(data, (error, result) => {
            if (error) {
                console.error('Error checking existing Skill:', error);
                return res.status(500).json({ error: 'Internal Server Error', result });
            }
            if (!result.ownership || !result.points) {
                return res.status(404).json({ error: 'Equipment or Skill not belong to the user, or points is higher.', message: 'Points must be lower than market value in Arsenal or Library'});
            }
            result.userDetail = userDetail
            req.checkItem = result;
            req.data = data;
            // Pass the result to the next controller
            next();
        });
    });
};


module.exports.addNewSell = (req, res, next) => { 
    const checkItem = req.checkItem;
    const data = req.data;
    console.log(checkItem)

    // If ownership and points checks pass, proceed to add the trade entry
    if (checkItem.ownership && checkItem.points) {
        const tradeData = {
            seller_user_id: data.seller_user_id,
            seller_user_name: checkItem.userDetail.username,
            buyer_user_id: null,
            buyer_user_name: null,
            equipment_id: data.equipment_id || null,
            equipment_name: checkItem.equipmentDetail ? checkItem.equipmentDetail.equipment_name || null : null,
            skill_id: data.skill_id || null,
            skill_name: checkItem.skillDetail ? checkItem.skillDetail.skill_name || null : null,
            points: data.points
        };


        model.addNewTrade(tradeData, (error, result) => {
            if (error) {
                console.error('Error adding new trade:', error);
                return res.status(500).json(error );
            }
            if ( !result || result.affectedRows === 0) {
                return res.status(400).json(error);
            }
                return res.status(201).json({"Newly Added Selling Item": result[1]})
        });
    } else {
        // Handle the case where ownership or points checks fail
        return res.status(400).json({ error: 'Invalid request. Ownership or points check failed.' });
    }
};// checkBuyer middleware
module.exports.checkBuyer = (req, res, next) => {
    const data = {
        trade_id: req.body.trade_id,
        buyer_user_id: req.body.buyer_user_id,
    };

    if (!data.trade_id || !data.buyer_user_id) {
        return res.status(400).json({ error: "Missing Required Data" });
    }

    characterModel.getCharacterId(data.buyer_user_id, (error, results, fields) => {
        if (error) {
            console.error("Error getCharacterId:", error);
            return res.status(500).json(error);
        }

        if (!results || results.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const character_id = results[0].character_id;

        model.checkBuyer(data, (error, result) => {
            if (error) {
                console.error('Error checking buyer:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            if (!result.buyerExist || !result.enoughPoints || !result.tradeExist) {
                return res.status(404).json({
                    error: 'Buyer not found or does not have enough points, or trade does not exist.',
                    result,
                });
            } else {
                // Attach character_id to the request object
                req.checkBuyer = result;
                req.character_id = character_id;
                next();
            }
        });
    });
};

module.exports.addBuyer = (req, res) => {
    const checkBuyerResult = req.checkBuyer;

    if (checkBuyerResult.buyerExist && checkBuyerResult.enoughPoints && checkBuyerResult.tradeExist) {
        // Access character_id from the request object
        const character_id = req.character_id;

        // Add the character_id to the checkBuyerResult
        checkBuyerResult.buyerDetail.buyer_character_id = character_id;
        let isAddBuyerSuccess = true;
        model.addBuyer(checkBuyerResult, (error, TradeResult) => {
            if (error) {
                // Check if the error is due to the buyer already existing
                if (error.error && error.error.includes('Buyer already exists')) {
                    isAddBuyerSuccess = false;
                    return res.status(400).json('Buyer already exists');
                } else {
                    console.error('Error adding buyer:', error);
                    return res.status(500).json('Internal Server Error');
                }
            }

            // Update character_from in skills and equipments tables
            model.updateCharacterId(isAddBuyerSuccess,checkBuyerResult, (updateError, updateResult) => {
                if (updateError) {
                    console.error('Error updating character_from:', updateError);
                    return res.status(500).json('Internal Server Error');
                }

                if (updateResult) {
                    return res.status(200).json(updateResult);
                } else {
                    return res.status(404).json("Can't update character_id");
                }
            });
        });
    } else {
        return res.status(400).json({ error: 'Invalid request or insufficient points' });
    }
};
