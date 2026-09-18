import express from "express";
import { randomUUID } from "node:crypto";
import { readDb, writeDb } from "../utils/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

function toPublicBlog(blog) {
  return {
    id: blog.id,
    title: blog.title,
    description: blog.description,
    content: blog.content,
    category: blog.category,
    image: blog.image,
    tags: blog.tags,
    status: blog.status,
    authorId: blog.authorId,
    authorName: blog.authorName,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
    views: blog.views || 0
  };
}

router.get("/", async (_req, res) => {
  try {
    const db = await readDb();
    const blogs = db.blogs
      .filter(blog => blog.status === "published")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(toPublicBlog);

    res.json({ blogs });
  } catch (error) {
    console.error("List blogs error:", error);
    res.status(500).json({ message: "Unable to load blogs." });
  }
});

router.get("/my", requireAuth, async (req, res) => {
  try {
    const db = await readDb();
    const blogs = db.blogs
      .filter(blog => blog.authorId === req.user.id)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .map(toPublicBlog);

    res.json({ blogs });
  } catch (error) {
    console.error("My blogs error:", error);
    res.status(500).json({ message: "Unable to load your blogs." });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, description, content, category, image = "", tags = [], status = "published" } = req.body;

    if (!title?.trim() || !description?.trim() || !content?.trim()) {
      return res.status(400).json({ message: "Title, description and content are required." });
    }

    if (!["published", "draft"].includes(status)) {
      return res.status(400).json({ message: "Status must be published or draft." });
    }

    const now = new Date().toISOString();
    const blog = {
      id: randomUUID(),
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      category: category?.trim() || "Technology",
      image: image?.trim() || "",
      tags: Array.isArray(tags) ? tags.map(String).map(tag => tag.trim()).filter(Boolean).slice(0, 10) : [],
      status,
      authorId: req.user.id,
      authorName: req.user.name,
      createdAt: now,
      updatedAt: now,
      views: 0
    };

    const db = await readDb();
    db.blogs.push(blog);
    await writeDb(db);

    res.status(201).json({
      message: status === "draft" ? "Draft saved." : "Blog published.",
      blog: toPublicBlog(blog)
    });
  } catch (error) {
    console.error("Create blog error:", error);
    res.status(500).json({ message: "Unable to create blog." });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const db = await readDb();
    const blog = db.blogs.find(item => item.id === req.params.id && item.authorId === req.user.id);

    if (!blog) return res.status(404).json({ message: "Blog not found." });

    if (req.body.title !== undefined) blog.title = String(req.body.title).trim();
    if (req.body.description !== undefined) blog.description = String(req.body.description).trim();
    if (req.body.content !== undefined) blog.content = String(req.body.content).trim();
    if (req.body.category !== undefined) blog.category = String(req.body.category).trim();
    if (req.body.image !== undefined) blog.image = String(req.body.image).trim();
    if (req.body.tags !== undefined) blog.tags = Array.isArray(req.body.tags) ? req.body.tags.map(String).map(tag => tag.trim()).filter(Boolean).slice(0, 10) : [];
    if (req.body.status !== undefined && ["published", "draft"].includes(req.body.status)) blog.status = req.body.status;
    blog.updatedAt = new Date().toISOString();

    await writeDb(db);
    res.json({ message: "Blog updated.", blog: toPublicBlog(blog) });
  } catch (error) {
    console.error("Update blog error:", error);
    res.status(500).json({ message: "Unable to update blog." });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const db = await readDb();
    const before = db.blogs.length;
    db.blogs = db.blogs.filter(item => !(item.id === req.params.id && item.authorId === req.user.id));

    if (db.blogs.length === before) return res.status(404).json({ message: "Blog not found." });

    await writeDb(db);
    res.json({ message: "Blog deleted." });
  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({ message: "Unable to delete blog." });
  }
});

export default router;
