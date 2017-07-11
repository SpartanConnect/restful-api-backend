var express = require('express');
var router = express.Router();

var announcements = require('../utilities/announcements');

router.get('/announcements/',function (req, res) {
    //console.log('hit router');
    announcements.getAnnouncements(req.query.id, req.query.status, req.query.startDate, req.query.endDate, req.query.tagId, req.query.creatorId).then((data) => {
        if (data.length === 1) {
            res.json(data[0]);
        }
        else {
            res.json(data);
        }
        res.end();
    }).catch(error => {
        console.log(error);
    })
});

router.get('/announcements/:id', function(req, res) {
    //console.log('hit router!');
    announcements.getAnnouncementById(req.params.id).then((announcementObject) => {
        //console.log('got to announcemenObject returning')
        res.json(announcementObject[0]);
        res.end();
    }).catch(error =>{
        console.log(error);
    });
});

module.exports = router;
