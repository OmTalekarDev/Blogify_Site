import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing. Create backend/.env using backend/.env.example.");
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    appName: "Blogify"
  });
}

export default mongoose;
