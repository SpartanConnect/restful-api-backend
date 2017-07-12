var database = require('./database');

exports.getNotifications = (id, type, userId, startDate, endDate) => {
    var statement = 'SELECT * FROM notifications';
    var statementParameters = {};

    if(typeof id != 'undefined') { statementParameters.id = id; };
    if(typeof type != 'undefined') { statementParameters.type = id; };
    if(typeof userId != 'undefined') { statementParameters.userId = userId; };

    if(Object.keys(statementParameters).length != 0) {
        statement += ' WHERE ';
        Object.keys(statementParameters).forEach(function(item, index) {
            if(index != 0) { statement += ' AND '; }
            statement += item + ' = :' + item;
        });
    };

    if (typeof startDate !== 'undefined') {
        if (Object.keys(statementParameters).length !== 0) {
            statement += ' AND ';
        }
        statement += ' WHERE timeCreated >= :startDate';
        statementParameters.startDate = startDate;
    };

    if(typeof startDate != 'undefined' && typeof endDate != 'undefined') {
        if (Object.keys(statementParameters).length === 0) statement += " WHERE ";
        else statement += ' AND ';
        statement += 'NOT ( (timeCreated > :endDate) OR (timeViewed < :startDate) )';
        statementParameters.startDate = startDate;
        statementParameters.endDate = endDate;
    };

    return database.query(statement, statementParameters);
}

exports.getNotificationById = (id) => {
    return database.query('SELECT * FROM notifications WHERE id=:id', {id:id})
}

module.exports = exports;
