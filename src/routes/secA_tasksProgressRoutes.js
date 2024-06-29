const express = require('express');
const router = express.Router();

const walletController = require('../controllers/secB_walletController')
const controller = require('../controllers/secA_tasksProgressController');      

router.get('/', controller.readAllTaskProgress)
router.get('/:progress_id', controller.readTaskProgressById)
router.get('/task_id/:task_id',controller.readTaskProgressByTaskId)
router.post('/', controller.createNewTaskProgress, walletController.addPointsForNewTask)
router.put('/:progress_id', controller.updateTaskProgressById)
router.delete('/:progress_id/:user_id', controller.deleteTaskProgressById, walletController.deducePointsForDeleteTask)
module.exports = router