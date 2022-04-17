const express = require('express');
const apiController = require('./controller');
const middleware = require('./middleware');

const router = express.Router();

router
  .post(
    '/createBasicGame',
    middleware.basicCreateMiddleware,
    apiController.createBasicGame
  )
  .post(
    '/playBasicGame',
    middleware.playMiddleware,
    apiController.playBasicGame
  )
  .get('/basicGameHints', apiController.getBasicHints)
  .post(
    '/createEdenGame',
    middleware.edenCreateMiddleware,
    apiController.createEdenGame
  );

module.exports = router;