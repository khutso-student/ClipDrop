import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    // Fallback if MONGO_URI not defined in env
    const mongoUri =
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ClipDrop";

    const conn = await mongoose.connect(mongoUri);

    console.log("✅ MongoDB Connected:");
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   DB:   ${conn.connection.name}`);
    console.log(`   ENV:  ${process.env.NODE_ENV || "development"}`);
  } catch (error: any) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// ✅ Use ES Module export
export default connectDB;
