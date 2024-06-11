//importing mongoose and Schema for mongoose
const mongoose = require("mongoose");
const { Schema } = mongoose;

//Creating new schema for Topic for mongoose to save Topic data
const topicSchema = new Schema({
  topic: {
    type: String,
    required: true,
    unique: true,
  },
});

//Model for Users and exporting to be used whereever needed
const Topic = mongoose.model("Topic", topicSchema);
module.exports = Topic;
