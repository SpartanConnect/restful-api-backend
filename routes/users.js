var express = require('express');
var router = express.Router();

var userUtilities = require('../utilities/users');
var announcementRoutes = require('./announcements');
var notificationRoutes = require('./notifications');
var authUtilities = require('./../utilities/auth'); //eslint-disable-line spellcheck/spell-checker
var dbUtilities = require('./../utilities/database');

function userRequestHandler (req, res) {
    /* eslint-disable indent */
    userUtilities.getUsers((req.query.id ? req.query.id : req.params.id),
                           req.query.rank,
                           req.query.handle).then((userObjectResults) => {
        /* eslint-enable indent */
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
        //console.log('User wants to create user');
        //console.log(req.user);
        if (req.user.rank <= 2 && typeof req.user.rank !== 'undefined') {
            //console.log('user has rank <=2 ');
            //User has sufficient privliedges to create a user (admin or higher ATM)
            if (typeof req.body.name !== 'undefined' &&
                /* typeof req.body.handle !== 'undefined' && */
                typeof req.body.email !== 'undefined') {
                //There is the necessary information to create the announcement
                //console.log('Create user conditions met');
                userUtilities.createUser(req.body.name, req.body.email).then ((result) => {
                    //console.log('create user completed');
                    if (result.affectedRows == 0) {
                        res.json({success: false,
                            reason:'Could not add rows and create user.'});
                    } else {
                        res.json({success:true});
                    }
                    res.end();
                }).catch((error) => {
                    if (error.code == 'ER_DUP_ENTRY') {
                        res.json({success:false, reason:'A user with the same email already exists.'});
                        res.end();
                    }
                });
            }
            else {
                res.json({success:false, reason:'Insufficient data to create user.'});
                res.end();
            }
        }
        else {
            res.json({success:false, reason:'You do not have sufficient privileges to create a user.'});
            res.end();
        }
    }
    else if (isNaN(parseInt(req.params.id))) {
        //The user ID is provided byt is invalid (not a number)
        res.json({
            success:false,
            reason: 'Invalid userId specified to modify.'
        });
        res.end();
    }
    else{
        //The user wants to update announcement
        if (typeof req.body.name === 'undefined' && typeof req.body.handle === 'undefined' && typeof req.body.rank === 'undefined') {
            //No updates have been specified.
            res.json({success:false, reason:'No edits have been made.'});
            res.end();
        }
        else {
            //console.log('Data has been provided to update and the user wants to update a user');
            //Data has been provided to update
            /* eslint-disable indent */
            dbUtilities.query('SELECT rank FROM users WHERE id = :id', {id:req.params.id}).then((targetRank) => {
                //console.log(targetRank[0].rank);
                //console.log(req.user.rank);
                if ((req.params.id==req.user.id && typeof req.body.rank !== 'undefined')) {
                    res.json({success:false, reason:'You may not modify your own rank.'});
                    res.end();
                }
                else if (targetRank[0].rank>req.user.rank || req.user.rank === 0) {
                    //User has sufficient privlieges to edit user.
                    userUtilities.updateUser(req.params.id,
                                            req.body.name,
                                            req.body.handle,
                                            /*req.body.email,*/
                                            req.body.rank
                    /* eslint-enable indent */
                    ).then ((result) => {
                        if (result.affectedRows == 0) {
                            res.json({success: false,
                                reason:'No rows have been updated.'});
                        } else {
                            res.json({success:true});
                        }
                        res.end();
                    });
                }
                else {
                    res.json({success:false, reason:'You do not have sufficient privileges to edit the user that has been specified.'});
                    res.end();
                }
            });
        }
    }
}

router.put('/users/hook-push/token', (req, res) => {
    // use req.body to get data
    if (!req.body.token.value || (req.body.token.enableNotifs == null || req.body.token.enableNotifs == undefined) || typeof req.body.token.ios != 'boolean') {
        res.json({
            success: false,
            reason: 'Insufficient data to set up a hook.'
        });
        res.end();
    } else {
        // console.log("New token: ");
        // console.dir(req.body);
        dbUtilities.query('SELECT * FROM expo_notifications WHERE token = :token', {
            token: req.body.token.value
        }).then((d) => {
            if (!d.length) {
                let willNotify = (req.body.token.enableNotifs ? req.body.token.enableNotifs : false);
                dbUtilities.query('INSERT INTO expo_notifications (token, enableNotifs, ios) VALUES (:token, :enableNotifs, :ios)', {  //eslint-disable-line spellcheck/spell-checker
                    token: req.body.token.value,
                    enableNotifs: willNotify,
                    ios:req.body.token.ios
                }).then((d) => {
                    res.json({
                        success: true,
                        reason: 'Attached hook to data store.'
                    });
                    res.end();
                });
            } else {
                if (((d[0].enableNotifs === 1) !== req.body.token.enableNotifs) || (d[0].ios == undefined || d[0].ios == null)) {
                    dbUtilities.query('UPDATE expo_notifications SET enableNotifs = :enableNotifs , ios = :ios WHERE token = :token', { //eslint-disable-line spellcheck/spell-checker
                        token: req.body.token.value,
                        ios: req.body.token.ios,
                        enableNotifs: req.body.token.enableNotifs
                    }).then((d) => {
                        res.json({
                            success: true,
                            reason: 'Updated hook, persist to data store.'
                        });
                        res.end();
                    });
                } else {
                    res.json({
                        success: true,
                        reason: 'Already hooked.'
                    });
                    res.end();
                }
            }
        });
    }
});

router.get('/users/:creatorId/announcements', announcementRoutes.announcementRequestHandler);

router.get('/users/:userId/notifications', authUtilities.verifyAuthenticated(), notificationRoutes.notificationRequestHandler);

router.post('/users/:id', authUtilities.verifyAuthenticated(), userSubmitHandler);

router.get('/users/:id', authUtilities.verifyAuthenticated(), userRequestHandler);

router.post('/users/', authUtilities.verifyAuthenticated(), userSubmitHandler);

router.get('/users/', authUtilities.verifyAuthenticated(), userRequestHandler);

module.exports = router;
