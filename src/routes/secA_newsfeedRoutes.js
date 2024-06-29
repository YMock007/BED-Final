const express = require('express');
const router = express.Router();

const controller = require('../controllers/secA_newsfeedController');      

router.get('/', controller.readAllPost)
router.get('/:newsfeed_id', controller.readPostById)
router.post('/', controller.createNewPost)
router.put('/:newsfeed_id', controller.updatePostById)
router.delete('/:newsfeed_id/:user_id', controller.deletePostById)

module.exports = router