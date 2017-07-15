var databaseConnection = require('./../database-development.js');

databaseConnection.config.queryFormat = function (query, values) {
    if (!values) return query;
    return query.replace(/\:(\w+)/g, function (txt, key) { //eslint-disable-line no-useless-escape
        if (values.hasOwnProperty(key)) {return this.escape(values[key]);}
        return txt;
    }.bind(this));
};

exports.query = function(query, args) {
    return new Promise(function(resolve) {
        //console.log(query);
        databaseConnection.query(query, args, function(error, result) {
            if(error) {
                throw error;
            } else {
                resolve(result);
            }
        });
    });
};

module.exports = exports;
