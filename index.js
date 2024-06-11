//Import required modules
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 1000;
const passport = require("passport");
const mongoose = require("mongoose");
// const controllers = require("./controllers");

//Set up for easier form data parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Dotenv and cors setup
dotenv.config();
app.use(cors());

//Initialize passport config
app.use(passport.initialize());

//Mongoose DB connection
const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    // Exit the process with failure
    process.exit(1);
  }
};

//Server listening only after db connection
dbConnection().then(() => {
  app.listen(port, () => {
    console.log(`HumberOverFlow server running on http://localhost:${port}`);
  });
});
