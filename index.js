//Import required modules
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
const port = process.env.PORT || "1000";
const passport = require("passport");
const controllers = require("./controllers");

//Set up for easier form data parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Dotenv and cors setup
dotenv.config();
app.use(cors());

//Initialize passport config