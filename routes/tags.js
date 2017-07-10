var express = require('express');
var router = express.Router();

var tagUtility = require('../utilities/tags');

router.get('/tags/',function (req, res) {
    tagUtility.getTags().then ((tagObjectArray) => {
        res.json(tagObjectArray);
        res.end();
    });
});

router.get('/tags/:id', function (req, res) {
    console.log('hit router function');
    tagUtility.getTagById(req.params.id).then((tagObject) => {
        res.json(tagObject[0]);
        res.end();
    });
});

module.exports = router;
