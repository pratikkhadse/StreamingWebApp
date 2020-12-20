var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/emit', function (req, res, next) {
  res.render('emit');
});

router.get('/visualize', function (req, res, next) {
  res.render('visualize.html');
});

router.get('/host', function (req, res, next) {
  res.render('host.html');
});

router.get('/camera', function (req, res, next) {
  res.render('mobile-camera');
});

router.get('/live/:room', function (req, res, next) {
  console.log('asdasd')
  if (req.params.room) {

    res.render('visualize', {
      data: req.params.room
    });
  }
});

module.exports = router;
