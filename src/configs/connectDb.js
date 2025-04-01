const mongoose = require('mongoose');
require('dotenv').config();


const dbUrl = `mongodb+srv://${process.env.DATABASE_USERNAME}:${encodeURIComponent(process.env.DATABASE_PASSWORD)}@cluster0.5ia4f.mongodb.net/eventhub?retryWrites=true&w=majority`;

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(dbUrl); // Không cần options nữa
        
        console.log('✅ Connected to MongoDB:', connection.connection.host);
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
