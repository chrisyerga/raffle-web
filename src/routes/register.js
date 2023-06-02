const express = require("express");
const Chore = require("../model/registrant");
const Registrant = require("../model/registrant");
const authUtils = require("../auth/google/authutils");
const Drawing = require("../model/drawing");
require("dotenv").config();

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
    name: body.firstName + " " + body.lastName,
    email: body.email,
    role: body.title,
    organization: body.company,
    phone: body.phone,
    entryCount: body.followSocials ? 2 : 1,
  });
  try {
    await registration.save();
    response.redirect("registration-complete");
  } catch (err) {
    console.log("Error adding new registrant: " + err.message);
  }
});

router.post("/raffle/details/:id", async (request, response, next) => {
  var body = request.body;
  const entrant = await Registrant.findById(request.params.id);
  console.log(`Editing notes for: ${JSON.stringify(entrant)}`.blue);
  entrant.notes = body.notes;
  await entrant.save();
  response.redirect(
    `/raffle/details/${request.params.id}?toastMessage=${body.toastMessage}`
  );
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

router.get(
  "/raffle/admin/drawing",
  authUtils.requireAuthenticatedUser,
  async (request, response, next) => {
    // Retrieve all the raffle entrants. Don't cache it at all
    const entrants = await Registrant.find();
    const names = entrants.map((entry) => entry.name);

    response.render("drawingNew", {
      title: "Drawing Results",
      names: names,
      page: request.path,
      authedUser: request.user,
    });
  }
);

router.post(
  "/raffle/admin/drawing",
  authUtils.requireAuthenticatedUser,
  async (request, response, next) => {
    var body = request.body;
    const drawing = new Drawing({
      name: body.name,
      itemName: body.name,
      itemImage: body.image,
      decription: body.description,
      date:
        new Date().toLocaleDateString() +
        ", " +
        new Date().toLocaleTimeString(),
      complete: "",
    });
    await drawing.save();
    response.redirect("../drawing");
  }
);

router.get("/raffle/drawing", async (request, response, next) => {
  // Retrieve all the raffle entrants. Don't cache it at all
  const entrants = await Registrant.find();
  const names = entrants.map((entry) => entry.name);
  const drawings = await Drawing.find();

  response.render("drawingList", {
    title: "Drawing Results",
    names: names,
    page: request.path,
    drawings: drawings,
    authedUser: request.user,
  });
});

router.get("/raffle/drawing/:id", async (request, response, next) => {
  const drawing = await Drawing.findById(request.params.id);
  const entries = await Registrant.find();
  const entrants = await Registrant.find();
  const names = entrants.map((entry) => entry.name);

  const eligible = entrants.filter((entry) => entry.winner != "true");
  var eligibleNames = eligible.map((entry) => entry.name);
  const bonusEntries = [];
  eligible.forEach((entry) => {
    if (entry.entryCount > 1) {
      bonusEntries.push(entry.name + " (Bonus)");
    }
  });
  eligibleNames = eligibleNames.concat(bonusEntries);
  console.log(
    `Entries=${entries.length}, Bonus=${bonusEntries.length}, Eligible=${eligibleNames.length}`
  );

  // Randomly shuffle the names so all the (bonus) entries aren't batched up
  for (index = 0; index < eligibleNames.length; ++index) {
    const randomIndex = Math.floor(Math.random() * eligibleNames.length);
    const tempName = eligibleNames[index];
    eligibleNames[index] = eligibleNames[randomIndex];
    eligibleNames[randomIndex] = tempName;
  }

  if (drawing.complete != "true") {
    drawing.complete = "true";

    const winnerIndex =
      (Math.random() * eligibleNames.length) % eligibleNames.length;
    const winner = eligibleNames[Math.floor(winnerIndex)];

    drawing.winner = winner;

    await drawing.save();
  }

  response.render("drawing", {
    title: "Drawing Results",
    drawing: drawing,
    entries: entries,
    page: request.path,
    names: eligibleNames,
  });
});

//! GET /raffle/details/undefined HTTP/1.1
//!
//! HOW DIS BBUG?
router.get("/raffle/details/:id", async (request, response, next) => {
  // Look up the requested id
  var entrant;

  try {
    if (request.params.id === "undefined") {
      console.log("Got an undefined detail view".bgBlue.black);
      console.log(request.originalUrl);
    }
    // const entrants = await Registrant.find();
    // const names = entrants.map((entry) => entry.name);
    // const drawings = await Drawing.find();
    const entrant = await Registrant.findById(request.params.id);
    console.log(`Entrant: ${JSON.stringify(entrant)}`.blue);
    response.render("entry-details", {
      title: "Drawing Results",
      entrant: entrant,
      page: request.path,
      id: request.params.id,
      apikey: process.env.BRANDFETCH_API_KEY,
      toastMessage: request.query.toastMessage,
    });
  } catch (err) {
    console.log(err);
    console.log("While attempting to get details on ID=" + request.params.id);
  }
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
