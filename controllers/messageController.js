const Message = require('../models/messageModel');

async function createMessage(req, res) {
    const { chatId } = req.params;
    const { sender, message, count } = req.body;
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
    const { chatId } = req.params;
    const { count } = req.body;
    try {
        const message = await Message.findOne({chatId: chatId, count: count});
        res.status(200).json({findMessage: message});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

async function returnMessagesCount(req, res) {
    const { chatId } = req.params;
    try {
        const count = await Message.countDocuments({chatId: chatId});
        res.status(200).json({count: count});
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
    const { chatId } = req.params;
    const { count } = req.body;
    try {
        await Message.deleteMany({chatId: chatId, count: {$gt: count}});
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
}

module.exports = {
    createMessage,
    getMessages,
    getMessage,
    returnMessagesCount,
    updateMessage,
    deleteSelectedMessage
};