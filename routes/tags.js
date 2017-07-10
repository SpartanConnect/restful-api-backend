var express = require('express');
var router = express.Router();

var tagUtilitiy = require('../utilities/tags');

router.get('/tags/',function (req, res) {
    tagUtilitiy.getTags().then ((tagObjectArray) => {
        res.json(tagObjectArray);
        res.end();
    });
});


module.exports = router;
