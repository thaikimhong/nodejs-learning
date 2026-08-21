const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://admin:admin123@localhost:27017/practice?authSource=admin';

async function connectDB() {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
}

module.exports = connectDB;
