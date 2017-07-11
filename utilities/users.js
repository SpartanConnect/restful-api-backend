// Utility functions for users
var database = require('./database')

// GETTERS
// Gets users

exports.getUsers = function(id, rank, handle) {
    //console.log('hit getUsers function');
    var statement = 'SELECT id FROM users';
    var statementParameters = {};

    if(typeof id != 'undefined') { statementParameters.id = id; };
    if(typeof rank != 'undefined') { statementParameters.rank = rank; };
    if(typeof handle != 'undefined') { statementParameters.handle = handle; };

    if(Object.keys(statementParameters).length != 0) {
        statement += ' WHERE ';
        Object.keys(statementParameters).forEach(function(item, index) {
            if(index != 0) { statement += ' AND '; }
            statement += item + ' = :' + item;
        });
    }

    //console.log(statement);

    return new Promise ((resolve) => {
        database.query(statement + ';', statementParameters).then((idList) => {
            if (idList.length === 0) {return resolve ()};
            var userResults = [];
            var userPromises = idList.map((userId) => {
                return exports.getUserById(userId.id).then((data) => {
                    //console.log(data);
                    userResults.push(data);
                    // We had no other choice..
                    if (userResults.length === userPromises.length) {
                        //console.log('These are the userResults that are resolved by the promise returned by the getUsers function',userResults);
                        resolve(userResults);
                    };
                });/*.catch(error => {
                    console.log(error);
                });*/
            });
        });/*.catch(error => {
            console.log(error);
        });*/
    });
}

exports.getUserById = function(id) {
    //SELECT * FRON users WHERE id=id;
    if (typeof id === 'undefined') return Promise.resolve({});
    //console.log('get user hit');
    userSql = database.query('SELECT * FROM users WHERE id=:id', {id:id});
    postCountApprovedSql = exports.getUserPostCount(id,1);
    postCountUnapprovedSql = exports.getUserPostCount(id,0);
    postCountDeniedSql = exports.getUserPostCount(id,2);
    postCountRemovedSql = exports.getUserPostCount(id,3);
    postCountTotalSql = exports.getUserPostCount(id);
    return new Promise((resolve) => {
        Promise.all([userSql,postCountApprovedSql,postCountUnapprovedSql,postCountDeniedSql,postCountRemovedSql,postCountTotalSql]).then((userPromise) => {
            if (typeof userPromise[0][0] === 'undefined') {resolve(0)};
            /*return*/ resolve (exports.userPromiseHandler(userPromise));
        }).catch(error =>{
            console.log(error);
        });
    });
}

exports.getUserAnnouncements = function(userId, status) {
    // IDEA: use Babel or TS for ES6 implementation of optional arguments
    if (typeof status === 'undefined') status = 1;
    return database.query('SELECT * FROM announcements WHERE creatorID=:userId AND status=:status;',{userId : userId,status : status})
}

exports.getUserPostCount = function(userId, status) {
    //console.log('user post counter hit');
    if (typeof status !== 'undefined') return database.query('SELECT COUNT (id) FROM announcements WHERE creatorId=:userId AND status=:status', {userId:userId,status:status});
    return database.query('SELECT COUNT (id) FROM announcements WHERE creatorId=:userId',{userId:userId});
}

exports.userPromiseHandler = function(promiseIn) {
    if (typeof promiseIn[0][0] === 'undefined')  return {};
    var userObject = promiseIn[0][0];
    userObject.postCounts = {
        approvedCount : promiseIn[1][0]['COUNT (id)'],
        unapprovedCount : promiseIn[2][0]['COUNT (id)'],
        deniedCount : promiseIn[3][0]['COUNT (id)'],
        removedCount : promiseIn[4][0]['COUNT (id)'],
        totalCount : promiseIn[5][0]['COUNT (id)']
    };
    return userObject;
};

// Utilize exports instead of module.exports every time
module.exports = exports;
