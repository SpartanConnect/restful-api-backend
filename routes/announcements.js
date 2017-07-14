var express = require('express');
var router = express.Router();

var announcements = require('../utilities/announcements');
var notificationRoutes = require('./notifications');
var eventRoutes = require('./events');

function announcementRequestHandler (req, res) {
    announcements.getAnnouncements((req.query.id ? req.query.id : req.params.id),
                                    req.query.status,
                                    req.query.startDate,
                                    req.query.endDate,
                                    (req.query.tagId ? req.query.tagId : req.params.tagId),
                                    (req.query.creatorId ? req.query.creatorId : req.params.creatorId),
                                    req.query.adminId).then((data) => {
        //console.log('This should be our data out from the routes page:\n',data);
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
        if (typeof req.body.title !== 'undefined' && 
            typeof req.body.description !== 'undefined' && 
            typeof req.body.creatorId !== 'undefined' && 
            typeof req.body.startDate !== 'undefined' && 
            typeof req.body.endDate !== 'undefined') {
            //Sufficient information has been provided to create the announcement
            announcements.createAnnouncement(req.body.title,
                                             req.body.description,
                                             req.body.creatorId,
                                             req.body.startDate,
                                             req.body.endDate).then((result) => {
                if (result.affectedRows == 0) {
                    //No rows were affected, thus no announcement was created.
                    res.json({"success":false, "reason":'No announcement has been created.'});
                    res.end();
                }
                else {
                    //Rows were affected, and so the announcement was created.
                    res.json({"success":true});
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
        //The id is defined and thus we want to edit an announcement
        if (typeof req.body.title === 'undefined' &&
            typeof req.body.description === 'undefined' &&
            typeof req.body.startDate === 'undefined' &&
            typeof req.body.endDate === 'undefined' &&
            typeof req.body.adminId === 'undefined' &&
            typeof req.body.status === 'undefined') {
            //No data has been submitted for changes. Throw error
            res.json({'success':false, 'reason':'The request provides no values to be updated.'});
            res.end();
        }
        else {
            //Some data has beem provided.
            if (isNaN(parseInt(req.params.id))) {
                //An invalid user Id has been provided to edit. Reject.
                res.json({'success':false, 'reason':'An invalid userId has been provided to edit.'});
                res.end();
            }
            else {
                //The id provided is defined, data has been provided to update, and the id that is provided is valid.
                announcements.updateAnnouncement(req.params.id,
                                                 req.body.title,
                                                 req.body.description,
                                                 req.body.startDate,
                                                 req.body.endDate,
                                                 req.body.adminId,
                                                 req.body.status).then((queryResult) => {
                    if (queryResult.affectedRows == 0) {
                        //No rows were affected, thus no announcement was edited.
                        res.json({"success":false, "reason":'No edits have been made to the announcement.'});
                        res.end();
                    }
                    else {
                        //Rows were affected, and so the announcement was edited.
                        res.json({"success":true});
                        res.end();
                    }
                });
            }
        }
    }
}

router.get('/announcements/', announcementRequestHandler);

router.post('/announcements/', announcementSubmitHandler);

router.get('/announcements/current', function (req, res) {
    //console.log(new Date());
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

router.post('announcements/:id', announcementSubmitHandler);

router.get('/announcements/:id', announcementRequestHandler);

module.exports = router;
module.exports.announcementRequestHandler = announcementRequestHandler;
