const express = require('express');
const router = express.Router();

// Any new resource api should imported here and then registered to
// router with proper api endpoint prefix (e.g /user user.route, /items items.route etc.)
//
// Do not remove the /** --route:import-- */ placeholder, if you use the cli to generate
// api resources, this works as placeholder to inject new route file requires.
//
// If you add a require manually, add it above the /** --route:import-- */ line.
const game = require('./game');
/** --route:import-- */

// Do not remove the /** --route-- */ placeholder, if you use the cli to generate
// api resources, this works as placeholder to inject new routes.
//
// If you add a require manually, add it above the /** --route-- */ line.
router.use(game.config.ENDPOINT, game.route);
/** --route-- */

module.exports = router;
