import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  updateUserById,
  deleteUser,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import passport from "passport";
import jwt from "jsonwebtoken";

const authRouter = express.Router();

authRouter.post("/register", upload.single("profileImage"), registerUser);

authRouter.post("/login", loginUser);

authRouter.get("/user", protect, getUserProfile);

authRouter.put(
  "/user",
  protect,
  upload.single("profileImage"),
  updateUserProfile
);

authRouter.get("/", protect, admin, getAllUsers);

authRouter.put(
  "/user/:id",
  protect,
  admin,
  upload.single("profileImage"),
  updateUserById
);

authRouter.delete("/delete/:id", protect, deleteUser);

authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        role: user.role,
      },
    });
  }
);

export default authRouter;
