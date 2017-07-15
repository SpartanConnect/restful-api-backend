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
                    callback(true, (data.length === 1 ? true : false), (data[0].gid === ""), res);
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
        role: exports.roles.ROLE_UNAPPROVED
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
        console.log(data);
        callback(data.affectedRows);
    });
}

exports.loginUser = function(gid, email, profileUrl, callback) {
    database.query(
        "UPDATE users SET profileUrl = :profileUrl, lastLogin = CURRENT_TIMESTAMP, email = :email WHERE gid = :gid", {
        gid: gid,
        email: email,
        profileUrl: profileUrl
    }).then((data) => {
        callback(data.affectedRows);
    });
}

// Implicit enum for roles
exports.roles = {
    ROLE_SUPERADMIN: 0,
    ROLE_MAINTENANCE: 1,
    ROLE_ADMIN: 2,
    ROLE_TEACHER: 3,
    ROLE_UNAPPROVED: 4
}

// Utilize exports instead of module.exports every time
module.exports = exports;
