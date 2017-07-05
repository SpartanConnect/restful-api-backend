var databaseConnection = require('./../database-development.js');
var mysql = require('mysql');

// GETTERS
exports.getAnnouncements = function(approval, startDate, endDate) {

}

exports.getAnnouncementById = function(id) {
    return new Promise(function(resolve) {
        var statement = 'SELECT * FROM announcements WHERE id = ' + databaseConnection.escape(id) + ';';
        databaseConnection.query(statement, function (error, result) {
            if (error) {
                throw error;
            } else {
                resolve(result);
            }
        });
    });
}

exports.getUserAnnouncements = function(userId, approval) {
    // IDEA: use Babel or TS for ES6 implementation of optional arguments
    if (typeof approval === 'undefined') approval = 0;
    //SELECT * FROM announcements WHERE creatorID=id
}

// SETTERS

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
