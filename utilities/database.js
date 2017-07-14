var databaseConnection = require('./../database-development.js');
var mysql = require('mysql');

databaseConnection.config.queryFormat = function (query, values) {
  if (!values) return query;
  return query.replace(/\:(\w+)/g, function (txt, key) {
    if (values.hasOwnProperty(key)) {
      return this.escape(values[key]);
    }
    return txt;
  }.bind(this));
};

exports.query = function(query, args) {
    return new Promise(function(resolve) {
        databaseConnection.query(query, args, function(error, result) {
            if(error) {
                throw error;
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = exports;
