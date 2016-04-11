'use strict';
var express = require('express');
var router = express.Router();
var store = require('./store');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Top' });
});

router.get('/about/', function(req, res, next) {
  res.render('about', { title: 'About' });
});

router.get('/updates/', function(req, res, next) {
  store.readJSON().then((data) => {
    res.render('update', {
      title: 'Updates',
      data: data,
    });
  }).catch((err) => {
    next(err);
  });
});


router.get('/addons/', function(req, res, next) {
  res.render('addons', { title: 'Addons' });
});


module.exports = router;
