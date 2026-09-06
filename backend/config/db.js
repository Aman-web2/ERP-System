const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      console.error('❌ MONGO_URI is not defined');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB Atlas...');

    const conn = await mongoose.connect(mongoURI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:');
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;