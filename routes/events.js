var express = require('express');
var router = express.Router();
var {index, show, eventRegister} = require('../controllers/EventController')

/* GET home page. */
router.get('/', index);
router.get('/:id', show);
router.post('/register', eventRegister);

module.exports = router;
