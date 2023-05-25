const express = require("express");
const Chore = require("../model/registrant");

const router = express.Router();

router.get("/register", async (request, response, next) => {
  // const chores = await Chore.find();
  // response.render("chores", {
  //   title: "Chore Board",
  //   message: "Hello there!",
  //   chores: chores,
  //   page: request.path,
  // });
});

module.exports = router;
