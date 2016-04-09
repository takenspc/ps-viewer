'use strict';
var express = require('express');
var router = express.Router();
var utils = require('./utils');

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
                    const newEngines = {};

                    for (const engineKey of Object.keys(engines)) {
                        if (queryEngine && engineKey !== queryEngine) {
                            continue;
                        }
                        
                        const entries = engines[engineKey].filter((statusEntry) => {
                            return statusEntry.redirects.length > 0;
                        });
                        
                        if (entries.length > 0) {
                            newEngines[engineKey] = entries;
                        }
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

router.get('/url/engine/:engine', function(req, res, next) {
    const engine = req.engine;
    
    utils.readJSON().then((data) => {
        const hostEntries = groupByHost(data, engine);

        res.render('n11n/url.jade', {
            title: engine + ' | URLs | Normalization',
            h1: 'Normalzation of URLs: ' + engine,
            engines: utils.engines,
            queryEngine: engine,
            data: hostEntries,
        });
    }).catch((err) => {
        next(err);
    });
});


router.get('/url/', function(req, res, next) {
    utils.readJSON().then((data) => {
        const hostEntries = groupByHost(data, null);

        res.render('n11n/url.jade', {
            title: 'URLs | Normalization',
            h1: 'Normalzation of URLs',
            engines: utils.engines,
            queryEngine: null,
            data: hostEntries,
        });
    }).catch((err) => {
        next(err);
    });
});

router.get('/status/', function(req, res, next) {
    res.render('n11n/status.jade', {
        title: 'Status | Normalization',
        h1: 'Normalization of status of Platform Status data',
    });
});


router.get('/', function(req, res, next) {
    res.render('n11n/index.jade', {
        title: 'Normalization',
        h1: 'Normalization',
    });
});


module.exports = router;
