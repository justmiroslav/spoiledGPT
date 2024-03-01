const mongoConnection = require('../connections/mongoConnection');
const mongoose = mongoConnection.mongo;

const chatSchema = new mongoose.Schema({
    title: String,
    userId: String,
    date: {type: Date, default: Date.now}
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;