/**
 * books-api-routes.js - All routes constituting the books api are defined here 
 */
const express = require("express");
const router = express.Router();
const moment = require("moment");

// Load the Book data model
let Books = require("../models/book");

/**
 * Creates a route to present/display books collection list
 */
router.get("/browse", function(request, response) {
    Books.find({}, function (err, books) {
        if(err) {
            console.log(err);
        } else {
            response.render("books-collection-list", {"page_title":"Books", "books":books} );
        }
    });
});

// Creates a route to handle HttpGet request for displaying the Add New Book form
router.get("/add", checkIfUserIsAuthenticated, function(request, response) {
    response.render("add-book", {"page_title":"Add a New Book"});
});

/**
 * Creates a route to handle HttpPost request for adding a new Book
 */
router.post("/add", checkIfUserIsAuthenticated, function(request, response) {
    // Perform data validation
    request.checkBody("title", "Title is required").notEmpty();
    request.checkBody("author", "Author is required").notEmpty();
    request.checkBody("content", "Content summary is required").notEmpty();
    request.checkBody("datePublished", "Date Published is required").notEmpty();

    // Get Validation Errors
    // TODO DeprecationWarning: req.validationErrors() may be removed in a future version. 
    // TODO Use req.getValidationResult() instead. See 'express-validator' docs
    let validationErrors = request.validationErrors(); 
    // let validationErrors = yield request.getValidationResult(); 
    // request.getValidationResult().then(function(validationErrors) {
        // if(!validationErrors.isEmpty()) {
        if(validationErrors) {    
            response.render("add-book", {
                "page_title": "Add a New Book",
                "validationErrors": validationErrors
            });
        } else {
            let book = new Books();
            book.title = request.body.title;
            book.author = request.body.author;
            book.content = request.body.content;
            book.datePublished = request.body.datePublished;

            book.save(function(err) {
                if(err) {
                    console.log(err);
                    console.log(err.stack);
                    response.sendStatus(response.statusCode);
                } else {
                    request.flash("success", "Book added!");
                    response.redirect("/book/browse");
                }
            });
        }
    // });
});

/**
 * Creates a route to fetch a selected Book's data, given its id
 */
router.get("/:id", function(request, response) {
    Books.findById(request.params.id, function(err, book) {
        // reformat the book.datePublished
        let datePublished = moment(book.datePublished, ["MM/DD/YYYY", "YYYY-MM-DD"]);
        book.datePublished = datePublished.format("dddd, MMMM Do YYYY");
        response.render("book", {"book":book});
    });
});

/**
 * Creates a route to present the Edit form for a selected Book, given its id
 */
router.get("/edit/:id", checkIfUserIsAuthenticated, function(request, response) {
    Books.findById(request.params.id, function(err, book) {
        // format the book.datePublished
        let datePublished = moment(book.datePublished, ["MM/DD/YYYY", "YYYY-MM-DD"]);
        book.datePublished = datePublished.format("YYYY-MM-DD");
        response.render("edit_book", {"page_title":"Edit Book Info", "book":book});
    });
});

/**
 * Creates a route to handle HttpPost request for 
 * updating the selected/edited Book's data, given its id
 */
router.post("/edit/:id", checkIfUserIsAuthenticated, function(request, response) {
    let book = {};
    book.title = request.body.title;
    book.author = request.body.author;
    book.content = request.body.content;
    book.datePublished = request.body.datePublished;

    let query = {_id: request.params.id};

    Books.update(query, book, function(err) {
        if(err) {
            console.log(err.stack);
            response.sendStatus(response.statusCode);
        } else {
            request.flash("success", "Book information updated!");
            response.redirect("/book/browse");
        }
    });
});

/**
 * Creates a route to delete the selected book, given its id
 */
router.delete("/delete/:id", checkIfUserIsAuthenticated, function(request, response) {
    let query = { "_id": request.params.id };
    if(request.user.userRole == "Admin") {
        Books.remove(query, function(err) {
            if(err) {
                console.log(err);
            } else {
                request.flash("success", "Book deleted!");
                response.send("<p>Book successfully deleted</p>");
            }       
        });
    } else {
        request.flash("danger", "Access denied. Action not authorized.");
    }
});

/**
 * User Authentication check & access control
 */
function checkIfUserIsAuthenticated(request, response, next) {
    if(request.isAuthenticated()) {
        return next();
    } else {
        request.flash("danger", "Access denied. Please login.");
        response.redirect("/user/login");
    }
}

module.exports = router;
