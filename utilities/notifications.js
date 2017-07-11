var database = require('./database');

exports.getNotifications = (id, type, userId, timeCreated, timeViewed) => {

}

exports.getNotificationById = (id) => {
    return database.query('SELECT * FROM notifications WHERE id=:id', {id:id})
}

module.exports = exports;
