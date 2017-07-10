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

exports.getAnnouncementsByTags = function(tagId) {
    return new Promise ((resolve) => {
        database.query('SELECT * FROM announcements WHERE id IN (SELECT announcementId FROM announcements_tags WHERE tagId=:tagId)', {tagId:tagId}).then((idList) => {
            var announcementResults = [];
            var announcementPromises = idList.map((announcementId) => {
                return announcementsUtility.getAnnouncementById(announcementId.id).then((data) => {
                    announcementResults.push(data[0]);
                    // We had no other choice..
                    if (announcementResults.length === announcementPromises.length) {
                        resolve(announcementResults);
                    };
                });
            });
        });
    });

}

// SETTERS
// Sets tags

// Utilize exports instead of module.exports every time
module.exports = exports;
