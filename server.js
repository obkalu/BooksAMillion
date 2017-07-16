/**
 * server.js - Main entry point to the application
 */
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const connectFlash = require("connect-flash");
const expressValidator = require("express-validator");
const dbConfig = require("./appconfig/databaseConfig");
const passport = require("passport");

// Setup Database connection options for Mongoose
const dbConnectionOptions = {
    useMongoClient: true,
    authSource: "admin" 
}

// Enable use of native promise
mongoose.Promise = global.Promise;

// Connect to MongoDB database, using imported dbConnectionString from externalized databaseConfig
mongoose.connect(dbConfig.dbConnectionString, dbConnectionOptions);
let db = mongoose.connection;

// Handle DB connection success
db.once("open", function() {
    console.log("Connection to BooksDB database on MongoDB server instance was successful");
    console.log("Ready...\nTo access the application, go to http://localhost:3000");
});

// Handle DB connection error condition
db.on("error", function(err) {
    console.log(err);
});

// Set the app server port number
const PORT_NUMBER = 3000;

// Initialize the Express app
const app = express();

// Load the View Engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Setup Body-Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse body content data to application/json format
app.use(bodyParser.json());

// Set public folder as source for all static content e.g. scripts, stylesheets etc.
app.use(express.static(path.join(__dirname, "public")));

// Express Validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Setup ExpressJS Messages middleware
app.use(connectFlash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Setup ExpressJS Session middleware
app.use(session({
  secret: 'wireless typhoon',
  resave: true,
  saveUninitialized: true
}));

// Setup the required middleware for Passport, to load the passportConfig, 
// initialize the passport authentication framework and its session management
require("./appconfig/passportConfig")(passport);
app.use(passport.initialize());
app.use(passport.session());

/**
 * Set authenticated user object onto response locals, if exist.
 * This is needed to enable dynamic menu options depending on the User authentication status.
 */
app.get("*", function(req, res, next) {
    res.locals.user = req.user || null;
    next();
});

/**
 * Creates a route for the Homepage URL
 */
app.get("/", function (request, response) {
    response.render("index", {"page_title":"Welcome"} );
});

// Define the books-api-routes
let bookAPIRoutes = require("./api-routes/books-api-routes");
app.use("/book", bookAPIRoutes);

// Define the users-api-routes
let userAPIRoutes = require("./api-routes/users-api-routes");
app.use("/user", userAPIRoutes);

// Startup the app server and make it listen on the port number assigned
app.listen(PORT_NUMBER, function() {
    console.log(`AppServer for Books-a-Million started successfully. Running on port: ${PORT_NUMBER}`);
});
