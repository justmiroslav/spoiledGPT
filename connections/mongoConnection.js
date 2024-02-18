const mongoose = require('mongoose');
const dbString = require('../configs/dbConfig');

const connection = () => {
    try {
        mongoose.connect(dbString);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};

const mongoConnection= {
    mongo : mongoose,
    connect : connection
};

module.exports = mongoConnection;