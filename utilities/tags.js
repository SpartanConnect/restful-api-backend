// Utility functions for tags
var database = require('./database');

// GETTERS
// Gets tags

exports.getTags = function(id) {
    return database.query('SELECT * FROM tags');
}

exports.getTagBySlug = function(id) {
}

exports.getTagById = function(id) {
    console.log('hit getTagById function');
    return database.query('SELECT * FROM tags WHERE id=:id',{id:id});

}

exports.getAnnouncementsByTags = function(tagId) {
}

// SETTERS
// Sets tags

// Utilize exports instead of module.exports every time
module.exports = exports;
