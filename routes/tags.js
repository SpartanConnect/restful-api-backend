var express = require('express');
var router = express.Router();

var tagUtility = require('../utilities/tags');

router.get('/tags/',function (req, res) {
    tagUtility.getTags(req.query.id, req.query.minRequestRank, req.query.minAssignRank, req.query.parentId, req.query.visible, req.query.name).then ((tagObjectArray) => {
        res.json(tagObjectArray);
        res.end();
    });
});

module.exports = router;
