const express = require('express');
const router = express.Router();

const controller = require('../controllers/secB_charactersController');      

router.get('/', controller.readAllCharacter)
router.get('/:character_id', controller.readCharacterById)
router.get('/user/:user_id', controller.readCharacterByUserId)
router.post('/', controller.checkUserID, controller.createNewCharacter);
router.put('/:character_id', controller.updateCharacterById)
router.delete('/:character_id', controller.deleteCharacterById)

module.exports = router;