var express = require('express');
var router = express.Router();

var tagUtility = require('../utilities/tags');

router.get('/tags/',function (req, res) {
    tagUtility.getTags().then ((tagObjectArray) => {
        res.json(tagObjectArray);
        res.end();
    });
});

router.get('/tags/:slug', function (req, res) {
    //console.log('hit router function');
    tagUtility.getTagById(req.params.id).then((tagObject) => {
        res.json(tagObject[0]);
        res.end();
    });
});

router.get('/tags/:id/announcements', function (req, res) {
    tagUtility.getAnnouncementsByTags(req.params.id).then((announcementObjectArray) => {
        res.json(announcementObjectArray);
        res.end();
    });
});

module.exports = router;
