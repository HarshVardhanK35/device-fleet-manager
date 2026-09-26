import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // reads env at call time, not import time, so dotenv.config() timing in index.js doesn't matter
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // exit instead of running a server with no DB
  }
};

export default connectDB;
