import express from "express";
import {
  createBlog,
  getAllBlogs,
  updateBlog,
  deleteBlog,
  getBlogById,
  getBlogsByUser,
} from "../controllers/blogController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const blogRouter = express.Router();

blogRouter.post("/", protect, admin, createBlog);

blogRouter.get("/", protect, admin, getAllBlogs);

blogRouter.get("/:id", protect, getBlogById);

blogRouter.put("/:id", protect, updateBlog);

blogRouter.delete("/:id", protect, admin, deleteBlog);

blogRouter.get("/user/:userId", protect, admin, getBlogsByUser);

export default blogRouter;
