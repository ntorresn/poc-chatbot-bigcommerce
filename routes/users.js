var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  let calamari = 'Calamardo';

  res.json({ message: calamari });
});

module.exports = router;
