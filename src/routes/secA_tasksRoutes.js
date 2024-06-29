const express = require('express');
const router = express.Router();


const controller = require('../controllers/secA_tasksController');      

router.get('/', controller.readAllTask)
router.get('/:task_id', controller.readTaskById)
router.post('/', controller.createNewTask)
router.put('/:task_id', controller.updateTaskById)
router.delete('/:task_id', controller.deleteTaskById)
module.exports = router