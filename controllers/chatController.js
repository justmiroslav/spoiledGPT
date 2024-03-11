const Chat = require('../models/chatModel');
const sortChats = require('../helpers/sortChats');
const Message = require('../models/messageModel');

async function getMainPage(req, res) {
    const { username } = req.cookies;
    let chats = await Chat.find({user: username}).sort({ date: -1 });
    let groupedChats = sortChats(chats);
    res.render('main', { chats: groupedChats, username: username});
}

async function getChat(req, res) {
    const { id } = req.params;
    const chat = await Chat.findOne({ _id: id});
    const messages = await Message.find({ chatId: id });
    res.render('chat', { title: chat.title, messages: messages });
}

async function addChat(req, res) {
    const { title } = req.body;
    const { username } = req.cookies;
    try {
        const newChat = await new Chat({ title: title, user: username });
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
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
}

async function removeChat(req, res) {
    const { id } = req.params;
    try {
        await Chat.deleteOne({_id: id});
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
}

async function removeAllChats(req, res) {
    const { username } = req.cookies;
    try {
        await Chat.deleteMany({ user: username });
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
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
