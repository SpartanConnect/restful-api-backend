// Utility functions for authentication

// Kevin (July 2, 2017) 10:50 PM
// Instead of writing down functions, I will add some resources below
// to help us guide how we will approach this

// Google's Guide to OAuth2
// https://developers.google.com/identity/protocols/OAuth2WebServer

// OpenID
// https://developers.google.com/identity/protocols/OpenIDConnect

// Redirection?
// http://expressjs.com/en/4x/api.html#res.redirect

// node.js googleapis
// http://google.github.io/google-api-nodejs-client/19.0.0/index.html

// Considerations: will our application store state in the backend?
// Or will this be stored in the frontend?

// The backend is more secure, but is it really the role of an API backend
// to manage state and sessions?

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var database = require('./database');
var enums = require('./enums');

var authClient = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CLIENT_REDIRECT_URL
);

// How we will retrieve profile information
var authGetter = google.oauth2({
    auth: authClient,
    version: 'v2'
})

exports.generateConsentUrl = function() {
    return authClient.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']               // Google scopes
    });
}

exports.validateAuthCode = function(code, callback) {
    authClient.getToken(code, (err, tokens) => {
        callback(err, tokens);
    });
}

exports.generateAuthResponse = function(success, message, data = null) {
    return {success: success, message: message, data: data};
}

exports.checkIfUserExists = function(access_token, refresh_token, callback) {
    authClient.setCredentials({
        access_token: access_token,
        refresh_token: refresh_token
    });
    authGetter.userinfo.v2.me.get((err, res) => {
        if (err) { callback(false, null) }
        else {
            database.query("SELECT * FROM users WHERE gid = :gid OR email = :email", {
                gid: res.id,
                email: res.email
            }).then((data) => {
                if (!data.length) callback(true, false, false, res);
                else {
                    callback(true, (data.length === 1 ? true : false), (data[0].gid === "" || data[0].gid === null), res);
                }
            });
        }
    });
}

exports.generateFilledUser = function(gid, name, email, profileUrl, callback) {
    database.query(
        "INSERT INTO users (name, email, rank, lastLogin, gid, profileUrl) VALUES (:name, :email, :role, CURRENT_TIMESTAMP, :gid, :profileUrl)", {
        name: name,
        email: email,
        gid: gid,
        profileUrl: profileUrl,
        role: enums.users.RANK_TEACHER
    }).then((data) => {
        callback(data.affectedRows);
    });
}

exports.updateUsertoFilled = function(gid, name, email, profileUrl, callback) {
    // Make filled by email (not gid)
    database.query(
        "UPDATE users SET name = :name, gid = :gid, profileUrl = :profileUrl, lastLogin = CURRENT_TIMESTAMP WHERE email = :email", {
        name: name,
        email: email,
        gid: gid,
        profileUrl: profileUrl
    }).then((data) => {
        callback(data.affectedRows);
    });
}

exports.loginUser = function(gid, email, profileUrl, callback) {
    database.query(
        'UPDATE users SET profileUrl = :profileUrl, lastLogin = CURRENT_TIMESTAMP, email = :email WHERE gid = :gid', {
            gid: gid,
            email: email,
            profileUrl: profileUrl
        }).then((data) => {
        callback(data.affectedRows);
    });
}

// Verification middleware -- takes in a role parameter
exports.verifyAuthenticated = function () {
    //console.log('hit verify auth');
    return function (req, res, next) {
        if (req.session.access_token) {
            authClient.setCredentials({
                access_token: req.session.access_token,
                refresh_token: req.session.refresh_token
            });
            authGetter.userinfo.v2.me.get((err, googleResult) => {
                if (err) { 
                    res.status(403).json({
                        success: false,
                        isAuthenticated: false,
                        error: "Invalid login. Check your login credentials or your internet connection."
                    }).end();
                }
                else {
                    database.query("SELECT * FROM users WHERE gid = :gid", {
                        gid: googleResult.id,
                    }).then((dbResult) => {
                        if (!dbResult.length) {
                            // Not found in database
                            res.status(403).json({
                                success: false,
                                isAuthenticated: false,
                                error: "Invalid login. (user does not exist in backend)"
                            }).end();
                        }
                        else {
                            // success!
                            req.user = {};
                            req.isAuthenticated = true;
                            req.user.id = dbResult[0].id;
                            req.user.gid = googleResult.id;
                            req.user.email = googleResult.email;
                            req.user.name = googleResult.name;
                            req.user.handle = dbResult[0].handle;
                            req.user.rank = dbResult[0].rank;
                            req.user.lastLogin = dbResult[0].lastLogin;
                            req.user.profileUrl = dbResult[0].profileUrl;
                            return next();
                        }
                    });
                }
            });
        } else {
            // No access token found
            res.status(403).json({
                success: false,
                isAuthenticated: false,
                error: "User has not logged in."
            }).end();
        }
    }
}

exports.revokeToken = function (access_token, cb) {
    authClient.revokeToken(access_token, (err, body) => {
        if (err) { cb(false); }
        else { cb(true); }
    });
}

// Utilize exports instead of module.exports every time
module.exports = exports;
