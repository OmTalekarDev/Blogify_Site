import express from "express";
import mongoose from "mongoose";
import { Blog } from "../models/Blog.js";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

function toPublicBlog(blog) {
  const author = blog.author && typeof blog.author === "object"
    ? blog.author
    : null;

  return {
    id: blog._id.toString(),
    title: blog.title,
    description: blog.description,
    content: blog.content,
    category: blog.category,
    image: blog.image,
    tags: blog.tags,
    status: blog.status,
    authorId: author?._id?.toString() || blog.author?.toString(),
    authorName: author?.name || "Blogify User",
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
    views: blog.views || 0
  };
}

router.get("/", async (_req, res) => {
  try {
    const blogs = await Blog.find({ status: "published" })
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ blogs: blogs.map(toPublicBlog) });
  } catch (error) {
    console.error("List blogs error:", error);
    res.status(500).json({ message: "Unable to load blogs." });
  }
});

router.get("/my", requireAuth, async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user.id })
      .populate("author", "name")
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ blogs: blogs.map(toPublicBlog) });
  } catch (error) {
    console.error("My blogs error:", error);
    res.status(500).json({ message: "Unable to load your blogs." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid blog id." });
    }

    const blog = await Blog.findOne({
      _id: req.params.id,
      status: "published"
    })
      .populate("author", "name")
      .lean();

    if (!blog) return res.status(404).json({ message: "Blog not found." });

    res.json({ blog: toPublicBlog(blog) });
  } catch (error) {
    console.error("Blog detail error:", error);
    res.status(500).json({ message: "Unable to load the blog." });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      category = "Technology",
      image = "",
      tags = [],
      status = "published"
    } = req.body;

    if (!title?.trim() || !description?.trim() || !content?.trim()) {
      return res.status(400).json({ message: "Title, description and content are required." });
    }

    if (!["published", "draft"].includes(status)) {
      return res.status(400).json({ message: "Status must be published or draft." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: "User not found." });

    const blog = await Blog.create({
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      category: String(category).trim() || "Technology",
      image: String(image).trim(),
      tags: Array.isArray(tags)
        ? tags.map(String).map(tag => tag.trim()).filter(Boolean).slice(0, 10)
        : [],
      status,
      author: user._id
    });

    const populated = await Blog.findById(blog._id)
      .populate("author", "name")
      .lean();

    res.status(201).json({
      message: status === "draft" ? "Draft saved." : "Blog published.",
      blog: toPublicBlog(populated)
    });
  } catch (error) {
    console.error("Create blog error:", error);
    res.status(500).json({ message: "Unable to create blog." });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid blog id." });
    }

    const blog = await Blog.findOne({
      _id: req.params.id,
      author: req.user.id
    });

    if (!blog) return res.status(404).json({ message: "Blog not found." });

    const fields = ["title", "description", "content", "category", "image"];
    for (const field of fields) {
      if (req.body[field] !== undefined) blog[field] = String(req.body[field]).trim();
    }

    if (Array.isArray(req.body.tags)) {
      blog.tags = req.body.tags.map(String).map(tag => tag.trim()).filter(Boolean).slice(0, 10);
    }

    if (["published", "draft"].includes(req.body.status)) {
      blog.status = req.body.status;
    }

    await blog.save();

    const updated = await Blog.findById(blog._id)
      .populate("author", "name")
      .lean();

    res.json({ message: "Blog updated.", blog: toPublicBlog(updated) });
  } catch (error) {
    console.error("Update blog error:", error);
    res.status(500).json({ message: "Unable to update blog." });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid blog id." });
    }

    const deleted = await Blog.findOneAndDelete({
      _id: req.params.id,
      author: req.user.id
    });

    if (!deleted) return res.status(404).json({ message: "Blog not found." });

    res.json({ message: "Blog deleted." });
  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({ message: "Unable to delete blog." });
  }
});

export default router;
