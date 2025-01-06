import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import "./config/passport.js";

import authRouter from "./routes/userRoute.js";
import blogRouter from "./routes/blogRoute.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/uploads", express.static("uploads"));

connectDB();

app.use(
  session({
    secret: process.env.SESSION_SECRET || "asdfadsf213423rdas^&^&^%&^",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRouter);
app.use("/api/blog", blogRouter);

app.get("/", async (req, res) => {
  res.send("Blog Posts");
});

app.use((err, req, res, next) => {
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
