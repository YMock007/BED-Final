const express = require('express');
const router = express.Router();

const controller = require('../controllers/secA_usersController');      
const bcryptMiddleware = require('../middlewares/bcryptMiddleware')

router.get('/', controller.readAllUser);
router.get('/:user_id', controller.readUserById)

router.put('/:user_id', controller.checkByNameAndEmail, controller.updateUserById, controller.readUserbyId200);
router.put('/password/:user_id', controller.hashBothPassword, controller.checkOldPassword, controller.updatePasswordById);
router.delete('/:user_id', controller.deleteUserById)

module.exports = router;