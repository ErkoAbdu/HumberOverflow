require("dotenv").config();
const express = require("express");
const passport = require("passport");
const Post = require("../models/Post");
const User = require("../models/User");
const Topic = require("../models/Topic");
const postController = express.Router();

// Below is to get single post data
postController.get("/:id", async (req, res) => {
  const postId = req.params.id;
  // Check if the ID is a valid MongoDB ObjectID
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ msg: "Invalid post ID" });
  }

  try {
    // Find the post by ID using mongoose in MongoDB
    const post = await Post.findById(postId);
    if (!post) {
      // If the post is not found, return a 404 status
      return res.status(404).json({ msg: "Post not found" });
    }
    // If the post is found, send it back in the response
    res.status(200).json({ post });
  } catch (err) {
    // If there's an error, send 400 status with an error message
    res.status(400).json({ msg: "Failed to get post data", err });
  }
});

// Below is to create a new post
postController.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { body, title, author, topic } = req.body;

    //ensures all fields are added otherwise an error message appears
    if (!body || !title || !author || !topic) {
      return res
        .status(400)
        .json({ msg: "Please provide all required fields" });
    }
    const newPost = new Post({
      body,
      author,
      title,
    });

    try {
      // Save the new post
      const savedPost = await newPost.save();
      const post = savedPost.toObject();

      // Update the user's post array
      await User.findByIdAndUpdate(
        author,
        { $push: { posts: post.id } },
        { useFindAndModify: false }
      );

      // Update topics post array
      await Topic.findByIdAndUpdate(
        topic,
        { $push: { posts: post.id } },
        { useFindAndModify: false }
      );

      // Get topic and post count for the author of the post
      const user = await User.findById(author)
        .populate("topics", "_id")
        .populate("posts", "_id");

      // Add author data to the post
      post.author = {
        _id: user._id,
        username: user.username,
        topicCount: user.topics.length,
        postCount: user.posts.length,
      };

      // Return the created post along with user data
      res.status(200).json({ post });
    } catch (err) {
      // If there's an error, send a response with the error message
      res.json({ msg: "Failed to add a new post", err });
    }
  }
);

//below is to update a post
postController.post(
  "/update",
  //authenticate using JWT with session set to false
  passport.authenticate("jwt", { session: false }),
  //async function to handle the update request
  async (req, res) => {
    try {
      //await the update operation for the post
      const updatedPost = await Post.findByIdAndUpdate(req.body.id, req.body, {
        useFindAndModify: false,
      });
      //send success response with updated post
      res.status(200).json({ msg: "Post Updated", post: updatedPost });
    } catch (err) {
      //catch any errors and send error response
      res.status(400).json({ msg: "Failed to update post", err });
    }
  }
);

//below deletes a post
postController.post(
  "/delete",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const deletedPost = await Post.findByIdAndDelete(req.body.id);
      //remove the post ID from the author's posts array
      await User.findByIdAndUpdate(
        deletedPost.author,
        { $pull: { posts: deletedPost._id } },
        { useFindAndModify: false }
      );
      //remove the post ID from the topic's posts array
      await Topic.findByIdAndUpdate(
        deletedPost.author,
        { $pull: { posts: deletedPost._id } },
        { useFindAndModify: false }
      );
      //send success msg
      res.status(200).json({ msg: "Post has been deleted" });
    } catch (err) {
      //catch any errors and send error response
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
