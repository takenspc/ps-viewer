'use strict';
var express = require('express');
var router = express.Router();
var utils = require('./utils');


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


router.get(/^url\/(.+)$/, function(req, res, next) {
    const urlString = req.param(0);
    const queryString = urlString === 'about:blank' ? '' : urlString;

    utils.readJSON().then((data) => {
        const hostEntries = queryByURL(data, queryString);
        if (!hostEntries) {
            next(new Error('Platform Status Entry was not found: ' + urlString));
            return;
        }

        res.render('status', {
            title: urlString + ' | Platform Status',
            h1: urlString,
            engines: utils.engines,
            data: hostEntries,
            isStandalonePage: true,
        });
    }).catch((err) => {
        next(err);
    });
});


/**
 * @param data {any}
 * @param queryEngine {string?}
 * @returns {any[]}
 */
function groupByHost(data, queryEngine) {
    const hostEntries = [];

    // XXX IT MUST BE REWRITTEN
    for (const entityKey of Object.keys(data)) {
        const hosts = data[entityKey].hosts;

        for (const hostKey of Object.keys(hosts)) {
            const hostEntry = hosts[hostKey];
            const urls = hostEntry.urls;
            const newURLs = {};

            for (const urlKey of Object.keys(urls)) {
                const urlEntry = urls[urlKey];
                const fragments = urlEntry.fragments;
                const newFragments = {};

                for (const fragmentKey of Object.keys(fragments)) {
                    const fragmentEntry = fragments[fragmentKey]
                    const engines = fragmentEntry.engines;
                    let newEngines = {};

                    if (queryEngine) {
                        if (engines[queryEngine]) {
                            newEngines[queryEngine] = engines[queryEngine];
                        }                        
                    } else {
                        newEngines = engines; 
                    }


                    if (Object.keys(newEngines).length > 0) {
                        const newFragmentEntry = Object.assign({}, fragmentEntry );
                        newFragmentEntry.engines = newEngines;
                        newFragments[fragmentKey] = newFragmentEntry;
                    }
                }

                if (Object.keys(newFragments).length > 0) {
                    const newURLEntry = Object.assign({}, urlEntry );
                    newURLEntry.fragments = newFragments;
                    newURLs[urlKey] = newURLEntry;
                }
            }

            if (Object.keys(newURLs).length > 0) {
                const newHostEntry = Object.assign({}, hostEntry );
                newHostEntry.urls = newURLs;
                hostEntries.push(newHostEntry);
            }
        }
    }

    return hostEntries;
}

router.param('engine', function(req, res, next, engine) {
    if (utils.engines.indexOf(engine) === -1) {
        next(new Error('Unkonwn engine: ' + engine));
    } else {
        req.engine = engine;
        next();
    }
});

router.get('/engine/:engine', function(req, res, next) {
    const engine = req.engine;
    
    utils.readJSON().then((data) => {
        const hostEntries = groupByHost(data, engine);

        res.render('status', {
            title: engine + ' | Indexes | Platform Status',
            h1: 'Indexes: ' + engine,
            engines: utils.engines,
            queryEngine: engine,
            data: hostEntries,
            isStandalonePage: false,
        });
    }).catch((err) => {
        next(err);
    });
});


router.get('/', function(req, res, next) {
    utils.readJSON().then((data) => {
        const hostEntries = groupByHost(data);

        res.render('status', {
            title: 'Indexes | Platform Status',
            h1: 'Indexes',
            engines: utils.engines,
            data: hostEntries,
            isStandalonePage: false,
        });
    }).catch((err) => {
        next(err);
    });
});

module.exports = router;
