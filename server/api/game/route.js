const express = require('express');
const apiController = require('./controller');

const router = express.Router();

router.post('/createGame', apiController.createGame);

module.exports = router;