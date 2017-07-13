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

//TODO: Make sure that users cannot demote or promote users of an incorrect level
function userSubmitHandler(req, res) {
    //console.log('Hit submit utility handler');
    //console.log(parseInt(req.params.id));
    if (typeof req.params.id === 'undefined') {
        if (typeof req.body.name !== 'undefined' && typeof req.body.handle !== 'undefined' && typeof req.body.email !== 'undefined') {
            //console.log('Create user conditions met');
            userUtilities.createUser(req.body.name, req.body.handle, req.body.email).then ((result) => {
                //console.log('create user completed');
                if (result.affectedRows == 0) {
                    res.json({success: false,
                            reason:"Could not add rows and create user."})
                } else {
                    res.json({success:true});
                }
                res.end();
            });
        }
        else {
            res.json({success:false, reason:'Insufficient data to create user.'});
            res.end();
        }
    }
    else if (isNaN(parseInt(req.params.id))) {
        res.json({
            success:false,
            reason: 'Invalid userId specified to modify.'
        });
        res.end();
    }
    else{
        userUtilities.updateUser(req.params.id,
                                 req.body.name,
                                 req.body.handle,
                                 /*req.body.email,*/
                                 req.body.rank
        ).then ((result) => {
            if (result.affectedRows == 0) {
                res.json({success: false,
                          reason:"Could not update rows."})
            } else {
                res.json({success:true})
            }
         res.end();
        });
    }
}

router.get('/users/:creatorId/announcements', announcementRoutes.announcementRequestHandler);

router.get('/users/:userId/notifications', notificationRoutes.notificationRequestHandler);

router.post('/users/:id', userSubmitHandler);

router.get('/users/:id', userRequestHandler);

router.post('/users/', userSubmitHandler);

router.get('/users/', userRequestHandler);

module.exports = router;
