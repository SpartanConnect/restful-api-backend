var database = require('./database');
var users = require('./users');

// Getter
exports.getAnnouncements = function(id, status, startDate, endDate, tagId, creatorId, adminId) {
    var statement = 'SELECT id FROM announcements';
    var statementParameters = {};

    if(typeof id != 'undefined') { statementParameters.id = id; };
    if(typeof status != 'undefined') { statementParameters.status = status; };

    //if(typeof tagId != 'undefined') { statementParameters.tagId = tagId; };
    if(typeof creatorId != 'undefined') { statementParameters.creatorId = creatorId; };
    if(typeof adminId != 'undefined') { statementParameters.adminId = adminId; };

    if(Object.keys(statementParameters).length != 0) {
        statement += ' WHERE ';
        Object.keys(statementParameters).forEach(function(item, index) {
            if(index != 0) { statement += ' AND '; }
            statement += item + ' = :' + item;
        });
    }

    if (typeof tagId !== 'undefined') {
        if (Object.keys(statementParameters).length !== 0) {
            statement += ' AND ';
        }
        statement += ' WHERE id IN (SELECT announcementId FROM announcements_tags WHERE tagId=:tagId) ';
        statementParameters.tagId = tagId;
    }

    if(typeof startDate != 'undefined') {
        if (Object.keys(statementParameters).length === 0) statement += " WHERE ";
        else statement += ' AND ';
        statement += 'startDate <= :startDate';
        statementParameters.startDate = startDate;
    };
    if(typeof endDate != 'undefined') {
        if (Object.keys(statementParameters).length === 0) statement += " WHERE ";
        else statement += ' AND ';
        statement += 'endDate >= :endDate';
        statementParameters.endDate = endDate;
    };



    console.log(statement);

    return new Promise ((resolve) => {
        database.query(statement + ';', statementParameters).then((idList) => {
            if (idList.length === 0) {return resolve ()};

            var announcementResults = [];
            var announcementPromises = idList.map((announcementId) => {
                return exports.getAnnouncementById(announcementId.id).then((data) => {
                    //console.log('This is the data from the getAnnouncementById, which should be blank',data);
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
    //let creatorSqlQuery = database.query('SELECT * FROM users WHERE id = (SELECT creatorId FROM announcements WHERE id=:id)',{id:id});
    //let adminSqlQuery = database.query('SELECT * FROM users WHERE id = (SELECT adminId FROM announcements WHERE id=:id)',{id:id});
    //console.log("sent all queries");
    return new Promise ((resolve) => {
        //console.log('Returning new promise');
        Promise.all([announcementSqlQuery, tagSqlQuery]).then((announcementResultArray) => {
            if (typeof announcementResultArray[0][0] === 'undefined') {return resolve()};
            let rawAnnouncementArray = announcementResultArray[0];
            let creatorDatabaseQuery = users.getUserById(rawAnnouncementArray[0].creatorId);
            let adminDatabaseQuery = users.getUserById(rawAnnouncementArray[0].adminId);
            Promise.all([creatorDatabaseQuery,adminDatabaseQuery]).then((userResultArray) => {
                //console.log('This is the promise result array:\n',promiseResultArray);
                //console.log('This is the rawAnnouncementArray\n', rawAnnouncementArray);
                let rawCreatorArray = [userResultArray[0]];
                //console.log('This is the rawCreatorArray\n', rawAnnouncementArray);
                let rawAdminArray = [userResultArray[1]];
                //console.log('This is the rawAdmin info\n', rawAdmin);
                let rawTags = [announcementResultArray[1]];
                //console.log('This is (hopefully the raw array of tags)\n',rawTags);
                //console.log('promise results divvied up');
                resolve (exports.announcementPackager(rawAnnouncementArray, rawCreatorArray, rawAdminArray, rawTags));
            }).catch(error =>{
                console.log(error);
            });
        }).catch(error =>{
            console.log(error);
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
    //console.log('This is the rawAnnouncementArray from the announcementPackager',rawAnnouncementArray);
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
