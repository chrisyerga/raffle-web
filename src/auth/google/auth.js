const express = require("express");
const passport = require("passport");
const Registrant = require("../../model/registrant");

const router = express.Router();

//!==================
//!
//! Redirect from Google goes to http://beta.the-differents.com:5662/auth/google/redirect?code=4/0AbUR2VMMdg5gBhheiP8XRTp0a9bYvOxh2uXRs60lkO0tN9ROF0Sp3mRiW5gvYvQQanzFVA&scope=email%20profile%20https://www.googleapis.com/auth/userinfo.email%20https://www.googleapis.com/auth/userinfo.profile%20openid&authuser=0&hd=thediffs.org&prompt=consent
//!
//!==================

// http://beta.the-differents.com:5662/auth-redirect-google
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get("/auth/google/redirect", async (request, response, next) => {
  passport.authenticate("google", {
    successRedirect: "/auth/google/success",
    failureRedirect: "/auth/google/failure",
  });
});

router.get("/auth/google/success", async (request, response, next) => {
  console.log("[AUTH] routed to /auth/google/success".green);
  return next();
});

router.get("/auth/google/failure", async (request, response, next) => {
  console.log("[AUTH] routed to /auth/google/failure".red);
  return next();
});

module.exports = router;
