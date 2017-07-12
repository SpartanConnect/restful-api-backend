var express = require('express');
var router = express.Router();

var notificationUtilities = require('../utilities/notifications');

function notificationRequestHandler (req, res) {
    notificationUtilities.getNotifications(req.query.id,
                                           req.query.type,
                                           (req.query.userId ? req.query.userId : req.params.userId),
                                           (req.query.announcementId ? req.query.announcementId : req.params.announcementId),
                                           req.query.startDate,
                                           req.query.endDate).then((notificationResults) => {
        if(typeof notificationResults==='undefined') {
        res.json([]);
        }
        else if (notificationResults.length === 1) {
        res.json(notificationResults);
        }
        else {
        res.json(notificationResults);
        }
        res.end();
    }).catch(error => {
        console.log(error);
    });
}

router.get('/notifications/', notificationRequestHandler);

module.exports = router;
module.exports.notificationRequestHandler = notificationRequestHandler;
