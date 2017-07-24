var express = require('express');
var router = express.Router();

var announcements = require('../utilities/announcements');
var authUtilities = require('./../utilities/auth'); //eslint-disable-line spellcheck/spell-checker
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
    if (typeof req.params.id === 'undefined') {
        //The id that is passed as a URL parameter is undefined (not provided) and thus the request is to create a new announcement
        if (req.user.rank <= 3) {
            console.log('user has sufficient privileges');
            if (typeof req.body.title !== 'undefined' && 
                typeof req.body.description !== 'undefined' && 
                /* typeof req.body.creatorId !== 'undefined' &&  */
                typeof req.body.startDate !== 'undefined' && 
                typeof req.body.endDate !== 'undefined') {
                //Sufficient information has been provided to create the announcement
                /*eslint-disable indent */
                //console.log(req.body.tags);
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
            res.json({'success':false, 'reason':'You do not have sufficient privileges to create an announcement.'});
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
                //An invalid announcement Id has been provided to edit. Reject.
                res.json({'success':false, 'reason':'An invalid announcementId has been provided to edit.'});
                res.end();
            }
            else {
                //Valid announcement ID to edit
                if (req.user.rank <=3) {
                    console.log('the user\'s rank is sufficient to edit announcements');
                    //The user has a rank sufficient to edit announcements.
                    var announcementInfo = dbUtility.query('SELECT creatorId, status FROM announcements WHERE id = :id', {id:req.params.id});
                    var creatorInfo = dbUtility.query('SELECT rank FROM users WHERE id=(SELECT creatorId FROM announcements WHERE id = :id)', {id: req.params.id});
                    //var tagInfo = dbUtility.query('SELECT minUserLevelAssign FROM tags WHERE id IN (SELECT tagId FROM announcements_tags WHERE announcementId = :id)', {id:req.params.id});
                    Promise.all([announcementInfo, creatorInfo /*,  tagInfo */]).then ((announcementCreatorTagInfo) => {
                        let announcementInfo = announcementCreatorTagInfo[0];
                        let creatorInfo = announcementCreatorTagInfo[1];
/*                         let tagInfo = announcementCreatorTagInfo[2];

                        console.log(tagInfo);
 */
                        let endStatus = req.body.status ? req.body.status : announcementInfo[0].status;
                        if ((req.user.id == announcementInfo[0].creatorId && (endStatus == 0 || endStatus == 3 || announcementInfo[0].status == 2)) || //User is creator and wants to edit own announcement and wants to set to pending or remove it
                            (req.user.rank <= 2 && req.user.rank <= creatorInfo[0].rank)) { //User is an admin and is trying to edit or approve an announcement created by someone of equal or lower rank.
                            if (typeof req.body.tags !== 'undefined') {
                                //Tags should be updated
                                announcements.updateTags(req.params.id, req.body.tags).then((updateTagResults) => {
                                    let announcementUpdateResult = {};
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
                            if (!(typeof req.body.title === 'undefined' &&
                                typeof req.body.description === 'undefined' &&
                                typeof req.body.startDate === 'undefined' &&
                                typeof req.body.endDate === 'undefined' &&
                                typeof req.body.adminId === 'undefined' &&
                                typeof req.body.status === 'undefined')) {
                                //user wants to update an announcement
                                /* eslint-disable indent */
                                announcements.updateAnnouncement(req.params.id,
                                                                req.body.title,
                                                                req.body.description,
                                                                req.body.startDate,
                                                                req.body.endDate,
                                                                req.body.adminId,
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
                        else {
                            res.json({success:false, reason:'You do not have sufficient privileges to edit this announcement. This may be due to you trying to edit your own, already approved, announcement without also removing it or requesting approval again.'});
                            res.end();
                        }
                    }).catch ((error) => {
                        console.log(error);
                    });
                }
                else {
                    console.log('The user does not have sufficient privileges');
                    res.json({success:false, reason:'You do not have sufficient privileges to edit announcements.'});
                    res.end();
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
