const mongoConnection = require('../connections/mongoConnection');
const mongoose = mongoConnection.mongo;

const chatSchema = new mongoose.Schema({
    title: String,
    user: String,
    date: {type: Date, default: Date.now}
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;