var express = require('express');
var router = express.Router();
var _ = require('underscore');

var announcements = require('../utilities/announcements');
var authUtilities = require('./../utilities/auth'); //eslint-disable-line spellcheck/spell-checker
var notificationRoutes = require('./notifications');
var eventRoutes = require('./events');
var dbUtility = require('./../utilities/database');
var errorSend = require('../utilities/errors').send;
var enums = require('../utilities/enums'); //eslint-disable-line spellcheck/spell-checker

var errorEnum = enums.errors;
var rankEnum = enums.users;
var statusEnum = enums.status;


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

/**
 * @typedef {Object} RequestCase
 * @prop {Boolean} isAdmin - Whether or not the user is an admin
 * @prop {Boolean} isCreator - Whether or not the user is the announcement's creator.
 * @prop {Boolean} updateContent - Whether or not the content is being edited.
 * @prop 
 */

/**
 * This function takes in parameters and is used for documenting and comparing announcements.
 * @param {Boolean} isAdmin 
 * @param {Boolean} isCreator 
 * @param {Boolean} updateContent 
 * @param {Boolean} updateTags 
 * @param {Boolean} updateStatus 
 * @param {number} finalStatus 
 * @param {Boolean} sufficientRank A boolean value which determines whether or not the user has a lower rank number (more privileges) than the creator of the announcement.
 * @returns {RequestCase} An object that has information about the request and its parameters.
 */
function caseObjectGenerator(isAdmin, isCreator, updateContent, updateTags, updateStatus, finalStatus,  sufficientRank) {
    return {isAdmin: isAdmin, isCreator: isCreator, updateContent: updateContent, updateTags: updateTags, finalStatus: finalStatus, sufficientRank: sufficientRank};
}

/**
 * 
 * @param {Object} req The request object from the HTTP(S) route.
 * @param {Object} res The response object from the HTTP(S) route. 
 */
