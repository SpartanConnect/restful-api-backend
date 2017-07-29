/**
 * This is an enum of user ranks.
 * @enum {number}
 * @readonly
 */
exports.users = {
    RANK_SUPERADMIN: 0,
    RANK_MAINTENANCE: 1,
    /**
     * Rank admin is the rank for the user when they can approve their own announcements, and approve others announcements as long as they are at a lower rank than them.
     * 
     * However, `this markdown` will not work.
     */
    RANK_ADMIN: 2,
    RANK_TEACHER: 3,
    RANK_UNAPPROVED: 99
};

/* function code (superblock, block, type, number) {
    let code;
    let subBlock;
    
    code = superBlock * 1000;
    
    switch (block) {
    case 'announcement': 
        subBlock = 0;
        break;
    case 'tag':
        subBlock = 1;
        break;
    case 'user':
        subBlock = 2;
        break;
    default:
        subBlock = 9;
    }

    switch (type) {
    case 'create'
    }
    
    return code;
} */

/**
 * This is the enum which has all of the response codes in it.
 * @readonly
 * @enum {number}
 */
exports.errors = {
    
    AUTH_SUCCESS_LOGIN: 100,
    AUTH_NOT_LOGGED_IN: 101,
    AUTH_INVALID_AUTH_CODE: 102,
    AUTH_EXPIRED_TOKEN: 103,
    AUTH_WRONG_ISSUER: 104,
    AUTH_WRONG_CLIENT_ID: 105,
    AUTH_NETWORK_UNAVAILABLE: 106,
    AUTH_COULD_NOT_RETRIEVE: 107,
    AUTH_ACCOUNT_CREATION_FAILURE: 108,
    AUTH_INCORRECT_DOMAIN: 109,
    AUTH_IRREVOCABLE_LOGOUT: 110,
    AUTH_SUCCESS_LOGOUT: 200,
    
    /**The submission of the announcement was successful
    This is for use when the user wants to create an announcement and all parts of its creation proceed (i.e. announcement creation, tag application) correctly. */    
    /**
     * Pass this response when the creation of an announcement with its tags was successful.
     */
    ANNOUNCEMENT_CREATE_SUCCESS: 1000,
    /**
     * Pass this response when the creation of an announcement's content failed.
     * 
     * If the application of the announcement's tags causes the problem, use **This should work**
     */
    ANNOUNCEMENT_CREATE_FAILURE: 1001,
    /**
     * Pass this when the creation of an announcement is unsuccessful due to an incomplete announcement object being submitted.
     * 
     * An announcement object must contain a title, description, start date, end, date, and a status. A status should be added by the backend, not passed by the user.
     */
    ANNOUNCEMENT_CREATE_INCOMPLETE: 1002, // Do we add a body to ensure that it isn't confused with incomplete connections?
    /**
     * Pass this when the user does not have sufficient privileges to create announcements.
     * 
     * If the user is able to create announcements, but is unable to request the specified tags, use `TAG_APPLY_FORBIDDEN`
     */
    ANNOUNCEMENT_CREATE_FORBIDDEN: 1003,

    ANNOUNCEMENT_UPDATE_SUCCESS: 1010,
    ANNOUNCEMENT_UPDATE_FAILURE: 1011,
    ANNOUNCEMENT_UPDATE_INVALID: 1012,
    ANNOUNCEMENT_UPDATE_FORBIDDEN: 1013,
    ANNOUNCEMENT_UPDATE_EMPTY: 1014, //For empty bodies.
    ANNOUNCEMENT_UPDATE_NO_CHANGES: 1015, //For changes that don't affect anything

    //ANNOUNCEMENT_APPROVE_SUCCESS: 1020, //Not useful yet. Implement when we get to separate approve handling.
    //ANNOUNCEMENT_APPROVE_USER_FORBIDDEN:1021,
    
    
    
    TAG_CREATE_SUCCESS: 1100,
    TAG_CREATE_FAILURE: 1101,
    TAG_CREATE_INCOMPLETE: 1102,
    TAG_CREATE_FORBIDDEN: 1103,

    TAG_UPDATE_SUCCESS: 1110,
    TAG_UPDATE_FAILURE: 1111,
    TAG_UPDATE_INVALID: 1112,
    TAG_UPDATE_FORBIDDEN: 1113,

    TAG_APPLY_SUCCESS: 1120,
    TAG_APPLY_FAILURE: 1121,
    TAG_APPLY_INVALID: 1122,
    TAG_APPLY_FORBIDDEN: 1123,

    TAG_APPROVE_SUCCESS:1130,
    TAG_APPROVE_FAILURE:1131,
    TAG_APPROVE_FORBIDDEN: 1132,

    TAG_REMOVE_SUCCESS: 1140,
    TAG_REMOVE_FAILURE: 1141
};

/**
 * This enum has the statuses that an announcement can have.
 * @enum {number}
 */
exports.status = {
    PENDING_ADMIN: 0,
    APPROVED_ADMIN: 1,
    REJECTED_ADMIN: 2,
    REMOVED_TEACHER: 3,
    APPROVED_TEACHER: 4,
    REJECTED_TEACHER: 5,
    REMOVED_STUDENT: 6
};

module.exports = exports;