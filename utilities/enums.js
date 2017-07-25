exports.users = {
    RANK_SUPERADMIN: 0,
    RANK_MAINTENANCE: 1,
    RANK_ADMIN: 2,
    RANK_TEACHER: 3,
    RANK_UNAPPROVED: 4
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
    
    
    ANNOUNCEMENT_CREATE_SUCCESS: 1000,
    ANNOUNCEMENT_CREATE_FAILURE: 1001,
    ANNOUNCEMENT_CREATE_INCOMPLETE: 1002, // Do we add a body to ensure that it isn't confused with incomplete connections?
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

exports.status = {
    PENDING: 0,
    APPROVED: 1,
    REJECTED: 2,
    REMOVED: 3
};

module.exports = exports;