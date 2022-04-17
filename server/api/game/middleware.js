function basicCreateMiddleware(req, res, next) {
  const fields = ['hints', 'secretNumber', 'maxAttempts', 'funds'];
  for (let field of fields) {
    if (!req.body.hasOwnProperty(field)) {
      return next(new Error(`Missing field: ${field}`));
    }
  }
  return next();
}

function playMiddleware(req, res, next) {
  const fields = ['secretNumber', 'player'];
  for (let field of fields) {
    if (!req.body.hasOwnProperty(field)) {
      return next(new Error(`Missing field: ${field}`));
    }
  }
  return next();
}

function edenCreateMiddleware(req, res, next) {
  const fields = [
    'player',
    'hints',
    'secretNumber',
    'participationFee',
    'nftName',
    'nftSymbol',
    'nftDescription',
    'nftURI',
  ];

  for (let field of fields) {
    if (!req.body.hasOwnProperty(field)) {
      return next(new Error(`Missing field: ${field}`));
    }
  }
  return next();
}

module.exports = {
  basicCreateMiddleware,
  edenCreateMiddleware,
  playMiddleware,
};
