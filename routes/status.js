'use strict';
var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();

function readFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', (err, text) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(text);
        });
    });
}

router.get('/', function(req, res, next) {
  const jsonPath = path.join(__dirname, '..', 'data', 'data.json');
  readFile(jsonPath).then((text) => {
    const data = JSON.parse(text);
    const engines = ['chromium', 'edge', 'webkit', 'gecko'];

    res.render('status', {
        title: 'Indexes of Platform Status',
        engines: engines,
        data: data,
    });
  }).catch((err) => {
    next(err);
  });
});

module.exports = router;
