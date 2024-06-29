const express = require('express');
const router = express.Router();

const controller = require('../controllers/secB_equipmentsController.js');     

router.get('/', controller.readAllEquipment)
router.get('/:equipment_id', controller.readEquipmentById)
router.get('/user/:user_id', controller.getCharacterId, controller.readEquipmentByCharacterId)
router.get('/character/:character_id', controller.readEquipmentByCharacterId)
router.get('/character/:character_id/equip', controller.readEquipmentByCharacterIdEquipable)

router.post('/character/:character_id/equip', controller.checkExistingEquipment, controller.checkAddingEquipment, controller.equipingCharacter)

module.exports = router