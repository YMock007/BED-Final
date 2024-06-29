const express = require('express');
const router = express.Router();

const controller = require('../controllers/secB_duelController');      

router.get('/', controller.readAllDuel)
router.get('/:duel_id', controller.readDuelById)
router.get('/win/:character_name', controller.readDuelByWin)
router.get('/lost/:character_name', controller.readDuelByLost)
router.get('/character_name/:character_name', controller.readDuelByName)
router.post('/', controller.checkIds, controller.createNewDuel, controller.modifyPoints)

module.exports = router;