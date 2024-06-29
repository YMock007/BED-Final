const express = require('express');
const router = express.Router();

const controller = require('../controllers/secB_skillsController.js');      


router.get('/', controller.readAllSkill)
router.get('/:skill_id', controller.readSkillById)
router.get('/user/:user_id', controller.getCharacterId, controller.readSkillByCharacterId)
router.get('/character/:character_id', controller.readSkillByCharacterId)
router.get('/character/:character_id/learn', controller.readSkillByCharacterIdLearnable)

router.post('/character/:character_id/learn', controller.checkExistingSkill, controller.checkAddingSkill, controller.skillingCharacter)
module.exports = router