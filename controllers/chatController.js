const Chat = require('../models/chatModel');
const sortChats = require('../helpers/sortChats');
const Message = require('../models/messageModel');

async function getMainPage(req, res) {
    let chats = await Chat.find({});
    let groupedChats = sortChats(chats);
    res.render('main', { chats: groupedChats });
}

async function getChat(req, res) {
    const { id } = req.params;
    const chat = await Chat.findOne({ _id: id});
    const messages = await Message.find({ chatId: id });
    res.render('chat', { title: chat.title, messages: messages });
}

async function addChat(req, res) {
    const { title } = req.body;
    try {
        const newChat = await new Chat({ title: title });
        newChat.save();
        res.status(200).json({newChat: newChat})
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function updateChat(req, res) {
    const { id } = req.params;
    const { title } = req.body;
    try {
        await Chat.updateOne({_id: id}, {title: title});
        res.status(200).json({ updateChat: 'Chat updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function removeChat(req, res) {
    const { id } = req.params;
    try {
        await Chat.deleteOne({_id: id});
        res.status(200).json({ removeChat: 'Chat removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function removeAllChats(req, res) {
    try {
        await Chat.deleteMany({});
        res.status(200).json({ removeAll: 'All chats removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getMainPage,
    getChat,
    addChat,
    updateChat,
    removeChat,
    removeAllChats
};
