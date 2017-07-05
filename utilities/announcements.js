// Utility functions for announcements
var databaseConnection = require('./database-development.js');


// GETTERS
// Gets announcements

exports.getAnnouncements = function(approval, startDate, endDate) {
    
}

exports.getCurrentAnnouncements = function() {
}

exports.getAnnouncementById = function(id) {

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
