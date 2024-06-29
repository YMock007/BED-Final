const express = require('express');
const router = express.Router();

const controller = require('../controllers/secB_libraryController.js');    
const skillsController = require('../controllers/secB_skillsController.js')  
const walletController = require('../controllers/secB_walletController.js')

// Router GET methods
router.get('/', controller.readAllLibrary);
router.get('/hp', controller.readAllLibraryByHP);
router.get('/atk', controller.readAllLibraryByATK);
router.get('/def', controller.readAllLibraryByDEF);
router.get('/character/:character_id', controller.readAllLibraryByCharacter)
router.get('/points', controller.readAllLibraryByPoints);
router.get('/:library_id', controller.readAllLibraryById);
router.get('/skill/:skill_name', controller.readAllArsenalBySkill);


// Router Post Method
router.get('/profession/:profession', controller.readAllLibraryByProfession);
router.post('/buy', controller.buyFromLibrary, skillsController.addNewSkill, walletController.deducePointsSkill)
router.post('/', controller.createNewLibrary)


// Router Put method
router.put('/:library_id', controller.updateLibraryById)

//Router delte method
router.delete('/:library_id', controller.deleteLibraryById)
module.exports = router;
