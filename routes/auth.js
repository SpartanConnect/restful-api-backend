var express = require('express');
var router = express.Router();

router.get('/users/login/generate', (req, res) => {
    res.json({
        success: true,
        message: "This generates a link."
    });
    res.end();
});

router.get('/users/login', (req, res) => {
    res.json({
        success: true,
        message: "This logs the user in."
    });
    res.end();
});

module.exports = router;