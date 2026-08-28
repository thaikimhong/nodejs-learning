const mongoose = require('mongoose');

// In Docker this is set by docker-compose (host "mongodb").
// Locally it falls back to the port published on your machine.
const MONGO_URI =
    process.env.MONGO_URI ||
    'mongodb://admin:admin123@localhost:27323/practice?authSource=admin';

async function connectDB() {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
}

module.exports = connectDB;
