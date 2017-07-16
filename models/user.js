const mongoose = require("mongoose");

// Define a data model for UserSchema
const UserSchema = mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    passwd: {
        type: String,
        required:true
    },
    userRole: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("User", UserSchema);
