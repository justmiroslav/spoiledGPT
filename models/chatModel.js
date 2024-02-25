const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    title: {type: String, default: "Untitled chat"},
    date: {type: Date, default: Date.now}
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;