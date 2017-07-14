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

var authClient = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CLIENT_REDIRECT_URL
);

exports.generateConsentUrl = function() {
    
    return authClient.generateConsentUrl({
        access_type: 'offline',
        scope: []                       // Google scopes
    });
}

// Utilize exports instead of module.exports every time
module.exports = exports;
