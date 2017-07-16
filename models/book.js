const mongoose = require("mongoose");

// Define a data model for BookSchema
const bookSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    datePublished: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Books", bookSchema);
