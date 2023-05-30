const express = require("express");
const Registrant = require("../model/registrant");
const authUtils = require("../auth/google/authutils");

const router = express.Router();

router.get(
  "/raffle/company/:name",
  authUtils.requireAuthenticatedUser,

  async (request, response, next) => {
    // Look up the requested id
    var entrant;

    try {
      orgName = decodeURI(request.params.name);
      const people = await Registrant.find({
        organization: { $regex: orgName, $options: "i" },
      });
      console.log(`people: ${JSON.stringify(people)}`.blue);
      response.render("company", {
        title: "Drawing Results",
        people: people,
        page: request.path,
      });
    } catch (err) {
      console.log(err);
    }
  }
);

router.get(
  "/raffle/email-registered/:email",
  authUtils.requireAuthenticatedUser,
  async (request, response, next) => {
    const exists = await Registrant.exists({ email: request.params.email });
    const result = { exists: exists };
    response.json(result);
  }
);

module.exports = router;
