var express = require('express');
var router = express.Router();

var announcementsUtility = require('./../utilities/announcements.js');

/* GET home page. */
router.get('/announcements/:id/', function(req, res) {
    announcementsUtility.getAnnouncementById(req.params.id).then(function(result) {
        res.json(result[0]);
        res.end();
    });
});


module.exports = router;
