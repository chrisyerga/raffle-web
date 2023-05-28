const express = require("express");
const passport = require("passport");
const Registrant = require("../../model/registrant");

const router = express.Router();

// Start federated auth process
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

// Callback from google auth
router.get(
  "/auth/google/redirect",
  passport.authenticate("google", {
    successRedirect: "/auth/google/success",
    failureRedirect: "/auth/google/failure",
  }),
  function (req, res, xxx) {
    console.log(
      "[AUTH] inside passport.authenticate callback. Never seen this before"
        .bgMagenta
    );
    res.redirect("/profile");
  }
);

router.get("/auth/google/success", async (request, response, next) => {
  console.log("[AUTH] routed to /auth/google/success".green);
  console.log("   *** USER=" + JSON.stringify(request.user));
  response.redirect(request.session.postAuthRedirect);
  //  response.send("SUCCESS auth");
  //  return next();
});

router.get("/auth/google/failure", async (request, response, next) => {
  console.log("[AUTH] routed to /auth/google/failure".red);
  response.send("ERROR auth");
  //  return next();
});

module.exports = router;
