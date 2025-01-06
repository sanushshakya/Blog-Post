import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import User from "../models/user.js";

dotenv.config();

// Connect to MongoDB
const connectDB = asyncHandler(async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log(`MongoDB Connected: ${conn.connection.host}`);

  // Seed admin user
  await seedAdminUser();
});

// Seed Admin User
const seedAdminUser = asyncHandler(async () => {
  const existingAdmin = await User.findOne({ role: "admin" });

  if (existingAdmin) {
    console.log("Admin user already exists.");
    return;
  }

  const password = "admin123";
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const adminUser = new User({
    name: "Admin",
    email: "admin@example.com",
    password: hashedPassword,
    isOAuth: false,
    role: "admin",
    profileImage: "",
  });

  await adminUser.save();
  console.log("Admin user created successfully.");
});

export default connectDB;
