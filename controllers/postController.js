require("dotenv").config();
const express = require("express");
const passport = require("passport");
const mongoose = require("mongoose");
const Post = require("../models/Post");
const User = require("../models/User");
const Topic = require("../models/Topic");
const postController = express.Router();

// Get single post data
postController.get("/:id", async (req, res) => {
  const postId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ msg: "Invalid post ID" });
  }

  try {
    const post = await Post.findById(postId)
      .populate("author", "username")
      .populate("topic", "topic");
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(200).json({ post });
  } catch (err) {
    res.status(400).json({ msg: "Failed to get post data", err });
  }
});

postController.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { body, title } = req.body;
    const authorId = req.user.id;
    const htmlId = process.env.HTML_CSS_JAVASCRIPT;
    const mernId = process.env.MERN;
    const netId = process.env.ASPNET;

    console.log("Environment Variable IDs:", { htmlId, mernId, netId });

    const lowerCaseBody = body.toLowerCase();
    const lowerCaseTitle = title.toLowerCase();

    let topicId;
    if (
      lowerCaseBody.includes("html") ||
      lowerCaseTitle.includes("html") ||
      lowerCaseBody.includes("css") ||
      lowerCaseTitle.includes("css") ||
      lowerCaseBody.includes("javascript") ||
      lowerCaseTitle.includes("javascript")
    ) {
      topicId = htmlId;
    } else if (
      lowerCaseBody.includes("mern") ||
      lowerCaseTitle.includes("mern")
    ) {
      topicId = mernId;
    } else {
      topicId = netId;
    }

    console.log("Selected topic ID:", topicId);

    if (!body || !title) {
      return res
        .status(400)
        .json({ msg: "Please provide all required fields" });
    }

    // Verify that the topic exists
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(400).json({ msg: "Invalid topic ID" });
    }

    const newPost = new Post({
      body,
      author: authorId,
      title,
      topic: topicId,
    });

    try {
      // Save the new post
      const savedPost = await newPost.save();
      console.log("New post saved:", savedPost);

      // Update the user's post array
      const userUpdateResult = await User.findByIdAndUpdate(
        authorId,
        { $push: { posts: savedPost._id } },
        { useFindAndModify: false }
      );
      console.log("User update result:", userUpdateResult);

      // Update topics post array
      const topicUpdateResult = await Topic.findByIdAndUpdate(
        topicId,
        { $push: { posts: savedPost._id } },
        { useFindAndModify: false, new: true } // Add 'new: true' to get the updated document
      );
      console.log("Topic update result:", topicUpdateResult);

      // Fetch updated user information
      const user = await User.findById(authorId).populate("posts", "_id");
      console.log("Updated user:", user);

      // Prepare the response
      const post = savedPost.toObject();
      post.author = {
        _id: user._id,
        username: user.username,
        postCount: user.posts.length,
      };

      res.status(200).json({ msg: "New post added successfully", post });
    } catch (err) {
      console.error("Error while adding new post:", err);
      res.status(400).json({ msg: "Failed to add a new post", err });
    }
  }
);

// Update a post
postController.post(
  "/update",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const updatedPost = await Post.findByIdAndUpdate(req.body.id, req.body, {
        useFindAndModify: false,
        new: true,
      });
      res.status(200).json({ msg: "Post Updated", post: updatedPost });
    } catch (err) {
      res.status(400).json({ msg: "Failed to update post", err });
    }
  }
);

// Delete a post
postController.post(
  "/delete",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const deletedPost = await Post.findByIdAndDelete(req.body.id);
      await User.findByIdAndUpdate(
        deletedPost.author,
        { $pull: { posts: deletedPost._id } },
        { useFindAndModify: false }
      );
      await Topic.findByIdAndUpdate(
        deletedPost.topic,
        { $pull: { posts: deletedPost._id } },
        { useFindAndModify: false }
      );
      res.status(200).json({ msg: "Post has been deleted" });
    } catch (err) {
      res.status(400).json({ msg: "Failed to delete the post", err });
    }
  }
);

module.exports = postController;

// require("dotenv").config();
// const express = require("express");
// const passport = require("passport");
// const postController = express.Router();
// const Post = require("../models/Post");
// const User = require("../models/User");
// const Topic = require("../models/Topic");

// //below is to get single post data
// postController.get("/:id", (req, res) => {
//   const postId = req.params.id;
//   // Check if the ID is a valid MongoDB ObjectID
//   if (!mongoose.Types.ObjectId.isValid(postId)) {
//     return res.status(400).json({ msg: "Invalid post ID" });
//   }
//   //find the post by ID using mongoose in mongodb
//   Post.findById(postId)
//     .then((post) => {
//       if (!post) {
//         //if the post is not found, return a 404 status
//         return res.status(404).json({ msg: "Post not found" });
//       }
//       //if the post is found, send it back in the response
//       res.status(200).json({ post });
//     })
//     .catch((err) =>
//       //if theres an error, send 400 status with an error message
//       res.status(400).json({ msg: "Failed to get post data", err })
//     );
// });

// //below is to create a new post
// postController.post(
//   "/create",
//   passport.authenticate("jwt", { session: false }),
//   (req, res) => {
//     const { body, title, author, topic } = req.body;
//     const newPost = new Post({
//       body,
//       author,
//       title,
//     });

//     newPost
//       .save()
//       .then((savedPost) => {
//         const post = savedPost.toObject();

//         //updating the users post array
//         return User.findByIdAndUpdate(
//           author,
//           { $push: { posts: post.id } },
//           { useFindAndModify: false }
//         )
//           .lean()
//           .then(() => {
//             //update topics post array
//             return Topic.findByIdAndUpdate(
//               topic,
//               { $push: { posts: post.id } },
//               { useFindAndModify: false }
//             );
//           })
//           .then(() => {
//             //get topic and post count for the author of the post
//             return User.findById(author)
//               .populate("topics", "_id")
//               .populate("posts", "_id");
//           })
//           .then((user) => {
//             post.author = {
//               _id: user._id,
//               username: user.username,
//               topicCount: user.topics.length,
//               postCount: user.posts.length,
//             };
//             return res.status(200).json({ post });
//           });
//       })
//       .catch((err) => res.json({ msg: "Failed to add a new post", err }));
//   }
// );
