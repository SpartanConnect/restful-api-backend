var enums = require('./enums'); //eslint-disable-line spellcheck/spell-checker
//var _ = require('underscore');

var errors = enums.errors;

function responseBuilder (success, id, name, description) {
    return ({success: success, id:id, name:name, description:description});
}

exports.send = function (name, res) {
    switch (name) {
        // Announcement creation errors. Block  100X
        case errors.ANNOUNCEMENT_CREATE_SUCCESS:
            res.json(responseBuilder(true, errors.ANNOUNCEMENT_CREATE_SUCCESS, 'ANNOUNCEMENT_CREATE_SUCCESS', 'The announcement that was submitted was successfully created.'));
            res.end();
            break;
        case errors.ANNOUNCEMENT_CREATE_FAILURE:
            res.json(responseBuilder(false, errors.ANNOUNCEMENT_CREATE_FAILURE, 'ANNOUNCEMENT_CREATE_FAILURE', 'The creation of your announcement resulted in an unknown error. Please contact an administrator regarding this error.'));
            res.end();
            break;
        case errors.ANNOUNCEMENT_CREATE_INCOMPLETE:
            res.json(responseBuilder(false, errors.ANNOUNCEMENT_CREATE_INCOMPLETE, 'ANNOUNCEMENT_CREATE_INCOMPLETE', 'The announcement data that was submitted was insufficient to create an announcement. A title, description, start date, end date, at least one tag, and a status.'));
            res.end();
            break;
        case errors.ANNOUNCEMENT_CREATE_FORBIDDEN:
            res.json(responseBuilder(false, errors.ANNOUNCEMENT_CREATE_FORBIDDEN, 'ANNOUNCEMENT_CREATE_FORBIDDEN', 'You do not have sufficient permissions to create announcements. If you believe this is an error, contact an administrator.'));
            res.end();
            break;
            
        // Announcement update errors. Block 101X
        case errors.ANNOUNCEMENT_UPDATE_SUCCESS:
            res.json(responseBuilder(true, errors.ANNOUNCEMENT_UPDATE_SUCCESS, 'ANNOUNCEMENT_UPDATE_SUCCESS', 'The changes that were submitted were successfully applied to the specified announcement.'));
            res.end();
            break;
        case errors.ANNOUNCEMENT_UPDATE_FAILURE:
            res.json(responseBuilder(false, errors.ANNOUNCEMENT_UPDATE_FAILURE, 'ANNOUNCEMENT_CREATE_FAILURE', 'The updating of the specified announcement encountered an unexpected error. Please contact an administrator regarding this error.'));
            res.end();
            break;
        case errors.ANNOUNCEMENT_UPDATE_INVALID:
            res.json(responseBuilder(false, errors.ANNOUNCEMENT_UPDATE_INVALID, 'ANNOUNCEMENT_UPDATE_INVALID', 'The announcement ID that was provided was invalid. The value must be a positive, non-zero integer.'));
            res.end();
            break;
        case errors.ANNOUNCEMENT_UPDATE_FORBIDDEN:
            res.json(responseBuilder(false, errors.ANNOUNCEMENT_UPDATE_FORBIDDEN, 'ANNOUNCEMENT_UPDATE_FORBIDDEN', 'You do not have sufficient permissions to edit the specified announcement. If you believe this is an error, contact an administrator.'));
            res.end();
            break;
        case errors.ANNOUNCEMENT_UPDATE_EMPTY:
            res.json(responseBuilder(false, errors.ANNOUNCEMENT_UPDATE_EMPTY, 'ANNOUNCEMENT_UPDATE_EMPTY', 'No applicable values were provided to update. You may update an announcement\'s title, description, startDate, endDate, status, or tags.'));
            res.end();
            break;
        case errors.ANNOUNCEMENT_UPDATE_NO_CHANGES:
            res.json(responseBuilder(false, errors.ANNOUNCEMENT_UPDATE_NO_CHANGES, 'ANNOUNCEMENT_UPDATE_NO_CHANGES', 'The submitted changes did not apply to any announcements. This may be due to an announcement ID that does not reference an existing announcement or that the values that were submitted were the same as those in the existing announcement.'));
            res.end();
            break;

        //Tag creation errors. Block 110X
        case errors.TAG_CREATE_SUCCESS:
            res.json(responseBuilder(true, errors.TAG_CREATE_SUCCESS, 'TAG_CREATE_SUCCESS', 'The tag that was submitted was created successfully.'));
            res.end();
            break;
        case errors.TAG_CREATE_FAILURE:
            res.json(responseBuilder(false, errors.TAG_CREATE_FAILURE, 'TAG_CREATE_FAILURE', 'The creation of the announcement encountered an unknown error. Please contact an administrator regarding this error.'));
            res.end();
            break;
        case errors.TAG_CREATE_INCOMPLETE:
            res.json(responseBuilder(false, errors.TAG_CREATE_INCOMPLETE, 'TAG_CREATE_INCOMPLETE', 'The information submitted was insufficient to create an announcement.')); // TODO: Add more details about what is necessary
            res.end();
            break;
        default:
            res.json(responseBuilder(false, errors.OTHER_ERROR, 'OTHER_ERROR', 'The requested action encountered an unexpected error. Please contact an administrator regarding this error.'));
            break;
    }
};


module.exports = exports;