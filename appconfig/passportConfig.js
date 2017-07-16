/**
 * passportConfig.js - Contains and exports all Passport.JS-related configuration data
 */
// Load and set LocalStrategy
const LocalStrategy = require("passport-local").Strategy;
// Load and set the user data model
const User = require("../models/user"); // TODO rename this UserSchema
//Load and set dbConfig
//const dbConfig = require("./appconfig/databaseConfig"); // TODO Remove this; not needed here
// Load and set bcrypt
const bcrypt = require("bcryptjs");

module.exports = function(passport) {
    // Perform authentication using LocalStrategy
    passport.use(new LocalStrategy({
            usernameField: "userId", 
            passwordField: "passwd"
        }, 
        function(username, password, done) {
            // Check for userId validity
            let dbQueryUserId = {"userId":username};
            User.findOne(dbQueryUserId, function(err, user) {
                if(err) {
                    return done(err); // Alternatively, throw err or console.log(err)
                }
                if(!user) {
                    return done(null, false, {"message": "Invalid User ID"});
                }
                // Check for password validity
                bcrypt.compare(password, user.passwd, function(err, isMatch) {
                    if(err) {
                        return done(err); // Alternatively, throw err or console.log(err)
                    } 
                    if(!isMatch) {
                        return done(null, false, {"message": "Invalid Password"});
                    } else {
                        return done(null, user);
                    }
                });
            });
    }));
    
    // Serializes (i.e. writes-out) the authenticated user object to the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // Deserializes ((i.e. reads-in)) the authenticated user object from the session
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });        
}
