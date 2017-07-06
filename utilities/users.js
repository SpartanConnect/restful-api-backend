// Utility functions for users
var database = require('./database')

// GETTERS
// Gets users

exports.getUser = function(id) {
    //SELECT * FRON users WHERE id=id;
    if (typeof id === 'undefined') return Promise.resolve({});
    console.log('get user hit');
    userSql = database('SELECT * FROM users WHERE id=:id', {id:id});
    postCountApprovedSql = exports.getUserPostCount(id,1);
    postCountUnapprovedSql = exports.getUserPostCount(id,0);
    postCountDeniedSql = exports.getUserPostCount(id,2);
    postCountRemovedSql = exports.getUserPostCount(id,3);
    postCountTotalSql = exports.getUserPostCount(id);
    return new Promise((resolve) => {
        Promise.all([userSql,postCountApprovedSql,postCountUnapprovedSql,postCountDeniedSql,postCountRemovedSql,postCountTotalSql]).then((userPromise) => {
            /*return*/ resolve (exports.userPromiseHandler(userPromise));
        }).catch(error =>{
            console.log(error);
        });
    });
}

exports.getUserAnnouncements = function(userId, status) {
    // IDEA: use Babel or TS for ES6 implementation of optional arguments
    if (typeof status === 'undefined') status = 1;
    return database('SELECT * FROM announcements WHERE creatorID=:userId AND status=:status;',{userId : userId,status : status})
}

exports.getUserPostCount = function(userId, status) {
    console.log('user post counter hit');
    if (typeof status !== 'undefined') return database('SELECT COUNT (id) FROM announcements WHERE creatorId=:userId AND status=:status', {userId:userId,status:status});
    return database('SELECT COUNT (id) FROM announcements WHERE creatorId=:userId',{userId:userId});
}

exports.userPromiseHandler = function(promiseIn) {
    if (typeof promiseIn[0][0] === 'undefined') {console.log("kill myself"); return {};};
    let userObject = promiseIn[0][0];
    userObject.postCounts = {
        approvedCount : promiseIn[1][0],
        unapprovedCount : promiseIn[2][0],
        deniedCount : promiseIn[3][0],
        removedCount : promiseIn[4][0],
        totalCount : promiseIn[5][0]
    };
    return userObject;
};

// Utilize exports instead of module.exports every time
module.exports = exports;
