const router = require('express').Router();
const chatController = require('../controllers/chatController');

router.get('/', chatController.getMainPage);
router.get('/:id', chatController.getChat);

module.exports = router;