const express = require('express');
const router = express.Router();

const controller = require('../controllers/secB_questsController');      
const characterController = require('../controllers/secB_charactersController');      

router.get('/', controller.readAllQuest)
router.get('/reward', controller.readAllQuestByReward)
router.get('/enemy', controller.readAllQuestByEnemy)
router.get('/:quest_id', controller.readQuestById)

router.post('/', controller.createNewQuest)
router.post('/:quest_id/character/:character_id',controller.checkPoints, controller.readQuestDetail, characterController.readCharacterDetail, controller.doQuest, controller.addAttributesPoints)

router.put('/:quest_id', controller.updateQuestById)

router.delete('/:quest_id', controller.deleteQuestById)

module.exports = router