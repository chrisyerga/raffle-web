const express = require("express");
require("dotenv").config();
const Registrant = require("../model/registrant");

const router = express.Router();

const requireAuthenticatedUser = (req, res, next) => {
  //* For local development, OAUTH doesn't work so just allow it
  if (process.env.FAKE_GOOGLE_AUTH.length) {
    console.log("  SKIPPING AUTH CHECK   ".bgRed.black);
    return next();
  }

  // Otherwise check if we need to have them login. If so, stash away
  // the requested path for a later redirect
  if (req.user) {
    console.log("   auth barrier -- have user already!   ".bgGreen.black);
    return next();
  }
  req.session.postAuthRedirect = req.path;
  console.log(
    "   jump to auth. will redirect to: " + req.session.postAuthRedirect
  );

  //! I think this does what we want
  res.redirect("/auth/google");
  // response.render("login-required", {
  //   title: "Please Login",
  //   page: request.path,
  // });
};

router.get(
  "/raffle/admin",
  requireAuthenticatedUser,
  async (request, response, next) => {
    // Retrieve all the raffle entrants. Don't cache it at all
    const entries = await Registrant.find();

    response.render("raffle-admin", {
      title: "Raffle Admin Console",
      entries: entries,
      page: request.path,
    });
  }
);

module.exports = router;
