var express = require('express');
var router = express.Router();

var tagUtility = require('../utilities/tags');

function tagRequestHandler (req,res) {
    tagUtility.getTags(req.query.id, req.query.minRequestRank, req.query.minAssignRank, req.query.parentId, req.query.visible, req.query.name).then ((tagObjectArray) => {
        if (typeof tagObjectArray[0]==='undefined') {
            res.json();
        }
        else if (tagObjectArray.length === 1) {
            res.json(tagObjectArray[0]);
        }
        else
        {
            res.json(tagObjectArray);
        }
        res.end();
    });
}

router.get('/tags/', tagRequestHandler);

module.exports = router;
