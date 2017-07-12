var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mysql = require('mysql');

// --- Sample Query ---
// var announcementsUtility = require('./utilities/announcements.js');
// announcementsUtility.getAnnouncementById(2).then(function(result) {
//     console.log(result);
// });

// --- Declare API routes here! ---   
var announcements = require('./routes/announcements');
var users = require('./routes/users');
var tags = require('./routes/tags');
var notifications = require('./routes/notifications')


var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// --- Route API calls here! ---
app.use('/api', announcements);
app.use('/api', users);
app.use('/api', tags);
app.use('/api', notifications);

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
