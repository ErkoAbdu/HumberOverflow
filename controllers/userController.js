require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const secret = process.env.JWT_SECRET;
const User = require("../models/User");
const userController = express.Router();

// Retrieve all users
userController.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ msg: "Failed to retrieve users", err });
  }
});

// Retrieve a single user
userController.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(400).json({ msg: "Failed to retrieve user", err });
  }
});

// Register a user
userController.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email in use" });
    }
    const newUser = new User({ username, email, password });
    const salt = await bcrypt.genSalt(6);
    const hash = await bcrypt.hash(newUser.password, salt);
    newUser.password = hash;
    const user = await newUser.save();
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ msg: "Error registering user", error: err });
  }
});

// Log in a user
userController.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ msg: "This user doesn't exist" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const payload = { id: user._id, username: user.username };
      jwt.sign(payload, secret, { expiresIn: "1d" }, (err, token) => {
        if (err) {
          return res.status(500).json({ msg: "Error with token", err });
        }
        res.status(200).json({
          success: true,
          token,
          user: { id: user._id, username: user.username, email: user.email },
        });
      });
    } else {
      res.status(400).json({ msg: "Password is incorrect" });
    }
  } catch (err) {
    res.status(500).json({ msg: "Error logging in", error: err });
  }
});

module.exports = userController;

// require("dotenv").config();
// const express = require("express");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcryptjs");
// const secret = process.env.JWT_SECRET;
// // const passport = require("passport");
// const User = require("../models/User");
// const userController = express.Router();

// //below is to retrive all users
// userController.get("/", (req, res) => {
//   User.find()
//     .then((users) => {
//       res.status(200).json({ users });
//     })
//     .catch((err) => {
//       res.status(500).json({ msg: "Failed to retrieve users", err });
//     });
// });

// //below is to retrive a single user
// userController.get("/:id", (req, res) => {
//   User.findById(req.params.id)
//     .then((user) => {
//       if (!user) {
//         return res.status(404).json({ msg: "User not found" });
//       }
//       res.status(200).json({ user });
//     })
//     .catch((err) =>
//       res.status(400).json({ msg: "Failed to retrieve user", err })
//     );
// });

// //below is to register a user
// userController.post("/register", (req, res) => {
//   const { username, email, password } = req.body;
//   //check if user already exists
//   User.findOne({ email })
//     .then((user) => {
//       if (user) {
//         return res.status(400).json({ msg: "Email in use" });
//       } else {
//         //creating new user object if user does not exist
//         const newUser = new User({
//           username,
//           email,
//           password,
//         });
//         //generating salt and hashing password of newly created user
//         bcrypt.genSalt(6, (generateError, salt) => {
//           if (generateError) throw generateError;
//           bcrypt.hash(newUser.password, salt, (hashError, hash) => {
//             if (hashError) throw hashError;
//             //replacing password string with hased password
//             newUser.password = hash;
//             //saving user to mongodb
//             newUser
//               .save()
//               .then((user) => res.status(200).json({ user }))
//               .catch((err) =>
//                 res.status(400).json({ msg: "Failed to register user", err })
//               );
//           });
//         });
//       }
//     })
//     .catch((err) =>
//       res
//         .status(500)
//         .json({ msg: "Error checking for existing user", error: err })
//     );
// });

// //below is to log a user in
// userController.post("/login", (req, res) => {
//   const { email, password } = req.body;
//   //find user in database including password
//   User.findOne({ email }, "+password").then((user) => {
//     if (!user) {
//       return res.status(404).json({ msg: "This user doesnt exist" });
//     }
//     //compare password to stored hashed password
//     bcrypt.compare(password, user.password).then((isMatch) => {
//       if (isMatch) {
//         const payload = {
//           id: user._id,
//           username: user.username,
//         };
//         //sign jwt with payload, secret, and expiration
//         jwt.sign(payload, secret, { expiresIn: "1d" }, (err, token) => {
//           if (err) {
//             res.status(500).json({ msg: "Error with token", err });
//           }
//           //return success response with token and user info
//           res.status(200).json({
//             success: true,
//             token,
//             user: {
//               id: user._id,
//               username: user.username,
//               email: user.email,
//             },
//           });
//         });
//       } else {
//         res.status(400).json({ msg: "Password is incorrect" });
//       }
//     });
//   });
// });

// module.exports = userController;
