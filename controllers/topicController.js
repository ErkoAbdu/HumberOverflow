require("dotenv").config();
const express = require("express");
const passport = require("passport");
const Topic = require("../models/Topic");

const topicController = express.Router();

// Predefined topics
const predefinedTopics = [
  { topic: "HTML, CSS, JavaScript" },
  { topic: "MERN" },
  { topic: "C#, ASP.NET" },
];

// Endpoint to create predefined topics (run once to initialize the topics)
topicController.post("/initialize", async (req, res) => {
  try {
    await Topic.insertMany(predefinedTopics, { ordered: false });
    res.status(200).json({ msg: "Predefined topics initialized" });
  } catch (err) {
    res.status(400).json({ msg: "Failed to initialize topics", err });
  }
});

// Get all topics (Public endpoint)
topicController.get("/", async (req, res) => {
  try {
    const topics = await Topic.find();
    res.status(200).json(topics);
  } catch (err) {
    res.status(400).json({ msg: "Failed to get topics", err });
  }
});

// Create a new topic (Private endpoint)
topicController.post(
  "/add",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { name } = req.body;

    // Ensure the topic name is provided
    if (!name) {
      return res.status(400).json({ msg: "Please provide a topic name" });
    }

    try {
      // Check if the topic already exists
      const topicExists = await Topic.findOne({ name });
      if (topicExists) {
        return res.status(400).json({ msg: "Topic already exists" });
      }

      // Create and save the new topic
      const newTopic = new Topic({ name });
      const savedTopic = await newTopic.save();

      res
        .status(200)
        .json({ msg: "Topic created successfully", topic: savedTopic });
    } catch (err) {
      res.status(400).json({ msg: "Failed to create topic", err });
    }
  }
);

// Update a topic (Private endpoint)
topicController.post(
  "/update",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { id, name } = req.body;

    // Ensure the topic ID and new name are provided
    if (!id || !name) {
      return res
        .status(400)
        .json({ msg: "Please provide a topic ID and new name" });
    }

    try {
      // Find and update the topic
      const updatedTopic = await Topic.findByIdAndUpdate(
        id,
        { name },
        { new: true, useFindAndModify: false }
      );
      if (!updatedTopic) {
        return res.status(404).json({ msg: "Topic not found" });
      }

      res
        .status(200)
        .json({ msg: "Topic updated successfully", topic: updatedTopic });
    } catch (err) {
      res.status(400).json({ msg: "Failed to update topic", err });
    }
  }
);

// Delete a topic (Private endpoint)
topicController.post(
  "/delete",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { id } = req.body;

    // Ensure the topic ID is provided
    if (!id) {
      return res.status(400).json({ msg: "Please provide a topic ID" });
    }

    try {
      // Find and delete the topic
      const deletedTopic = await Topic.findByIdAndDelete(id);
      if (!deletedTopic) {
        return res.status(404).json({ msg: "Topic not found" });
      }

      res.status(200).json({ msg: "Topic deleted successfully" });
    } catch (err) {
      res.status(400).json({ msg: "Failed to delete topic", err });
    }
  }
);

module.exports = topicController;
