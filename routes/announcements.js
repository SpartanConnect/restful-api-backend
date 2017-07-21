var express = require('express');
var router = express.Router();

var announcements = require('../utilities/announcements');
var authUtilities = require('./../utilities/auth');
var notificationRoutes = require('./notifications');
var eventRoutes = require('./events');
var dbUtility = require('./../utilities/database');

function announcementRequestHandler (req, res) {
    /*eslint-disable indent */
    announcements.getAnnouncements((req.query.id ? req.query.id : req.params.id),
                                    req.query.status,
                                    req.query.startDate,
                                    req.query.endDate,
                                    (req.query.tagId ? req.query.tagId : req.params.tagId),
                                    (req.query.creatorId ? req.query.creatorId : req.params.creatorId),
                                    req.query.adminId).then((data) => {
        //console.log('This should be our data out from the routes page:\n',data);
        /* eslint-enable indent */
        if (typeof data==='undefined') {
            res.json([]);
        }
        else
        {
            res.json(data);
        }
        res.end();
    }).catch(error => {
        console.log(error);
    });
}

function announcementSubmitHandler (req, res) {
    // console.log('Hit submit handler!');
    if (typeof req.params.id === 'undefined') {
        //The id that is passed as a URL parameter is undefined (not provided) and thus the request is to create a new announcement
        if (typeof req.body.title !== 'undefined' && 
            typeof req.body.description !== 'undefined' && 
            /* typeof req.body.creatorId !== 'undefined' &&  */
            typeof req.body.startDate !== 'undefined' && 
            typeof req.body.endDate !== 'undefined') {
            //Sufficient information has been provided to create the announcement
            /*eslint-disable indent */
            console.log(req.body.tags);
            announcements.createAnnouncement(req.body.title,
                                             req.body.description,
                                             req.user.id,
                                             req.body.startDate,
                                             req.body.endDate,
                                             req.body.tags).then((result) => {
                /*eslint-enable indent */
                if (result.announcementCreate.affectedRows == 0) {
                    //No rows were affected, thus no announcement was created.
                    res.json({'success':false, 'reason':'No announcement has been created.'});
                    res.end();
                }
                else if (result.tagCreate.affectedRows == 0 && typeof req.body.tags !== 'undefined') {
                    //Rows were affected, and so the announcement was created.
                    res.json({'success':false, 'reason':'The tags that you indicated were not applied.'});
                    res.end();
                }
                else {
                    res.json({'success':true});
                    res.end();
                }
            });
        }
        else {
            //Insuffucient data has been submitted in order to create the announcement.
            res.json({'success':false, 'reason':'Insufficient data to create announcement.'});
            res.end();
        }
    }
    else {
        //The id is defined and thus we want to edit/update an announcement
        if (typeof req.body.title === 'undefined' &&
            typeof req.body.description === 'undefined' &&
            typeof req.body.startDate === 'undefined' &&
            typeof req.body.endDate === 'undefined' &&
            typeof req.body.status === 'undefined' &&
            typeof req.body.tags === 'undefined') {
            //No data has been submitted for changes. Throw error
            res.json({'success':false, 'reason':'The request provides no values to be updated.'});
            res.end();
        }
        else {
            //Some data has beem provided.
            //User wants to edit
            if (isNaN(parseInt(req.params.id))) {
                //An invalid user Id has been provided to edit. Reject.
                res.json({'success':false, 'reason':'An invalid userId has been provided to edit.'});
                res.end();
            }
            else {
                //Valid announcement ID to edit
                if (req.user.rank <=3) {
                    //The user has a rank sufficient to edit the announcement.
                    dbUtility.query('SELECT creatorId, status FROM announcements WHERE id = :id', {id:req.params.id}).then ((announcementInfo) => {
                        if (req.user.id == announcementInfo[0].creatorId || req.user.rank <= 2) {
                            //The user is the creator or an admin
                            dbUtility.query('SELECT rank FROM users WHERE id=(SELECT creatorId FROM announcements where id = :id)', {id: req.params.id}).then ((creatorRank) => {

                            });
                            if (req.user.id == announcementInfo[0].creatorId && (req.body.status == 0 || req.body.status == 3)) {
                                //The user is trying to edit their own announcement and they are either removing it or making it pending.
                                if (typeof req.body.tags !== 'undefined') {
                                    //Tags should be updated
                                    announcements.updateTags(req.params.id, req.body.tags).then((updateTagResults) => {
                                        announcementUpdateResult.tagDeleteResult = updateTagResults.deleteResult;
                                        announcementUpdateResult.tagCreateResult = updateTagResults.createResult;
                                        if (announcementUpdateResult.tagDeleteResult.affectedRows == 0) {
                                            //The tags haven't been deleted. Throw error
                                            res.json({'success':false,'reason':'The tags that were connected to the announcement were not deleted.'});
                                            res.end();
                                        }
                                        else if (announcementUpdateResult.tagCreateResult.affectedRows == 0) {
                                            //The tags have not be re-created Throw error
                                            res.json({'success':false, 'reason':'The tags that you indicated were not applied.'});
                                            res.end();
                                        }
                                        else if (typeof req.body.title === 'undefined' &&
                                                typeof req.body.description === 'undefined' &&
                                                typeof req.body.startDate === 'undefined' &&
                                                typeof req.body.endDate === 'undefined' &&
                                                typeof req.body.adminId === 'undefined' &&
                                                typeof req.body.status === 'undefined') {
                                            //The user only wants to update the tags. If this is successful, then throw success
                                            res.json({'success':true});
                                            res.end();
                                        }
                                    });
                                }

                            }
                            else if (req.user.rank < creatorRank[0].rank) {
                                //User is trying to edit someone elses announcement. They must be of a higher level than the creator
                                if (typeof req.body.tags !== 'undefined') {
                                    //Tags should be updated
                                    announcements.updateTags(req.params.id, req.body.tags).then((updateTagResults) => {
                                        announcementUpdateResult.tagDeleteResult = updateTagResults.deleteResult;
                                        announcementUpdateResult.tagCreateResult = updateTagResults.createResult;
                                        if (announcementUpdateResult.tagDeleteResult.affectedRows == 0) {
                                            //The tags haven't been deleted. Throw error
                                            res.json({'success':false,'reason':'The tags that were connected to the announcement were not deleted.'});
                                            res.end();
                                        }
                                        else if (announcementUpdateResult.tagCreateResult.affectedRows == 0) {
                                            //The tags have not be re-created Throw error
                                            res.json({'success':false, 'reason':'The tags that you indicated were not applied.'});
                                            res.end();
                                        }
                                        else if (typeof req.body.title === 'undefined' &&
                                                typeof req.body.description === 'undefined' &&
                                                typeof req.body.startDate === 'undefined' &&
                                                typeof req.body.endDate === 'undefined' &&
                                                typeof req.body.adminId === 'undefined' &&
                                                typeof req.body.status === 'undefined') {
                                            //The user only wants to update the tags. If this is successful, then throw success
                                            res.json({'success':true});
                                            res.end();
                                        }
                                    });
                                }
                            }
                            if (announcementInfo[0].status != 1 && req.body.status != 1) {
                            }
                            else {
                                res.json({success:false, reason:'You cannot edit your announcement it has been approved unless the status is not also being set to unapproved.'});
                                res.end();
                            }
                        }
                        else {
                            res.json({success:false, reason:'You do not have sufficient privileges to edit this announcement.'});
                            res.end();
                        }
                    });
                }
                else {
                    res.json({success:false, reason:'You do not have sufficient privileges to edit this announcement.'});
                    res.end();
                }
                //The id provided is defined, data has been provided to update, and the id that is provided is valid.
                var announcementUpdateResult = {};

                if (!(typeof req.body.title === 'undefined' &&
                    typeof req.body.description === 'undefined' &&
                    typeof req.body.startDate === 'undefined' &&
                    typeof req.body.endDate === 'undefined' &&
                    typeof req.body.status === 'undefined')) {
                    //user wants to update an announcement
                    /* eslint-disable indent */
                    announcements.updateAnnouncement(req.params.id,
                                                     req.body.title,
                                                     req.body.description,
                                                     req.body.startDate,
                                                     req.body.endDate,
                                                     req.user.id,
                                                     req.body.status,
                                                     req.body.tags).then((updateResult) => {
                        if (updateResult.affectedRows == 1) {
                            res.json({'success':true});
                            res.end();
                        }
                        else {
                            res.json({'success':false, 'reason':'The changes that were submitted affected no announcements.'});
                            res.end();
                        }
                    });
                }   
            }
        }
    }
}

router.get('/announcements/', announcementRequestHandler);

router.post('/announcements/', authUtilities.verifyAuthenticated(), announcementSubmitHandler);

router.get('/announcements/current', function (req, res) {
    //console.log(new Date());
    req.query.startDate = new Date()/*.setHours(0, 0, 0, 0)*/;
    req.query.endDate = new Date()/*.setHours(0, 0 ,0 ,0)*/;
    req.query.status = 1;
    announcementRequestHandler(req, res);
});

router.get('/announcements/:announcementId/notifications', notificationRoutes.notificationRequestHandler);

router.get('/announcements/:announcementId/events', (req, res) => {
    eventRoutes.eventRequestHandler (req, res);
});

router.get('/announcements/:announcementId/deadlines', (req, res) => {
    req.query.type = 1;
    eventRoutes.eventRequestHandler (req, res);
});

router.post('/announcements/:id', authUtilities.verifyAuthenticated(), announcementSubmitHandler);

router.get('/announcements/:id', announcementRequestHandler);

module.exports = router;
module.exports.announcementRequestHandler = announcementRequestHandler;
