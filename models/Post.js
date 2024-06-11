//importing mongoose and Schema for mongoose
const mongoose = require("mongoose");
const { Schema } = mongoose;

//Creating new schema for Posts for mongoose to save Post data
const postSchema = new Schema({
  body: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  // topic: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Topic",
  // },
  timestamp: true,
});

//Model for Users and exporting to be used whereever needed
const Post = mongoose.model("Post", postSchema);
module.exports = Post;
