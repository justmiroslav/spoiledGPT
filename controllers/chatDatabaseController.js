const chatModel = require('../models/chatModel');
const messageModel = require('../models/messageModel');
const sortChats = require('../helpers/sortChats');
const mongoose = require('mongoose');

async function addChat(title) {
    await new chatModel({title: title}).save();
}

async function getMainPage(req, res) {
    let chats = await chatModel.find().sort({ date: -1 });
    let groupedChats = sortChats(chats);
    res.render('main', { chats: groupedChats });
}

async function getChat(req, res) {
    const chat = await chatModel.findOne({ _id: req.params.id });
    const messages = await messageModel.find({ chatId: chat._id });
    res.render('chat', { title: chat.title, messages: messages });
}

async function getChatIdByTitle(title) {
    await chatModel.findOne({ title: title });
}

async function updateChat (chatId, title) {
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
        throw new Error('Invalid chatId');
    }
    await chatModel.updateOne({ _id: chatId }, { title: title });
}

async function removeChat(chatId) {
    await chatModel.deleteOne({_id: chatId});
}

async function removeAllChats() {
    await chatModel.deleteMany({});
}

module.exports = {
    getMainPage,
    getChatIdByTitle,
    getChat,
    addChat,
    updateChat,
    removeChat,
    removeAllChats
};