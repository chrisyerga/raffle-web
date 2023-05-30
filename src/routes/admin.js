const express = require("express");
require("dotenv").config();
const Registrant = require("../model/registrant");
const authUtils = require("../auth/google/authutils");
const router = express.Router();

router.get(
  "/raffle/admin",
  authUtils.requireAuthenticatedUser,
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
