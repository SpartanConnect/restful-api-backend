#!/usr/bin/env node
require('dotenv').config();
var db = require('./utilities/database');

var emailUtilities = require('./utilities/emails')

var announcementListQuery = db.query('SELECT title, description FROM announcements WHERE status = 0;')
var adminListQuery = db.query('SELECT name,email FROM users WHERE rank < 3;', {})
Promise.all([announcementListQuery,adminListQuery]).then((announcementAdminInfoPackage) => {
    var announcementList = announcementAdminInfoPackage[0];
    if (announcementList.length == 0) {
        process.exit();
    }
    var adminList = announcementAdminInfoPackage[1];
    /**
     * @type {Promise[]}
     */
    var emailPromiseList = [];
    for (let i = 0; i < adminList.length; i++) {
        emailPromiseList.push(emailUtilities.sendPendingEmail(announcementList, adminList[i]));
    }
    Promise.all(emailPromiseList).then((resultArray) => {
        process.exit();
    });
});
