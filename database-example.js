var mysql = require('mysql');

// --- mySQL Connection Variables ---
var connection = mysql.createConnection({
    host: 'localhost',
    port: '8089',
    user: 'spartanConnect',
    password: 'yourPasswordHere',
    database: 'spartan_connect'
});

connection.connect(function(error) {
    if (error) throw error;
});

module.exports = connection;
