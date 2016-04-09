'use strict';
var express = require('express');
var router = express.Router();
var store = require('./store');
var utils = require('../utils');

router.get(/^\/url\/(.+)$/, function(req, res, next) {
    const urlString = req.param(0);
    const queryUrlString = urlString === 'about:blank' ? '' : urlString;

    store.readJSON().then((data) => {
        const filtered = utils.queryByUrl(data, queryUrlString);
        if (filtered.urls.length === 0) {
            next(new Error('Platform Status Entry was not found: ' + urlString));
            return;
        }

        res.render('status', {
            title: urlString + ' | URL | Platform Status',
            h1: 'URL: ' + urlString,
            engines: utils.ENGINES,
            data: filtered,
            pageType: 'url',
        });
    }).catch((err) => {
        next(err);
    });
});


router.param('host', function(req, res, next, host) {
    req.hostString = host;
    next();
});

router.get('/host/:host', function(req, res, next) {
    const hostString = req.hostString;
    const queryHostStirng = hostString === 'about:blank' ? '' : hostString;
    
    store.readJSON().then((data) => {
        const filtered = utils.queryByHost(data, queryHostStirng);
        if (filtered.urls.length === 0) {
            next(new Error('Platform Status Entry was not found: ' + hostString));
            return;
        }

        res.render('status', {
            title: hostString + ' | Host | Platform Status',
            h1: 'Host: ' + hostString,
            engines: utils.ENGINES,
            data: filtered,
            pageType: 'host',
        });
    }).catch((err) => {
        next(err);
    });
});


router.param('engine', function(req, res, next, engine) {
    if (utils.ENGINES.indexOf(engine) === -1) {
        next(new Error('Unkonwn engine: ' + engine));
    } else {
        req.engine = engine;
        next();
    }
});

router.get('/engine/:engine', function(req, res, next) {
    const engine = req.engine;
    
    store.readJSON().then((data) => {
        const filtered = utils.queryByEngine(data, engine);

        res.render('status', {
            title: engine + ' | Rendering engine | Platform Status',
            h1: 'Rendering engine: ' + engine,
            engines: utils.ENGINES,
            data: filtered,
            pageType: engine,
        });
    }).catch((err) => {
        next(err);
    });
});


router.get('/', function(req, res, next) {
    store.readJSON().then((data) => {
        res.render('status', {
            title: 'Indexes | Platform Status',
            h1: 'Indexes',
            engines: utils.ENGINES,
            data: data,
            pageType: 'index',
        });
    }).catch((err) => {
        next(err);
    });
});

module.exports = router;
