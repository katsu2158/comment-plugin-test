const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
//const PORT = 3000;
const PORT = 8080;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Connect to MongoDB
const MONGO_URI =
  "mongodb+srv://atomicq301:15gnquVqk94y3CIi@mangodb.lra5te9.mongodb.net/?retryWrites=true&w=majority&appName=MangoDB";
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Define a simple schema and model
// Define a schema for comments
const CommentSchema = new mongoose.Schema({
  prefecture: String,
  authorName: String,
  createdAt: { type: Date, default: Date.now },
  content: String,
});

// Define a schema for posts
const MarkerSchema = new mongoose.Schema({
  markerId: String,
  likesNum: Number,
  comments: [CommentSchema],
});

const Marker = mongoose.model("Post", MarkerSchema);

// Create a simple POST endpoint to store marker data
// v1/api/markers/:markerId
app.post("/v1/api/markers/:markerId", async (req, res) => {
  const { markerId, likesNum, comments } = req.body;

  const newMarker = new Marker({ markerId, likesNum, comments });
  try {
    await newMarker.save();
    res.status(201).send("Marker saved successfully");
  } catch (error) {
    res.status(500).send("Error saving marker");
  }
});

// Create a GET endpoint to get all markers
// v1/api/markers
app.get("/v1/api/markers", async (req, res) => {
  try {
    const markers = await Marker.find();
    res.status(200).json(markers);
  } catch (error) {
    res.status(500).send("Error retrieving markers");
  }
});

// Create a GET endpoint to retrieve a single marker with markerId
// /v1/api/markers/:markerId
app.get("/v1/api/markers/:markerId", async (req, res) => {
  const { markerId } = req.params;

  try {
    const marker = await Marker.findOne({ markerId });
    if (!marker) {
      return res.status(404).send("Marker not found");
    }
    res.status(200).json(marker);
  } catch (error) {
    res.status(500).send("Error retrieving marker");
  }
});

// Create a POST endpoint to add a comment to a specific marker
// /v1/api/markers/:markerId/comments

app.post("/v1/api/markers/:markerId/comments", async (req, res) => {
  const { markerId } = req.params;
  const { prefecture, authorName, content } = req.body;

  try {
    // Find the post by postId
    const marker = await Marker.findOne({ markerId });
    if (!marker) {
      return res.status(404).send("Marker not found");
    }

    // Add the new comment to the post's comments array
    const newComment = {
      prefecture,
      authorName,
      createdAt: new Date(),
      content,
    };
    marker.comments.push(newComment);

    // Save the updated post
    await marker.save();

    res.status(201).send("Comment added successfully");
  } catch (error) {
    res.status(500).send("Error adding comment");
  }
});

// -------- ooooooooo --------//
// Create an endpoint for like/dislike
app.post("/v1/api/markers/:markerId/like", async (req, res) => {
  const { markerId } = req.params;

  try {
    const marker = await Marker.findOne({ markerId });
    if (!marker) {
      return res.status(404).send("Marker not found");
    }

    marker.likesNum += 1;
    await marker.save();

    res.status(200).send("Marker liked successfully");
  } catch (error) {
    res.status(500).send("Error liking marker");
  }
});

// API endpoint to dislike a post
app.post("/posts/:postId/dislike", async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findOne({ postId });
    if (post) {
      post.likesNum -= 1;
      await post.save();
      res.status(200).json({ success: true, likesNum: post.likesNum });
    } else {
      res.status(404).json({ success: false, message: "Post not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// -------- ooooooooo --------//

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
