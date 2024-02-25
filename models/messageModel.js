const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chatId: String,
    sender: String,
    message: String,
    count: Number,
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;