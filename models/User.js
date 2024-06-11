//importing mongoose and Schema for mongoose
const mongoose = require("mongoose");
const { Schema } = mongoose;

//Creating new schema for Users for mongoose to save registered user data
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 3,
  },
  password: {
    type: String,
    required: true,
    unique: true,
    select: false,
    minLength: 8,
  },
});

//Model for Users and exporting to be used whereever needed
const User = mongoose.model("User", userSchema);
module.exports = User;
