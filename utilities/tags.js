// Utility functions for tags
var database = require('./database');
var announcementsUtility = require('./announcements');

// GETTERS
// Gets tags

exports.getTags = function(id, minRequestRank, minAssignRank, parentId, visibility, slug) {
    var statement = 'SELECT * FROM tags';
    var statementParameters = {};

    if(typeof id != 'undefined') { statementParameters.id = id; };
    if(typeof minAssignRank != 'undefined') { statementParameters.minUserLevelAssign = minAssignRank; };
    if(typeof minRequestRank != 'undefined') { statementParameters.minUserLevelRequest = minRequestRank; };
    if(typeof parentId != 'undefined') { statementParameters.parentId = parentId; };
    if(typeof visibility != 'undefined') { statementParameters.visibility = visibility; }
    if(typeof slug != 'undefined') { statementParameters.slug = slug; }

    if(Object.keys(statementParameters).length != 0) {
        statement += ' WHERE ';
        Object.keys(statementParameters).forEach(function(item, index) {
            if(index != 0) { statement += ' AND '; }
            statement += item + ' = :' + item;
        });
    }

    console.log(statement);

    return database.query(statement, statementParameters);
}

exports.getTagById = function(id) {
    //console.log('hit getTagById function');
    return database.query('SELECT * FROM tags WHERE id=:id',{id:id});
}

// SETTERS
// Sets tags

// Utilize exports instead of module.exports every time
module.exports = exports;
