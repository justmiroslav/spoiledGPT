const mongoConnection = require('../connections/mongoConnection');
const mongoose = mongoConnection.mongo;

const messageSchema = new mongoose.Schema({
    chatId: mongoose.Schema.Types.ObjectId,
    sender: String,
    message: String,
    count: Number,
    date: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;