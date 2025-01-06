import asyncHandler from "express-async-handler";
import User from "../models/user.js";
import { generateToken } from "../config/jwt.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("User already exists");
  }

  let profileImage = "";
  if (req.file) {
    profileImage = `/uploads/${req.file.filename}`;
  }

  const user = await User.create({
    name,
    email,
    password,
    profileImage,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage,
    createdAt: user.createdAt,
    token,
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user._id);

  res.json({
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
  });
});

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(user);
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.name = req.body.name || user.name;

  if (req.file) {
    user.profileImage = `/uploads/${req.file.filename}`;
  }

  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();
  res.json(updatedUser);
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

export const updateUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, role, password } = req.body;

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.role = role || user.role;
  if (password) {
    user.password = password;
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    createdAt: updatedUser.createdAt,
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  await user.deleteOne();
  res.json({ message: "User deleted" });
});
