const chatModel = require('../models/chatModel');
const messageModel = require('../models/messageModel');
const sortChats = require('../helpers/sortChats');

async function getMainPage(req, res) {
    let chats = await chatModel.find().sort({ date: -1 });
    let groupedChats = sortChats(chats);
    res.render('main', { chats: groupedChats });
}

async function getChat(req, res) {
    const chatId = req.params.id;
    const chat = await chatModel.findOne({ _id: chatId });
    const messages = await messageModel.find({ chatId: chatId });
    res.render('chat', { title: chat.title, messages: messages });
}

async function addChat() {
    await new chatModel().save();
}

async function updateChat (chatId, title) {
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
    getChat,
    addChat,
    updateChat,
    removeChat,
    removeAllChats
};