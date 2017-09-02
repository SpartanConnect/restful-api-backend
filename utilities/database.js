var databaseConnection = require('./../database-development.js'); //eslint-disable-line spellcheck/spell-checker

databaseConnection.config.queryFormat = function (query, values) {
    if (!values) return query;
    return query.replace(/\:(\w+)/g, function (txt, key) { //eslint-disable-line no-useless-escape
        if (values.hasOwnProperty(key)) {return this.escape(values[key]);}
        return txt;
    }.bind(this));
};

/**
 * @param {string} query A string which is the query that will be executed. To substitute a value from args, add `:KEY_NAME`, and make sure to have a matching key name in the argument object.
 * @param {Object} args An object which has keys with the same names as the open spots in the query.
 * @returns {Promise}
 */
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
