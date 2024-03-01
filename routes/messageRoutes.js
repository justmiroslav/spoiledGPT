const router = require('express').Router();
const messageController = require('../controllers/messageController');

router.post('/add/:chatId/:count', messageController.createMessage);
router.get('/get/all/:chatId', messageController.getMessages);
router.get('/get/id/:id', messageController.getMessageById);
router.get('/get/prev/:chatId/:id', messageController.getPreviousMessage);
router.get('/get/:chatId/:count', messageController.getMessage);
router.patch('/update/:id', messageController.updateMessage);
router.delete('/remove/all', messageController.deleteAllMessages);
router.delete('/delete/all/:chatId', messageController.deleteMessagesFromChat);
router.delete('/delete/:chatId/:count', messageController.deleteSelectedMessage);

module.exports = router;