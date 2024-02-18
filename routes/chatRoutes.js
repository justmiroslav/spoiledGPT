const router = require('express').Router();
const chatController = require('../controllers/chatController');

router.get('/', chatController.getChat);

module.exports = router;