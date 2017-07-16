/**
 * users-api-routes.js - All routes constituting the users api are defined here 
 */
const bcrypt = require("bcryptjs");
const express = require("express");
const passport = require("passport");
const router = express.Router();

// Load the user data model
const User = require("../models/user");

// Creates a route to handle HttpGet request for displaying the Register new User form
router.get("/register", function(request, response) {
    response.render("register-user", {"page_title":"Register as a new member"});
});

// Creates a route to handle HttpPost request for registering a new User
router.post("/register", function(request, response) {
    // Read the submitted form data
    const fullname = request.body.fullname;
    const email = request.body.email;
    const userId = request.body.userId;
    const passwd = request.body.passwd;
    // const confPasswd = request.body.confPasswd; // TODO Remove this; not needed
    const userRole = request.body.userRole;
    // Perform data validation
    request.checkBody("fullname", "Full Name is required").notEmpty();
    request.checkBody("email", "Email is required").notEmpty();
    request.checkBody("email", "Email is not a valid email format").isEmail();
    request.checkBody("userId", "User Id is required").notEmpty();
    request.checkBody("passwd", "Password is required").notEmpty();
    request.checkBody("confPasswd", "Confirm Password does not match with Password").equals(passwd);

    let validationErrors = request.validationErrors();
    if(validationErrors) {
        response.render("register-user", {
            "validationErrors":validationErrors
        });
    } else {
        let newUser = new User({
            "fullname": fullname,
            "email": email,
            "userId": userId,
            "passwd": passwd,
            "userRole": userRole
        });
        bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(newUser.passwd, salt, function(err, hash) {
                if(err) {
                    console.log(err);
                }
                newUser.passwd = hash;
                newUser.save(function(err) {
                    if(err) {
                        console.log(err);
                        return;
                    } else {
                        request.flash("success", "User is registered successfully!");
                        response.redirect("/user/register");
                    }
                });
            });
        });
    }
});

/**
 * Creates a route to handle HttpGet request for displaying the UserLogin form
 */
router.get("/login", function(request, response) {
    response.render("login-user", {"page_title":"Sign In"});
});

/**
 * Creates a route to handle HttpPost request for authenticating and signing-in 
 * a user, taking credentials posted/received from the UserLogin form
 */
router.post("/login", function(request, response, next) {
    passport.authenticate("local", {
        "successRedirect": "/book/browse",
        "failureRedirect": "/user/login",
        "failureFlash": true
    })(request, response, next);
});

/**
 * Creates a route to handle User Logout
 */
router.get("/logout", function(request, response) {
    request.logout();
    request.flash("success", "You have been signed-out");
    response.redirect("/user/login");
});

module.exports = router;
