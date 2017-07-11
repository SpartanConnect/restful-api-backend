// Utility functions for tags
var database = require('./database');
var announcementsUtility = require('./announcements');

// GETTERS
// Gets tags

exports.getTags = function(id) {
    return database.query('SELECT * FROM tags');
}

exports.getTagBySlug = function(slug) {
    //return database.query('SELECT * FROM tags WHERE slug=:slug',{slug:slug});
}

exports.getTagById = function(id) {
    //console.log('hit getTagById function');
    return database.query('SELECT * FROM tags WHERE id=:id',{id:id});
}

// SETTERS
// Sets tags

// Utilize exports instead of module.exports every time
module.exports = exports;
