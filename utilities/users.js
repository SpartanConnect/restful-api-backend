// Utility functions for users

var database = require('./database')

// GETTERS
// Gets users

exports.getUser = function(id) {
    //SELECT * FRON users WHERE id=id;
}

exports.getUserEmail = function(id) {
}

exports.getUserName = function(id) {
}

exports.getUserAnnouncements = function(userId, approval) {
    // IDEA: use Babel or TS for ES6 implementation of optional arguments
    if (typeof approval === 'undefined') approval = 1;
    return database('SELECT * FROM announcements WHERE creatorID=:userId AND approved=:approval;',{userId:userId,approval:approval})
}

// Utilize exports instead of module.exports every time
module.exports = exports;
