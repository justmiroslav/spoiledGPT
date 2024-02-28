const mongoConnection = require('../connections/mongoConnection');
const mongoose = mongoConnection.mongo;

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true},
    email: { type: String, unique: true, required: true},
    password: { type: String, required: true}
});

const User = mongoose.model('User', userSchema);

module.exports = User;