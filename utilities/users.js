// Utility functions for users
var database = require('./database');

// GETTERS
// Gets users

exports.getUsers = function(id, rank, handle) {
    //console.log('hit getUsers function');
    var statement = 'SELECT id FROM users';
    var statementParameters = {};

    if(typeof id != 'undefined') { statementParameters.id = id; }
    if(typeof rank != 'undefined') { statementParameters.rank = rank; }
    if(typeof handle != 'undefined') { statementParameters.handle = handle; }

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
            if (idList.length === 0) {return resolve ();}
            var userResults = [];
            var userPromises = idList.map((userId) => {
                return exports.getUserById(userId.id, true).then((data) => {
                    //console.log(data);
                    userResults.push(data);
                    // We had no other choice..
                    if (userResults.length === userPromises.length) {
                        //console.log('These are the userResults that are resolved by the promise returned by the getUsers function',userResults);
                        resolve(userResults);
                    }
                });/*.catch(error => {
                    console.log(error);
                });*/
            });
        });/*.catch(error => {
            console.log(error);
        });*/
    });
};

exports.getUserById = function(id, getPostCounts) {
    //SELECT * FRON users WHERE id=id;
    if (typeof id === 'undefined') return Promise.resolve();
    //console.log('get user hit');
    let userSql = database.query('SELECT * FROM users WHERE id=:id;', {id:id});
    if (getPostCounts) {
        /* eslint-disable no-unused-vars */
        var postCountApprovedSql = exports.getUserPostCount(id,1);
        var postCountUnapprovedSql = exports.getUserPostCount(id,0);
        var postCountDeniedSql = exports.getUserPostCount(id,2);
        var postCountRemovedSql = exports.getUserPostCount(id,3);
        var postCountTotalSql = exports.getUserPostCount(id);
        /* eslint-enable no-unused-vars */
    }
    return new Promise((resolve) => {
        Promise.all((getPostCounts ? [userSql,postCountApprovedSql,postCountUnapprovedSql,postCountDeniedSql,postCountRemovedSql,postCountTotalSql] : [userSql])).then((userPromise) => {
            if (typeof userPromise[0][0] === 'undefined') {resolve();}
            /*return*/ resolve (exports.userPromiseHandler(userPromise, getPostCounts));
        }).catch(error =>{
            console.log(error);
        });
    });
};

exports.getUserAnnouncements = function(userId, status) {
    // IDEA: use Babel or TS for ES6 implementation of optional arguments
    if (typeof status === 'undefined') status = 1;
    return database.query('SELECT * FROM announcements WHERE creatorID=:userId AND status=:status;',{userId : userId,status : status});
};

exports.getUserPostCount = function(userId, status) {
    //console.log('user post counter hit');
    if (typeof status !== 'undefined') return database.query('SELECT COUNT (id) FROM announcements WHERE creatorId=:userId AND status=:status;', {userId:userId,status:status});
    return database.query('SELECT COUNT (id) FROM announcements WHERE creatorId=:userId;',{userId:userId});
};

exports.userPromiseHandler = function(promiseIn, includePostCounts) {
    if (typeof promiseIn[0][0] === 'undefined')  return {};
    var userObject = promiseIn[0][0];
    if (includePostCounts) {
        userObject.postCounts = {
            approvedCount : promiseIn[1][0]['COUNT (id)'],
            unapprovedCount : promiseIn[2][0]['COUNT (id)'],
            deniedCount : promiseIn[3][0]['COUNT (id)'],
            removedCount : promiseIn[4][0]['COUNT (id)'],
            totalCount : promiseIn[5][0]['COUNT (id)']
        };
    }
    delete userObject.gid;
    return userObject;
};

exports.updateUser = (id, name, handle, /*email,*/ rank) => {
    var statement = 'UPDATE users SET ';
    var statementParameters = {};

    if (typeof name != 'undefined') { statementParameters.name = name; }
    if (typeof handle != 'undefined') { statementParameters.handle = handle; }
    //if (typeof email != 'undefined') { statementParameters.email = email; };
    if (typeof rank != 'undefined') { statementParameters.rank = rank; }

    if (Object.keys(statementParameters).length != 0) {
        Object.keys(statementParameters).forEach(function (item, index) {
            if (index != 0) { statement += ' , '; }
            statement += item + ' = :' + item;
        });
    }

    statementParameters.id = id;

    return database.query(statement + ' WHERE id = :id;', statementParameters);

};

exports.createUser = (name, handle, email) => {
    var statement = 'INSERT INTO users (name, handle, email, rank) VALUES (:name, :handle, :email, 99);';
    var statementParameters = {name: name, handle:handle, email:email};

    return database.query(statement, statementParameters);
};

// Utilize exports instead of module.exports every time
module.exports = exports;
