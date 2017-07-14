var mysql = require('mysql');
require('dotenv').config();
// --- mySQL Connection Variables ---

//console.log(process.env);

var connection = mysql.createConnection({
    host: process.env.SQL_DB_HOST,
    port: process.env.SQL_DB_PORT,
    user: process.env.SQL_DB_USER,
    password: process.env.SQL_DB_PASSWORD,
    database: process.env.SQL_DB_NAME
});

connection.connect(function(error) {
    if (error) throw error;
});

module.exports = connection;
