var express = require('express');
var router = express.Router();

var tagUtilities = require('../utilities/tags');
var announcementRoutes = require('./announcements');

function tagRequestHandler (req,res) {
    /* eslint-disable indent */
    tagUtilities.getTags((req.query.id ? req.query.id : req.params.id),
                         req.query.minRequestRank,
                         req.query.minAssignRank,
                         req.query.parentId,
                         req.query.visibility,
                         req.query.slug).then ((tagObjectArray) => {
        /*eslint-enable indent */
        if (typeof tagObjectArray[0]==='undefined') {
            res.json([]);
        }
        else
        {
            res.json(tagObjectArray);
        }
        res.end();
    });
}

router.get('/tags/', tagRequestHandler);

router.get('/tags/:id', tagRequestHandler);

router.get('/tags/:tagId/announcements', announcementRoutes.announcementRequestHandler);

module.exports = router;
