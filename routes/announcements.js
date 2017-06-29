var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/announcements/:id/', function(req, res, next) {
    console.log(req.params.id);
    res.json({user: 'jkaufman'});
    res.end();
});

module.exports = router;
