'use strict';
var express = require('express');
var router = express.Router();
var utils = require('../utils');
var store = require('./store');


router.param('engine', function(req, res, next, engine) {
    if (utils.ENGINES.indexOf(engine) === -1) {
        next(new Error('Unkonwn engine: ' + engine));
    } else {
        req.engine = engine;
        next();
    }
});

router.get('/url/engine/:engine', function(req, res, next) {
    const engine = req.engine;
    
    store.readJSON().then((data) => {
        const filtered = utils.queryByEngine(data, engine);
        const hasRedirects = utils.queryHasRedirects(filtered);

        res.render('n11n/url.jade', {
            title: engine + ' | Rendering engine | URLs | Normalization',
            h1: 'Normalzation of URLs: Rendering engine: ' + engine,
            engines: utils.ENGINES,
            pageType: engine,
            data: hasRedirects,
        });
    }).catch((err) => {
        next(err);
    });
});


router.get('/url/', function(req, res, next) {
    store.readJSON().then((data) => {
        const hasRedirects = utils.queryHasRedirects(data);

        res.render('n11n/url.jade', {
            title: 'URLs | Normalization',
            h1: 'Normalzation of URLs',
            engines: utils.ENGINES,
            pageType: 'index',
            data: hasRedirects,
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
