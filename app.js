var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var helmet = require('helmet');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var cors = require('cors');

// Configure environment variables
require('dotenv').config();

// --- Sample Query ---
// var announcementsUtility = require('./utilities/announcements.js');
// announcementsUtility.getAnnouncementById(2).then(function(result) {
//     console.log(result);
// });

// --- Declare API routes here! ---   
var announcements = require('./routes/announcements');
var users = require('./routes/users');
var tags = require('./routes/tags');
var notifications = require('./routes/notifications');
var events = require('./routes/events');
var auth = require('./routes/auth');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(cookieSession({
    name: 'session',
    maxAge: 3 * 24 * 60 * 60 * 1000,         // 3 days
    secure: false,
    httpOnly: true,
    secret: process.env.COOKIE_SECRET,
    keys: [process.env.COOKIE_SECRET]
}));
app.use(helmet());

var corsOptions = {
    origin: process.env.FRONTEND_URL
}

// Protect POST requests from external sources
app.post('*', cors(corsOptions));

// --- Route API calls here! ---
app.use('/api', cors(corsOptions), auth);
app.use('/api', announcements);
app.use('/api', users);
app.use('/api', tags);
app.use('/api', notifications);
app.use('/api', events);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
});

module.exports = app;