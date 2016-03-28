'use strict';
var fs = require('fs');
var path = require('path');
var url = require('url');
var express = require('express');
var router = express.Router();


const engines = ['chromium', 'edge', 'webkit', 'gecko'];

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

function readJSON() {
    const jsonPath = path.join(__dirname, '..', 'data', 'data.json');
    return readFile(jsonPath).then((text) => {
        const data = JSON.parse(text);
        return data;
    });
}

function groupByHost(data) {
    const hosts = [];
    const hostToEntry = new Map();
    for (const entry of data) {
        const urlString = entry.url;
        const host = (urlString === '') ? '' : url.parse(urlString).host;
        if (!hostToEntry.has(host)) {
            hostToEntry.set(host, { host: host, urls: [] });
            hosts.push(host);
        }
        hostToEntry.get(host).urls.push(entry);
    }

    const dataByHost = [];
    for (const host of hosts) {
        dataByHost.push(hostToEntry.get(host));
    }

    return dataByHost;
}

router.get(/^\/(.+)$/, function(req, res, next) {
    const urlString = req.param(0);

    readJSON().then((data) => {
        const urlData = data.filter((entry) => {
            return urlString === entry.url;
        });

        res.render('status', {
            title: urlString + ' - Indexes of Platform Status',
            h1: urlString,
            engines: engines,
            data: groupByHost(urlData),
            isStandalonePage: true,
        });
    }).catch((err) => {
        next(err);
    });
});

router.get('/', function(req, res, next) {
    readJSON().then((data) => {
        res.render('status', {
            title: 'Indexes of Platform Status',
            h1: 'Indexes',
            engines: engines,
            data: groupByHost(data),
            isStandalonePage: false,
        });
    }).catch((err) => {
        next(err);
    });
});

module.exports = router;
