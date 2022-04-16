const express = require('express');
const apiController = require('./controller');

const router = express.Router();

router
  .post('/createGame', apiController.createGame)
  .post('/playGame', apiController.playGame);

module.exports = router;