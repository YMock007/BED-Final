const express = require('express');
const router = express.Router();

const controller = require('../controllers/secB_walletController');      

router.get('/:user_id', controller.readWalletByUserId)
router.get('/', controller.updateWallet);


module.exports = router;