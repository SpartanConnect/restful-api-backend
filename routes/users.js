var express = require('express');
var router = express.Router();

var userUtilities = require('../utilities/users');

router.get('/users/', function(req, res) {
    userUtilities.getUsers(req.query.id, req.query.rank, req.query.handle);
});

module.exports = router;
