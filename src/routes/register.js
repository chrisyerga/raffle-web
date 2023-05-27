const express = require("express");
const Chore = require("../model/registrant");
const Registrant = require("../model/registrant");

const router = express.Router();

router.get("/raffle/register", async (request, response, next) => {
  response.render("register", {
    title: "Test Page",
    message: "Hello there!",
    page: request.path,
  });
});

router.post("/raffle/register", async (request, response, next) => {
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

router.get("/raffle/registration-complete", async (request, response, next) => {
  // !Must be a simpler way to count. Read the manual
  const entries = await Registrant.find();

  response.render("registration-complete", {
    title: "Test Page",
    message: "Hello there!",
    page: request.path,
    entryCount: entries.length,
  });
});

router.get("/raffle", async (request, response, next) => {
  // Redirect to registration page
  response.redirect("/raffle/register");
});

router.get("/raffle/drawing", async (request, response, next) => {
  // Retrieve all the raffle entrants. Don't cache it at all
  const entrants = await Registrant.find();
  const names = entrants.map((entry) => entry.name);

  response.render("drawing", {
    title: "Drawing Results",
    names: names,
    page: request.path,
  });
});

router.get(
  "/raffle/email-registered/:email",
  async (request, response, next) => {
    const exists = await Registrant.exists({ email: request.params.email });
    const result = { exists: exists };
    response.json(result);
  }
);

module.exports = router;
