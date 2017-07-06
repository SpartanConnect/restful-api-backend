var mysql = require('mysql');
var database = require('./database');

var users = require('./users');

// GETTERS
exports.getAnnouncements = function(approval, startDate, endDate) {
}

exports.getAnnouncementById = function(id) {
    console.log('hit get function');
    let announcementSql = database('SELECT * FROM announcements WHERE id=:id',{id:id});
    let tagsSql = database('SELECT * FROM tags WHERE id IN (SELECT tagId FROM announcements_tags WHERE announcementId=:id);',{id:id})
    return new Promise ((resolve) => {
        Promise.all([announcementSql, tagsSql]).then((promiseResult) => {
            exports.announcementPromiseHandler(promiseResult).then((data) => {
                console.log('completed the promise for announcement');
                /*return*/resolve (data);
            }).catch(error =>{
                console.log(error);
            })
        });
    });
}

// SETTERS

//Nick 2017/07/04 Should we just pass it an announcement object which it then handles?
exports.createAnnouncement = function(title, description, creatorId, startDate, endDate, urgent, status) {
    if (typeof urgency === 'undefined') approval = 0;
    if (typeof approval === 'undefined') approval = 1;

    //INSERT INTO announcements (title, description, creatorId, startDate,endDate, urgent, status, timeSubmitted) values (title, description, creatorId,startDate,endDate,urgent,status,NOW())

}

// UTILITIES
// Functions that handle parsing, formatting, etc. used multiple times

exports.sanitizeInput = function(input) {
}

exports.desanitizeInput = function(input) {
}

exports.announcementPromiseHandler = function(promiseIn) {
    console.log('hit announcementPromiseHandler');
    //console.log('announcementResult on passing to handler\n', promiseIn);
    let announcementResult = promiseIn[0][0];
    //console.log('announcementResult before tag declaration\n',announcementResult);
    announcementResult.tags = promiseIn[1];
    //console.log('announcementResult after tag declaration\n', announcementResult);
    //console.log(promiseIn);
    return new Promise ((resolve) => {
        //console.log('this should be a announcementResult:', announcementResult);
        let creatorUser = users.getUser(announcementResult.creatorId);
        let adminUser = users.getUser(announcementResult.adminId);
        console.log('this should be the adminUser id\n', announcementResult.adminId);
        let promiseInput = [creatorUser];
        if (typeof adminUser !== 'undefined') promiseInput[1] = adminUser;
        Promise.all(promiseInput).then((userPromise) => {
            console.log('hit promise all for announcement user getting');
            console.log('this should be both users information\n',userPromise);
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

// Utilize exports instead of module.exports every time
module.exports = exports;
