const express = require("express");
const Chore = require("../model/registrant");
const Registrant = require("../model/registrant");

const router = express.Router();

router.get("/register", async (request, response, next) => {
  //! read shit from mongo
  //const chores = await Chore.find();
  //  response.send("Hello <b>World!</b>");
  response.render("register", {
    title: "Test Page",
    message: "Hello there!",
    page: request.path,
  });
});

router.post("/register", async (request, response, next) => {
  var body = request.body;
  registration = new Registrant({
    name: body.name,
    email: body.email,
    role: body.title,
    organization: body.company,
    phone: body.phone,
  });
  await registration.save();
  response.redirect("registration-complete");
});

router.get("/registration-complete", async (request, response, next) => {
  //! read shit from mongo
  //const chores = await Chore.find();
  //  response.send("Hello <b>World!</b>");
  response.render("registration-complete", {
    title: "Test Page",
    message: "Hello there!",
    page: request.path,
  });
});

router.get("/drawing", async (request, response, next) => {
  // Retrieve all the raffle entrants. Don't cache it at all
  const entrants = await Registrant.find();
  const names = entrants.map((entry) => entry.name);

  response.render("drawing", {
    title: "Drawing Results",
    names: names,
    page: request.path,
  });
});
module.exports = router;
