var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Top' });
});

router.get('/about/', function(req, res, next) {
  res.render('about', { title: 'About' });
});

router.get('/updates/', function(req, res, next) {
  res.render('update', { title: 'Updates' });
});


router.get('/addons/', function(req, res, next) {
  res.render('addons', { title: 'Addons' });
});


module.exports = router;
