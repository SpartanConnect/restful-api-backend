var mysql = require('mysql');
var database = require ('./database.js');

// GETTERS
exports.getAnnouncements = function(approval, startDate, endDate) {

}

exports.getAnnouncementById = function(id) {
    return database('SELECT * FROM announcements WHERE id = :id;',{id:id});
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
