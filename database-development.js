//Nick 7/3/17: For now this is just a clone of Jeffrey's CONSTANTS_example.js file. It will likely evolve in the future.

var CONSTANTS = require('./constants.js');
var SECRETS = require('./secret.js');

var mysql = require('mysql');

// --- mySQL Connection Variables ---
var connection = mysql.createConnection({
    host: CONSTANTS.SQL_DB_HOST,
    port: CONSTANTS.SQL_DB_PORT,
    user: CONSTANTS.SQL_DB_USER,
    password: SECRETS.SQL_DB_PASSWORD,
    database: CONSTANTS.SQL_DB_NAME
});

connection.connect(function(error) {
    if (error) throw error;
});

module.exports = connection;
