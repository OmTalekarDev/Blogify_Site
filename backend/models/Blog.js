import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 220
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: "Technology",
      trim: true,
      maxlength: 50
    },
    image: {
      type: String,
      default: "",
      trim: true
    },
    tags: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
      index: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    views: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

blogSchema.index({ status: 1, createdAt: -1 });

export const Blog = mongoose.model("Blog", blogSchema);
