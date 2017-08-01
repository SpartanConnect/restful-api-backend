var enums = require('./enums'); //eslint-disable-line spellcheck/spell-checker
//var _ = require('underscore');

var errors = enums.errors;

/**
 * This function takes parameters and packages them into a response object for maximum flexibility.
 * @param {boolean} success A boolean representing whether or not the action was was completed successfully.
 * @param {number} id A numberical result identifier. Derive from the error enum.
 * @param {string} name A constant-style name for the error, for use when testing for or specifiying an error.
 * @param {string} description A human readable description for the error. This is taken from by the web frontend and displayed to the user in a shackbar.
 */
function responseBuilder(success, id, name, description) {
    return ({success: success, id: id, name: name, description: description});
}

/**
 * This function takes in a result id and an response object, packages them, and sends them to the client.
 * @param {number} id The id of the error. Derive this from the error enum. Do not directly type in a value.
 * @param {Object} res The response object passed from the router.
 */
exports.send = function (id, res) {
    /**
     * Append this string to error in which users are trying to perform an action, but don't have sufficient privileges.
     * @var adminPerms {String}
     */
    let adminPerms = ' If you believe this is an error, please contact an administrator.';
    /**
     * Append this string to errors which the user should contact an admin about, such as unknown errors.
     * 
     * **Do not use this string for permissions errors. Use `adminPerms` instead.**
     * @var  {String} adminError
     */
    let adminError = ' Please contact an administrator regarding this error.';
    switch (id) {
        // Announcement creation errors. Block  100X
        case errors.ANNOUNCEMENT_CREATE_SUCCESS:
            res.json(responseBuilder(true, errors.ANNOUNCEMENT_CREATE_SUCCESS, 'ANNOUNCEMENT_CREATE_SUCCESS', 'The announcement that was submitted was successfully created.'));
            res.end();
            break;
        case errors.ANNOUNCEMENT_CREATE_FAILURE:
            res.json(responseBuilder(false, errors.ANNOUNCEMENT_CREATE_FAILURE, 'ANNOUNCEMENT_CREATE_FAILURE', 'The creation of your announcement resulted in an unknown error.' + adminError));
            res.end(); 
            break;
        case errors.ANNOUNCEMENT_CREATE_INCOMPLETE:
            res.json(responseBuilder(false, errors.ANNOUNCEMENT_CREATE_INCOMPLETE, 'ANNOUNCEMENT_CREATE_INCOMPLETE', 'The announcement data that was submitted was insufficient to create an announcement. A title, description, start date, end date, at least one tag, and a status.'));
            res.end();
            break;
        case errors.ANNOUNCEMENT_CREATE_FORBIDDEN:
            res.json(responseBuilder(false, errors.ANNOUNCEMENT_CREATE_FORBIDDEN, 'ANNOUNCEMENT_CREATE_FORBIDDEN', 'You do not have sufficient permissions to create announcements.' + adminPerms));
            res.end();
            break;
            
        // Announcement update errors. Block 101X
        case errors.ANNOUNCEMENT_UPDATE_SUCCESS:
            res.json(responseBuilder(true, errors.ANNOUNCEMENT_UPDATE_SUCCESS, 'ANNOUNCEMENT_UPDATE_SUCCESS', 'The changes that were submitted were successfully applied to the specified announcement.'));
            res.end();
            break;
        case errors.ANNOUNCEMENT_UPDATE_FAILURE:
            res.json(responseBuilder(false, errors.ANNOUNCEMENT_UPDATE_FAILURE, 'ANNOUNCEMENT_CREATE_FAILURE', 'The updating of the specified announcement encountered an unexpected error.' + adminError));
            res.end();
            break;
        case errors.ANNOUNCEMENT_UPDATE_INVALID:
            res.json(responseBuilder(false, errors.ANNOUNCEMENT_UPDATE_INVALID, 'ANNOUNCEMENT_UPDATE_INVALID', 'The specified announcement ID was invalid. The value must be a positive integer.'));
            res.end();
            break;
        case errors.ANNOUNCEMENT_UPDATE_FORBIDDEN:
            res.json(responseBuilder(false, errors.ANNOUNCEMENT_UPDATE_FORBIDDEN, 'ANNOUNCEMENT_UPDATE_FORBIDDEN', 'You do not have sufficient permissions to edit the specified announcement.' + adminPerms));
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
            res.json(responseBuilder(false, errors.TAG_CREATE_FAILURE, 'TAG_CREATE_FAILURE', 'The creation of the announcement encountered an unknown error.' + adminError));
            res.end();
            break;
        case errors.TAG_CREATE_INCOMPLETE:
            res.json(responseBuilder(false, errors.TAG_CREATE_INCOMPLETE, 'TAG_CREATE_INCOMPLETE', 'The information submitted was insufficient to create an announcement.')); // TODO: Add more details about what is necessary
            res.end();
            break;
        case errors.TAG_CREATE_FORBIDDEN:
            res.json(responseBuilder(false, errors.TAG_CREATE_FORBIDDEN, 'TAG_CREATE_FORBIDDEN', 'You do not have sufficient privileges to create tags.' + adminPerms));
            res.end();
            break;

        //Tag updating errors. BLock 111X
        case errors.TAG_UPDATE_SUCCESS:
            res.json(responseBuilder(true, errors.TAG_UPDATE_SUCCESS, 'TAG_UPDATE_SUCCESS', 'The submitted updates were successfully applied to the specified tag.'));
            res.end();
            break;
        case errors.TAG_UPDATE_FAILURE:
            res.json(responseBuilder(false, errors.TAG_UPDATE_FAILURE, 'TAG_UPDATE_FAILURE', 'The updating of the specified tag encountered an unknown error.' + adminError));
            res.end();
            break;
        case errors.TAG_UPDATE_INVALID:
            res.json(responseBuilder(false, errors.TAG_UPDATE_INVALID, 'TAG_UPDATE_INVALID', 'The specified tag ID to update is invalid. A tag ID must be a positive integer.'));
            res.end();
            break;
        case errors.TAG_UPDATE_FORBIDDEN:
            res.json(responseBuilder(false, errors.TAG_UPDATE_FORBIDDEN, 'TAG_UPDATE_FORBIDDEN', 'You do not have sufficient privileges to edit the specified announcement.' + adminPerms));
            res.end();
            break;
        
        // Tag application errors. To be used when the user is applying tags to an announceent. Block 112X
        case errors.TAG_APPLY_SUCCESS:
            res.json(responseBuilder(true, errors.TAG_APPLY_SUCCESS, 'TAG_UPDATE_SUCCESS', 'The application of the specified tag to the specified announcement was successful.'));
            res.end();
            break;
        case errors.TAG_APPLY_FAILURE:
            res.json(responseBuilder(false, errors.TAG_UPDATE_FAILURE, 'TAG_UPDATE_FAILURE', 'The application of the specified tag to the specified announcement encountered an unknown error.' + adminError));
            res.end();
            break;
        case errors.TAG_APPLY_INVALID: 
            res.json(responseBuilder(false, errors.TAG_APPLY_INVALID, 'TAG_APPLY_INVALID', 'The specified tag ID to apply is invalid. A tag ID must be a positive integer.'));
            res.end();
            break;
        case errors.TAG_APPLY_FORBIDDEN:
            res.json(responseBuilder(false, errors.TAG_APPLY_FORBIDDEN, 'TAG_APPLY_FORBIDDEN', 'You do not have sufficient privileges to apply the specified tag to the specified announcement.' + adminPerms));
            res.end();
            break;
        
        // Tag approval errors. Block 113X
        case errors.TAG_APPROVE_SUCCESS:
            res.json(responseBuilder(true, errors.TAG_APPROVE_SUCCESS, 'TAG_APPROVE_SUCCESS', 'The approval of the specified announcement\'s tags was successful.'));
            res.end();
            break;
        case errors.TAG_APPROVE_FAILURE:
            res.json(responseBuilder(false, errors.TAG_APPROVE_FAILURE, 'TAG_APPROVE_FAILURE', 'The approval of the specified announcement\'s tags encountered an unknown error.' + adminError));
            res.end();
            break;
        case errors.TAG_APPROVE_FORBIDDEN:
            res.json(responseBuilder(false, errors.TAG_APPROVE_FORBIDDEN, 'TAG_APPROVE_FORBIDDEN', 'You do not have sufficient privileges to approve the specified announcements tags.' + adminPerms));
            res.end();
            break;
        
        // Tag removal errors. Block 114X
        case errors.TAG_REMOVE_SUCCESS:
            res.json(responseBuilder(true, errors.TAG_REMOVE_SUCCESS, 'TAG_REMOVE_SUCCESS', 'The removal of the specified tag from the specified announcement was successful.'));
            res.end();
            break;
        case errors.TAG_REMOVE_FAILURE:
            res.json(responseBuilder(false, errors.TAG_REMOVE_FAILURE, 'TAG_REMOVE_FAILURE', 'The removal of the specified tag encountered an unknown error.'));
            res.end();
            break;
        //The default catch all that we don't want to get to ever.
        default:
            res.json(responseBuilder(false, errors.OTHER_ERROR, 'OTHER_ERROR', 'The requested action encountered an unexpected error.' + adminError));
            res.end();
            break;
    }
};


module.exports = exports;