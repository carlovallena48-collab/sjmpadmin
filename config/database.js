const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { 
      dbName: "sjmp"
    });
    console.log("✅ Connected to MongoDB Atlas (sjmp DB)");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

// Export the function directly
module.exports = connectDB;