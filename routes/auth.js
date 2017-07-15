var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

var auth = require('../utilities/auth');

router.get('/users/login/generate', (req, res) => {
    res.redirect(auth.generateConsentUrl());
    res.end();
});

router.get('/users/me', auth.verifyAuthenticated(), (req, res) => {
    let userObject = req.user;
    delete userObject.gid;
    userObject.isAuthenticated = true;
    userObject.success = true;
    res.json(userObject);
    res.end();
})

// Login logic -- all here!
router.get('/users/login', (req, res) => {
    if (!req.query.code) {
        res.json(auth.generateAuthResponse(false, "Cannot access this function directly. Please go to /users/login/generate to generate an authorization link.", null));
        res.end();
    } else {
        const authResponse = auth.validateAuthCode(req.query.code, (err, tokens) => {
            if (err) {
                res.json(auth.generateAuthResponse(false, "Invalid login code. Please try logging in through /users/login/generate again.", err));
                res.end();
            } else {
                // We have a valid id token and access token!
                // Validate all id tokens
                var access_token = tokens.access_token;
                var refresh_token = tokens.refresh_token;
                var id = jwt.decode(tokens.id_token);
                if (Date.now() >= tokens.expiry_date) {
                    // Expired token! Query the user to login again!
                    res.json(auth.generateAuthResponse(false, "Expired login. Please try logging in through /users/login/generate again.", null));
                    res.end();
                } else if (id.iss !== "accounts.google.com" && id.iss !== "https://accounts.google.com") {
                    res.json(auth.generateAuthResponse(false, "Invalid token (wrong issuer). Please try logging in through /users/login/generate again.", null));
                    res.end();
                } else if (Date.now()/1000 >= id.exp) {
                    res.json(auth.generateAuthResponse(false, "Expired login (origin: token). Please try logging in through /users/login/generate again.", null));
                    res.end();
                } else if (id.aud !== process.env.GOOGLE_CLIENT_ID) {
                    res.json(auth.generateAuthResponse(false, "Invalid token (invalid target). Please try logging in through /users/login/generate again.", null));
                    res.end();
                } else {
                    // Check if user exists in database before!
                    auth.checkIfUserExists(access_token, refresh_token, (success, doesExist, isEmptyUser, data) => {
                        if (!success) {
                            res.json(auth.generateAuthResponse(false, "Invalid token (profile info failed). Please try logging in through /users/login/generate again.", null));
                            res.end();
                        } else {
                            if (data.hd === "lcusd.net" && !doesExist) {
                                // create a new user (lcusd.net)
                                auth.generateFilledUser(data.id, data.name, data.email, data.picture, (success) => {
                                    if (success) {
                                        // IDEA: change variable names?
                                        req.session.access_token = access_token;
                                        req.session.refresh_token = refresh_token;
                                        res.json(auth.generateAuthResponse(true, "Authenticated. Congratulations.", null));
                                        res.end();
                                    } else {
                                        res.json(auth.generateAuthResponse(false, 
                                            "Validated token, but cannot create/login as an account (database error). Please log in with a proper lcusd.net account through /users/login/generate again to create a valid account. In addition, you can also ask an admin to invite a user through the admin panel.", 
                                            null));
                                        res.end();
                                    }
                                });
                            } else if (doesExist && isEmptyUser) {
                                // fill the user if !lcusd.net
                                auth.updateUsertoFilled(data.id, data.name, data.email, data.picture, (success) => {
                                    if (success) {
                                        // IDEA: change variable names?
                                        req.session.access_token = access_token;
                                        req.session.refresh_token = refresh_token;
                                        res.json(auth.generateAuthResponse(true, "Authenticated. Congratulations.", null));
                                        res.end();
                                    } else {
                                        res.json(auth.generateAuthResponse(false, 
                                            "Validated token, but cannot create/login as an account (database error). Please log in with a proper lcusd.net account through /users/login/generate again to create a valid account. In addition, you can also ask an admin to invite a user through the admin panel.", 
                                            null));
                                    }
                                });
                            } else if (doesExist && !isEmptyUser) {
                                // log in the user regularly
                                auth.loginUser(data.id, data.email, data.picture, (success) => {
                                    if (success) {
                                        // IDEA: change variable names?
                                        req.session.access_token = access_token;
                                        req.session.refresh_token = refresh_token;
                                        res.json(auth.generateAuthResponse(true, "Authenticated. Congratulations.", null));
                                        res.end();
                                    } else {
                                        res.json(auth.generateAuthResponse(false, 
                                            "Validated token, but cannot create/login as an account (database error). Please log in with a proper lcusd.net account through /users/login/generate again to create a valid account. In addition, you can also ask an admin to invite a user through the admin panel.", 
                                            null));
                                    }
                                });
                            } else {
                                res.json(auth.generateAuthResponse(false, 
                                    "Validated token, but cannot create/login as an account. Please log in with a proper lcusd.net account through /users/login/generate again to create a valid account. In addition, you can also ask an admin to invite a user through the admin panel.", 
                                    null));
                            }
                        }
                        
                    });
                }
            }
        });
    }
});

router.get('/users/logout', auth.verifyAuthenticated(), (req, res) => {
    if (!req.isAuthenticated) {
        res.json({
            success: false,
            message: "Cannot logout -- you are not signed in."
        });
        res.end();
    } else {
        auth.revokeToken(req.session.access_token, (success) => {
            if (!success) { res.json({ success: false, message: "Cannot logout -- could not revoke token." }).end(); }
            else {
                req.session = null;
                res.json({ success: true, message: "Logged out." }).end();
            }
            
        })
    }
});

module.exports = router;