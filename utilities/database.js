var databaseConnection = require('./../database-development.js'); //eslint-disable-line spellcheck/spell-checker

databaseConnection.config.queryFormat = function (query, values) {
    if (!values) return query;
    return query.replace(/\:(\w+)/g, function (txt, key) { //eslint-disable-line no-useless-escape
        if (values.hasOwnProperty(key)) {return this.escape(values[key]);}
        return txt;
    }.bind(this));
};

exports.query = function(query, args) {
    return new Promise(function(resolve, reject) {
        //console.log(query);
        databaseConnection.query(query, args, function(error, result) {
            if(error) {
                reject (error);
            } else {
                resolve (result);
            }
        });
    });
};

module.exports = exports;
