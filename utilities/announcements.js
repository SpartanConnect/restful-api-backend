// Utility functions for announcements
var databaseConnection = require('./../database-development.js');
var mysql=require('mysql');


// GETTERS
// Gets announcements

exports.getAnnouncements = function(approval, startDate, endDate) {

}

exports.getAnnouncementById = function(id) {
    var sqlTemplate='SELECT * FROM announcements WHERE id=?;';
    var sqlInserts=[id];
    var sqlStatement=mysql.format(sqlTemplate,sqlInserts);
    databaseConnection.query(sqlStatement, function (error, results) {
            if (error) throw error;
            return results;
        }
    );

    //databaseConnection.query('SELECT * FROM announcements WHERE id = 5', function(error, result) {
    //        if (error) throw error;
    //        return result[0];
    //    }
    //);
}

exports.getUserAnnouncements = function(userId, approval) {
    // IDEA: use Babel or TS for ES6 implementation of optional arguments
    if (typeof approval === 'undefined') approval = 0;
}

// SETTERS
// Sets announcements

exports.createAnnouncement = function(title, description, userId, startDate, endDate, urgency, approval) {
    if (typeof urgency === 'undefined') approval = 0;
    if (typeof approval === 'undefined') approval = 1;
}

exports.updateAnnouncementApproval = function(id, approval) {
}

exports.updateAnnouncementUrgency = function(id, urgency) {
}

exports.updateAnnouncementTitle = function(id, title) {
}

exports.updateAnnouncementDescription = function(id, description) {
}

// UTILITIES
// Functions that handle parsing, formatting, etc. used multiple times

exports.sanitizeInput = function(input) {
}

exports.desanitizeInput = function(input) {
}

// Utilize exports instead of module.exports every time
module.exports = exports;