function announcementSubmitHandler2 (req, res) {
    if (typeof req.params.id !== 'undefined') {
        //The user wants to edit an announcement. Fantastic. 😒
        
        //Define varaibles for request catergorazation.
        
        /**
         * A boolean variable which represents whether the user that is attempting the action is an admin or not.
         * @var {Boolean}
         */
        var isAdmin;

        /**
         * A boolean variable which represents whether the user is the creator of the specified announcement.
         * @var {Boolean}
         */
        var isCreator;

        /**
         * A boolean which indicates whether or not title, description, startDate, or endDate data has been submitted. **The new content should be checked to ensure that it has actually been changed.**
         * @var {Boolean}
         */
        var updateContent;

        /**
         * A boolean which indicated if tags have been supplied to update. This value should not be assumed to be an update of the tags. **The tags should be checked to ensure that they have actually changed.**
         * @var {Boolean}
         */
        var updateTags;

        /**
         * A boolean which indicates if the status of the announcement is included in the submitted announcement object. **Similar to `updateContent` and `updateTags`, it should be checked to ensure a change has in fact been made before sending a query.**
         * @var {Boolean}
         */
        var updateStatus;

        /**
         * An integer representing the final rank that an announcement would be after the specified edits.
         * This is used when determining whether someone is approving, denying, removing, or submitting an announcement.
         * @var {Boolean}
         */
        var finalStatus;

        /**
         * A boolean value which determines whether or not the user has a lower or equal rank number (more or the same privileges) than the creator of the announcement. This value is often used in conjunction with the isAdmin variable to determine whether or not an admin can edit another admin's announcement.
         * @var {Boolean}
         */
        var sufficientRank;
        
        // Determine whether or not the user is an admin.
        if (req.user.rank <= rankEnum.RANK_ADMIN)
            isAdmin = true;
        else
            isAdmin = false;

        // Determine whether or not the user is requesting to change the content of the announcement.
        // This needs to be checked 
        if (typeof req.body.title != 'undefined' ||
            typeof req.body.description != 'undefined' || 
            typeof req.body.startDate != 'undefined' ||
            typeof req.body.endDate != 'undefined')
            updateContent = true;
        else
            updateContent = false;

        // Determine whether or not the user is requesting to change the tags on the announcement.
        // This needs to be checked later to determine whether or not the tag list actually changed.
        // TODO: This also needs to iterate through the tags to ensure that all tags that are attempting to be applied have IDs.
        if (typeof req.body.tags != 'undefined') { //We know that there is a tags object.
            if (req.body.tags.length > 0) { //Making sure that the tag objet has objects in it (its length is >0)
                req.body.tags.forEach((tagObject) => {
                    if (typeof tagObject.id == 'undefined') // If the if for any tag object is undefined, throw an error.
                        errorSend(errorEnum.TAG_APPLY_INVALID, res); // Throw TAG_APPLY_INVALID error. Not sure if this is the rignt one, however.
                });
            }
            else
                updateTags = false; // The tag object is present but there are no elements in it.
        }
        else // The tag object isn't present.
            updateTags = false;

        // Is the status being sent? This needs to be checked later to see if the status is actually changed from the old one.
        if (typeof req.body.status != 'undefined')
            updateStatus = true;
        else
            updateStatus = false;

        //If no body content, tag data, nor status is being sent, there is nothing to update and we should thrown an error.
        if (updateContent == false && updateTags == false, updateStatus == false) {
            errorSend(errorEnum.ANNOUNCEMENT_UPDATE_EMPTY, res);
            return;
        }
        
        // Now that we know that there is some data to update, we need more info about what is currently in the DB to determine whether or not to actually do anything.
        // Now we query the database to get more information on the creator, content and tags.
        announcements.getAnnouncementById(req.params.id).then((announcementInfo) => {
            // TODO: We need to ensure that there is announcement info that is returned. If none is returned, we need to throw an error.

            /**
             * A variable (hopefully) containing information about the announcement that is wanted to be edited.
             * This is basically just the first index of the `announcementInfo` variable that is output by the `getAnnouncementById` function.
             * @var {Object}
             * @prop {String} announcementObject.title The title of the announcement frin  the database.
             * @prop {String} announcementObject.description The description of the announcement from the database.
             * @prop {Date} announcementObject.startDate The startDate of the announcement from the databsae.
             * @prop {Date} announcementObject.endDate The end date of the announcement from the database.
             * @prop {number} announcementObject.status The status of the announcement from the database. Should be one of the values fron enums.status
             * @prop {Date} announcementObject.timeSubmitted The date and time that the announcement was first submitted.
             * @prop {Date} announcementObject.timeApproved An optional date and time at which the announcement was approved. If the announcement is not approved, it should be null.
             * @prop {Date} announcementObject.timeEdited The date and time at which the announcement was last edited.
             * @prop {Object} announcementObject.creator The standard user object that contains information about the creator of the announcement.
             * @prop {Object} announcementObject.admin An optional standard user object that contains information about the last admin to affect an announcement. For annnouncements which admins have not taken action upon, this is not present.
             * @prop {Object[]} announcementObject.tags An optional arrray of standard tag objects that contain the tags that an announcement has.
             * @prop {Object[]} announcementObject.events An optional array of standard event objects that contain the event(s) which is/are the child(ren) of the announcement.
             * @readonly 
             */
            var announcementObject = announcementInfo[0];
            //Remeber that getAnnouncementById returns an array of announcement objects.

            // Determine whether or not the user is the creator of the announcement.
            if (announcementObject.creatorID == req.user.id)
                isCreator = true;
            else
                isCreator = false;

            // Determine the final status of the announcement after the submitted changes.
            if (updateStatus) // If the status has been submitted, then the final status after applying the submitted changes would be read from the request object.
                finalStatus = req.body.status;
            else //If the status has not been submitted, then it would remain the same as it was at first.
                finalStatus = announcementObject.status;

            //We need to compare the creator and editor's ranks to determine if the editopr's rank is sufficient to edit the announcement, in certain cases.
            if (req.user.rank <= announcementObject.user.rank)
                sufficientRank = true;
            else
                sufficientRank = false;

            //Declare boring variables to use for determining updates to content.
            /**
             * A temporary boolean variable indicating whether or not the title has actually changed. Initialized to false.
             * @var {Boolean} updateTitle
             */
            var updateTitle = false;

            /**
             * A temporary boolean variable indicating whether or not the description has actually changed. Initialized to false.
             * @var {Boolean} updateDescription
             */
            var updateDescription = false;

            /**
             * A temporary boolean variable indicating whether or not the startDate has actually changed. Initialized to false.
             * @var {Boolean} updateStartDate
             */
            var updateStartDate = false;

            /**
             * A temporary boolean variable indicating whether or not the endDate has actually changed. Initialized to false.
             * @var {Boolean} updateEndDate
             */
            var updateEndDate = false;

            //Now that we have the starting values for these parameters, we need to make sure that we only are trying to update the values that have actually changed. 
            if (updateContent) {
                if (typeof req.body.title != 'undefined' && req.body.title != announcementObject.title) //Is the title of the submitted data is defined, we should compare it to the current value.
                    updateTitle = true;
                if (typeof req.body.description != 'undefined' && req.body.description != announcementObject.description) //Testing for the description actually changing.
                    updateDescription = true;
                if (typeof req.body.startDate != 'undefined' && req.body.startDate != announcementObject.startDate) // Testing for the start date changing
                    updateStartDate = true;
                if (typeof req.body.endDate != 'undefined' && req.body.endDate != announcementObject.endDate) // Testing for the end date changing.
                    updateEndDate = true;
            }

            // Update updateContent to ensure that it actually represents wheteher or not the the values were actually changed.
            updateContent = updateTitle || updateDescription || updateStartDate || updateEndDate;

            // Check if the submitted status is actually different from the one that is already in the database.
            if (updateStatus)
                if (req.body.status == announcementObject.status)
                    updateStatus = false;
            
            // If updateTags is true, we need to ensure whether or not the tags have changed. However, this kind of divying up is not necessarily needed here (although its useful for the comparison at the bottom.)
            if (updateTags) {
                /**
                 * This variable contains the tagId's which the announcement currently has in the database, prior to any changes.
                 * @var {Set} currentTags
                 * @readonly
                 */
                var currentTags = new Set();
                /**
                 * `deleteTags` is a set of tagId's that should be deleted to complete the query.
                 * 
                 * @var {Set} deleteTags
                 */
                var deleteTags = new Set();
                /**
                 * `applyTags` is a set of tagId's that should be applied the the announcement for the edit to be completed.
                 * 
                 * @var {Set} applyTags
                 */
                var applyTags = new Set();
                /**
                 * `requestTags` is a set of tagId's that the request announcement object contains.
                 * 
                 * @var {Set} requestTags
                 * @readonly
                 */
                var requestTags = new Set();

                //Populate the currentTag set with the tagId's from the db query
                announcementObject.tags.forEach((tagObject) => {
                    currentTags.add(tagObject.id);
                });

                //Populate requestTags set with the request's tag objects.
                req.body.tags.forEach((tagObject) => {
                    requestTags.add(tagObject.id);
                });

                // If one of the tags in the request isn't currently in the announcement, add it to be applied.
                requestTags.forEach((tagId) => {
                    if (!currentTags.has(tagId))
                        applyTags.add(tagId);
                });

                // If one of the tags that is currently applied but isn't in the request, add it to the delete list.
                currentTags.forEach((tagId) => {
                    if (!requestTags.has(tagId))
                        deleteTags.add(tagId);
                });

                //Now we need to make sure that the tags have actually changed. Do this by seeing if the apply and delete tag objects have lengths.
                if (applyTags.size == 0 && deleteTags.size == 0)
                    updateTags = false;
            }

            // Perform a similar check as above to not 'update' the database if nothing has changed.
            if (updateContent == false && updateTags == false, updateStatus == false) {
                errorSend(errorEnum.ANNOUNCEMENT_UPDATE_EMPTY, res);
                return;
            }

            //Finally, we should be sure that the user has submitted some new data for the database to update. Now we can have fun with the actual permissions cases! 😒
            var permissionsCase = caseObjectGenerator(isAdmin, isCreator, updateContent, updateTags, updateStatus, finalStatus, sufficientRank);

            //I'm not sure I want to use a switch... I think it might be useful later, but not for the first level of request filtering.
            if (permissionsCase.isAdmin)


            /* switch (permissionsCase) {
                // Cases for admin editing their own announcement.
                case caseObjectGenerator(true, true, true, true, true, statusEnum.APPROVED_ADMIN, true): // The user is an admin and editing their own announcement. Let them do what they want. (Errors with tag assignment can be handled later.) In this case they are trying to approve their own announcement. 
                case caseObjectGenerator(true, true, true, true, true, statusEnum.PENDING_ADMIN, true): // User is an admin and editing own announcement, they are trying to resubmit it for reapproval. Not sure why they would, but OK.
                case caseObjectGenerator(true, true, true, true, true, statusEnum.REMOVED_TEACHER, true): // User is an admin and editing own announcement. They are trying to remove an announcement from circulation.
                case caseObjectGenerator(true, true, true, true, true, statusEnum.REJECTED_ADMIN, true): // User is an admin and editing own announcenemt. They are trying to reject their own announcement. Not sure why, but OK.

                //Cases for admins editing announcements created by users other than their own.
                case caseObjectGenerator(true, false, true, true, true, statusEnum.PENDING_ADMIN, true): //User is trying to 
                case caseObjectGenerator(true, false, true, true, true, statusEnum.APPROVED_ADMIN, true):
                case caseObjectGenerator():

                default:
                    errorSend(errorEnum.ANNOUNCEMENT_UPDATE_FAILURE);
                    return;
            } */


        });
    }
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
                    //console.log('the user\'s rank is sufficient to edit announcements');
                    //The user has a rank sufficient to edit announcements.
                    var announcementInfo = dbUtility.query('SELECT creatorId, status FROM announcements WHERE id = :id', {id:req.params.id});
                    var creatorInfo = dbUtility.query('SELECT rank FROM users WHERE id=(SELECT creatorId FROM announcements WHERE id = :id)', {id: req.params.id});
                    var tagInfo = dbUtility.query('SELECT minUserLevelAssign FROM tags WHERE id IN (SELECT tagId FROM announcements_tags WHERE announcementId = :id)', {id:req.params.id});
                    Promise.all([announcementInfo, creatorInfo,  tagInfo]).then ((announcementCreatorTagInfo) => {
                        let announcementInfo = announcementCreatorTagInfo[0];
                        let creatorInfo = announcementCreatorTagInfo[1];
                        let tagInfo = announcementCreatorTagInfo[2];
                        //console.log(tagInfo);
                        var minTagLevel = 3;
                        
                        tagInfo.forEach((tag) => {
                            if (tag.minUserLevelAssign<minTagLevel) {
                                minTagLevel = tag.minUserLevelAssign;
                            }
                        });

                        let endStatus = req.body.status ? req.body.status : announcementInfo[0].status;
                        if (req.body.status == 1 && req.user.rank >= minTagLevel) {
                            res.json({success:false, reason: 'You do not have sufficient permissions to approve the indicated announcement\'s tags.'});
                            res.end();
                        }
                        else if ((req.user.id == announcementInfo[0].creatorId && (endStatus == 0 || endStatus == 3 || announcementInfo[0].status == 2) && req.body.status != 2) || //User is creator and wants to edit own announcement and wants to set to pending or remove it
                            (req.user.rank <= 2 && req.user.rank <= creatorInfo[0].rank)) { //User is an admin and is trying to edit or approve an announcement created by someone of equal or lower rank.
                            if (typeof req.body.tags !== 'undefined') {
                                //Tags should be updated
                                announcements.updateTags(req.params.id, req.body.tags).then((updateTagResults) => {
                                    let announcementUpdateResult = {};
                                    announcementUpdateResult.tagDeleteResult = updateTagResults.deleteResult;
                                    announcementUpdateResult.tagCreateResult = updateTagResults.createResult;
                                    if (announcementUpdateResult.tagDeleteResult.affectedRows == 0) {
                                        //The tags haven't been deleted. Throw error
                                        res.json({'success':false,'reason':'The tags that were assigned to the announcement were not deleted.'});
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
                    //console.log('The user does not have sufficient privileges');
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
    req.query.startDate = new Date();
    req.query.endDate = new Date();
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
