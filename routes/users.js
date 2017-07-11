var express = require('express');
var router = express.Router();

var userUtilities = require('../utilities/users');

router.get('/users/', function(req, res) {
    userUtilities.getUsers(req.query.id, req.query.rank, req.query.handle).then((userObjectResults) => {
        if (userObjectResults.length === 1) {
            res.json(userObjectResults[0]);
        }
        else {
            res.json(userObjectResults);
        }
        res.end();
    }).catch(error => {
        console.log(error);
    });
});

module.exports = router;
