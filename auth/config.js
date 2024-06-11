require("dotenv").config();
const { Strategy, ExtractJwt } = require("passport-jwt");
const User = require("../models/User");

//Setting jwt secret and getting the jwt from the header as a bearer token
const secret = process.env.JWT_SECRET;
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secret,
};

// Define the Passport strategy for handling JWT authentication
module.exports = (passport) => {
  passport.use(
    new Strategy(options, (payload, done) => {
      User.findById(payload.id)
        .then((user) => {
          if (user) {
            return done(null, {
              id: user.id,
              username: user.username,
              email: user.email,
            });
          } else {
            done(null, false);
          }
        })
        .catch((err) => console.log(err));
    })
  );
};
