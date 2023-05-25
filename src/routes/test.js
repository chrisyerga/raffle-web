const express = require("express");

const router = express.Router();

router.get("/test", async (request, response, next) => {
  //! read shit from mongo
  //const chores = await Chore.find();
  //  response.send("Hello <b>World!</b>");
  response.render("test", {
    title: "Test Page",
    message: "Hello there!",
    page: request.path,
  });
});

module.exports = router;
