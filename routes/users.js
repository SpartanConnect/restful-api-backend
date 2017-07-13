var express = require('express');
var router = express.Router();

var userUtilities = require('../utilities/users');
var announcementRoutes = require('./announcements');
var notificationRoutes = require('./notifications');

function userRequestHandler (req, res) {
    userUtilities.getUsers((req.query.id ? req.query.id : req.params.id),
                           req.query.rank,
                           req.query.handle).then((userObjectResults) => {
        if(typeof userObjectResults==='undefined') {
            res.json([]);
        }
        else {
            res.json(userObjectResults);
        }
        res.end();
    }).catch(error => {
        console.log(error);
    });
}

function userSubmitHandler(req, res) {

    if (typeof req.params.id === 'undefined') {
        res.json({
            success:false,
            reason: 'No userId specified to modify.'
        });
    }

    userUtilities.updateUser(req.params.id,
                             req.body.name,
                             req.body.handle,
                             req.body.email,
                             req.body.rank
    ).then (() => {
        res.json({success:true})
    });
}

router.get('/users/:creatorId/announcements', announcementRoutes.announcementRequestHandler);

router.get('/users/:userId/notifications', notificationRoutes.notificationRequestHandler);

router.get('/users/:id', userRequestHandler);

router.post('users/:id', userSubmitHandler);

router.get('/users/', userRequestHandler);

module.exports = router;
