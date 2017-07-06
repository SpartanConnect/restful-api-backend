var express = require('express');
var router = express.Router();

var announcements = require('../utilities/announcements');
/* GET home page. */
router.get('/announcements/:id/', function(req, res) {
    console.log('hit router!');
    announcements.getAnnouncementById(req.params.id).then((announcementObject) => {
        console.log('got to announcemenObject returning')
        res.json(announcementObject);
        res.end();
    }).catch(error =>{
        console.log(error);
    });
});

module.exports = router;
