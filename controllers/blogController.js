import asyncHandler from "express-async-handler";
import Blog from "../models/blog.js";
import User from "../models/user.js";

export const createBlog = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const blog = new Blog({
    title,
    description,
    user: req.user.id,
  });

  const createdBlog = await blog.save();

  res.status(201).json(createdBlog);
});

export const getAllBlogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, startDate, endDate } = req.query;

  const filters = {};

  if (status) filters.status = status;

  if (startDate || endDate) {
    filters.createdAt = {};

    if (startDate) {
      const start = new Date(startDate);
      if (!isNaN(start)) filters.createdAt.$gte = start;
    }

    if (endDate) {
      const end = new Date(endDate);
      if (!isNaN(end)) filters.createdAt.$lte = end;
    }
  }

  const skip = (page - 1) * limit;

  const blogs = await Blog.find(filters)
    .skip(skip)
    .limit(parseInt(limit))
    .populate("user", "name email");

  const totalBlogs = await Blog.countDocuments(filters);

  res.json({
    blogs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalBlogs,
      totalPages: Math.ceil(totalBlogs / limit),
    },
  });
});

export const getBlogById = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  res.json(blog);
});

export const updateBlog = asyncHandler(async (req, res) => {
  const { title, description, status } = req.body;
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  if (blog.user.toString() !== req.user.id && req.user.role !== "admin") {
    res.status(401);
    throw new Error("You are not authorized to update this blog");
  }

  blog.title = title || blog.title;
  blog.description = description || blog.description;
  blog.status = status || blog.status;

  const updatedBlog = await blog.save();
  res.json(updatedBlog);
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  await blog.deleteOne();
  res.json({ message: "Blog deleted" });
});

export const getBlogsByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const blogs = await Blog.find({ user: userId }).populate(
    "user",
    "name email"
  );

  res.json(blogs);
});
