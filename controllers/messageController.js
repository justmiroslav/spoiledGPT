const Message = require('../models/messageModel');

async function createMessage(req, res) {
    const { chatId, count } = req.params;
    const { sender, message } = req.body;
    try {
        const newMessage = await new Message({ chatId: chatId, sender: sender, message: message, count: count });
        newMessage.save();
        res.status(200).json({newMessage: newMessage});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

async function getMessages(req, res) {
    const { chatId } = req.params;
    try {
        const messages = await Message.find({chatId: chatId});
        res.status(200).json({messages: messages});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

async function getMessage(req, res) {
    const { chatId, count } = req.params;
    try {
        const message = await Message.findOne({chatId: chatId, count: count});
        res.status(200).json({findMessage: message});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

async function getMessageById(req, res) {
    const { id } = req.params;
    try {
        const message = await Message.findById({_id: id});
        res.status(200).json({messageId: message});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

async function getPreviousMessage(req, res) {
    const { chatId, id } = req.params;
    try {
        const message = await Message.findById(id);
        const previousMessage = await Message.find({chatId: chatId, date: {$lt: message.date}}).sort({date: -1});
        res.status(200).json({previousMessage: previousMessage[0]});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

async function updateMessage(req, res) {
    const { id } = req.params;
    const { message } = req.body;
    try {
        await Message.updateOne({_id: id}, {message: message});
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
}

async function deleteSelectedMessage(req, res) {
    const { chatId, count } = req.params;
    try {
        await Message.deleteMany({chatId: chatId, count: {$gt: count}});
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
}

async function deleteMessagesFromChat(req, res) {
    const { chatId } = req.params;
    try {
        await Message.deleteMany({chatId: chatId});
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
}

async function deleteAllMessages(req, res) {
    try {
        await Message.deleteMany({});
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
}

module.exports = {
    createMessage,
    getMessages,
    getMessage,
    getMessageById,
    getPreviousMessage,
    updateMessage,
    deleteSelectedMessage,
    deleteMessagesFromChat,
    deleteAllMessages
};