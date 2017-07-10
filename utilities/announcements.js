var database = require('./database');
var users = require('./users');

// Getter
exports.getAnnouncements = function(id, status, startDate, endDate) {
    var statement = 'SELECT id FROM announcements';
    var statementParameters = {}

    if(typeof id != 'undefined') { statementParameters.id = id; }
    if(typeof status != 'undefined') { statementParameters.status = status; }
    if(typeof startDate != 'undefined') { statementParameters.startDate = startDate; }
    if(typeof endDate != 'undefined') { statementParameters.endDate = endDate; }

    if(Object.keys(statementParameters).length != 0) {
        statement += ' WHERE ';
        Object.keys(statementParameters).forEach(function(item, index) {
            if(index != 0) { statement += ' AND '; }
            statement += item + ' = :' + item;
        });
    }

    return new Promise ((resolve) => {
        database.query(statement + ';', statementParameters).then((idList) => {
            var announcementResults = [];
            var announcementPromises = idList.map((announcementId) => {
                return exports.getAnnouncementById(announcementId.id).then((data) => {
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

exports.getAnnouncementById = function(id) {
    //console.log('Hit getAnnouncementById');
    let announcementSqlQuery = database.query('SELECT * FROM announcements WHERE id=:id',{id:id});
    let tagSqlQuery = database.query('SELECT * FROM tags WHERE id IN (SELECT tagId FROM announcements_tags WHERE announcementId=:id);',{id:id});
    let creatorSqlQuery = database.query('SELECT * FROM users WHERE id = (SELECT creatorId FROM announcements WHERE id=:id)',{id:id});
    let adminSqlQuery = database.query('SELECT * FROM users WHERE id = (SELECT adminId FROM announcements WHERE id=:id)',{id:id});
    //console.log("sent all queries");
    return new Promise ((resolve) => {
        //console.log('Returning new promise');
        Promise.all([announcementSqlQuery, creatorSqlQuery, adminSqlQuery, tagSqlQuery]).then((promiseResultArray) => {
            //console.log('This is the promise result array:\n',promiseResultArray);
            let rawAnnouncementArray = promiseResultArray[0];
            //console.log('This is the rawAnnouncementArray\n', rawAnnouncementArray);
            let rawCreatorArray = promiseResultArray[1];
            //console.log('This is the rawCreatorArray\n', rawAnnouncementArray);
            let rawAdmin = promiseResultArray[2];
            //console.log('This is the rawAdmin info\n', rawAdmin);
            let rawTags = [promiseResultArray[3]];
            //console.log('This is (hopefully the raw array of tags)\n',rawTags);
            //console.log('promise results divvied up');
            resolve (exports.announcementPackager(rawAnnouncementArray, rawCreatorArray, rawAdmin, rawTags));
        }).catch(error =>{
            //console.log(error);
        })
    });
}

// Setters
exports.createAnnouncement = function(title, description, creatorId, startDate, endDate, urgent, status) {
    if (typeof urgency === 'undefined') status = 0;
    if (typeof status === 'undefined') status = 1;

    //INSERT INTO announcements (title, description, creatorId, startDate,endDate, urgent, status, timeSubmitted) values (title, description, creatorId,startDate,endDate,urgent,status,NOW())

}

// Utilities
exports.sanitizeInput = function(input) {
}

exports.desanitizeInput = function(input) {
}

exports.announcementPackager = function(rawAnnouncementArray, rawUserCreatorArray, rawUserAdminArray, rawTagArrayArray) {
    //console.log('hit packager');
    //console.log(rawTagArrayArray);
    let announcementObject = rawAnnouncementArray.map((rawAnnouncement, announcementIndex) => {
        if (typeof rawAnnouncement.creatorId !== 'undefined') {
            rawAnnouncement.creator = rawUserCreatorArray[announcementIndex];
            delete rawAnnouncement.creatorId;
        }
        if (typeof rawAnnouncement.adminId !== 'undefined') {
            rawAnnouncement.admin = rawUserAdminArray[announcementIndex];
            delete rawAnnouncement.adminId;
        }
        rawAnnouncement.tags = [];
        rawTagArrayArray[announcementIndex].map((rawTag) => {
            rawAnnouncement.tags.push(rawTag);
        });
        return rawAnnouncement;
    });
    ////console.log(announcementObject);
    return announcementObject;
}

module.exports = exports;
