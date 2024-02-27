const messageModel = require('../models/messageModel');

async function createMessage(chatId, sender, message, count) {
    await new messageModel({ chatId: chatId, sender: sender, message: message, count: count }).save();
}

async function getMessages(chatId) {
     await messageModel.find({ chatId: chatId });
}

async function getMessage(chatId, count) {
    await messageModel.findOne({ chatId: chatId, count: count});
}

function returnMessagesCount(chatId) {
    return messageModel.countDocuments({ chatId: chatId });
}

async function updateMessage(messageId, message) {
    await messageModel.updateOne({ _id: messageId }, { message: message });
}

async function deleteSelectedMessage(chatId, messageCounter) {
    await messageModel.deleteMany({ chatId: chatId, count: { $gt: messageCounter } });
}


module.exports = {
    createMessage,
    getMessages,
    getMessage,
    returnMessagesCount,
    updateMessage,
    deleteSelectedMessage
};