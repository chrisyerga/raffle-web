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

// * MongoDB schema/models
const User = require("./src/model/user");
const Registrant = require("./src/model/registrant");

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
    //! Defaults to in-memory session storage which leaks and isn't persistent
    //! Use either Mongo or Redis
  })
);

// Google OAUTH support
const passport = require("passport");
app.use(passport.initialize());
app.use(passport.session());
var GoogleStrategy = require("passport-google-oauth2").Strategy;
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://beta.the-differents.com:5662/auth/google/redirect",
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      const existing = await User.findOne({ googleId: profile.id });

      if (existing) {
        return done(null, existing);
      } else {
        const newUser = new User({
          googleId: profile.id,
          name: profile.given_name,
          email: profile.email,
          photo: profile.picture,
        });
        await newUser.save();
        return done(null, newUser);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  console.log(JSON.stringify(user));
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      console.log("DB lookup of user failed with err=" + err);
      done(err, null);
    });
});

// Debug dump user on every request
app.use((req, res, next) => {
  if (req.isAuthenticated) {
    console.log(
      req.isAuthenticated()
        ? "   AUTHENTICATED   ".bgBlue.black
        : "   NOT AUTHED   ".bgMagenta.black
    );
  }

  next();
});

const requireAuthenticatedUser = (req, res, next) => {
  //* For local development, OAUTH doesn't work so just allow it
  if (process.env.FAKE_GOOGLE_AUTH) {
    console.log("  SKIPPING AUTH CHECK   ".bgRed.black);
    next();
  }

  // Otherwise check if we need to have them login. If so, stash away
  // the requested path for a later redirect
  if (req.user) {
    consolr.log("   auth protected and we have user  ".bgGreen.black);
    next();
  }
  req.session.postAuthRedirect = req.path;
  console.log("   need auth - redirect to " + req.session.postAuthRedirect);

  //! I think this does what we want
  response.redirect("/auth/google");
  // response.render("login-required", {
  //   title: "Please Login",
  //   page: request.path,
  // });
};

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
app.use(require("./src/routes/register"));
app.use(require("./src/routes/test")); //! Only in development mode?
app.use(require("./src/routes/admin"));
app.use(require("./src/routes/company"));
const auth = require("./src/auth/google/auth");
app.use(auth);

// Unhandled routes return 404
app.all("*", (req, res) => {
  console.log("404 for path " + req.path);
  res.status(404).sendfile("./public/html/404.html", null);
  //res.status(404).send("<h1>404! Page not found</h1>");
});

// * Set up test data if needed
if (process.env.NODE_ENV === "development") {
  console.log("\n\n   Populating DB with sample data\n   ".bgGreen.black);
  Registrant.populateSampleData();
}

// * Start the server
server.listen(port);
