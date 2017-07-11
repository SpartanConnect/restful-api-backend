var express = require('express');
var router = express.Router();

var announcements = require('../utilities/announcements');

function getAnnouncementHandler (req, res) {
    announcements.getAnnouncements((req.query.id ? req.query.id : req.params.id), req.query.status, req.query.startDate, req.query.endDate, req.query.tagId, req.query.creatorId, req.query.adminId).then((data) => {
        //console.log('This should be our data out from the routes page:\n',data);
        if (typeof data==='undefined') {
            res.json();
        }
        else if (data.length === 1) {
            res.json(data[0]);
        }
        else
        {
            res.json(data);
        }
        res.end();
    }).catch(error => {
    console.log(error);
    });
};

router.get('/announcements/', getAnnouncementHandler);

router.get('/announcements/:id', getAnnouncementHandler);

module.exports = router;
