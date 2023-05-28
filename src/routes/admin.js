const express = require("express");
require("dotenv").config();
const Registrant = require("../model/registrant");

const router = express.Router();

const requireAuthenticatedUser = (req, res, next) => {
  //* For local development, OAUTH doesn't work so just allow it
  if (process.env.FAKE_GOOGLE_AUTH) {
    console.log("  SKIPPING AUTH CHECK   ".bgRed.black);
    next();
  }

  // Otherwise check if we need to have them login. If so, stash away
  // the requested path for a later redirect
  if (req.user) {
    next();
  }
  req.session.postAuthRedirect = req.path;

  //! I think this does what we want
  response.redirect("/auth/google");
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
