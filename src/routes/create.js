const express = require("express");

const router = express.Router();

router.get("/create", async (request, response, next) => {
  const chores = await Chore.find();
  response.write("create");
  // response.render("chores", {
  //   title: "Chore Board",
  //   message: "Hello there!",
  //   chores: chores,
  //   page: request.path,
  // });
});

module.exports = router;
