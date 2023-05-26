const express = require("express");
const Chore = require("../model/registrant");

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
  //! grab form and add to DB
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
  //! read shit from mongo
  //const chores = await Chore.find();
  //  response.send("Hello <b>World!</b>");
  response.render("drawing", {
    title: "Test Page",
    message: "Hello there!",
    page: request.path,
  });
});
module.exports = router;
