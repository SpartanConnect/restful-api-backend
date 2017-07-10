// Utility functions for tags
var database = require('./database');

// GETTERS
// Gets tags

exports.getTags = function(id) {
    let tagsSqlQuery = 'SELECT * FROM tags';
    return database.query(tagsSqlQuery);
}

exports.getTagBySlug = function(id) {
}

exports.getTagById = function(id) {
}

exports.getAnnouncementsByTags = function(tagId) {
}

// SETTERS
// Sets tags

// Utilize exports instead of module.exports every time
module.exports = exports;
