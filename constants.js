var DATABASE={
    SQL_DB_HOST:"localhost",
    SQL_DB_PORT:"3307",
    //The password for the SQL db should be set in secret.js
    SQL_DB_USER:"SCWebApp",
    SQL_DB_NAME:"spartanconnect",
};

//Export the SQL info (except for pw, of course)
module.exports=DATABASE;
