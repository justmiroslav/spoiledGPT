const router = require('express').Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/', authMiddleware, chatController.getMainPage);
router.get('/:id', authMiddleware, chatController.getChat);

module.exports = router;