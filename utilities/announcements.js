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

    console.log(statement + ';');

    return new Promise ((resolve) => {
        database.query(statement + ';', statementParameters).then((idList) => {
            var announcementResults = [];
            var announcementPromises = idList.map((announcementId) => {
                return exports.getAnnouncementById(announcementId.id).then((data) => {
                    announcementResults.push(data);
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
    var announcementSql = database.query('SELECT * FROM announcements WHERE id=:id',{id:id});
    var tagsSql = database.query('SELECT * FROM tags WHERE id IN (SELECT tagId FROM announcements_tags WHERE announcementId=:id);',{id:id})
    return new Promise ((resolve) => {
        Promise.all([announcementSql, tagsSql]).then((promiseResult) => {
            exports.announcementPromiseHandler(promiseResult).then((data) => {
                /*return*/resolve (data);
            }).catch(error =>{
                console.log(error);
            })
        });
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

exports.announcementPromiseHandler = function(promiseIn) {
    //console.log('hit announcementPromiseHandler');
    //console.log('announcementResult on passing to handler\n', promiseIn);
    var announcementResult = promiseIn[0][0];
    //console.log('announcementResult before tag declaration\n',announcementResult);
    announcementResult.tags = promiseIn[1];
    //console.log('announcementResult after tag declaration\n', announcementResult);
    //console.log(promiseIn);
    return new Promise ((resolve) => {
        //console.log('this should be a announcementResult:', announcementResult);
        var creatorUser = users.getUser(announcementResult.creatorId);
        var adminUser = users.getUser(announcementResult.adminId);
        //console.log('this should be the adminUser id\n', announcementResult.adminId);
        var promiseInput = [creatorUser];
        if (typeof adminUser !== 'undefined') promiseInput[1] = adminUser;
        Promise.all(promiseInput).then((userPromise) => {
            //console.log('hit promise all for announcement user getting');
            //console.log('this should be both users information\n',userPromise);
            announcementResult.creator = userPromise[0];
            announcementResult.admin = userPromise[1];
            delete announcementResult.creatorId;
            delete announcementResult.adminId;
            /*return*/resolve(announcementResult);
        }).catch(error =>{
            console.log(error);
        });
    });
}

module.exports = exports;
