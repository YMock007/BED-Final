const express = require('express');
const router = express.Router();

const controller = require('../controllers/secB_tradeController');      

router.get('/', controller.readAllTrade);
router.get('/:trade_id', controller.readTradeById);
router.get('/user/:user_id', controller.readTradeByUserId);
router.get('/user/:user_id/sell', controller.readTradeByUserIdSell);
router.get('/user/:user_id/buy', controller.readTradeByUserIdBuy);
router.post('/sell', controller.checkItem, controller.addNewSell);
router.post('/buy', controller.checkBuyer, controller.addBuyer);
module.exports = router;