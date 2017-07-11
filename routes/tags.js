var express = require('express');
var router = express.Router();

var tagUtilities = require('../utilities/tags');
var announcementRoutes = require('./announcements');

function tagRequestHandler (req,res) {
    tagUtilities.getTags((req.query.id ? req.query.id : req.params.id),
                         req.query.minRequestRank,
                         req.query.minAssignRank,
                         req.query.parentId,
                         req.query.visible,
                         req.query.slug).then ((tagObjectArray) => {
        if (typeof tagObjectArray[0]==='undefined') {
            res.json([]);
        }
        else if (tagObjectArray.length === 1) {
            res.json(tagObjectArray);
        }
        else
        {
            res.json(tagObjectArray);
        }
        res.end();
    });
}

router.get('/tags/', tagRequestHandler);

router.get('/tags/:id', tagRequestHandler)

router.get('/tags/:tagId/announcements', announcementRoutes.announcementRequestHandler);

module.exports = router;
