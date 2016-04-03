'use strict';
var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();


const engines = ['chromium', 'edge', 'webkit', 'gecko'];

/**
 * @param filePath {string}
 * @returns Promise<string>
 */
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

/**
 * @returns Promise<any>
 */
function readJSON() {
    const jsonPath = path.join(__dirname, '..', 'data', 'data.json');
    return readFile(jsonPath).then((text) => {
        const data = JSON.parse(text);
        Object.freeze(data);
        return data;
    });
}


/**
 * @param data {any}
 * @param urlString {string}
 * @returns {any[]}
 */
function queryByURL(data, urlString) {
    // XXX IT IS SLOW
    for (const entityKey of Object.keys(data)) {
        const hosts = data[entityKey].hosts;
        for (const hostKey of Object.keys(hosts)) {
            const hostEntry = hosts[hostKey];
            const urls = hostEntry.urls;
            for (const urlKey of Object.keys(urls)) {
                if (urlKey === urlString) {
                    const newUrls = {};
                    newUrls[urlKey] = urls[urlKey];

                    const newHostEntry = Object.assign({ urls: urls }, hostEntry);
                    return [ newHostEntry ];
                }
            }
        }
    }
    
    return null;
}

router.get(/^\/(.+)$/, function(req, res, next) {
    const urlString = req.param(0);
    const queryString = urlString === 'about:blank' ? '' : urlString;

    readJSON().then((data) => {
        const hostEntries = queryByURL(data, queryString);
        if (!hostEntries) {
            next(new Error('Platform Status Entry was not found: ' + urlString));
            return;
        }

        res.render('status', {
            title: urlString + ' - Indexes of Platform Status',
            h1: urlString,
            engines: engines,
            data: hostEntries,
            isStandalonePage: true,
        });
    }).catch((err) => {
        next(err);
    });
});


/**
 * @param data {any}
 * @returns {any[]}
 */
function groupByHost(data) {
    const hostEntries = [];
    for (const entityKey of Object.keys(data)) {
        const hosts = data[entityKey].hosts;
        for (const hostKey of Object.keys(hosts)) {
            hostEntries.push(hosts[hostKey]);
        }
    }

    return hostEntries;
}

router.get('/', function(req, res, next) {
    readJSON().then((data) => {
        const hostEntries = groupByHost(data);

        res.render('status', {
            title: 'Indexes of Platform Status',
            h1: 'Indexes',
            engines: engines,
            data: hostEntries,
            isStandalonePage: false,
        });
    }).catch((err) => {
        next(err);
    });
});

module.exports = router;
