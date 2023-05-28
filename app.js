"use strict";

// * .env first
require("dotenv").config();

// * node.js core
const http = require("http");
const fs = require("fs");
const path = require("path");

// * 3rd party modules
require("colors");
const express = require("express");
const winston = require("winston");
const expressWinston = require("express-winston");

// * Globals
const app = express();
const server = http.createServer(app);
const port = 5662;

// * Turn off all caching in dev mode
if (!process.env.NODE_ENV) {
  // Node defaults to dev if nothing set
  process.env.NODE_ENV = "development";
}
if (process.env.NODE_ENV === "development") {
  console.log("   Running in development mode   ".bgRed.black);
  console.log("     - All caching disabled   ".grey);
  console.log("     - Using dev log settings   ".grey);
  console.log(`     - Listening on port ${port}`);

  const nocache = require("nocache");
  app.use(nocache());
}

// * HTTP request logging
app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
    meta: false, // optional: control whether you want to log the meta data about the request (default to true)
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
  })
);

// * Static File Serving
app.use(express.static("public"));

// * Form POST parsing
var bodyParser = require("body-parser");
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

// * Morgan request logger. Use the "combined" format which logs
// * IP address, UserAgent, etc.
var logger = require("morgan");
app.use(logger("combined"));

// Log to file also, if configured in .env
if (process.env.LOG_FILE_PATH) {
  let logStream = fs.createWriteStream(`${process.env.LOG_FILE_PATH}`, {
    flags: "a",
  });
  app.use(
    logger("combined", {
      stream: logStream,
    })
  );
}

// Session manager using mongo for storage
const session = require("express-session");
if (!process.env.SESSION_COOKIE_SECRET) {
  console.error(
    "SESSION_COOKIE_SECRET not set. Auth and cookies will not work".bgRed.black
  );
}
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_COOKIE_SECRET,
  })
);

// Google OAUTH
const auth = require("./src/auth/google/auth");
app.use(auth);
const passport = require("passport");
var GoogleStrategy = require("passport-google-oauth2").Strategy;
console.log("[AUTH] Creatning passport Google strategy");
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://beta.the-differents.com:5662/auth/google/redirect",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      console.log("[AUTH] called strategy callback in app.js");
	   console.log("GoogleID = " + profile.id);
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return done(err, user);
      });
    }
  )
);
// * route "/" to "/today"
app.use((req, res, next) => {
  if (req.path === "/") {
    res.redirect(301, "/today");
  } else {
    next();
  }
});

// * Remove trailing slashes in URLs
app.use((req, res, next) => {
  if (req.path.length > 1 && req.path.slice(-1) === "/") {
    const query = req.url.slice(req.path.length);
    res.redirect(301, req.path.slice(0, -1) + query);
  } else {
    next();
  }
});

// * Template Engine
app.set("view engine", "ejs");

// * DB Connection
const db = require("./src/util/mongodb");
db.connect(process.env.MONGODB_DB_NAME);

// * App Routes
app.use(require("./src/routes/create"));
app.use(require("./src/routes/register"));
app.use(require("./src/routes/test")); //! Only in development mode?
app.use(require("./src/routes/admin"));
app.use(require("./src/routes/company"));

// Unhandled routes return 404
app.all("*", (req, res) => {
	console.log("404 for path " + req.path);
  res.status(404).sendfile("./public/html/404.html", null);
  //res.status(404).send("<h1>404! Page not found</h1>");
});

// * Set up test data if needed
if (process.env.NODE_ENV === "development") {
  console.log("\n\n   Populating DB with sample data\n   ".bgGreen.black);

  const Registrant = require("./src/model/registrant");
  Registrant.populateSampleData();
}

// * Start the server
server.listen(port);
