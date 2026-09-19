import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import blogRoutes from "./routes/blogs.js";

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Blogify API",
    database: "MongoDB",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);

app.use(express.static(projectRoot));

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Unexpected server error." });
});

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log("Blogify is running at http://localhost:" + PORT);
    console.log("MongoDB connection established.");
    console.log("Health check: http://localhost:" + PORT + "/api/health");
  });
}

startServer().catch(error => {
  console.error("Startup failed:", error.message);
  process.exit(1);
});
