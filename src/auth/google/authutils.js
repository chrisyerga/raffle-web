const express = require("express");
const passport = require("passport");
require("dotenv").config();

const router = express.Router();

module.exports = {
  requireAuthenticatedUser: (req, res, next) => {
    //* For local development, OAUTH doesn't work so just allow it
    if (process.env.FAKE_GOOGLE_AUTH && process.env.FAKE_GOOGLE_AUTH.length) {
      console.log("  SKIPPING AUTH CHECK   ".bgRed.black);
      return next();
    }

    // Otherwise check if we need to have them login. If so, stash away
    // the requested path for a later redirect
    if (req.user) {
      console.log("   auth barrier -- have user already!   ".bgGreen.black);
      console.log(`   USER=${req.user.name}   `.bgGreen.black);
      return next();
    }
    req.session.postAuthRedirect = req.path;
    console.log(
      "   jump to auth. will redirect to: " + req.session.postAuthRedirect
    );

    // Just shoot them right to google login
    res.redirect("/auth/google");
  },
};
