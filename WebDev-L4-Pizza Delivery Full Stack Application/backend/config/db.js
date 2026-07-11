const dns = require('dns');
const mongoose = require('mongoose');

// Set DNS servers in case of local network resolution issues with Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      console.error("CRITICAL ERROR: MONGODB_URL is not defined in the environment variables!");
      process.exit(1);
    }
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
