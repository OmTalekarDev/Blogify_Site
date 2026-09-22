import { connectDB } from "../backend/config/db.js";
import app from "../backend/app.js";

let dbReady;

function getDatabaseConnection() {
  if (!dbReady) dbReady = connectDB();
  return dbReady;
}

export default async function handler(req, res) {
  try {
    await getDatabaseConnection();
    return app(req, res);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return res.status(500).json({ message: "Database connection failed." });
  }
}
