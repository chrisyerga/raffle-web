"use strict";

// * .env first
require("dotenv").config();

// * node.js core
const http = require("http");

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

// Unhandled routes return 404
app.all("*", (req, res) => {
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
