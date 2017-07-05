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
    //SELECT * FROM announcements WHERE creatorID=id
}

// SETTERS
// Sets announcements

//Nick 2017/07/04 Should we just pass it an announcement object which it then handles?
exports.createAnnouncement = function(title, description, creatorId, startDate, endDate, urgent, approved) {
    if (typeof urgency === 'undefined') approval = 0;
    if (typeof approval === 'undefined') approval = 1;

    //INSERT INTO announcements (title, description, creatorId, startDate,endDate, urgent, approed, timeSubmitted) values (title, description, creatorId,startDate,endDate,urgent,approved,NOW())

}

exports.updateAnnouncementApproval = function(id, approval) {
    //UPDATE announcements (approved) VALUES (approval) WHERE id=id
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
