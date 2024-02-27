const router = require('express').Router();
const chatController = require('../controllers/chatController');

router.post('/add', chatController.addChat);
router.patch('/update/:id', chatController.updateChat);
router.delete('/remove/:id', chatController.removeChat);
router.delete('/removeAll', chatController.removeAllChats);

module.exports = router;