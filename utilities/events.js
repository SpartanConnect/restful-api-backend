var database = require('./database');

exports.getEvents = (id, type, announcementId, startTimestamp, endTimestamp) => {
    var statement = 'SELECT * FROM events';
    var statementParameters = {};

    console.log('hit get event utility function');
    if(typeof id != 'undefined') { statementParameters.id = id; };
    if(typeof type != 'undefined') { statementParameters.type = type; };
    if(typeof announcementId != 'undefined') { statementParameters.announcementId = announcementId; };

    if(Object.keys(statementParameters).length != 0) {
        statement += ' WHERE ';
        Object.keys(statementParameters).forEach(function(item, index) {
            if(index != 0) { statement += ' AND '; }
            statement += item + ' = :' + item;
        });
    };

    if(typeof startTimestamp != 'undefined' && typeof endTimestamp != 'undefined') {
        if (Object.keys(statementParameters).length === 0) statement += " WHERE ";
        else statement += ' AND ';
        statement += 'NOT ( (startTimestamp > :endTimestamp) OR (endTimestamp < :startTimestamp) )';
        statementParameters.startTimestamp = startTimestamp;
        statementParameters.endTimestamp = endTimestamp;
    };

    //console.log(statement,'where type = ', type);
    //console.log('these are the statementParameters\n', statementParameters);

    return database.query(statement+';', statementParameters);

}

exports.getEventById = (id) => {
    return database.query('SELECT * FROM events WHERE id=:id',{id:id})
}

module.exports = exports;
