var express = require('express');
var router = express.Router();

var usersUtility = require('./../utilities/users.js');

router.get('/users/:id/announcements', function(req, res) {
    usersUtility.getUserAnnouncements(req.params.id).then(function(result) {
        res.json(result);
        res.end();
    });
});

module.exports = router;
