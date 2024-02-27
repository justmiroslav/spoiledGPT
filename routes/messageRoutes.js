const router = require('express').Router();
const messageController = require('../controllers/messageController');

router.post('/add/:chatId', messageController.createMessage);
router.get('/get/all/:chatId', messageController.getMessages);
router.get('/get/:chatId', messageController.getMessage);
router.get('/count/:chatId', messageController.returnMessagesCount);
router.patch('/update/:id', messageController.updateMessage);
router.delete('/delete/:chatId', messageController.deleteSelectedMessage);

module.exports = router;