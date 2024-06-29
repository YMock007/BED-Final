const express = require('express');
const router = express.Router();

const controller = require('../controllers/secB_arsenalController');    
const equipmentController = require('../controllers/secB_equipmentsController.js')  
const walletController = require('../controllers/secB_walletController.js')

// Router GET methods
router.get('/', controller.readAllArsenal);
router.get('/hp', controller.readAllArsenalByHP);
router.get('/atk', controller.readAllArsenalByATK);
router.get('/def', controller.readAllArsenalByDEF);
router.get('/character/:character_id', controller.readAllArsenalByCharacter)
router.get('/points', controller.readAllArsenalByPoints);
router.get('/:arsenal_id', controller.readAllArsenalById);
router.get('/equipment/:equipment_name', controller.readAllArsenalByEquipment);

// Router Post Method
router.get('/profession/:profession', controller.readAllArsenalByProfession)
router.post('/buy', controller.buyFromArsenal, equipmentController.addNewEquipment, walletController.deducePointsEquipment)
router.post('/', controller.createNewArsenal)

// Router Put method
router.put('/:arsenal_id', controller.updateArsenalById)

//Router delte method
router.delete('/:arsenal_id', controller.deleteArsenalById)
module.exports = router;
