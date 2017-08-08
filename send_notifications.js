#!/usr/bin/env node
require('dotenv').config();
var request = require('request');
var db = require('./utilities/database');
var expoData = [];

const expoPushOptions = {
    hostname: 'exp.host',
    port: 80,
    path: '/--/api/v2/push/send',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

console.log("[notify] Script has launched.");
console.log("[notify:collect] Collecting information from data store.");

// Scheduled to run every day on 8:00;
db.query("SELECT * FROM expo_notifications").then((users) => {
    console.log("[notify:collect] Collected data. There are currently %d users.", users.length);
    // Bundle the announcements by 100s.
    for (let i = 0; i <= Math.floor(users.length / 100); i++) {
        console.log("[notify:sort] Selecting users from ids %d to %d.", i * 100 + 1, (i + 1) * 100);
        expoData[i] = [];           // init new array
        for (let j = 1; j <= 100; j++) {
            expoData[i].push({
                to: users[j + (i*100) - 1]['token'],
                sound: "default",
                body: "Good morning Spartans and here are your announcements!",
                title: "Daily Report",
                badge: 0
            });
            if (j + (i*100) >= users.length) {
                console.log("[notify:sort] Finished sorting users from %d to %d. Total length of set: %d", i * 100 + 1, (i + 1) * 100, expoData[i].length);
                break;
            } else if (j == 100) {
                console.log("[notify:sort] Finished sorting users from %d to %d. Total length of set: %d", i * 100 + 1, (i + 1) * 100, expoData[i].length);
            }
        }
    }
    console.log("[notify] Data has been sorted.");
    console.log("[notify:post] Sending data to Expo.");

    for (let [index, body] of expoData.entries()) {
        request({
            url: 'https://exp.host/--/api/v2/push/send',
            method: 'POST',
            json: true,
            body: body
        }, (err, res, bd) => {
            console.log("[notify:post] Batch %d of %d completed.", index + 1, expoData.length);
            if (index + 1 === expoData.length) {
                console.log("[notify] Notifications have been delivered.");
                process.exit();
            }
        });
    }

});

