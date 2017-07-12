var express = require('express');
var router = express.Router();

var eventUtilities = require('../utilities/events');

function eventRequestHandler (req, res) {
    //console.log('hit router');
    eventUtilities.getEvents((req.query.id ? req.query.id : req.params.id),
                             req.query.type,
                             (req.query.announcementId ? req.query.announcementId : req.params.announcementId),
                             req.query.startTimestamp,
                             req.query.endTimestamp).then((eventResults) => {
        //console.log('completed get event function');
        //console.log('this should be the data returned', eventResults);
        if(typeof eventResults==='undefined') {
            res.json([]);
        }
        else {
            res.json(eventResults);
        }
        res.end();
    }).catch(error => {
        console.log(error);

    });
}

router.get('/events/', eventRequestHandler);

router.get('/events/:id', eventRequestHandler);

router.get('/deadlines/', (req, res) => {
    req.query.type = 1;
    eventRequestHandler(req, res);
});

router.get('/deadlines/:id', (req, res) => {
    req.query.type = 1;
    eventRequestHandler(req, res);
});

module.exports = router;
module.exports.eventRequestHandler = eventRequestHandler;
