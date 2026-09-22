import "dotenv/config";
import { connectDB } from "./config/db.js";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  app.listen(PORT, "0.0.0.0", () => {
    console.log("Blogify is running at http://localhost:" + PORT);
    console.log("MongoDB connection established.");
    console.log("Health check: http://localhost:" + PORT + "/api/health");
  });
}

startServer().catch(error => {
  console.error("Startup failed:", error.message);
  process.exit(1);
});
