require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

// Temporary posts data
let posts = [
  {
    id: 1,
    username: "Vanshika",
    content: "Welcome to our Social Media Platform! 🎉",
    likes: 0,
    comments: []
  }
];

// Home route
app.get("/", (req, res) => {
  res.send("Social Media Platform Backend is Running!");
});

// Get all posts
app.get("/api/posts", (req, res) => {
  res.json(posts);
});

// Create a new post
app.post("/api/posts", (req, res) => {
  const { username, content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({
      message: "Post content is required"
    });
  }

  const newPost = {
    id: Date.now(),
    username: username || "Guest",
    content: content.trim(),
    likes: 0,
    comments: []
  };

  posts.unshift(newPost);
  res.status(201).json(newPost);
});

// Like a post
app.post("/api/posts/:id/like", (req, res) => {
  const post = posts.find(
    (p) => p.id === Number(req.params.id)
  );

  if (!post) {
    return res.status(404).json({
      message: "Post not found"
    });
  }

  post.likes++;
  res.json(post);
});

// Add a comment
app.post("/api/posts/:id/comments", (req, res) => {
  const post = posts.find(
    (p) => p.id === Number(req.params.id)
  );

  if (!post) {
    return res.status(404).json({
      message: "Post not found"
    });
  }

  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({
      message: "Comment is required"
    });
  }

  post.comments.push({
    id: Date.now(),
    text: text.trim()
  });

  res.status(201).json(post);
});
// Temporary follow system
let users = [
  {
    id: 1,
    username: "Vanshika",
    following: []
  },
  {
    id: 2,
    username: "Alex",
    following: []
  }
];

// Get all users
app.get("/api/users", (req, res) => {
  res.json(users);
});

// Follow or unfollow a user
app.post("/api/users/:id/follow", (req, res) => {
  const currentUser = users.find(
    (user) => user.id === 1
  );

  const targetId = Number(req.params.id);

  if (targetId === currentUser.id) {
    return res.status(400).json({
      message: "You cannot follow yourself"
    });
  }

  const targetUser = users.find(
    (user) => user.id === targetId
  );

  if (!targetUser) {
    return res.status(404).json({
      message: "User not found"
    });
  }

  const alreadyFollowing =
    currentUser.following.includes(targetId);

  if (alreadyFollowing) {
    currentUser.following =
      currentUser.following.filter(
        (id) => id !== targetId
      );
  } else {
    currentUser.following.push(targetId);
  }

  res.json({
    message: alreadyFollowing
      ? "Unfollowed successfully"
      : "Followed successfully",
    following: currentUser.following
  });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('server running on port $ {PORT}');
    
});