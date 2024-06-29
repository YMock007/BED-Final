const express = require('express');
const router = express.Router();

const controller = require('../controllers/secA_commentsController');      

router.get('/', controller.readAllComment)
router.get('/:newsfeed_id', controller.readCommentByNewsfeedId)
router.post('/', controller.createNewComment)
router.put('/:comment_id', controller.updateCommentById)
router.delete('/:comment_id/:user_id', controller.deleteCommentById)

module.exports = router