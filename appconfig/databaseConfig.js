/**
 * databaseConfig.js - Contains and exports all Database-related application configuration data
 * e.g. dbConnectionString etc.
 */
// TODO Enhancement: Remove and externalize DB connection credentials for secure storing
module.exports = {
    dbConnectionString: "mongodb://mongoDBRoot:pa55w0rd@localhost:27017/BooksDB",
    secret: "secretpassword"
}
