import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // reads env at call time, not import time, so dotenv.config() timing in index.js doesn't matter
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    // exit instead of running a server with no DB
    process.exit(1);
  }
};

export default connectDB;
